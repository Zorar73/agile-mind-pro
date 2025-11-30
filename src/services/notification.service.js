// src/services/notification.service.js
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { logInfo, logError } from '../components/DebugConsole';

class NotificationService {
  // Типы уведомлений
  TYPES = {
    TASK_ASSIGNED: 'task_assigned',
    TASK_COMMENT: 'task_comment',
    TASK_MENTION: 'task_mention',
    TASK_DEADLINE: 'task_deadline',
    TASK_UPDATED: 'task_updated',
    USER_APPROVED: 'user_approved',
    TEAM_INVITATION: 'team_invitation',
    TEAM_MENTION: 'team_mention',
  };

  // Создать уведомление
  async create(notification) {
    try {
      const notificationRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        read: false,
        createdAt: serverTimestamp()
      });

      logInfo('Notification created', { id: notificationRef.id, type: notification.type });

      // Отправляем email если настроено
      await this.sendEmailIfEnabled(notification);

      return { success: true, id: notificationRef.id };
    } catch (error) {
      logError('Failed to create notification', error);
      return { success: false, message: error.message };
    }
  }

  // Подписка на уведомления пользователя (Realtime)
  subscribeToUserNotifications(userId, callback) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(notifications);
    });
  }

  // Получить непрочитанные уведомления
  async getUnreadCount(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return { success: true, count: snapshot.size };
    } catch (error) {
      logError('Failed to get unread count', error);
      return { success: false, count: 0 };
    }
  }

  // Отметить как прочитанное
  async markAsRead(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      logError('Failed to mark notification as read', error);
      return { success: false, message: error.message };
    }
  }

  // Отметить все как прочитанные
  async markAllAsRead(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const promises = [];

      snapshot.forEach(docSnapshot => {
        promises.push(
          updateDoc(doc(db, 'notifications', docSnapshot.id), {
            read: true,
            readAt: serverTimestamp()
          })
        );
      });

      await Promise.all(promises);

      return { success: true };
    } catch (error) {
      logError('Failed to mark all as read', error);
      return { success: false, message: error.message };
    }
  }

  // Отправка email уведомлений (если включено в настройках)
  async sendEmailIfEnabled(notification) {
    try {
      // Получаем настройки пользователя
      const userSettingsDoc = await getDoc(doc(db, 'userSettings', notification.userId));
      
      if (!userSettingsDoc.exists()) return;

      const settings = userSettingsDoc.data();
      const emailSettings = settings.emailNotifications || {};

      // Проверяем включены ли email уведомления для этого типа
      const shouldSendEmail = this.checkEmailSettings(notification.type, emailSettings);

      if (shouldSendEmail) {
        // Здесь будет интеграция с email сервисом
        // Пока просто логируем
        logInfo('Email notification should be sent', {
          userId: notification.userId,
          type: notification.type
        });
      }
    } catch (error) {
      logError('Failed to send email notification', error);
    }
  }

  // Проверка настроек email
  checkEmailSettings(notificationType, emailSettings) {
    switch (notificationType) {
      case this.TYPES.TASK_ASSIGNED:
        return emailSettings.newTasks !== false;
      case this.TYPES.TASK_COMMENT:
      case this.TYPES.TASK_MENTION:
        return emailSettings.comments !== false;
      case this.TYPES.TASK_DEADLINE:
      case this.TYPES.TASK_UPDATED:
        return emailSettings.deadlines === true;
      default:
        return false;
    }
  }

  // Вспомогательные методы для создания уведомлений

  async notifyTaskAssigned(taskId, taskTitle, assigneeId, assignedBy) {
    return await this.create({
      type: this.TYPES.TASK_ASSIGNED,
      userId: assigneeId,
      title: 'Новая задача',
      message: `Вам назначена задача: ${taskTitle}`,
      taskId,
      actorId: assignedBy,
      link: `/task/${taskId}`
    });
  }

  async notifyTaskComment(taskId, taskTitle, userId, commentedBy) {
    if (userId === commentedBy) return; // Не уведомляем о своих комментариях

    return await this.create({
      type: this.TYPES.TASK_COMMENT,
      userId,
      title: 'Новый комментарий',
      message: `Новый комментарий к задаче: ${taskTitle}`,
      taskId,
      actorId: commentedBy,
      link: `/task/${taskId}`
    });
  }

  async notifyTaskMention(taskId, taskTitle, mentionedUserId, mentionedBy) {
    return await this.create({
      type: this.TYPES.TASK_MENTION,
      userId: mentionedUserId,
      title: 'Вас упомянули',
      message: `Вас упомянули в комментарии к задаче: ${taskTitle}`,
      taskId,
      actorId: mentionedBy,
      link: `/task/${taskId}`
    });
  }

  async notifyTaskDeadline(taskId, taskTitle, assigneeId) {
    return await this.create({
      type: this.TYPES.TASK_DEADLINE,
      userId: assigneeId,
      title: 'Приближается дедлайн',
      message: `Срок выполнения задачи "${taskTitle}" истекает завтра`,
      taskId,
      link: `/task/${taskId}`
    });
  }

  async notifyUserApproved(userId) {
    return await this.create({
      type: this.TYPES.USER_APPROVED,
      userId,
      title: 'Регистрация одобрена',
      message: 'Ваша учетная запись одобрена! Добро пожаловать в Agile Mind.',
      link: '/'
    });
  }
}

export default new NotificationService(); 
