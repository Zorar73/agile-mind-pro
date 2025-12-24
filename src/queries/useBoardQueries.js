// src/queries/useBoardQueries.js
// React Query hooks для досок

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryClient';
import boardService from '../services/board.service';
import { useBoardStore } from '../stores';

// ============ Queries ============

/**
 * Получить все доски пользователя
 */
export function useBoards(userId, options = {}) {
  const setBoards = useBoardStore((state) => state.setBoards);
  
  return useQuery({
    queryKey: queryKeys.boards.all,
    queryFn: () => boardService.getUserBoards(userId),
    enabled: !!userId,
    onSuccess: (data) => {
      setBoards(data);
    },
    ...options,
  });
}

/**
 * Получить одну доску
 */
export function useBoard(boardId, options = {}) {
  const setCurrentBoard = useBoardStore((state) => state.setCurrentBoard);
  
  return useQuery({
    queryKey: queryKeys.boards.detail(boardId),
    queryFn: () => boardService.getBoard(boardId),
    enabled: !!boardId,
    onSuccess: (data) => {
      setCurrentBoard(data);
    },
    ...options,
  });
}

/**
 * Получить колонки доски
 */
export function useBoardColumns(boardId, options = {}) {
  const setColumns = useBoardStore((state) => state.setColumns);
  
  return useQuery({
    queryKey: queryKeys.boards.columns(boardId),
    queryFn: () => boardService.getColumns(boardId),
    enabled: !!boardId,
    onSuccess: (data) => {
      setColumns(data);
    },
    ...options,
  });
}

/**
 * Получить задачи доски
 */
export function useBoardTasks(boardId, options = {}) {
  const setAllTasks = useBoardStore((state) => state.setAllTasks);
  
  return useQuery({
    queryKey: queryKeys.boards.tasks(boardId),
    queryFn: async () => {
      const columns = await boardService.getColumns(boardId);
      const tasksByColumn = {};
      
      for (const column of columns) {
        const tasks = await boardService.getTasks(boardId, column.id);
        tasksByColumn[column.id] = tasks;
      }
      
      return tasksByColumn;
    },
    enabled: !!boardId,
    onSuccess: (data) => {
      setAllTasks(data);
    },
    ...options,
  });
}

// ============ Mutations ============

/**
 * Создать доску
 */
export function useCreateBoard() {
  const queryClient = useQueryClient();
  const addBoard = useBoardStore((state) => state.addBoard);
  
  return useMutation({
    mutationFn: (data) => boardService.createBoard(data),
    onSuccess: (newBoard) => {
      addBoard(newBoard);
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
    },
  });
}

/**
 * Обновить доску
 */
export function useUpdateBoard() {
  const queryClient = useQueryClient();
  const updateBoard = useBoardStore((state) => state.updateBoard);
  
  return useMutation({
    mutationFn: ({ boardId, data }) => boardService.updateBoard(boardId, data),
    onMutate: async ({ boardId, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.boards.detail(boardId) });
      const previousBoard = queryClient.getQueryData(queryKeys.boards.detail(boardId));
      updateBoard(boardId, data);
      return { previousBoard };
    },
    onError: (err, { boardId }, context) => {
      // Rollback
      if (context?.previousBoard) {
        updateBoard(boardId, context.previousBoard);
      }
    },
    onSettled: (_, __, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) });
    },
  });
}

/**
 * Удалить доску
 */
export function useDeleteBoard() {
  const queryClient = useQueryClient();
  const removeBoard = useBoardStore((state) => state.removeBoard);
  
  return useMutation({
    mutationFn: (boardId) => boardService.deleteBoard(boardId),
    onSuccess: (_, boardId) => {
      removeBoard(boardId);
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
    },
  });
}

/**
 * Создать колонку
 */
export function useCreateColumn() {
  const queryClient = useQueryClient();
  const addColumn = useBoardStore((state) => state.addColumn);
  
  return useMutation({
    mutationFn: ({ boardId, data }) => boardService.createColumn(boardId, data),
    onSuccess: (newColumn, { boardId }) => {
      addColumn(newColumn);
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.columns(boardId) });
    },
  });
}

/**
 * Создать задачу
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const addTask = useBoardStore((state) => state.addTask);
  
  return useMutation({
    mutationFn: ({ boardId, columnId, data }) => 
      boardService.createTask(boardId, columnId, data),
    onSuccess: (newTask, { boardId, columnId }) => {
      addTask(columnId, newTask);
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.tasks(boardId) });
    },
  });
}

/**
 * Обновить задачу
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const updateTask = useBoardStore((state) => state.updateTask);
  
  return useMutation({
    mutationFn: ({ taskId, data }) => boardService.updateTask(taskId, data),
    onMutate: async ({ taskId, data }) => {
      // Optimistic update
      updateTask(taskId, data);
    },
    onSettled: (_, __, { boardId }) => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.boards.tasks(boardId) });
      }
    },
  });
}

/**
 * Переместить задачу
 */
export function useMoveTask() {
  const queryClient = useQueryClient();
  const moveTask = useBoardStore((state) => state.moveTask);
  
  return useMutation({
    mutationFn: async ({ taskId, fromColumnId, toColumnId, newIndex, boardId }) => {
      // Update in Firebase
      await boardService.moveTask(taskId, toColumnId, newIndex);
      return { taskId, fromColumnId, toColumnId, newIndex };
    },
    onMutate: async ({ taskId, fromColumnId, toColumnId, newIndex }) => {
      // Optimistic update
      moveTask(taskId, fromColumnId, toColumnId, newIndex);
    },
    onSettled: (_, __, { boardId }) => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.boards.tasks(boardId) });
      }
    },
  });
}

/**
 * Удалить задачу
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const removeTask = useBoardStore((state) => state.removeTask);
  
  return useMutation({
    mutationFn: ({ taskId }) => boardService.deleteTask(taskId),
    onSuccess: (_, { taskId, boardId }) => {
      removeTask(taskId);
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.boards.tasks(boardId) });
      }
    },
  });
}
