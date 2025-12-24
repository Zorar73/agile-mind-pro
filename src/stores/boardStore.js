// src/stores/boardStore.js
// Zustand store для досок — кэширование и быстрый доступ

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

const useBoardStore = create(
  subscribeWithSelector(
    (set, get) => ({
      // State
      boards: [],
      currentBoard: null,
      columns: [],
      tasks: {},  // { [columnId]: Task[] }
      isLoading: false,
      error: null,
      
      // Filters
      filters: {
        search: '',
        priority: null,
        assignee: null,
        labels: [],
        status: null,
      },
      
      // View mode
      viewMode: 'kanban', // 'kanban' | 'list' | 'timeline'
      
      // Actions - Boards
      setBoards: (boards) => set({ boards }),
      addBoard: (board) => set((state) => ({ 
        boards: [...state.boards, board] 
      })),
      updateBoard: (boardId, updates) => set((state) => ({
        boards: state.boards.map(b => 
          b.id === boardId ? { ...b, ...updates } : b
        ),
        currentBoard: state.currentBoard?.id === boardId 
          ? { ...state.currentBoard, ...updates }
          : state.currentBoard
      })),
      removeBoard: (boardId) => set((state) => ({
        boards: state.boards.filter(b => b.id !== boardId),
        currentBoard: state.currentBoard?.id === boardId ? null : state.currentBoard
      })),
      
      // Actions - Current Board
      setCurrentBoard: (board) => set({ currentBoard: board }),
      setColumns: (columns) => set({ columns }),
      
      // Actions - Tasks
      setTasks: (columnId, tasks) => set((state) => ({
        tasks: { ...state.tasks, [columnId]: tasks }
      })),
      setAllTasks: (tasksByColumn) => set({ tasks: tasksByColumn }),
      
      addTask: (columnId, task) => set((state) => ({
        tasks: {
          ...state.tasks,
          [columnId]: [...(state.tasks[columnId] || []), task]
        }
      })),
      
      updateTask: (taskId, updates) => set((state) => {
        const newTasks = { ...state.tasks };
        for (const columnId in newTasks) {
          newTasks[columnId] = newTasks[columnId].map(t =>
            t.id === taskId ? { ...t, ...updates } : t
          );
        }
        return { tasks: newTasks };
      }),
      
      moveTask: (taskId, fromColumnId, toColumnId, newIndex) => set((state) => {
        const newTasks = { ...state.tasks };
        const fromTasks = [...(newTasks[fromColumnId] || [])];
        const toTasks = fromColumnId === toColumnId 
          ? fromTasks 
          : [...(newTasks[toColumnId] || [])];
        
        const taskIndex = fromTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return state;
        
        const [task] = fromTasks.splice(taskIndex, 1);
        
        if (fromColumnId === toColumnId) {
          fromTasks.splice(newIndex, 0, task);
          newTasks[fromColumnId] = fromTasks;
        } else {
          toTasks.splice(newIndex, 0, { ...task, columnId: toColumnId });
          newTasks[fromColumnId] = fromTasks;
          newTasks[toColumnId] = toTasks;
        }
        
        return { tasks: newTasks };
      }),
      
      removeTask: (taskId) => set((state) => {
        const newTasks = { ...state.tasks };
        for (const columnId in newTasks) {
          newTasks[columnId] = newTasks[columnId].filter(t => t.id !== taskId);
        }
        return { tasks: newTasks };
      }),
      
      // Actions - Columns
      addColumn: (column) => set((state) => ({
        columns: [...state.columns, column],
        tasks: { ...state.tasks, [column.id]: [] }
      })),
      
      updateColumn: (columnId, updates) => set((state) => ({
        columns: state.columns.map(c =>
          c.id === columnId ? { ...c, ...updates } : c
        )
      })),
      
      removeColumn: (columnId) => set((state) => {
        const { [columnId]: removed, ...remainingTasks } = state.tasks;
        return {
          columns: state.columns.filter(c => c.id !== columnId),
          tasks: remainingTasks
        };
      }),
      
      reorderColumns: (newOrder) => set((state) => ({
        columns: newOrder.map((id, index) => {
          const col = state.columns.find(c => c.id === id);
          return col ? { ...col, order: index } : null;
        }).filter(Boolean)
      })),
      
      // Actions - Filters
      setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value }
      })),
      clearFilters: () => set({
        filters: {
          search: '',
          priority: null,
          assignee: null,
          labels: [],
          status: null,
        }
      }),
      
      // Actions - View
      setViewMode: (mode) => set({ viewMode: mode }),
      
      // Loading & Error
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Selectors
      getTaskById: (taskId) => {
        const state = get();
        for (const tasks of Object.values(state.tasks)) {
          const task = tasks.find(t => t.id === taskId);
          if (task) return task;
        }
        return null;
      },
      
      getFilteredTasks: (columnId) => {
        const state = get();
        let tasks = state.tasks[columnId] || [];
        const { search, priority, assignee, labels } = state.filters;
        
        if (search) {
          const searchLower = search.toLowerCase();
          tasks = tasks.filter(t => 
            t.title?.toLowerCase().includes(searchLower) ||
            t.description?.toLowerCase().includes(searchLower)
          );
        }
        
        if (priority) {
          tasks = tasks.filter(t => t.priority === priority);
        }
        
        if (assignee) {
          tasks = tasks.filter(t => t.assigneeId === assignee);
        }
        
        if (labels?.length > 0) {
          tasks = tasks.filter(t => 
            t.labels?.some(l => labels.includes(l))
          );
        }
        
        return tasks;
      },
      
      getTotalTaskCount: () => {
        const state = get();
        return Object.values(state.tasks).reduce((sum, tasks) => sum + tasks.length, 0);
      },
      
      // Reset
      reset: () => set({
        currentBoard: null,
        columns: [],
        tasks: {},
        filters: {
          search: '',
          priority: null,
          assignee: null,
          labels: [],
          status: null,
        },
        error: null,
      }),
    })
  )
);

export default useBoardStore;
