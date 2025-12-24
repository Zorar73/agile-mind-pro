// src/services/feedback.service.js
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
  orderBy,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const FEEDBACK_COLLECTION = 'feedback';

const feedbackService = {
  // Типы фидбека
  TYPES: {
    BUG: 'bug',
    FEATURE: 'feature',
    QUESTION: 'question',
  },

  // Категории
  CATEGORIES: {
    UI: 'ui',
    BACKEND: 'backend',
    PERFORMANCE: 'performance',
    OTHER: 'other',
  },

  // Статусы
  STATUSES: {
    NEW: 'new',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
  },

  // Приоритеты
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  },

  // Создать фидбек
  async create(feedbackData, userData) {
    try {
      const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), {
        userId: userData.uid,
        userName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        userEmail: userData.email,
        userAvatar: userData.avatar || null,
        type: feedbackData.type,
        title: feedbackData.title,
        description: feedbackData.description,
        category: feedbackData.category || 'other',
        screenshot: feedbackData.screenshot || null,
        pageUrl: feedbackData.pageUrl || window.location.href,
        userAgent: navigator.userAgent,
        status: 'new',
        priority: 'medium',
        assignedTo: null,
        response: null,
        respondedAt: null,
        respondedBy: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Уведомить админов о новом фидбеке
      try {
        const notificationService = await import('./notification.service');
        await notificationService.default.notifyAdminsNewFeedback(docRef.id, feedbackData.type, feedbackData.title);
      } catch (error) {
        console.error('Error notifying admins about feedback:', error);
      }

      return { success: true, feedbackId: docRef.id };
    } catch (error) {
      console.error('Error creating feedback:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить все фидбеки (для админов)
  async getAll(filters = {}) {
    try {
      let q = collection(db, FEEDBACK_COLLECTION);
      const constraints = [orderBy('createdAt', 'desc')];

      if (filters.status) {
        constraints.unshift(where('status', '==', filters.status));
      }
      if (filters.type) {
        constraints.unshift(where('type', '==', filters.type));
      }
      if (filters.priority) {
        constraints.unshift(where('priority', '==', filters.priority));
      }

      q = query(q, ...constraints);
      const snapshot = await getDocs(q);

      const feedbacks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        respondedAt: doc.data().respondedAt?.toDate?.() || doc.data().respondedAt,
      }));

      return { success: true, feedbacks };
    } catch (error) {
      console.error('Error getting feedbacks:', error);
      return { success: false, error: error.message, feedbacks: [] };
    }
  },

  // Получить фидбек по ID
  async getById(feedbackId) {
    try {
      const docRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          feedback: {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt,
            updatedAt: docSnap.data().updatedAt?.toDate?.() || docSnap.data().updatedAt,
            respondedAt: docSnap.data().respondedAt?.toDate?.() || docSnap.data().respondedAt,
          },
        };
      }

      return { success: false, error: 'Feedback not found' };
    } catch (error) {
      console.error('Error getting feedback:', error);
      return { success: false, error: error.message };
    }
  },

  // Обновить статус фидбека
  async updateStatus(feedbackId, status, adminId) {
    try {
      const docRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
      await updateDoc(docRef, {
        status,
        assignedTo: adminId,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating feedback status:', error);
      return { success: false, error: error.message };
    }
  },

  // Обновить приоритет
  async updatePriority(feedbackId, priority) {
    try {
      const docRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
      await updateDoc(docRef, {
        priority,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating feedback priority:', error);
      return { success: false, error: error.message };
    }
  },

  // Ответить на фидбек
  async respond(feedbackId, response, adminId, adminName) {
    try {
      const docRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
      
      // Получаем текущий фидбек для уведомления
      const feedbackSnap = await getDoc(docRef);
      const feedbackData = feedbackSnap.data();

      await updateDoc(docRef, {
        response,
        respondedAt: serverTimestamp(),
        respondedBy: adminId,
        respondedByName: adminName,
        status: 'resolved',
        updatedAt: serverTimestamp(),
      });

      // Уведомить пользователя об ответе
      try {
        const notificationService = await import('./notification.service');
        await notificationService.default.createNotification({
          userId: feedbackData.userId,
          type: 'FEEDBACK_RESPONSE',
          title: 'Ответ на ваш отзыв',
          message: `Администратор ответил на ваш отзыв "${feedbackData.title}"`,
          link: '/profile', // или страница с историей фидбеков
        });
      } catch (error) {
        console.error('Error notifying user about feedback response:', error);
      }

      return { success: true };
    } catch (error) {
      console.error('Error responding to feedback:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить фидбек
  async delete(feedbackId) {
    try {
      await deleteDoc(doc(db, FEEDBACK_COLLECTION, feedbackId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить статистику фидбеков
  async getStats() {
    try {
      const snapshot = await getDocs(collection(db, FEEDBACK_COLLECTION));
      
      const stats = {
        total: snapshot.size,
        byStatus: { new: 0, in_progress: 0, resolved: 0, closed: 0 },
        byType: { bug: 0, feature: 0, question: 0 },
        byPriority: { low: 0, medium: 0, high: 0 },
      };

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (stats.byStatus[data.status] !== undefined) {
          stats.byStatus[data.status]++;
        }
        if (stats.byType[data.type] !== undefined) {
          stats.byType[data.type]++;
        }
        if (stats.byPriority[data.priority] !== undefined) {
          stats.byPriority[data.priority]++;
        }
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting feedback stats:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить фидбеки пользователя
  async getUserFeedbacks(userId) {
    try {
      const q = query(
        collection(db, FEEDBACK_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const feedbacks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        respondedAt: doc.data().respondedAt?.toDate?.() || doc.data().respondedAt,
      }));

      return { success: true, feedbacks };
    } catch (error) {
      console.error('Error getting user feedbacks:', error);
      return { success: false, error: error.message, feedbacks: [] };
    }
  },
};

export default feedbackService;
