// src/components/Common/GradientHeader.jsx
import React from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';
import { gradients } from '../../theme';

/**
 * Градиентный хедер для карточек, drawer'ов и модалок
 * @param {Object} props
 * @param {string} props.title - Заголовок
 * @param {string} props.subtitle - Подзаголовок
 * @param {string} props.gradient - Название градиента из theme.js
 * @param {React.ReactNode} props.icon - Иконка слева
 * @param {React.ReactNode} props.avatar - Аватар вместо иконки
 * @param {function} props.onClose - Callback закрытия (показывает кнопку закрытия)
 * @param {React.ReactNode} props.actions - Дополнительные действия справа
 * @param {React.ReactNode} props.children - Дополнительный контент
 * @param {number} props.height - Высота хедера
 */
function GradientHeader({
  title,
  subtitle,
  gradient = 'primary',
  icon,
  avatar,
  onClose,
  actions,
  children,
  height,
  sx = {},
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Получаем градиент
  const bgGradient = gradients[gradient] || gradients.primary;

  return (
    <Box
      sx={{
        background: bgGradient,
        p: 3,
        pb: children ? 3 : 4,
        position: 'relative',
        minHeight: height,
        ...sx,
      }}
    >
      {/* Кнопка закрытия */}
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <Close />
        </IconButton>
      )}
      
      {/* Дополнительные действия */}
      {actions && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: onClose ? 56 : 8,
            display: 'flex',
            gap: 1,
          }}
        >
          {actions}
        </Box>
      )}
      
      {/* Основной контент */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Иконка или аватар */}
        {(icon || avatar) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {avatar || (
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  '& .MuiSvgIcon-root': {
                    fontSize: 28,
                  },
                }}
              >
                {icon}
              </Box>
            )}
          </Box>
        )}
        
        {/* Текст */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {title && (
            <Typography
              variant="h5"
              fontWeight={700}
              color="white"
              noWrap
              sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                mt: 0.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      
      {/* Дополнительный контент */}
      {children && (
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

export default GradientHeader;
