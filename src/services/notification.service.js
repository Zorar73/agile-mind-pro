// src/services/notification.service.js
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
  onSnapshot,
  serverTimestamp,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';

class NotificationService {
  // Типы уведомлений
  TYPES = {
    TASK_ASSIGNED: 'task_assigned',
    TASK_COMMENT: 'task_comment',
    TASK_MENTION: 'task_mention',
    TASK_DEADLINE: 'task_deadline',
    TASK_UPDATED: 'task_updated',
    TASK_STATUS_CHANGED: 'task_status_changed',
    TASK_PRIORITY_CHANGED: 'task_priority_changed',
    TASK_DUEDATE_CHANGED: 'task_duedate_changed',
    TASK_COMPLETED: 'task_completed',
    USER_APPROVED: 'user_approved',
    TEAM_INVITATION: 'team_invitation',
    TEAM_MENTION: 'team_mention',
    TEAM_ADDED: 'team_added',
    TEAM_UPDATED: 'team_updated',
    TEAM_MEMBER_REMOVED: 'team_member_removed',
    TEAM_MEMBER_ROLE_CHANGED: 'team_member_role_changed',
    BOARD_INVITATION: 'board_invitation',
    BOARD_UPDATED: 'board_updated',
    BOARD_MEMBER_ADDED: 'board_member_added',
    BOARD_MEMBER_REMOVED: 'board_member_removed',
    BOARD_MEMBER_ROLE_CHANGED: 'board_member_role_changed',
    SKETCH_SHARED: 'sketch_shared',
    SKETCH_SHARED_TEAM: 'sketch_shared_team',
    SKETCH_COMMENT: 'sketch_comment',
    SKETCH_MENTION: 'sketch_mention',
    NEWS_COMMENT: 'news_comment',
    NEWS_MENTION: 'news_mention',
  };

  // Создать уведомление
  async create(notification) {
    try {
      const notificationRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        read: false,
        archived: false,
        createdAt: serverTimestamp()
      });

      // Отправляем email если настроено
      await this.sendEmailIfEnabled(notification);

