// src/constants/index.js

// Экспорт всех констант из одного места
export * from './roles';
export * from './learning';

/**
 * Статусы задач
 */
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
};

/**
 * Приоритеты задач
 */
export const TASK_PRIORITY = {
  URGENT: 'urgent',
  RECURRING: 'recurring',
  NORMAL: 'normal',
};

/**
 * Статусы спринтов
 */
export const SPRINT_STATUS = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

/**
 * Типы уведомлений
 */
export const NOTIFICATION_TYPE = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMMENT: 'task_comment',
  TASK_MENTION: 'task_mention',
  COURSE_ASSIGNED: 'course_assigned',
  COURSE_DEADLINE: 'course_deadline',
  COURSE_OVERDUE: 'course_overdue',
  EXAM_GRADED: 'exam_graded',
  PRACTICE_REVIEWED: 'practice_reviewed',
  NEWS_IMPORTANT: 'news_important',
  TEAM_INVITE: 'team_invite',
};

/**
 * Типы новостей
 */
export const NEWS_TYPE = {
  NEWS: 'news',
  ANNOUNCEMENT: 'announcement',
  POLL: 'poll',
  BIRTHDAY: 'birthday',
};

/**
 * Таргетинг новостей
 */
export const NEWS_TARGET_TYPE = {
  ALL: 'all',
  TEAM: 'team',
  ROLE: 'role',
  USERS: 'users',
};

/**
 * Типы обратной связи
 */
export const FEEDBACK_TYPE = {
  BUG: 'bug',
  FEATURE: 'feature',
  QUESTION: 'question',
  OTHER: 'other',
};

export const FEEDBACK_TYPE_LABELS = {
  [FEEDBACK_TYPE.BUG]: 'Ошибка',
  [FEEDBACK_TYPE.FEATURE]: 'Предложение',
  [FEEDBACK_TYPE.QUESTION]: 'Вопрос',
  [FEEDBACK_TYPE.OTHER]: 'Другое',
};

/**
 * Статусы обратной связи
 */
export const FEEDBACK_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const FEEDBACK_STATUS_LABELS = {
  [FEEDBACK_STATUS.NEW]: 'Новое',
  [FEEDBACK_STATUS.IN_PROGRESS]: 'В работе',
  [FEEDBACK_STATUS.RESOLVED]: 'Решено',
  [FEEDBACK_STATUS.CLOSED]: 'Закрыто',
};

/**
 * Приоритеты обратной связи
 */
export const FEEDBACK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const FEEDBACK_PRIORITY_LABELS = {
  [FEEDBACK_PRIORITY.LOW]: 'Низкий',
  [FEEDBACK_PRIORITY.MEDIUM]: 'Средний',
  [FEEDBACK_PRIORITY.HIGH]: 'Высокий',
};

/**
 * Лимиты
 */
export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,  // 5MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  PAGE_SIZE: 20,
  TOAST_DURATION: 3000,
};

/**
 * Регулярные выражения для валидации
 */
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /^https?:\/\/.+/,
};
