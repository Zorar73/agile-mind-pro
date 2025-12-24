// src/constants/roles.js
import {
  Assignment,
  ViewKanban,
  Timeline,
  CalendarToday,
  Lightbulb,
  Group,
  Article,
  School,
  Chat,
  MenuBook,
  Person,
  SupportAgent,
} from '@mui/icons-material';

/**
 * Уровни доступа к модулям
 */
export const ACCESS_LEVELS = {
  NONE: 'none',
  VIEW: 'view',
  EDIT: 'edit',
  ADMIN: 'admin',
};

/**
 * Модули системы
 */
export const MODULES = {
  TASKS: 'tasks',
  BOARDS: 'boards',
  SPRINTS: 'sprints',
  CALENDAR: 'calendar',
  SKETCHES: 'sketches',
  TEAMS: 'teams',
  NEWS: 'news',
  LEARNING: 'learning',
  CHAT: 'chat',
  KNOWLEDGE: 'knowledge',
  PROFILE: 'profile',
  FEEDBACK_ADMIN: 'feedback_admin',
};

/**
 * Метаданные модулей
 * icon - это компонент, который нужно рендерить как <Icon />
 */
export const MODULE_META = {
  [MODULES.TASKS]: {
    label: 'Задачи',
    description: 'Управление задачами',
    icon: Assignment,
    group: 'work',
  },
  [MODULES.BOARDS]: {
    label: 'Доски',
    description: 'Kanban доски',
    icon: ViewKanban,
    group: 'work',
  },
  [MODULES.SPRINTS]: {
    label: 'Спринты',
    description: 'Планирование спринтов',
    icon: Timeline,
    group: 'work',
  },
  [MODULES.CALENDAR]: {
    label: 'Календарь',
    description: 'События и дедлайны',
    icon: CalendarToday,
    group: 'work',
  },
  [MODULES.SKETCHES]: {
    label: 'Наброски',
    description: 'Быстрые заметки',
    icon: Lightbulb,
    group: 'work',
  },
  [MODULES.TEAMS]: {
    label: 'Команды',
    description: 'Управление командами',
    icon: Group,
    group: 'work',
  },
  [MODULES.NEWS]: {
    label: 'Новости',
    description: 'Лента новостей',
    icon: Article,
    group: 'communication',
  },
  [MODULES.LEARNING]: {
    label: 'Обучение',
    description: 'Курсы и тесты',
    icon: School,
    group: 'learning',
  },
  [MODULES.CHAT]: {
    label: 'Чат',
    description: 'Общение в командах',
    icon: Chat,
    group: 'communication',
  },
  [MODULES.KNOWLEDGE]: {
    label: 'База знаний',
    description: 'Документы и инструкции',
    icon: MenuBook,
    group: 'learning',
  },
  [MODULES.PROFILE]: {
    label: 'Профиль',
    description: 'Личные данные',
    icon: Person,
    group: 'personal',
  },
  [MODULES.FEEDBACK_ADMIN]: {
    label: 'Обратная связь (Админ)',
    description: 'Управление обращениями пользователей',
    icon: SupportAgent,
    group: 'admin',
  },
};

/**
 * Группы модулей для UI
 */
export const MODULE_GROUPS = {
  work: {
    label: 'Работа',
    modules: [
      MODULES.TASKS,
      MODULES.BOARDS,
      MODULES.SPRINTS,
      MODULES.CALENDAR,
      MODULES.SKETCHES,
      MODULES.TEAMS,
    ],
  },
  communication: {
    label: 'Коммуникации',
    modules: [MODULES.NEWS, MODULES.CHAT],
  },
  learning: {
    label: 'Обучение',
    modules: [MODULES.LEARNING, MODULES.KNOWLEDGE],
  },
  personal: {
    label: 'Личное',
    modules: [MODULES.PROFILE],
  },
  admin: {
    label: 'Администрирование',
    modules: [MODULES.FEEDBACK_ADMIN],
  },
};

/**
 * Системные роли (ID ролей)
 */
export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  OFFICE: 'office',
  RETAIL_MANAGER: 'retail_manager',
  RETAIL: 'retail',
  TRAINEE: 'trainee',
};

/**
 * Конфигурация системных ролей по умолчанию
 */
