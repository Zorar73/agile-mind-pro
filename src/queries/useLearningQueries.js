// src/queries/useLearningQueries.js
// React Query hooks для LMS

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryClient';
import learningService from '../services/learning.service';

// ============ Courses ============

/**
 * Получить все курсы
 */
export function useCourses(filters = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.learning.courses.list(filters),
    queryFn: () => learningService.getCourses(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Получить курс по ID
 */
export function useCourse(courseId, options = {}) {
  return useQuery({
    queryKey: queryKeys.learning.courses.detail(courseId),
    queryFn: () => learningService.getCourse(courseId),
    enabled: !!courseId,
    ...options,
  });
}

/**
 * Получить уроки курса
 */
export function useCourseLessons(courseId, options = {}) {
  return useQuery({
    queryKey: queryKeys.learning.courses.lessons(courseId),
    queryFn: () => learningService.getLessons(courseId),
    enabled: !!courseId,
    ...options,
  });
}

/**
 * Получить прогресс пользователя
 */
export function useUserProgress(userId, courseId, options = {}) {
  return useQuery({
    queryKey: ['learning', 'progress', userId, courseId],
    queryFn: () => learningService.getUserProgress(userId, courseId),
    enabled: !!userId && !!courseId,
    ...options,
  });
}

/**
 * Получить статистику пользователя
 */
export function useUserLearningStats(userId, options = {}) {
  return useQuery({
    queryKey: queryKeys.learning.stats(userId),
    queryFn: () => learningService.getUserStats(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

// ============ Mutations ============

/**
 * Создать курс
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => learningService.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.courses.all });
    },
  });
}

/**
 * Обновить курс
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, data }) => learningService.updateCourse(courseId, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.courses.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.courses.all });
    },
  });
}

/**
 * Удалить курс
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId) => learningService.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.courses.all });
    },
  });
}

/**
 * Записаться на курс
 */
export function useEnrollCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, courseId }) => learningService.enrollUser(userId, courseId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.stats(userId) });
    },
  });
}

/**
 * Завершить урок
 */
export function useCompleteLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, lessonId, courseId }) => 
      learningService.completeLesson(userId, lessonId),
    onSuccess: (_, { userId, courseId }) => {
      queryClient.invalidateQueries({ 
        queryKey: ['learning', 'progress', userId, courseId] 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.stats(userId) });
    },
  });
}

/**
 * Сдать экзамен
 */
export function useSubmitExam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ examId, answers, userId }) => 
      learningService.submitExam(examId, answers),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.stats(userId) });
    },
  });
}

// ============ Categories ============

/**
 * Получить категории
 */
export function useCourseCategories(options = {}) {
  return useQuery({
    queryKey: ['learning', 'categories'],
    queryFn: () => learningService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 минут
    ...options,
  });
}
