// src/constants/learning.js

/**
 * Статусы курсов
 */
export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

/**
 * Сложность курсов
 */
export const COURSE_DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

export const DIFFICULTY_LABELS = {
  [COURSE_DIFFICULTY.BEGINNER]: 'Начальный',
  [COURSE_DIFFICULTY.INTERMEDIATE]: 'Средний',
  [COURSE_DIFFICULTY.ADVANCED]: 'Продвинутый',
};

/**
 * Типы уроков
 */
export const LESSON_TYPE = {
  THEORY: 'theory',
  TEST: 'test',
  PRACTICE: 'practice',
};

export const LESSON_TYPE_LABELS = {
  [LESSON_TYPE.THEORY]: 'Теория',
  [LESSON_TYPE.TEST]: 'Тест',
  [LESSON_TYPE.PRACTICE]: 'Практика',
};

/**
 * Типы вопросов в тестах
 */
export const QUESTION_TYPE = {
  SINGLE: 'single',          // Один правильный ответ
  MULTIPLE: 'multiple',      // Несколько правильных ответов
  YESNO: 'yesno',           // Да/Нет
  MATCH: 'match',           // Сопоставление
  OPEN: 'open',             // Открытый вопрос
  IMAGE: 'image',           // С картинкой
};

export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPE.SINGLE]: 'Один вариант',
  [QUESTION_TYPE.MULTIPLE]: 'Несколько вариантов',
  [QUESTION_TYPE.YESNO]: 'Да/Нет',
  [QUESTION_TYPE.MATCH]: 'Сопоставление',
  [QUESTION_TYPE.OPEN]: 'Открытый вопрос',
  [QUESTION_TYPE.IMAGE]: 'С изображением',
};

/**
 * Статусы записи на курс (enrollments)
 */
export const ENROLLMENT_STATUS = {
  ASSIGNED: 'assigned',         // Назначено
  IN_PROGRESS: 'in_progress',   // В процессе
  COMPLETED: 'completed',       // Завершено
  EXPIRED: 'expired',           // Просрочено
};

export const ENROLLMENT_STATUS_LABELS = {
  [ENROLLMENT_STATUS.ASSIGNED]: 'Назначен',
  [ENROLLMENT_STATUS.IN_PROGRESS]: 'В процессе',
  [ENROLLMENT_STATUS.COMPLETED]: 'Завершён',
  [ENROLLMENT_STATUS.EXPIRED]: 'Просрочен',
};

export const ENROLLMENT_STATUS_COLORS = {
  [ENROLLMENT_STATUS.ASSIGNED]: 'info',
  [ENROLLMENT_STATUS.IN_PROGRESS]: 'primary',
  [ENROLLMENT_STATUS.COMPLETED]: 'success',
  [ENROLLMENT_STATUS.EXPIRED]: 'error',
};

/**
 * Типы дедлайнов
 */
export const DEADLINE_TYPE = {
  DAYS_AFTER_ASSIGN: 'days_after_assign',  // N дней после назначения
  FIXED_DATE: 'fixed_date',                // Фиксированная дата
};

/**
 * Статусы практических заданий
 */
export const PRACTICE_STATUS = {
  PENDING: 'pending',       // Ожидает проверки
  APPROVED: 'approved',     // Одобрено
  REJECTED: 'rejected',     // Отклонено
};

export const PRACTICE_STATUS_LABELS = {
  [PRACTICE_STATUS.PENDING]: 'На проверке',
  [PRACTICE_STATUS.APPROVED]: 'Одобрено',
  [PRACTICE_STATUS.REJECTED]: 'Отклонено',
};

/**
 * Типы отправки практических заданий
 */
export const SUBMISSION_TYPE = {
  TEXT: 'text',
  FILE: 'file',
  PHOTO: 'photo',
  VIDEO: 'video',
};

/**
 * Типы проверки практических заданий
 */
export const REVIEW_TYPE = {
  MANUAL: 'manual',           // Ручная проверка
  AUTO_APPROVE: 'auto_approve', // Автоодобрение
};

/**
 * Статусы проверки экзаменов
 */
export const GRADING_STATUS = {
  AUTO: 'auto',           // Автопроверка
  PENDING: 'pending',     // Ожидает проверки
  GRADED: 'graded',       // Проверено
};

/**
 * ID системных достижений
 */
export const ACHIEVEMENTS = {
  FIRST_COURSE: 'first_course',
  PERFECT_SCORE: 'perfect_score',
  MARATHON: 'marathon',
  EXPERT: 'expert', // + categoryId
};

/**
 * Метаданные достижений
 */
export const ACHIEVEMENT_META = {
  [ACHIEVEMENTS.FIRST_COURSE]: {
    title: 'Первый курс',
    description: 'Завершили первый курс',
    icon: 'EmojiEvents',
    color: '#FDD835',
  },
  [ACHIEVEMENTS.PERFECT_SCORE]: {
    title: 'Отличник',
    description: 'Получили 100% по тесту',
    icon: 'Star',
    color: '#FF6F00',
  },
  [ACHIEVEMENTS.MARATHON]: {
    title: 'Марафонец',
    description: 'Завершили 5 курсов за месяц',
    icon: 'Whatshot',
    color: '#E53935',
  },
  [ACHIEVEMENTS.EXPERT]: {
    title: 'Эксперт',
    description: 'Завершили все курсы категории',
    icon: 'School',
    color: '#7E57C2',
  },
};

/**
 * Напоминания о дедлайнах (дни до)
 */
export const DEADLINE_REMINDERS = {
  EARLY: 3,    // За 3 дня
  LATE: 1,     // За 1 день
};
