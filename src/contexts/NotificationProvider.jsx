// src/contexts/NotificationProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserContext } from '../App';
import notificationService from '../services/notification.service';
import browserPush from '../utils/browserPushNotifications';
import soundNotifications from '../utils/soundNotifications';
import { useNavigate } from 'react-router-dom';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export function NotificationProvider({ children }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Подписка на уведомления пользователя
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const unsubscribe = notificationService.subscribeToUserNotifications(
      user.uid,
      (updatedNotifications) => {
        // Проверяем новые уведомления
        const previousIds = new Set(notifications.map(n => n.id));
        const newNotifications = updatedNotifications.filter(n => !previousIds.has(n.id));

        // Показываем browser push для новых уведомлений
        newNotifications.forEach(notification => {
          if (!notification.read) {
            handleNewNotification(notification);
          }
        });

        setNotifications(updatedNotifications);
        const unread = updatedNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Обработка нового уведомления
  const handleNewNotification = (notification) => {
    // Browser Push Notification
    const onClick = () => {
      if (notification.link) {
        navigate(notification.link);
      }
    };

    switch (notification.type) {
      case notificationService.TYPES.TASK_ASSIGNED:
        browserPush.taskAssigned(notification.message, '', onClick);
        soundNotifications.play('task_assigned');
        break;

      case notificationService.TYPES.TASK_COMMENT:
        browserPush.taskComment(notification.message, '', onClick);
        soundNotifications.play('comment');
        break;

      case notificationService.TYPES.TASK_MENTION:
      case notificationService.TYPES.SKETCH_MENTION:
      case notificationService.TYPES.TEAM_MENTION:
      case notificationService.TYPES.NEWS_MENTION:
        browserPush.taskMention(notification.message, '', onClick);
        soundNotifications.play('mention');
        break;

      case notificationService.TYPES.TASK_DEADLINE:
        browserPush.taskDeadline(notification.message, onClick);
        soundNotifications.play('deadline');
        break;

      case notificationService.TYPES.USER_APPROVED:
        browserPush.userApproved(onClick);
        soundNotifications.play('success');
        break;

      case notificationService.TYPES.BOARD_INVITATION:
      case notificationService.TYPES.TEAM_INVITATION:
        browserPush.boardInvitation(notification.message, '', onClick);
        soundNotifications.play('invitation');
        break;

      default:
        browserPush.generic(notification.title, notification.message, onClick);
        soundNotifications.play('default');
    }
  };

  // Запрос разрешения на browser push
  const requestPushPermission = async () => {
    return await browserPush.requestPermission();
  };

  // Включить/выключить push уведомления
  const setPushEnabled = async (enabled) => {
    return await browserPush.setEnabled(enabled);
  };

  // Включить/выключить звуковые уведомления
  const setSoundEnabled = (enabled) => {
    soundNotifications.setEnabled(enabled);
  };

  // Получить настройки
  const getSettings = () => ({
    pushEnabled: browserPush.enabled,
    pushPermission: browserPush.permission,
    soundEnabled: soundNotifications.enabled,
    soundVolume: soundNotifications.volume,
  });

  // Установить громкость звуков
  const setSoundVolume = (volume) => {
    soundNotifications.setVolume(volume);
  };

  const value = {
    notifications,
    unreadCount,
    requestPushPermission,
    setPushEnabled,
    setSoundEnabled,
    setSoundVolume,
    getSettings,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