export const DEFAULT_ROLES_CONFIG = [
  {
    id: SYSTEM_ROLES.ADMIN,
    name: 'Администратор',
    description: 'Полный доступ ко всем модулям',
    isSystem: true,
    isDefault: false,
    modules: {
      [MODULES.TASKS]: ACCESS_LEVELS.ADMIN,
      [MODULES.BOARDS]: ACCESS_LEVELS.ADMIN,
      [MODULES.SPRINTS]: ACCESS_LEVELS.ADMIN,
      [MODULES.CALENDAR]: ACCESS_LEVELS.ADMIN,
      [MODULES.SKETCHES]: ACCESS_LEVELS.ADMIN,
      [MODULES.TEAMS]: ACCESS_LEVELS.ADMIN,
      [MODULES.NEWS]: ACCESS_LEVELS.ADMIN,
      [MODULES.LEARNING]: ACCESS_LEVELS.ADMIN,
      [MODULES.CHAT]: ACCESS_LEVELS.ADMIN,
      [MODULES.KNOWLEDGE]: ACCESS_LEVELS.ADMIN,
      [MODULES.PROFILE]: ACCESS_LEVELS.EDIT,
    },
  },
  {
    id: SYSTEM_ROLES.OFFICE,
    name: 'Офис',
    description: 'Офисные сотрудники - полный функционал',
    isSystem: true,
    isDefault: true,
    modules: {
      [MODULES.TASKS]: ACCESS_LEVELS.EDIT,
      [MODULES.BOARDS]: ACCESS_LEVELS.EDIT,
      [MODULES.SPRINTS]: ACCESS_LEVELS.EDIT,
      [MODULES.CALENDAR]: ACCESS_LEVELS.EDIT,
      [MODULES.SKETCHES]: ACCESS_LEVELS.EDIT,
      [MODULES.TEAMS]: ACCESS_LEVELS.EDIT,
      [MODULES.NEWS]: ACCESS_LEVELS.VIEW,
      [MODULES.LEARNING]: ACCESS_LEVELS.VIEW,
      [MODULES.CHAT]: ACCESS_LEVELS.EDIT,
      [MODULES.KNOWLEDGE]: ACCESS_LEVELS.EDIT,
      [MODULES.PROFILE]: ACCESS_LEVELS.EDIT,
    },
  },
  {
    id: SYSTEM_ROLES.RETAIL_MANAGER,
    name: 'Руководитель команды',
    description: 'Руководители розничных команд',
    isSystem: true,
    isDefault: false,
    modules: {
      [MODULES.TASKS]: ACCESS_LEVELS.NONE,
      [MODULES.BOARDS]: ACCESS_LEVELS.NONE,
      [MODULES.SPRINTS]: ACCESS_LEVELS.NONE,
      [MODULES.CALENDAR]: ACCESS_LEVELS.NONE,
      [MODULES.SKETCHES]: ACCESS_LEVELS.NONE,
      [MODULES.TEAMS]: ACCESS_LEVELS.EDIT,
      [MODULES.NEWS]: ACCESS_LEVELS.EDIT,
      [MODULES.LEARNING]: ACCESS_LEVELS.ADMIN,
      [MODULES.CHAT]: ACCESS_LEVELS.EDIT,
      [MODULES.KNOWLEDGE]: ACCESS_LEVELS.EDIT,
      [MODULES.PROFILE]: ACCESS_LEVELS.EDIT,
    },
  },
  {
    id: SYSTEM_ROLES.RETAIL,
    name: 'Сотрудник',
    description: 'Розничные сотрудники',
    isSystem: true,
    isDefault: false,
    modules: {
      [MODULES.TASKS]: ACCESS_LEVELS.NONE,
      [MODULES.BOARDS]: ACCESS_LEVELS.NONE,
      [MODULES.SPRINTS]: ACCESS_LEVELS.NONE,
      [MODULES.CALENDAR]: ACCESS_LEVELS.NONE,
      [MODULES.SKETCHES]: ACCESS_LEVELS.NONE,
      [MODULES.TEAMS]: ACCESS_LEVELS.VIEW,
      [MODULES.NEWS]: ACCESS_LEVELS.VIEW,
      [MODULES.LEARNING]: ACCESS_LEVELS.VIEW,
      [MODULES.CHAT]: ACCESS_LEVELS.EDIT,
      [MODULES.KNOWLEDGE]: ACCESS_LEVELS.VIEW,
      [MODULES.PROFILE]: ACCESS_LEVELS.EDIT,
    },
  },
  {
    id: SYSTEM_ROLES.TRAINEE,
    name: 'Стажёр',
    description: 'Новые сотрудники на испытательном сроке',
    isSystem: true,
    isDefault: false,
    modules: {
      [MODULES.TASKS]: ACCESS_LEVELS.NONE,
      [MODULES.BOARDS]: ACCESS_LEVELS.NONE,
      [MODULES.SPRINTS]: ACCESS_LEVELS.NONE,
      [MODULES.CALENDAR]: ACCESS_LEVELS.NONE,
      [MODULES.SKETCHES]: ACCESS_LEVELS.NONE,
      [MODULES.TEAMS]: ACCESS_LEVELS.NONE,
      [MODULES.NEWS]: ACCESS_LEVELS.VIEW,
      [MODULES.LEARNING]: ACCESS_LEVELS.VIEW,
      [MODULES.CHAT]: ACCESS_LEVELS.NONE,
      [MODULES.KNOWLEDGE]: ACCESS_LEVELS.VIEW,
      [MODULES.PROFILE]: ACCESS_LEVELS.EDIT,
    },
  },
];

/**
 * Проверка, есть ли доступ к модулю
 */
export function hasModuleAccess(moduleAccess, requiredLevel = ACCESS_LEVELS.VIEW) {
  if (!moduleAccess || moduleAccess === ACCESS_LEVELS.NONE) {
    return false;
  }

  const levels = [ACCESS_LEVELS.NONE, ACCESS_LEVELS.VIEW, ACCESS_LEVELS.EDIT, ACCESS_LEVELS.ADMIN];
  const currentIndex = levels.indexOf(moduleAccess);
  const requiredIndex = levels.indexOf(requiredLevel);

  return currentIndex >= requiredIndex;
}
