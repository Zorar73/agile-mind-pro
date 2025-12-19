// src/utils/debounce.js
// Утилита для отложенного вызова функции (debounce)

/**
 * Создает debounced версию функции, которая откладывает выполнение
 * на указанное количество миллисекунд после последнего вызова
 *
 * @param {Function} func - Функция для debounce
 * @param {number} delay - Задержка в миллисекундах
 * @returns {Function} - Debounced функция
 *
 * @example
 * const debouncedSearch = debounce((query) => {
 *   performSearch(query);
 * }, 300);
 *
 * // При каждом изменении input вызываем debouncedSearch
 * // Фактический поиск выполнится только через 300ms после последнего ввода
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 */
export function debounce(func, delay = 300) {
  let timeoutId;

  return function debounced(...args) {
    // Очищаем предыдущий таймер
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Устанавливаем новый таймер
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Создает debounced версию функции с возможностью немедленного вызова
 * (leading edge) и/или отложенного вызова (trailing edge)
 *
 * @param {Function} func - Функция для debounce
 * @param {number} delay - Задержка в миллисекундах
 * @param {Object} options - Опции { leading: boolean, trailing: boolean }
 * @returns {Function} - Debounced функция с методом cancel()
 */
export function debounceAdvanced(func, delay = 300, { leading = false, trailing = true } = {}) {
  let timeoutId;
  let lastCallTime = 0;

  const debounced = function(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    const callNow = leading && timeSinceLastCall > delay;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (callNow) {
      lastCallTime = now;
      func.apply(this, args);
    }

    if (trailing) {
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        func.apply(this, args);
      }, delay);
    }
  };

  // Метод для отмены ожидающего вызова
  debounced.cancel = function() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

export default debounce;
