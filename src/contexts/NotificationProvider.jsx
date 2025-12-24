// src/contexts/NotificationProvider.jsx
import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { UserContext } from '../App';
import { useNotificationStore, useUserStore } from '../stores';
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
  // Zustand stores
  const user = useUserStore((state) => state.user);
  const { 
    notifications, 
    unreadCount, 
    setNotifications, 
    markAsShown, 
    hasBeenShown,
    clear: clearNotifications 
  } = useNotificationStore();
  
  const navigate = useNavigate();
  
  // Ref для navigate чтобы использовать в callback без пересоздания
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  
  // Флаг первой инициализации
  const initializedRef = useRef(false);

  // Показ push уведомления
  const showPush = useCallback((notification) => {
    const onClick = () => {
      if (notification.link) {
        navigateRef.current(notification.link);
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
  }, []);

  // Подписка на уведомления пользователя
  useEffect(() => {
    if (!user) {
      clearNotifications();
      initializedRef.current = false;
      return;
    }

    const unsubscribe = notificationService.subscribeToUserNotifications(
      user.uid,
      (updatedNotifications) => {
        // При первой инициализации - просто запоминаем все ID без показа push
        if (!initializedRef.current) {
          initializedRef.current = true;
          updatedNotifications.forEach(n => markAsShown(n.id));
        } else {
          // Проверяем только НОВЫЕ уведомления
          updatedNotifications.forEach(notification => {
            if (!notification.read && !hasBeenShown(notification.id)) {
              showPush(notification);
              markAsShown(notification.id);
            }
          });
        }

        setNotifications(updatedNotifications);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, setNotifications, markAsShown, hasBeenShown, showPush, clearNotifications]);

  const requestPushPermission = useCallback(async () => {
    return await browserPush.requestPermission();
  }, []);

  const setPushEnabled = useCallback(async (enabled) => {
    return await browserPush.setEnabled(enabled);
  }, []);

  const setSoundEnabled = useCallback((enabled) => {
    soundNotifications.setEnabled(enabled);
  }, []);

  const getSettings = useCallback(() => ({
    pushEnabled: browserPush.enabled,
    pushPermission: browserPush.permission,
    soundEnabled: soundNotifications.enabled,
    soundVolume: soundNotifications.volume,
  }), []);

  const setSoundVolume = useCallback((volume) => {
    soundNotifications.setVolume(volume);
  }, []);

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
