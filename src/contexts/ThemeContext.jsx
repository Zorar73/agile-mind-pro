// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from '../theme';

// Ключ для localStorage
const THEME_STORAGE_KEY = 'agile-mind-theme-mode';

// Контекст
export const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {},
  isDark: false,
});

// Хук для использования темы
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
};

// Провайдер темы
export function ThemeProvider({ children }) {
  // Инициализация из localStorage или системных настроек
  const [mode, setModeState] = useState(() => {
    // Проверяем localStorage
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    
    // Проверяем системные настройки
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  // Следим за системными настройками
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Только если пользователь не установил тему вручную
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (!saved) {
        setModeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    
    // Добавляем класс на body для возможных CSS хаков
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${mode}-mode`);
  }, [mode]);

  // Переключение темы
  const toggleTheme = () => {
    setModeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Установка конкретной темы
  const setMode = (newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setModeState(newMode);
    }
  };

  // Выбор темы
  const theme = useMemo(() => {
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [mode]);

  // Значение контекста
  const contextValue = useMemo(() => ({
    mode,
    toggleTheme,
    setMode,
    isDark: mode === 'dark',
  }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
