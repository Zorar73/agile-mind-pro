// src/components/Common/ThemeToggle.jsx
import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useThemeMode } from '../../contexts/ThemeContext';

/**
 * Кнопка переключения темы (светлая/тёмная)
 * @param {Object} props
 * @param {string} props.size - Размер кнопки ('small' | 'medium' | 'large')
 * @param {boolean} props.showLabel - Показывать текстовую подпись
 */
function ThemeToggle({ size = 'medium', showLabel = false }) {
  const { mode, toggleTheme, isDark } = useThemeMode();

  return (
    <Tooltip title={isDark ? 'Светлая тема' : 'Тёмная тема'}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={toggleTheme}
          size={size}
          sx={{
            color: isDark ? 'warning.main' : 'primary.main',
            bgcolor: isDark ? 'rgba(255, 183, 77, 0.1)' : 'rgba(30, 136, 229, 0.1)',
            '&:hover': {
              bgcolor: isDark ? 'rgba(255, 183, 77, 0.2)' : 'rgba(30, 136, 229, 0.2)',
              transform: 'rotate(180deg)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isDark ? <LightMode /> : <DarkMode />}
        </IconButton>
        {showLabel && (
          <Box
            component="span"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.secondary',
            }}
          >
            {isDark ? 'Светлая' : 'Тёмная'}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}

export default ThemeToggle;
