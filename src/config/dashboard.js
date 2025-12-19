// src/config/dashboard.js
// Конфигурация виджетов дашборда

// Доступные типы виджетов
export const WIDGET_TYPES = {
  // Стандартные
  STATS: 'stats',           // Общая статистика (задачи в работе, выполнено, просрочено)
  MY_TASKS: 'my_tasks',     // Мои задачи на сегодня
  URGENT_TASKS: 'urgent',   // Срочные задачи
  BOARDS: 'boards',         // Мои доски
  TEAMS: 'teams',           // Мои команды
  SKETCHES: 'sketches',     // Последние наброски
  NOTIFICATIONS: 'notifications', // Уведомления
  CALENDAR: 'calendar',     // Календарь на неделю
  
  // Статистика команд
  TEAM_STATS: 'team_stats',      // Статистика команды
  TEAM_PROGRESS: 'team_progress', // Прогресс команды
  
  // AI виджеты
  AI_ANALYZER: 'ai_analyzer',     // AI анализатор встреч
  AI_SUGGESTIONS: 'ai_suggestions', // AI предложения
  
  // Графики
  WEEKLY_CHART: 'weekly_chart',   // График задач за неделю
  BURNDOWN: 'burndown',           // Burndown chart спринта
};

// Конфигурация виджетов
export const WIDGET_CONFIG = {
  [WIDGET_TYPES.STATS]: {
    id: WIDGET_TYPES.STATS,
    title: 'Статистика',
    description: 'Общая статистика по задачам',
    icon: 'TrendingUp',
    size: { xs: 12, md: 4 },
    minHeight: 120,
    default: true,
  },
  [WIDGET_TYPES.MY_TASKS]: {
    id: WIDGET_TYPES.MY_TASKS,
    title: 'Мои задачи',
    description: 'Задачи на сегодня и ближайшие',
    icon: 'Assignment',
    size: { xs: 12, md: 8 },
    minHeight: 300,
    default: true,
  },
  [WIDGET_TYPES.URGENT_TASKS]: {
    id: WIDGET_TYPES.URGENT_TASKS,
    title: 'Срочные задачи',
    description: 'Задачи с высоким приоритетом',
    icon: 'Warning',
    size: { xs: 12, md: 6 },
    minHeight: 250,
    default: true,
  },
  [WIDGET_TYPES.BOARDS]: {
    id: WIDGET_TYPES.BOARDS,
    title: 'Доски',
    description: 'Быстрый доступ к доскам',
    icon: 'ViewKanban',
    size: { xs: 12, md: 6 },
    minHeight: 200,
    default: true,
  },
  [WIDGET_TYPES.TEAMS]: {
    id: WIDGET_TYPES.TEAMS,
    title: 'Команды',
    description: 'Мои команды',
    icon: 'Group',
    size: { xs: 12, md: 6 },
    minHeight: 200,
    default: true,
  },
  [WIDGET_TYPES.SKETCHES]: {
    id: WIDGET_TYPES.SKETCHES,
    title: 'Наброски',
    description: 'Последние наброски',
    icon: 'Lightbulb',
    size: { xs: 12, md: 6 },
    minHeight: 200,
    default: true,
  },
  [WIDGET_TYPES.NOTIFICATIONS]: {
    id: WIDGET_TYPES.NOTIFICATIONS,
    title: 'Уведомления',
    description: 'Последние уведомления',
    icon: 'Notifications',
    size: { xs: 12, md: 4 },
    minHeight: 200,
    default: false,
  },
  [WIDGET_TYPES.CALENDAR]: {
    id: WIDGET_TYPES.CALENDAR,
    title: 'Календарь',
    description: 'Задачи на неделю',
    icon: 'CalendarToday',
    size: { xs: 12, md: 8 },
    minHeight: 300,
    default: false,
  },
  [WIDGET_TYPES.TEAM_STATS]: {
    id: WIDGET_TYPES.TEAM_STATS,
    title: 'Статистика команды',
    description: 'Показатели выбранной команды',
    icon: 'Group',
    size: { xs: 12, md: 6 },
    minHeight: 250,
    default: false,
    hasSettings: true, // Можно выбрать команду
  },
  [WIDGET_TYPES.TEAM_PROGRESS]: {
    id: WIDGET_TYPES.TEAM_PROGRESS,
    title: 'Прогресс команды',
    description: 'Прогресс выполнения задач команды',
    icon: 'TrendingUp',
    size: { xs: 12, md: 6 },
    minHeight: 200,
    default: false,
    hasSettings: true,
  },
  [WIDGET_TYPES.AI_ANALYZER]: {
    id: WIDGET_TYPES.AI_ANALYZER,
    title: 'AI Анализатор',
    description: 'Анализ встреч и создание задач',
    icon: 'Psychology',
    size: { xs: 12, md: 12 },
    minHeight: 400,
    default: true,
  },
  [WIDGET_TYPES.AI_SUGGESTIONS]: {
    id: WIDGET_TYPES.AI_SUGGESTIONS,
    title: 'AI Рекомендации',
    description: 'Умные рекомендации по задачам',
    icon: 'AutoAwesome',
    size: { xs: 12, md: 6 },
    minHeight: 200,
    default: false,
  },
  [WIDGET_TYPES.WEEKLY_CHART]: {
    id: WIDGET_TYPES.WEEKLY_CHART,
    title: 'График за неделю',
    description: 'Выполненные задачи за неделю',
    icon: 'BarChart',
    size: { xs: 12, md: 6 },
    minHeight: 250,
    default: false,
  },
  [WIDGET_TYPES.BURNDOWN]: {
    id: WIDGET_TYPES.BURNDOWN,
    title: 'Burndown Chart',
    description: 'График сгорания спринта',
    icon: 'ShowChart',
    size: { xs: 12, md: 6 },
    minHeight: 250,
    default: false,
  },
};

// Дефолтный порядок виджетов
export const DEFAULT_WIDGET_ORDER = [
  WIDGET_TYPES.STATS,
  WIDGET_TYPES.MY_TASKS,
  WIDGET_TYPES.URGENT_TASKS,
  WIDGET_TYPES.BOARDS,
  WIDGET_TYPES.TEAMS,
  WIDGET_TYPES.SKETCHES,
  WIDGET_TYPES.AI_ANALYZER,
];

// Сохранение конфигурации в localStorage
export const saveDashboardConfig = (config) => {
  localStorage.setItem('dashboard_config', JSON.stringify(config));
};

// Загрузка конфигурации из localStorage
export const loadDashboardConfig = () => {
  try {
    const saved = localStorage.getItem('dashboard_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading dashboard config:', e);
  }
  
  // Возвращаем дефолтную конфигурацию
  return {
    widgets: DEFAULT_WIDGET_ORDER,
    widgetSettings: {},
  };
};

// Получить виджеты с настройками
export const getWidgetsWithConfig = (config) => {
  return config.widgets.map(widgetId => ({
    ...WIDGET_CONFIG[widgetId],
    settings: config.widgetSettings[widgetId] || {},
  })).filter(Boolean);
};

export default {
  WIDGET_TYPES,
  WIDGET_CONFIG,
  DEFAULT_WIDGET_ORDER,
  saveDashboardConfig,
  loadDashboardConfig,
  getWidgetsWithConfig,
};
