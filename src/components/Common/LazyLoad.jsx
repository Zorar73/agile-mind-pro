// src/components/Common/LazyLoad.jsx
// Компоненты для lazy loading страниц

import React, { Suspense, lazy } from 'react';
import { Box, CircularProgress, Skeleton, Typography } from '@mui/material';

/**
 * Fallback компонент для загрузки страницы
 */
export function PageLoader({ message = 'Загрузка...' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}

/**
 * Fallback для карточек
 */
export function CardSkeleton({ count = 3 }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={120}
          animation="wave"
        />
      ))}
    </Box>
  );
}

/**
 * Fallback для таблицы
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={40} />
        ))}
      </Box>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 1 }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              width={`${100 / columns}%`}
              height={32}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

/**
 * Fallback для списка
 */
export function ListSkeleton({ count = 5 }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Lazy page wrapper
 */
export function LazyPage({ children, fallback }) {
  return (
    <Suspense fallback={fallback || <PageLoader />}>
      {children}
    </Suspense>
  );
}

/**
 * Создать lazy компонент с retry логикой
 */
export function lazyWithRetry(importFn, retries = 3, delay = 1000) {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const tryImport = (attemptsLeft) => {
        importFn()
          .then(resolve)
          .catch((error) => {
            if (attemptsLeft <= 1) {
              reject(error);
              return;
            }
            
            setTimeout(() => {
              tryImport(attemptsLeft - 1);
            }, delay);
          });
      };
      
      tryImport(retries);
    });
  });
}

/**
 * Preload компонент (для hover preload)
 */
export function preloadComponent(importFn) {
  importFn();
}

// ============ Lazy Pages ============

// Тяжёлые страницы
export const LazyBoardPage = lazyWithRetry(() => import('../../pages/BoardPage'));
export const LazyCalendarPage = lazyWithRetry(() => import('../../pages/CalendarPage'));
export const LazyLandingPage = lazyWithRetry(() => import('../../pages/LandingPage'));
export const LazyLearningPortalPage = lazyWithRetry(() => import('../../pages/LearningPortalPage'));
export const LazyExamTakingPage = lazyWithRetry(() => import('../../pages/ExamTakingPage'));
export const LazyProfilePage = lazyWithRetry(() => import('../../pages/ProfilePage'));
export const LazySettingsPage = lazyWithRetry(() => import('../../pages/SettingsPage'));
export const LazyDashboardPage = lazyWithRetry(() => import('../../pages/DashboardPage'));
export const LazyMyTasksPage = lazyWithRetry(() => import('../../pages/MyTasksPage'));
export const LazyUsersPage = lazyWithRetry(() => import('../../pages/UsersPage'));

// Admin pages
export const LazyRolesPage = lazyWithRetry(() => import('../../pages/admin/RolesPage'));
export const LazyAdminFeedbackPage = lazyWithRetry(() => import('../../pages/admin/AdminFeedbackPage'));
export const LazyLearningAdminPage = lazyWithRetry(() => import('../../pages/LearningAdminPage'));
export const LazyLearningAnalyticsPage = lazyWithRetry(() => import('../../pages/LearningAnalyticsPage'));

export default LazyPage;
