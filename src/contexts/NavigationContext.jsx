// src/contexts/NavigationContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [pageTitle, setPageTitle] = useState('');

  // Установить хлебные крошки
  const setBreadcrumbItems = useCallback((items) => {
    setBreadcrumbs(items);
  }, []);

  // Добавить элемент в конец
  const pushBreadcrumb = useCallback((item) => {
    setBreadcrumbs(prev => [...prev, item]);
  }, []);

  // Удалить последний элемент
  const popBreadcrumb = useCallback(() => {
    setBreadcrumbs(prev => prev.slice(0, -1));
  }, []);

  // Очистить хлебные крошки
  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbs([]);
  }, []);

  // Установить заголовок страницы
  const setTitle = useCallback((title) => {
    setPageTitle(title);
    document.title = title ? `${title} | Agile Mind Pro` : 'Agile Mind Pro';
  }, []);

  const value = {
    breadcrumbs,
    pageTitle,
    setBreadcrumbs: setBreadcrumbItems,
    pushBreadcrumb,
    popBreadcrumb,
    clearBreadcrumbs,
    setTitle,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

// Хук для использования контекста
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

// Хук для установки хлебных крошек при монтировании компонента
export function useBreadcrumbs(items, deps = []) {
  const { setBreadcrumbs } = useNavigation();
  
  React.useEffect(() => {
    setBreadcrumbs(items);
    return () => setBreadcrumbs([]);
  }, deps);
}

// Хук для установки заголовка страницы
export function usePageTitle(title, deps = []) {
  const { setTitle } = useNavigation();
  
  React.useEffect(() => {
    setTitle(title);
    return () => setTitle('');
  }, deps);
}

export default NavigationContext;
