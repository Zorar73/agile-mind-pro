// src/hooks/usePerformance.js
// Хуки для оптимизации производительности

import { useCallback, useRef, useMemo, useEffect, useState } from 'react';

/**
 * Debounce хук — отложенный вызов функции
 * @param {Function} callback - Функция для вызова
 * @param {number} delay - Задержка в мс
 */
export function useDebounce(callback, delay = 300) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  
  // Обновляем ref при изменении callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
  
  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
}

/**
 * Debounced value — отложенное значение
 * @param {any} value - Значение
 * @param {number} delay - Задержка в мс
 */
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Throttle хук — ограничение частоты вызова
 * @param {Function} callback - Функция для вызова
 * @param {number} limit - Минимальный интервал в мс
 */
export function useThrottle(callback, limit = 300) {
  const lastCallRef = useRef(0);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCallRef.current >= limit) {
      lastCallRef.current = now;
      callbackRef.current(...args);
    }
  }, [limit]);
}

/**
 * Intersection Observer хук — для lazy loading
 * @param {Object} options - Опции IntersectionObserver
 */
export function useIntersectionObserver(options = {}) {
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);
  
  const observer = useRef(null);
  
  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      {
        threshold: 0.1,
        rootMargin: '100px',
        ...options,
      }
    );
    
    if (node) {
      observer.current.observe(node);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [node, options.threshold, options.rootMargin]);
  
  return [setNode, entry?.isIntersecting ?? false, entry];
}

/**
 * Previous value хук — предыдущее значение
 * @param {any} value - Текущее значение
 */
export function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Stable callback хук — стабильная ссылка на callback
 * Решает проблему пересоздания функций
 */
export function useStableCallback(callback) {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
}

/**
 * Memoized selector — мемоизированный селектор для объектов
 * @param {Object} object - Объект
 * @param {string[]} keys - Ключи для извлечения
 */
export function useMemoizedSelector(object, keys) {
  return useMemo(() => {
    if (!object) return null;
    return keys.reduce((acc, key) => {
      acc[key] = object[key];
      return acc;
    }, {});
  }, [object, ...keys.map(key => object?.[key])]);
}

/**
 * Window size хук с throttle
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  useEffect(() => {
    let timeoutId = null;
    
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
  
  return size;
}

/**
 * Media query хук
 * @param {string} query - CSS media query
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handler = (event) => setMatches(event.matches);
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    // Legacy browsers
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, [query]);
  
  return matches;
}

/**
 * Mount state хук — проверка монтирования компонента
 */
export function useIsMounted() {
  const isMounted = useRef(false);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return useCallback(() => isMounted.current, []);
}

/**
 * Async state хук — для асинхронных операций
 */
export function useAsyncState(asyncFunction) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });
  
  const isMounted = useIsMounted();
  
  const execute = useCallback(async (...args) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await asyncFunction(...args);
      if (isMounted()) {
        setState({ data: result, loading: false, error: null });
      }
      return result;
    } catch (error) {
      if (isMounted()) {
        setState({ data: null, loading: false, error });
      }
      throw error;
    }
  }, [asyncFunction, isMounted]);
  
  return { ...state, execute };
}
