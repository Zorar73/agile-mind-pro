// src/queries/queryClient.js
// React Query client configuration

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Данные считаются свежими 5 минут
      staleTime: 5 * 60 * 1000,
      
      // Кэш хранится 30 минут
      gcTime: 30 * 60 * 1000,
      
      // Повторные попытки при ошибке
      retry: (failureCount, error) => {
        // Не ретраить при 401/403
        if (error?.code === 'permission-denied' || error?.code === 'unauthenticated') {
          return false;
        }
        return failureCount < 2;
      },
      
      // Рефетч при фокусе окна
      refetchOnWindowFocus: false,
      
      // Рефетч при переподключении
      refetchOnReconnect: true,
    },
    mutations: {
      // Повторные попытки для мутаций
      retry: 1,
    },
  },
});

// Query keys factory
export const queryKeys = {
  // Boards
  boards: {
    all: ['boards'],
    list: (filters) => ['boards', 'list', filters],
    detail: (id) => ['boards', 'detail', id],
    columns: (boardId) => ['boards', boardId, 'columns'],
    tasks: (boardId) => ['boards', boardId, 'tasks'],
    tasksByColumn: (boardId, columnId) => ['boards', boardId, 'tasks', columnId],
  },
  
  // Tasks
  tasks: {
    all: ['tasks'],
    list: (filters) => ['tasks', 'list', filters],
    detail: (id) => ['tasks', 'detail', id],
    comments: (taskId) => ['tasks', taskId, 'comments'],
    myTasks: (userId) => ['tasks', 'my', userId],
  },
  
  // Teams
  teams: {
    all: ['teams'],
    list: () => ['teams', 'list'],
    detail: (id) => ['teams', 'detail', id],
    members: (teamId) => ['teams', teamId, 'members'],
    chat: (teamId) => ['teams', teamId, 'chat'],
  },
  
  // Users
  users: {
    all: ['users'],
    list: () => ['users', 'list'],
    detail: (id) => ['users', 'detail', id],
    current: ['users', 'current'],
  },
  
  // Learning
  learning: {
    courses: {
      all: ['learning', 'courses'],
      list: (filters) => ['learning', 'courses', 'list', filters],
      detail: (id) => ['learning', 'courses', 'detail', id],
      lessons: (courseId) => ['learning', 'courses', courseId, 'lessons'],
    },
    progress: (userId) => ['learning', 'progress', userId],
    stats: (userId) => ['learning', 'stats', userId],
  },
  
  // Notifications
  notifications: {
    all: ['notifications'],
    list: (userId) => ['notifications', 'list', userId],
    unread: (userId) => ['notifications', 'unread', userId],
  },
  
  // Sprints
  sprints: {
    all: ['sprints'],
    list: (boardId) => ['sprints', 'list', boardId],
    detail: (id) => ['sprints', 'detail', id],
    active: (boardId) => ['sprints', 'active', boardId],
  },
  
  // Sketches
  sketches: {
    all: ['sketches'],
    list: (filters) => ['sketches', 'list', filters],
    detail: (id) => ['sketches', 'detail', id],
  },
  
  // News
  news: {
    all: ['news'],
    list: (filters) => ['news', 'list', filters],
    detail: (id) => ['news', 'detail', id],
  },
  
  // Feedback
  feedback: {
    all: ['feedback'],
    list: (filters) => ['feedback', 'list', filters],
    detail: (id) => ['feedback', 'detail', id],
    my: (userId) => ['feedback', 'my', userId],
  },
  
  // Roles
  roles: {
    all: ['roles'],
    list: () => ['roles', 'list'],
    detail: (id) => ['roles', 'detail', id],
  },
};

export default queryClient;
