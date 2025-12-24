// src/hooks/index.js
// Экспорт всех хуков

export { default as useLocalStorage } from './useLocalStorage';
export { usePermissions, useModulePermission } from './usePermissions';

// Performance hooks
export {
  useDebounce,
  useDebouncedValue,
  useThrottle,
  useIntersectionObserver,
  usePrevious,
  useStableCallback,
  useMemoizedSelector,
  useWindowSize,
  useMediaQuery,
  useIsMounted,
  useAsyncState,
} from './usePerformance';
