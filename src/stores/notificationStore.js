// src/stores/notificationStore.js
// Zustand store для уведомлений

import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  lastFetchedAt: null,
  
  // Shown notification IDs (for deduplication)
  shownIds: new Set(),
  
  // Actions
  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    lastFetchedAt: new Date(),
  }),
  
  addNotification: (notification) => set((state) => {
    // Avoid duplicates
    if (state.notifications.some(n => n.id === notification.id)) {
      return state;
    }
    return {
      notifications: [notification, ...state.notifications],
      unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
    };
  }),
  
  markAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  
  removeNotification: (notificationId) => set((state) => {
    const notification = state.notifications.find(n => n.id === notificationId);
    return {
      notifications: state.notifications.filter(n => n.id !== notificationId),
      unreadCount: notification && !notification.read 
        ? Math.max(0, state.unreadCount - 1) 
        : state.unreadCount,
    };
  }),
  
  // Track shown notifications (for toast deduplication)
  markAsShown: (notificationId) => set((state) => {
    const newShownIds = new Set(state.shownIds);
    newShownIds.add(notificationId);
    return { shownIds: newShownIds };
  }),
  
  hasBeenShown: (notificationId) => get().shownIds.has(notificationId),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  // Clear all
  clear: () => set({
    notifications: [],
    unreadCount: 0,
    shownIds: new Set(),
  }),
}));

export default useNotificationStore;
