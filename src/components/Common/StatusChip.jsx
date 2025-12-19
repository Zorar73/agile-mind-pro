// src/components/Common/StatusChip.jsx
import React from 'react';
import { Chip, useTheme } from '@mui/material';
import {
  RadioButtonUnchecked,
  PlayCircleOutline,
  RateReview,
  CheckCircle,
  Error,
  Block,
} from '@mui/icons-material';
import { getStatusColor } from '../../theme';

// Конфигурация статусов
const STATUS_CONFIG = {
  todo: {
    label: 'К выполнению',
    icon: RadioButtonUnchecked,
  },
  in_progress: {
    label: 'В работе',
    icon: PlayCircleOutline,
  },
  review: {
    label: 'На проверке',
    icon: RateReview,
  },
  done: {
    label: 'Выполнено',
    icon: CheckCircle,
  },
  overdue: {
    label: 'Просрочено',
    icon: Error,
  },
  blocked: {
    label: 'Заблокировано',
    icon: Block,
  },
};

/**
 * Унифицированный чип для отображения статуса задачи
 * @param {Object} props
 * @param {string} props.status - Статус (todo, in_progress, review, done, overdue, blocked)
 * @param {string} props.size - Размер ('small' | 'medium')
 * @param {string} props.variant - Вариант ('filled' | 'outlined' | 'soft')
 * @param {boolean} props.showIcon - Показывать иконку
 * @param {string} props.label - Кастомный текст (опционально)
 * @param {function} props.onClick - Обработчик клика
 */
function StatusChip({ 
  status = 'todo', 
  size = 'small', 
  variant = 'soft',
  showIcon = true,
  label,
  onClick,
  sx = {},
  ...props 
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
  const colors = getStatusColor(status, isDark);
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

  return (
    <Chip
      label={label || config.label}
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
export { STATUS_CONFIG };
export default StatusChip;
