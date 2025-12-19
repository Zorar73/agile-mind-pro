// src/contexts/DrawerStackContext.jsx
// Context для управления стеком drawer'ов

import React, { createContext, useContext, useState, useCallback } from 'react';

const DrawerStackContext = createContext();

export const useDrawerStack = () => {
  const context = useContext(DrawerStackContext);
  if (!context) {
    throw new Error('useDrawerStack must be used within DrawerStackProvider');
  }
  return context;
};

/**
 * Provider для управления стеком drawer'ов
 * Позволяет открывать множественные drawer'ы с плавным сдвигом влево
 */
export function DrawerStackProvider({ children }) {
  const [drawerStack, setDrawerStack] = useState([]);

  /**
   * Открыть drawer
   * @param {Object} drawer - Данные drawer'а
   * @param {string} drawer.id - Уникальный ID
   * @param {string} drawer.type - Тип (task/board/sketch/team/user/etc)
   * @param {string} drawer.entityId - ID сущности
   * @param {Object} drawer.data - Дополнительные данные
   */
  const openDrawer = useCallback((drawer) => {
    setDrawerStack((prev) => {
      // Проверяем, не открыт ли уже этот drawer
      const exists = prev.find(d => d.id === drawer.id);
      if (exists) {
        // Если открыт, переносим его в конец (на передний план)
        return [...prev.filter(d => d.id !== drawer.id), drawer];
      }

      // Добавляем новый drawer
      return [...prev, { ...drawer, timestamp: Date.now() }];
    });
  }, []);

  /**
   * Закрыть drawer
   * @param {string} drawerId - ID drawer'а
   */
  const closeDrawer = useCallback((drawerId) => {
    setDrawerStack((prev) => prev.filter(d => d.id !== drawerId));
  }, []);

  /**
   * Закрыть все drawer'ы
   */
  const closeAllDrawers = useCallback(() => {
    setDrawerStack([]);
  }, []);

  /**
   * Закрыть все drawer'ы кроме первого
   */
  const closeOthers = useCallback((drawerId) => {
    setDrawerStack((prev) => prev.filter(d => d.id === drawerId));
  }, []);

  /**
   * Получить позицию drawer'а в стеке
   * @param {string} drawerId - ID drawer'а
   * @returns {number} - Индекс в стеке (0 = самый первый, -1 = не найден)
   */
  const getDrawerPosition = useCallback((drawerId) => {
    return drawerStack.findIndex(d => d.id === drawerId);
  }, [drawerStack]);

  /**
   * Получить количество drawer'ов в стеке
   */
  const getStackSize = useCallback(() => {
    return drawerStack.length;
  }, [drawerStack]);

  /**
   * Проверить, является ли drawer самым верхним
   */
  const isTopDrawer = useCallback((drawerId) => {
    if (drawerStack.length === 0) return false;
    return drawerStack[drawerStack.length - 1].id === drawerId;
  }, [drawerStack]);

  const value = {
    drawerStack,
    openDrawer,
    closeDrawer,
    closeAllDrawers,
    closeOthers,
    getDrawerPosition,
    getStackSize,
    isTopDrawer,
  };

  return (
    <DrawerStackContext.Provider value={value}>
      {children}
    </DrawerStackContext.Provider>
  );
}

export default DrawerStackContext;
