// src/utils/browserPushNotifications.js
// Browser Push Notifications using Notification API

class BrowserPushNotifications {
  constructor() {
    this.enabled = false;
    this.permission = 'default'; // default, granted, denied
    this.loadSettings();
    this.updatePermission();
  }

  // Загрузка настроек из localStorage
  loadSettings() {
    const settings = localStorage.getItem('app_settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        this.enabled = parsed.pushNotifications !== false; // По умолчанию включено
      } catch (e) {
        console.error('Error loading push settings:', e);
      }
    }
  }

  // Сохранение настроек
  saveSettings() {
    const currentSettings = localStorage.getItem('app_settings');
    let settings = {};

    if (currentSettings) {
      try {
        settings = JSON.parse(currentSettings);
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }

    settings.pushNotifications = this.enabled;
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }

  // Обновить статус разрешения
  updatePermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    } else {
      this.permission = 'denied';
      console.warn('This browser does not support desktop notifications');
    }
  }

  // Проверка, поддерживает ли браузер Notification API
  isSupported() {
    return 'Notification' in window;
  }

  // Проверка, есть ли разрешение
  hasPermission() {
    return this.permission === 'granted';
  }

  // Запрос разрешения на уведомления
  async requestPermission() {
    if (!this.isSupported()) {
      return { success: false, error: 'Notifications not supported' };
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;

      if (permission === 'granted') {
        this.enabled = true;
        this.saveSettings();
        return { success: true, permission };
      } else {
        this.enabled = false;
        this.saveSettings();
        return { success: false, permission };
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return { success: false, error: error.message };
    }
  }

  // Включить/выключить push уведомления
  async setEnabled(enabled) {
    if (enabled && !this.hasPermission()) {
      // Если пытаются включить, но нет разрешения - запрашиваем
      const result = await this.requestPermission();
      if (!result.success) {
        return result;
      }
    }

    this.enabled = enabled;
    this.saveSettings();
    return { success: true };
  }

  // Показать уведомление
  show(title, options = {}) {
    if (!this.enabled || !this.hasPermission()) {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: options.icon || '/favicon.ico',
        body: options.body || '',
        badge: options.badge || '/favicon.ico',
        tag: options.tag || `notification-${Date.now()}`,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        data: options.data || {},
        ...options,
      });

      // Обработчики событий
      if (options.onClick) {
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          options.onClick(event);
          notification.close();
        };
      }

      if (options.onClose) {
        notification.onclose = options.onClose;
      }

      if (options.onError) {
        notification.onerror = options.onError;
      }

      // Авто-закрытие
      if (options.duration) {
        setTimeout(() => notification.close(), options.duration);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  // =====================
  // ПРЕДУСТАНОВЛЕННЫЕ ТИПЫ УВЕДОМЛЕНИЙ
  // =====================

  // Новая задача назначена
  taskAssigned(taskTitle, boardTitle, onClick) {
    return this.show('Новая задача', {
      body: `Вам назначена задача: ${taskTitle}`,
      icon: '/favicon.ico',
      tag: 'task-assigned',
      requireInteraction: true,
      data: { type: 'task_assigned', taskTitle, boardTitle },
      onClick,
    });
  }

  // Новый комментарий
  taskComment(taskTitle, commenterName, onClick) {
    return this.show('Новый комментарий', {
      body: `${commenterName} прокомментировал: ${taskTitle}`,
      icon: '/favicon.ico',
      tag: 'task-comment',
      data: { type: 'task_comment', taskTitle, commenterName },
      onClick,
    });
  }

  // Упоминание
  taskMention(taskTitle, mentionerName, onClick) {
    return this.show('Вас упомянули', {
      body: `${mentionerName} упомянул вас в задаче: ${taskTitle}`,
      icon: '/favicon.ico',
      tag: 'task-mention',
      requireInteraction: true,
      data: { type: 'task_mention', taskTitle, mentionerName },
      onClick,
    });
  }

  // Приближается дедлайн
  taskDeadline(taskTitle, onClick) {
    return this.show('Приближается дедлайн', {
      body: `Срок выполнения задачи "${taskTitle}" истекает завтра`,
      icon: '/favicon.ico',
      tag: 'task-deadline',
      requireInteraction: true,
      data: { type: 'task_deadline', taskTitle },
      onClick,
    });
  }

  // Регистрация одобрена
  userApproved(onClick) {
    return this.show('Регистрация одобрена', {
      body: 'Ваша учетная запись одобрена! Добро пожаловать в Agile Mind.',
      icon: '/favicon.ico',
      tag: 'user-approved',
      requireInteraction: true,
      data: { type: 'user_approved' },
      onClick,
    });
  }

  // Приглашение на доску
  boardInvitation(boardTitle, inviterName, onClick) {
    return this.show('Приглашение на доску', {
      body: `${inviterName} пригласил вас на доску "${boardTitle}"`,
      icon: '/favicon.ico',
      tag: 'board-invitation',
      requireInteraction: true,
      data: { type: 'board_invitation', boardTitle, inviterName },
      onClick,
    });
  }

  // Универсальное уведомление
  generic(title, message, onClick) {
    return this.show(title, {
      body: message,
      icon: '/favicon.ico',
      data: { type: 'generic' },
      onClick,
    });
  }
}

// Экспортируем синглтон
export default new BrowserPushNotifications();
