// src/components/Common/PriorityChip.jsx
import React from 'react';
import { Chip, useTheme } from '@mui/material';
import {
  KeyboardArrowDown,
  Remove,
  KeyboardArrowUp,
  KeyboardDoubleArrowUp,
  PriorityHigh,
} from '@mui/icons-material';
import { getPriorityColor } from '../../theme';

// Конфигурация приоритетов
const PRIORITY_CONFIG = {
  low: {
    label: 'Низкий',
    icon: KeyboardArrowDown,
  },
  normal: {
    label: 'Обычный',
    icon: Remove,
  },
  high: {
    label: 'Высокий',
    icon: KeyboardArrowUp,
  },
  urgent: {
    label: 'Срочный',
    icon: KeyboardDoubleArrowUp,
  },
};

/**
 * Унифицированный чип для отображения приоритета задачи
 * @param {Object} props
 * @param {string} props.priority - Приоритет (low, normal, high, urgent)
 * @param {string} props.size - Размер ('small' | 'medium')
 * @param {string} props.variant - Вариант ('filled' | 'outlined' | 'soft')
 * @param {boolean} props.showIcon - Показывать иконку
 * @param {boolean} props.showLabel - Показывать текст
 * @param {function} props.onClick - Обработчик клика
 */
function PriorityChip({ 
  priority = 'normal', 
  size = 'small', 
  variant = 'soft',
  showIcon = true,
  showLabel = true,
  onClick,
  sx = {},
  ...props 
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;
  const colors = getPriorityColor(priority, isDark);
  const Icon = config.icon;

  // Стили в зависимости от варианта
  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          bgcolor: colors.main,
          color: '#FFFFFF',
          '& .MuiChip-icon': { color: '#FFFFFF' },
        };
      case 'outlined':
        return {
          bgcolor: 'transparent',
          color: colors.main,
          border: `2px solid ${colors.main}`,
          '& .MuiChip-icon': { color: colors.main },
        };
      case 'soft':
      default:
        return {
          bgcolor: colors.bg,
          color: colors.main,
          '& .MuiChip-icon': { color: colors.main },
        };
    }
  };

  // Только иконка
  if (!showLabel) {
    return (
      <Chip
        size={size}
        icon={<Icon fontSize="small" />}
        onClick={onClick}
        sx={{
          fontWeight: 600,
          '& .MuiChip-label': { display: 'none' },
          '& .MuiChip-icon': { 
            margin: 0,
            color: colors.main,
          },
          minWidth: size === 'small' ? 28 : 32,
          ...getVariantStyles(),
          ...sx,
        }}
        {...props}
      />
    );
  }

  return (
    <Chip
      label={config.label}
      size={size}
      icon={showIcon ? <Icon fontSize="small" /> : undefined}
      onClick={onClick}
      sx={{
        fontWeight: 600,
        ...getVariantStyles(),
        ...sx,
      }}
      {...props}
    />
  );
}

// Экспорт конфигурации для использования в других компонентах
export { PRIORITY_CONFIG };
export default PriorityChip;
