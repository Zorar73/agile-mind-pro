// src/services/sketch.service.js
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
  onSnapshot,
  serverTimestamp,
  orderBy,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import notificationService from './notification.service';

class SketchService {
  // =====================
  // НАБРОСКИ
  // =====================

  async createSketch(sketchData, userId) {
    try {
      const sketchRef = await addDoc(collection(db, 'sketches'), {
        title: sketchData.title,
        description: sketchData.description || '',
        tags: sketchData.tags || [],
        authorId: userId,
        sharedWith: {
          users: [],
          teams: []
        },
        attachments: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, id: sketchRef.id };
    } catch (error) {
      console.error('Create sketch error:', error);
      return { success: false, message: error.message };
    }
  }

  async getSketch(sketchId) {
    try {
      const sketchDoc = await getDoc(doc(db, 'sketches', sketchId));
      
      if (!sketchDoc.exists()) {
        return { success: false, message: 'Набросок не найден' };
      }

      return {
        success: true,
        sketch: { id: sketchDoc.id, ...sketchDoc.data() }
      };
    } catch (error) {
      console.error('Get sketch error:', error);
      return { success: false, message: error.message };
    }
  }

  async getUserSketches(userId) {
    try {
      const q = query(
        collection(db, 'sketches'),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const sketches = [];

      snapshot.forEach(doc => {
        sketches.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, sketches };
    } catch (error) {
      console.error('Get sketches error:', error);
      return { success: false, message: error.message, sketches: [] };
    }
  }

  async getAccessibleSketches(userId, userTeams = []) {
    try {
      const allSketches = await getDocs(collection(db, 'sketches'));
      const sketches = [];

      allSketches.forEach(doc => {
        const data = doc.data();
        
        // Автор видит всегда
        if (data.authorId === userId) {
          sketches.push({ id: doc.id, ...data, accessType: 'owner' });
          return;
        }

        // Shared с пользователем
        if (data.sharedWith?.users?.includes(userId)) {
          sketches.push({ id: doc.id, ...data, accessType: 'shared' });
          return;
        }

        // Shared с командой
        const sharedTeamIds = data.sharedWith?.teams || [];
        if (sharedTeamIds.some(teamId => userTeams.includes(teamId))) {
          sketches.push({ id: doc.id, ...data, accessType: 'team' });
        }
      });

      // Сортируем по дате
      sketches.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      return { success: true, sketches };
    } catch (error) {
      console.error('Get accessible sketches error:', error);
      return { success: false, message: error.message, sketches: [] };
    }
  }

  subscribeToSketch(sketchId, callback) {
    return onSnapshot(doc(db, 'sketches', sketchId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
  }

  async updateSketch(sketchId, updates) {
    try {
      await updateDoc(doc(db, 'sketches', sketchId), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Update sketch error:', error);
      return { success: false, message: error.message };
    }
  }

  async deleteSketch(sketchId) {
    try {
      const batch = writeBatch(db);

      // Удаляем комментарии
      const commentsSnapshot = await getDocs(
        collection(db, 'sketches', sketchId, 'comments')
      );
      commentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Удаляем набросок
      batch.delete(doc(db, 'sketches', sketchId));

      await batch.commit();

      return { success: true };
    } catch (error) {
      console.error('Delete sketch error:', error);
      return { success: false, message: error.message };
    }
  }

  // =====================
  // ШАРИНГ
  // =====================

  async shareWithUser(sketchId, userId, sharedBy) {
    try {
      // Получаем данные наброска для уведомления
      const sketchDoc = await getDoc(doc(db, 'sketches', sketchId));
      const sketchData = sketchDoc.data();

      await updateDoc(doc(db, 'sketches', sketchId), {
        'sharedWith.users': arrayUnion(userId),
        updatedAt: serverTimestamp()
      });

      // Отправляем уведомление
      if (sharedBy && userId !== sharedBy && sketchData) {
        await notificationService.notifySketchShared(
          sketchId,
          sketchData.title,
          userId,
          sharedBy
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Share sketch error:', error);
      return { success: false, message: error.message };
    }
  }

  async unshareWithUser(sketchId, userId) {
    try {
      await updateDoc(doc(db, 'sketches', sketchId), {
        'sharedWith.users': arrayRemove(userId),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Unshare sketch error:', error);
      return { success: false, message: error.message };
    }
  }

  async shareWithTeam(sketchId, teamId, sharedBy) {
    try {
      // Получаем данные наброска и команды для уведомлений
      const sketchDoc = await getDoc(doc(db, 'sketches', sketchId));
      const sketchData = sketchDoc.data();

      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      const teamData = teamDoc.data();

      await updateDoc(doc(db, 'sketches', sketchId), {
        'sharedWith.teams': arrayUnion(teamId),
        updatedAt: serverTimestamp()
      });

      // Отправляем уведомления всем участникам команды
      if (sharedBy && teamData && teamData.members && sketchData) {
        const teamMembers = Object.keys(teamData.members);
        await notificationService.notifySketchSharedTeam(
          sketchId,
          sketchData.title,
          teamId,
          teamMembers,
          sharedBy
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Share sketch error:', error);
      return { success: false, message: error.message };
    }
  }

  async unshareWithTeam(sketchId, teamId) {
    try {
      await updateDoc(doc(db, 'sketches', sketchId), {
        'sharedWith.teams': arrayRemove(teamId),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Unshare sketch error:', error);
      return { success: false, message: error.message };
    }
  }

  // =====================
  // КОММЕНТАРИИ
  // =====================

  async addComment(sketchId, userId, text, attachments = [], mentions = [], entityLinks = [], parentId = null) {
    try {
      const commentData = {
        userId,
        text,
        attachments,
        mentions,
        entityLinks,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Если это ответ, добавляем parentId
      if (parentId) {
        commentData.parentId = parentId;
      }

      const commentRef = await addDoc(collection(db, 'sketches', sketchId, 'comments'), commentData);

      // Получаем данные наброска для уведомлений
      const sketchDoc = await getDoc(doc(db, 'sketches', sketchId));
      const sketchData = sketchDoc.data();

      if (sketchData) {
        // Уведомляем автора наброска о комментарии
        if (sketchData.authorId && sketchData.authorId !== userId) {
          await notificationService.notifySketchComment(
            sketchId,
            sketchData.title,
            sketchData.authorId,
            userId
          );
        }

        // Уведомляем упомянутых пользователей
        if (mentions && mentions.length > 0) {
          for (const mentionedUserId of mentions) {
            if (mentionedUserId !== userId) {
              await notificationService.notifySketchMention(
                sketchId,
                sketchData.title,
                mentionedUserId,
                userId
              );
            }
          }
        }
      }

      return { success: true, id: commentRef.id };
    } catch (error) {
      console.error('Add comment error:', error);
      return { success: false, message: error.message };
    }
  }

  async updateComment(sketchId, commentId, data) {
    try {
      await updateDoc(doc(db, 'sketches', sketchId, 'comments', commentId), {
        ...data,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Update comment error:', error);
      return { success: false, message: error.message };
    }
  }

  async deleteComment(sketchId, commentId) {
    try {
      await deleteDoc(doc(db, 'sketches', sketchId, 'comments', commentId));
      return { success: true };
    } catch (error) {
      console.error('Delete comment error:', error);
      return { success: false, message: error.message };
    }
  }

  subscribeToComments(sketchId, callback) {
    const q = query(
      collection(db, 'sketches', sketchId, 'comments'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const comments = [];
      snapshot.forEach(doc => {
        comments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(comments);
    });
  }

  async getComments(sketchId) {
    try {
      const q = query(
        collection(db, 'sketches', sketchId, 'comments'),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      const comments = [];

      snapshot.forEach(doc => {
        comments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, comments };
    } catch (error) {
      console.error('Get comments error:', error);
      return { success: false, message: error.message, comments: [] };
    }
  }

  // Получить наброски, расшаренные с командой
  async getSketchesSharedWithTeam(teamId) {
    try {
      const q = query(
        collection(db, 'sketches'),
        where('sharedWith.teams', 'array-contains', teamId)
      );

      const snapshot = await getDocs(q);
      const sketches = [];

      snapshot.forEach(doc => {
        sketches.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, sketches };
    } catch (error) {
      console.error('Get team sketches error:', error);
      return { success: false, message: error.message, sketches: [] };
    }
  }

  // Получить наброски, расшаренные с пользователем
  async getSketchesSharedWithUser(userId) {
    try {
      const q = query(
        collection(db, 'sketches'),
        where('sharedWith.users', 'array-contains', userId)
      );

      const snapshot = await getDocs(q);
      const sketches = [];

      snapshot.forEach(doc => {
        sketches.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, sketches };
    } catch (error) {
      console.error('Get shared sketches error:', error);
      return { success: false, message: error.message, sketches: [] };
    }
  }
}

export default new SketchService();