      return { success: true, id: notificationRef.id };
    } catch (error) {
      console.error('Failed to create notification:', error);
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

  // Получить уведомления пользователя
  async getUserNotifications(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const notifications = [];

      snapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, notifications };
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return { success: false, message: error.message, notifications: [] };
    }
  }

  // Получить количество непрочитанных
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
      console.error('Failed to get unread count:', error);
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
      console.error('Failed to mark notification as read:', error);
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
      const batch = writeBatch(db);

      snapshot.forEach(docSnapshot => {
        batch.update(docSnapshot.ref, {
          read: true,
          readAt: serverTimestamp()
        });
      });

      await batch.commit();

      return { success: true };
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      return { success: false, message: error.message };
    }
  }

  // Архивировать уведомление
  async archive(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        archived: true
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to archive notification:', error);
      return { success: false, message: error.message };
    }
  }

  // Разархивировать
  async unarchive(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        archived: false
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to unarchive notification:', error);
      return { success: false, message: error.message };
    }
  }

  // Удалить уведомление
  async delete(notificationId) {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return { success: false, message: error.message };
    }
  }

  // Удалить все уведомления пользователя
  async deleteAll(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach(docSnapshot => {
        batch.delete(docSnapshot.ref);
      });

      await batch.commit();

      return { success: true };
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      return { success: false, message: error.message };
    }
  }

  // Отправка email уведомлений (если включено в настройках)
  async sendEmailIfEnabled(notification) {
    try {
      const userSettingsDoc = await getDoc(doc(db, 'userSettings', notification.userId));
      
      if (!userSettingsDoc.exists()) return;

      const settings = userSettingsDoc.data();
      const emailSettings = settings.emailNotifications || {};

      const shouldSendEmail = this.checkEmailSettings(notification.type, emailSettings);

      if (shouldSendEmail) {
        // Здесь будет интеграция с email сервисом (SendGrid, Mailgun и т.д.)
        console.log('Email notification should be sent:', {
          userId: notification.userId,
          type: notification.type
        });
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
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

  // =====================
  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // =====================

  async notifyTaskAssigned(taskId, taskTitle, boardId, assigneeId, assignedBy) {
    if (assigneeId === assignedBy) return; // Не уведомляем себя

    return await this.create({
      type: this.TYPES.TASK_ASSIGNED,
      userId: assigneeId,
      title: 'Новая задача',
      message: `Вам назначена задача: ${taskTitle}`,
      taskId,
      boardId,
      actorId: assignedBy,
      link: `/board/${boardId}?task=${taskId}`
    });
  }

  async notifyTaskComment(taskId, taskTitle, boardId, userId, commentedBy) {
    if (userId === commentedBy) return; // Не уведомляем о своих комментариях

    return await this.create({
      type: this.TYPES.TASK_COMMENT,
      userId,
      title: 'Новый комментарий',
      message: `Новый комментарий к задаче: ${taskTitle}`,
      taskId,
      boardId,
      actorId: commentedBy,
      link: `/board/${boardId}?task=${taskId}`
    });
  }

  async notifyTaskMention(taskId, taskTitle, boardId, mentionedUserId, mentionedBy) {
    if (mentionedUserId === mentionedBy) return;

    return await this.create({
      type: this.TYPES.TASK_MENTION,
      userId: mentionedUserId,
      title: 'Вас упомянули',
      message: `Вас упомянули в комментарии к задаче: ${taskTitle}`,
      taskId,
      boardId,
      actorId: mentionedBy,
      link: `/board/${boardId}?task=${taskId}`
    });
  }

  async notifyTaskDeadline(taskId, taskTitle, boardId, assigneeId) {
    return await this.create({
      type: this.TYPES.TASK_DEADLINE,
      userId: assigneeId,
      title: 'Приближается дедлайн',
      message: `Срок выполнения задачи "${taskTitle}" истекает завтра`,
      taskId,
      boardId,
      link: `/board/${boardId}?task=${taskId}`
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

  async notifyBoardInvitation(boardId, boardTitle, userId, invitedBy) {
    return await this.create({
      type: this.TYPES.BOARD_INVITATION,
      userId,
      title: 'Приглашение на доску',
      message: `Вас пригласили на доску "${boardTitle}"`,
      boardId,
      actorId: invitedBy,
      link: `/board/${boardId}`
    });
  }

  async notifyTaskStatusChanged(taskId, taskTitle, boardId, userIds, newStatus, changedBy) {
    // Уведомляем всех участников задачи кроме того кто изменил
    const statusLabels = {
      'todo': 'К выполнению',
      'in-progress': 'В работе',
      'review': 'На проверке',
      'done': 'Завершена'
    };

    const statusLabel = statusLabels[newStatus] || newStatus;

    const promises = userIds
      .filter(userId => userId !== changedBy)
      .map(userId => this.create({
        type: this.TYPES.TASK_STATUS_CHANGED,
        userId,
        title: 'Изменён статус задачи',
        message: `Статус задачи "${taskTitle}" изменён на "${statusLabel}"`,
        taskId,
        boardId,
        actorId: changedBy,
        link: `/board/${boardId}?task=${taskId}`
      }));

    return await Promise.all(promises);
  }

  async notifyTaskPriorityChanged(taskId, taskTitle, boardId, userIds, newPriority, changedBy) {
    const priorityLabels = {
      'low': 'Низкий',
      'medium': 'Средний',
      'high': 'Высокий',
      'critical': 'Критический'
    };

    const priorityLabel = priorityLabels[newPriority] || newPriority;

    const promises = userIds
      .filter(userId => userId !== changedBy)
      .map(userId => this.create({
        type: this.TYPES.TASK_PRIORITY_CHANGED,
        userId,
        title: 'Изменён приоритет задачи',
        message: `Приоритет задачи "${taskTitle}" изменён на "${priorityLabel}"`,
        taskId,
        boardId,
        actorId: changedBy,
        link: `/board/${boardId}?task=${taskId}`
      }));

    return await Promise.all(promises);
  }

  async notifyTaskDueDateChanged(taskId, taskTitle, boardId, userIds, newDueDate, changedBy) {
    const promises = userIds
      .filter(userId => userId !== changedBy)
      .map(userId => this.create({
        type: this.TYPES.TASK_DUEDATE_CHANGED,
        userId,
        title: 'Изменён дедлайн задачи',
        message: `Дедлайн задачи "${taskTitle}" изменён на ${newDueDate}`,
        taskId,
        boardId,
        actorId: changedBy,
        link: `/board/${boardId}?task=${taskId}`
      }));

    return await Promise.all(promises);
  }

  async notifyTaskCompleted(taskId, taskTitle, boardId, userIds, completedBy) {
    const promises = userIds
      .filter(userId => userId !== completedBy)
      .map(userId => this.create({
        type: this.TYPES.TASK_COMPLETED,
        userId,
        title: 'Задача завершена',
        message: `Задача "${taskTitle}" завершена`,
        taskId,
        boardId,
        actorId: completedBy,
        link: `/board/${boardId}?task=${taskId}`
      }));

    return await Promise.all(promises);
  }

  // =====================
  // BOARD NOTIFICATIONS
  // =====================

  async notifyBoardUpdated(boardId, boardTitle, userIds, changedBy, changes) {
    const changeText = changes.join(', ');
    const promises = userIds
      .filter(userId => userId !== changedBy)
      .map(userId => this.create({
        type: this.TYPES.BOARD_UPDATED,
        userId,
        title: 'Доска обновлена',
        message: `Доска "${boardTitle}" обновлена: ${changeText}`,
        boardId,
        actorId: changedBy,
        link: `/board/${boardId}`
      }));

    return await Promise.all(promises);
  }

  async notifyBoardMemberAdded(boardId, boardTitle, addedUserId, addedBy) {
    if (addedUserId === addedBy) return;

    return await this.create({
      type: this.TYPES.BOARD_MEMBER_ADDED,
      userId: addedUserId,
      title: 'Добавление на доску',
      message: `Вас добавили на доску "${boardTitle}"`,
      boardId,
      actorId: addedBy,
      link: `/board/${boardId}`
    });
  }

  async notifyBoardMemberRemoved(boardId, boardTitle, removedUserId, removedBy) {
    if (removedUserId === removedBy) return;

    return await this.create({
      type: this.TYPES.BOARD_MEMBER_REMOVED,
      userId: removedUserId,
      title: 'Удаление с доски',
      message: `Вас удалили с доски "${boardTitle}"`,
      actorId: removedBy,
      link: `/boards`
    });
  }

  async notifyBoardMemberRoleChanged(boardId, boardTitle, userId, newRole, changedBy) {
    if (userId === changedBy) return;

    const roleLabels = {
      'owner': 'Владелец',
      'admin': 'Администратор',
      'editor': 'Редактор',
      'viewer': 'Наблюдатель'
    };

    const roleLabel = roleLabels[newRole] || newRole;

    return await this.create({
      type: this.TYPES.BOARD_MEMBER_ROLE_CHANGED,
      userId,
      title: 'Изменена роль на доске',
      message: `Ваша роль на доске "${boardTitle}" изменена на "${roleLabel}"`,
      boardId,
      actorId: changedBy,
      link: `/board/${boardId}`
    });
  }

  // =====================
  // TEAM NOTIFICATIONS
  // =====================

  async notifyTeamUpdated(teamId, teamName, userIds, changedBy, changes) {
    const changeText = changes.join(', ');
    const promises = userIds
      .filter(userId => userId !== changedBy)
      .map(userId => this.create({
        type: this.TYPES.TEAM_UPDATED,
        userId,
        title: 'Команда обновлена',
        message: `Команда "${teamName}" обновлена: ${changeText}`,
        teamId,
        actorId: changedBy,
        link: `/team`
      }));

    return await Promise.all(promises);
  }

  async notifyTeamMemberRemoved(teamId, teamName, removedUserId, removedBy) {
    if (removedUserId === removedBy) return;

    return await this.create({
      type: this.TYPES.TEAM_MEMBER_REMOVED,
      userId: removedUserId,
      title: 'Удаление из команды',
      message: `Вас удалили из команды "${teamName}"`,
      actorId: removedBy,
      link: `/team`
    });
  }

  async notifyTeamMemberRoleChanged(teamId, teamName, userId, newRole, changedBy) {
    if (userId === changedBy) return;

    const roleLabels = {
      'leader': 'Лидер',
      'admin': 'Администратор',
      'member': 'Участник'
    };

    const roleLabel = roleLabels[newRole] || newRole;

    return await this.create({
      type: this.TYPES.TEAM_MEMBER_ROLE_CHANGED,
      userId,
      title: 'Изменена роль в команде',
      message: `Ваша роль в команде "${teamName}" изменена на "${roleLabel}"`,
      teamId,
      actorId: changedBy,
      link: `/team`
    });
  }

  // =====================
  // SKETCH NOTIFICATIONS
  // =====================

  async notifySketchShared(sketchId, sketchTitle, sharedUserId, sharedBy) {
    if (sharedUserId === sharedBy) return;

    return await this.create({
      type: this.TYPES.SKETCH_SHARED,
      userId: sharedUserId,
      title: 'Доступ к наброску',
      message: `С вами поделились наброском "${sketchTitle}"`,
      sketchId,
      actorId: sharedBy,
      link: `/sketches`
    });
  }

  async notifySketchSharedTeam(sketchId, sketchTitle, teamId, teamMembers, sharedBy) {
    const promises = teamMembers
      .filter(userId => userId !== sharedBy)
      .map(userId => this.create({
        type: this.TYPES.SKETCH_SHARED_TEAM,
        userId,
        title: 'Доступ к наброску для команды',
        message: `С вашей командой поделились наброском "${sketchTitle}"`,
        sketchId,
        teamId,
        actorId: sharedBy,
        link: `/sketches`
      }));

    return await Promise.all(promises);
  }

  async notifySketchComment(sketchId, sketchTitle, authorId, commentedBy) {
    if (authorId === commentedBy) return;

    return await this.create({
      type: this.TYPES.SKETCH_COMMENT,
      userId: authorId,
      title: 'Новый комментарий к наброску',
      message: `Новый комментарий к наброску "${sketchTitle}"`,
      sketchId,
      actorId: commentedBy,
      link: `/sketches`
    });
  }

  async notifySketchMention(sketchId, sketchTitle, mentionedUserId, mentionedBy) {
    if (mentionedUserId === mentionedBy) return;

    return await this.create({
      type: this.TYPES.SKETCH_MENTION,
      userId: mentionedUserId,
      title: 'Вас упомянули в наброске',
      message: `Вас упомянули в комментарии к наброску "${sketchTitle}"`,
      sketchId,
      actorId: mentionedBy,
      link: `/sketches`
    });
  }

  // =====================
  // NEWS NOTIFICATIONS
  // =====================

  async notifyNewsComment(newsId, newsTitle, authorId, commentedBy) {
    if (authorId === commentedBy) return;

    return await this.create({
      type: this.TYPES.NEWS_COMMENT,
      userId: authorId,
      title: 'Новый комментарий к новости',
      message: `Новый комментарий к новости "${newsTitle}"`,
      newsId,
      actorId: commentedBy,
      link: `/news`
    });
  }

  async notifyNewsMention(newsId, newsTitle, mentionedUserId, mentionedBy) {
    if (mentionedUserId === mentionedBy) return;

    return await this.create({
      type: this.TYPES.NEWS_MENTION,
      userId: mentionedUserId,
      title: 'Вас упомянули в новости',
      message: `Вас упомянули в комментарии к новости "${newsTitle}"`,
      newsId,
      actorId: mentionedBy,
      link: `/news`
    });
  }
}

export default new NotificationService();
