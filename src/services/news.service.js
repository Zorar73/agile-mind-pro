// src/services/news.service.js
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy as firestoreOrderBy,
  serverTimestamp,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import notificationService from './notification.service';

const NEWS_COLLECTION = 'news';
const COMMENTS_SUBCOLLECTION = 'comments';

class NewsService {
  // =====================
  // НОВОСТИ
  // =====================

  // Получить все новости (с пагинацией)
  async getAllNews(limitCount = 50) {
    try {
      const q = query(
        collection(db, NEWS_COLLECTION),
        firestoreOrderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const news = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
      }));

      return { success: true, news };
    } catch (error) {
      console.error('Error getting news:', error);
      return { success: false, error: error.message, news: [] };
    }
  }

  // Подписка на новости (realtime)
  subscribeToNews(callback, limitCount = 50) {
    const q = query(
      collection(db, NEWS_COLLECTION),
      firestoreOrderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const news = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
      }));
      callback(news);
    });
  }

  // Получить новость по ID
  async getNewsById(newsId) {
    try {
      const docRef = doc(db, NEWS_COLLECTION, newsId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          success: true,
          news: {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          }
        };
      }

      return { success: false, error: 'News not found' };
    } catch (error) {
      console.error('Error getting news:', error);
      return { success: false, error: error.message };
    }
  }

  // Создать новость
  async createNews(newsData, userId) {
    try {
      const newsDoc = {
        title: newsData.title,
        content: newsData.content,
        imageUrl: newsData.imageUrl || null,
        tags: newsData.tags || [],
        authorId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        commentsCount: 0,
        likesCount: 0,
        likes: {}, // { userId: true }
        // Targeting
        targeting: newsData.targeting || {
          type: 'all', // all | roles | teams | users
          roleIds: [],
          teamIds: [],
          userIds: [],
        },
        // Important news
        isImportant: newsData.isImportant || false,
        requiresConfirmation: newsData.requiresConfirmation || false,
        readBy: {}, // { userId: { readAt: timestamp, confirmed: boolean } }
      };

      // Poll (опрос)
      if (newsData.poll && newsData.poll.question && newsData.poll.options) {
        newsDoc.poll = {
          question: newsData.poll.question,
          options: newsData.poll.options.map(opt => ({
            text: opt.text || opt,
            votes: {}, // { userId: true }
            votesCount: 0,
          })),
          multipleChoice: newsData.poll.multipleChoice || false,
          showResults: newsData.poll.showResults !== false, // по умолчанию true
          allowAddOptions: newsData.poll.allowAddOptions || false,
          totalVotes: 0,
        };
      }

      const docRef = await addDoc(collection(db, NEWS_COLLECTION), newsDoc);

      return { success: true, newsId: docRef.id };
    } catch (error) {
      console.error('Error creating news:', error);
      return { success: false, error: error.message };
    }
  }

  // Обновить новость
  async updateNews(newsId, updates) {
    try {
      await updateDoc(doc(db, NEWS_COLLECTION, newsId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating news:', error);
      return { success: false, error: error.message };
    }
  }

  // Удалить новость
  async deleteNews(newsId) {
    try {
      // Удаляем комментарии
      const commentsSnapshot = await getDocs(
        collection(db, NEWS_COLLECTION, newsId, COMMENTS_SUBCOLLECTION)
      );

      const deletePromises = commentsSnapshot.docs.map(commentDoc =>
        deleteDoc(commentDoc.ref)
      );

      await Promise.all(deletePromises);

      // Удаляем новость
      await deleteDoc(doc(db, NEWS_COLLECTION, newsId));

      return { success: true };
    } catch (error) {
      console.error('Error deleting news:', error);
      return { success: false, error: error.message };
    }
  }

  // Лайкнуть/убрать лайк
  async toggleLike(newsId, userId) {
    try {
      const newsRef = doc(db, NEWS_COLLECTION, newsId);
      const newsDoc = await getDoc(newsRef);

      if (!newsDoc.exists()) {
        return { success: false, error: 'News not found' };
      }

      const newsData = newsDoc.data();
      const likes = newsData.likes || {};
      const isLiked = likes[userId];

      if (isLiked) {
        // Убираем лайк
        delete likes[userId];
        await updateDoc(newsRef, {
          likes,
          likesCount: (newsData.likesCount || 0) - 1,
        });
      } else {
        // Добавляем лайк
        likes[userId] = true;
        await updateDoc(newsRef, {
          likes,
          likesCount: (newsData.likesCount || 0) + 1,
        });
      }

      return { success: true, isLiked: !isLiked };
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================
  // КОММЕНТАРИИ
  // =====================

  // Получить комментарии к новости
  async getComments(newsId) {
    try {
      const q = query(
        collection(db, NEWS_COLLECTION, newsId, COMMENTS_SUBCOLLECTION),
        firestoreOrderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
      }));

      return { success: true, comments };
    } catch (error) {
      console.error('Error getting comments:', error);
      return { success: false, error: error.message, comments: [] };
    }
  }

  // Подписка на комментарии (realtime)
  subscribeToComments(newsId, callback) {
    const q = query(
      collection(db, NEWS_COLLECTION, newsId, COMMENTS_SUBCOLLECTION),
      firestoreOrderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
      }));
      callback(comments);
    });
  }

  // Добавить комментарий
  async addComment(newsId, text, userId, attachments = [], mentions = [], entityLinks = [], parentId = null) {
    try {
      const commentData = {
        text,
        userId,
        attachments,
        mentions,
        entityLinks,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Если это ответ, добавляем parentId
      if (parentId) {
        commentData.parentId = parentId;
      }

      const docRef = await addDoc(
        collection(db, NEWS_COLLECTION, newsId, COMMENTS_SUBCOLLECTION),
        commentData
      );

      // Обновляем счетчик комментариев
      const newsRef = doc(db, NEWS_COLLECTION, newsId);
      const newsDoc = await getDoc(newsRef);
      const newsData = newsDoc.data();
      const currentCount = newsData?.commentsCount || 0;

      await updateDoc(newsRef, {
        commentsCount: currentCount + 1,
        updatedAt: serverTimestamp(),
      });

      // Уведомляем автора новости о комментарии
      if (newsData && newsData.authorId && newsData.authorId !== userId) {
        await notificationService.notifyNewsComment(
          newsId,
          newsData.title,
          newsData.authorId,
          userId
        );
      }

      // Уведомляем упомянутых пользователей
      if (mentions && mentions.length > 0) {
        for (const mentionedUserId of mentions) {
          if (mentionedUserId !== userId) {
            await notificationService.notifyNewsMention(
              newsId,
              newsData?.title || 'Новость',
              mentionedUserId,
              userId
            );
          }
        }
      }

      return { success: true, commentId: docRef.id };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  }

  // Обновить комментарий
  async updateComment(newsId, commentId, data) {
    try {
      await updateDoc(
        doc(db, NEWS_COLLECTION, newsId, COMMENTS_SUBCOLLECTION, commentId),
        {
          ...data,
          updatedAt: serverTimestamp(),
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating comment:', error);
      return { success: false, error: error.message };
    }
  }

  // Удалить комментарий
  async deleteComment(newsId, commentId) {
    try {
      await deleteDoc(
        doc(db, NEWS_COLLECTION, newsId, COMMENTS_SUBCOLLECTION, commentId)
      );

      // Обновляем счетчик комментариев
      const newsRef = doc(db, NEWS_COLLECTION, newsId);
      const newsDoc = await getDoc(newsRef);
      const currentCount = newsDoc.data()?.commentsCount || 0;

      await updateDoc(newsRef, {
        commentsCount: Math.max(0, currentCount - 1),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================
  // TARGETING & IMPORTANT NEWS
  // =====================

  // Фильтровать новости по таргетингу для пользователя
  filterNewsByTargeting(newsList, userId, userRoleId, userTeamIds = []) {
    return newsList.filter(news => {
      // Если таргетинга нет или он "all", показываем всем
      if (!news.targeting || news.targeting.type === 'all') {
        return true;
      }

      // Фильтруем по ролям
      if (news.targeting.type === 'roles') {
        return news.targeting.roleIds && news.targeting.roleIds.includes(userRoleId);
      }

      // Фильтруем по командам
      if (news.targeting.type === 'teams') {
        return news.targeting.teamIds && news.targeting.teamIds.some(teamId => userTeamIds.includes(teamId));
      }

      // Фильтруем по конкретным пользователям
      if (news.targeting.type === 'users') {
        return news.targeting.userIds && news.targeting.userIds.includes(userId);
      }

      return false;
    });
  }

  // Получить непрочитанные важные новости для пользователя
  async getUnreadImportantNews(userId) {
    try {
      const q = query(
        collection(db, NEWS_COLLECTION),
        where('isImportant', '==', true),
        where('requiresConfirmation', '==', true),
        firestoreOrderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const allImportantNews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
      }));

      // Фильтруем только непрочитанные или неподтвержденные
      const unreadNews = allImportantNews.filter(news => {
        const readInfo = news.readBy?.[userId];
        return !readInfo || !readInfo.confirmed;
      });

      return { success: true, news: unreadNews };
    } catch (error) {
      console.error('Error getting unread important news:', error);
      return { success: false, error: error.message, news: [] };
    }
  }

  // Подтвердить прочтение важной новости
  async confirmNewsRead(newsId, userId) {
    try {
      const newsRef = doc(db, NEWS_COLLECTION, newsId);
      await updateDoc(newsRef, {
        [`readBy.${userId}`]: {
          readAt: serverTimestamp(),
          confirmed: true,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error confirming news read:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================
  // ОПРОСЫ (POLLS)
  // =====================

  // Проголосовать в опросе
  async votePoll(newsId, userId, optionIndexes) {
    try {
      const newsRef = doc(db, NEWS_COLLECTION, newsId);
      const newsDoc = await getDoc(newsRef);

      if (!newsDoc.exists()) {
        return { success: false, error: 'News not found' };
      }

      const newsData = newsDoc.data();
      const poll = newsData.poll;

      if (!poll) {
        return { success: false, error: 'Poll not found' };
      }

      // Проверяем, не голосовал ли пользователь уже
      const hasVoted = poll.options.some(opt => opt.votes && opt.votes[userId]);

      if (hasVoted && !poll.multipleChoice) {
        // Если пользователь уже голосовал и это не множественный выбор,
        // сначала удаляем его старые голоса
        poll.options.forEach((opt, idx) => {
          if (opt.votes && opt.votes[userId]) {
            delete opt.votes[userId];
            opt.votesCount = (opt.votesCount || 1) - 1;
          }
        });
        poll.totalVotes = Math.max(0, (poll.totalVotes || 1) - 1);
      }

      // Добавляем новые голоса
      const indexes = Array.isArray(optionIndexes) ? optionIndexes : [optionIndexes];

      indexes.forEach(index => {
        if (index >= 0 && index < poll.options.length) {
          if (!poll.options[index].votes) {
            poll.options[index].votes = {};
          }
          poll.options[index].votes[userId] = true;
          poll.options[index].votesCount = (poll.options[index].votesCount || 0) + 1;
        }
      });

      // Обновляем общее количество голосов
      if (!hasVoted) {
        poll.totalVotes = (poll.totalVotes || 0) + 1;
      }

      await updateDoc(newsRef, {
        poll,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error voting in poll:', error);
      return { success: false, error: error.message };
    }
  }

  // Добавить опцию в опрос (если разрешено)
  async addPollOption(newsId, userId, optionText) {
    try {
      const newsRef = doc(db, NEWS_COLLECTION, newsId);
      const newsDoc = await getDoc(newsRef);

      if (!newsDoc.exists()) {
        return { success: false, error: 'News not found' };
      }

      const newsData = newsDoc.data();
      const poll = newsData.poll;

      if (!poll) {
        return { success: false, error: 'Poll not found' };
      }

      if (!poll.allowAddOptions) {
        return { success: false, error: 'Adding options is not allowed' };
      }

      // Проверяем, нет ли уже такой опции
      const optionExists = poll.options.some(opt => opt.text.toLowerCase() === optionText.toLowerCase());
      if (optionExists) {
        return { success: false, error: 'Option already exists' };
      }

      poll.options.push({
        text: optionText,
        votes: {},
        votesCount: 0,
      });

      await updateDoc(newsRef, {
        poll,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding poll option:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new NewsService();
