// src/utils/errorHandler.js

/**
 * Централизованный обработчик ошибок
 */

// Типы ошибок
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  UNKNOWN: 'unknown',
};

// Пользовательские сообщения об ошибках
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Проблема с подключением к интернету',
  [ERROR_TYPES.AUTH]: 'Ошибка аутентификации. Пожалуйста, войдите снова',
  [ERROR_TYPES.VALIDATION]: 'Проверьте правильность введённых данных',
  [ERROR_TYPES.PERMISSION]: 'У вас нет прав для выполнения этого действия',
  [ERROR_TYPES.NOT_FOUND]: 'Запрашиваемый ресурс не найден',
  [ERROR_TYPES.SERVER]: 'Ошибка сервера. Попробуйте позже',
  [ERROR_TYPES.UNKNOWN]: 'Произошла неизвестная ошибка',
};

/**
 * Определяет тип ошибки
 */
function getErrorType(error) {
  if (!error) return ERROR_TYPES.UNKNOWN;

  // Сетевые ошибки
  if (error.message === 'Network Error' || !navigator.onLine) {
    return ERROR_TYPES.NETWORK;
  }

  // Firebase ошибки аутентификации
  if (error.code?.startsWith('auth/')) {
    return ERROR_TYPES.AUTH;
  }

  // Firebase permission denied
  if (error.code === 'permission-denied') {
    return ERROR_TYPES.PERMISSION;
  }

  // 404
  if (error.code === 'not-found' || error.status === 404) {
    return ERROR_TYPES.NOT_FOUND;
  }

  // Валидация
  if (error.name === 'ValidationError') {
    return ERROR_TYPES.VALIDATION;
  }

  // Серверные ошибки (5xx)
  if (error.status >= 500) {
    return ERROR_TYPES.SERVER;
  }

  return ERROR_TYPES.UNKNOWN;
}

/**
 * Получает пользовательское сообщение для ошибки
 */
export function getErrorMessage(error) {
  if (!error) return ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];

  // Если есть кастомное сообщение
  if (error.userMessage) {
    return error.userMessage;
  }

  // Определяем тип и возвращаем соответствующее сообщение
  const errorType = getErrorType(error);
  return ERROR_MESSAGES[errorType] || error.message || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];
}

/**
 * Логирует ошибку (в будущем можно отправлять в Sentry)
 */
export function logError(error, context = {}) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    type: getErrorType(error),
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // В development - выводим в консоль
  if (import.meta.env.DEV) {
    console.error('Error logged:', errorInfo);
  }

  // TODO: В production - отправлять в Sentry
  // if (import.meta.env.PROD && window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context });
  // }

  return errorInfo;
}

/**
 * Обработчик ошибок для async функций
 * Использование: handleAsyncError(async () => { ... }, 'Loading data')
 */
export async function handleAsyncError(asyncFn, context = '') {
  try {
    return await asyncFn();
  } catch (error) {
    logError(error, { context });
    throw error;
  }
}

/**
 * Wrapper для сервисных методов с обработкой ошибок
 */
export function withErrorHandling(serviceFn, context = '') {
  return async (...args) => {
    try {
      return await serviceFn(...args);
    } catch (error) {
      logError(error, { context, args });
      return {
        success: false,
        error: getErrorMessage(error),
        errorType: getErrorType(error),
      };
    }
  };
}

/**
 * Создаёт кастомную ошибку с пользовательским сообщением
 */
export class AppError extends Error {
  constructor(message, userMessage, type = ERROR_TYPES.UNKNOWN) {
    super(message);
    this.name = 'AppError';
    this.userMessage = userMessage;
    this.type = type;
  }
}

/**
 * Обработчик ошибок для React компонентов
 */
export function handleComponentError(error, errorInfo) {
  logError(error, {
    componentStack: errorInfo.componentStack,
    type: 'React Component Error',
  });
}
