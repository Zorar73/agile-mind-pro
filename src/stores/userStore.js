// src/stores/userStore.js
// Zustand store для пользователя — заменяет UserContext

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';

const useUserStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // State
        user: null,
        isLoading: true,
        isAuthenticated: false,
        
        // Actions
        setUser: (user) => set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        }),
        
        clearUser: () => set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        }),
        
        setLoading: (isLoading) => set({ isLoading }),
        
        updateUser: (updates) => set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        })),
        
        // Selectors
        getUserId: () => get().user?.uid,
        getUserRole: () => get().user?.role || get().user?.roleId,
        isAdmin: () => {
          const user = get().user;
          return user?.role === 'admin' || user?.role === 'owner' || user?.roleId === 'admin';
        },
      }),
      {
        name: 'user-storage',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({ 
          user: state.user,
          isAuthenticated: state.isAuthenticated 
        }),
      }
    )
  )
);

export default useUserStore;
