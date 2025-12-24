// src/stores/uiStore.js
// Zustand store для UI состояния — сайдбар, модалки, toast

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set, get) => ({
      // Sidebar
      sidebarOpen: true,
      sidebarBoardsExpanded: true,
      sidebarAdminExpanded: false,
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleBoardsExpanded: () => set((state) => ({ 
        sidebarBoardsExpanded: !state.sidebarBoardsExpanded 
      })),
      toggleAdminExpanded: () => set((state) => ({ 
        sidebarAdminExpanded: !state.sidebarAdminExpanded 
      })),
      
      // Theme
      themeMode: 'system', // 'light' | 'dark' | 'system'
      setThemeMode: (mode) => set({ themeMode: mode }),
      
      // Compact mode
      compactMode: false,
      setCompactMode: (compact) => set({ compactMode: compact }),
      
      // Active drawers/modals
      activeDrawer: null, // { type: 'task' | 'sketch' | 'team', id: string, data?: any }
      drawerStack: [],
      
      openDrawer: (type, id, data = null) => set((state) => ({
        activeDrawer: { type, id, data },
        drawerStack: [...state.drawerStack, { type, id, data }]
      })),
      
      closeDrawer: () => set((state) => {
        const newStack = state.drawerStack.slice(0, -1);
        return {
          activeDrawer: newStack[newStack.length - 1] || null,
          drawerStack: newStack
        };
      }),
      
      closeAllDrawers: () => set({ activeDrawer: null, drawerStack: [] }),
      
      // Command palette / search
      commandPaletteOpen: false,
      toggleCommandPalette: () => set((state) => ({ 
        commandPaletteOpen: !state.commandPaletteOpen 
      })),
      
      // Toast notifications (quick messages)
      toasts: [],
      addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { 
          id: Date.now(), 
          ...toast,
          createdAt: new Date()
        }]
      })),
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      })),
      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        sidebarBoardsExpanded: state.sidebarBoardsExpanded,
        sidebarAdminExpanded: state.sidebarAdminExpanded,
        themeMode: state.themeMode,
        compactMode: state.compactMode,
      }),
    }
  )
);

export default useUIStore;
