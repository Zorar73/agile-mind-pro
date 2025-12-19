// src/components/Board/TaskCard.jsx
import React from 'react';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import {
  Flag,
  AttachFile,
  Comment,
  CalendarToday,
  Loop,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast, isToday } from 'date-fns';

// Универсальная функция для безопасного преобразования даты
const toSafeDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date.toDate === 'function') return date.toDate();
  if (typeof date === 'string' || typeof date === 'number') return new Date(date);
  return null;
};

// Проверка выполнена ли задача
const isDone = (task) => task.status === 'done';

// Проверка просрочена ли задача
const isOverdue = (task) => {
  if (isDone(task)) return false;
  const dueDate = toSafeDate(task.dueDate);
  if (!dueDate) return false;
  return isPast(dueDate) && !isToday(dueDate);
};

function TaskCard({ task, onClick, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const taskIsDone = isDone(task);
  const taskIsOverdue = isOverdue(task);
  const dueDate = toSafeDate(task.dueDate);

  const getPriorityColor = (priority) => {
    if (taskIsDone) return 'success';
    if (taskIsOverdue) return 'error';
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'recurring':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    if (taskIsDone) return <CheckCircle fontSize="small" />;
    if (taskIsOverdue) return <Warning fontSize="small" />;
    switch (priority) {
      case 'urgent':
        return <Flag fontSize="small" />;
      case 'recurring':
        return <Loop fontSize="small" />;
      default:
        return null;
    }
  };

  // Стили карточки в зависимости от статуса
  const getCardStyle = () => {
    if (taskIsDone) {
      return {
        bgcolor: '#e8f5e9', // Зелёный фон
        borderLeft: 4,
        borderColor: 'success.main',
        opacity: 0.85,
      };
    }
    if (taskIsOverdue) {
      return {
        bgcolor: '#ffebee', // Красный фон
        borderLeft: 4,
        borderColor: 'error.main',
      };
    }
    return {
      bgcolor: 'white',
    };
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      sx={{
        ...getCardStyle(),
        borderRadius: 2,
        p: 2,
        mb: 1.5,
        cursor: 'pointer',
        boxShadow: 1,
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      {/* Заголовок */}
      <Typography
        variant="body1"
        fontWeight="medium"
        sx={{ 
          mb: 1, 
          wordBreak: 'break-word',
          textDecoration: taskIsDone ? 'line-through' : 'none',
          color: taskIsDone ? 'text.secondary' : 'text.primary',
        }}
      >
        {taskIsDone && '✓ '}{task.title}
      </Typography>

      {/* Теги */}
      {task.tags && task.tags.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {task.tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" />
          ))}
        </Box>
      )}

      {/* Footer карточки */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 1,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* Левая часть - статус/приоритет и дата */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Статус выполнено */}
          {taskIsDone && (
            <Chip
              icon={<CheckCircle fontSize="small" />}
              label="Готово"
              size="small"
              color="success"
            />
          )}

          {/* Просрочено */}
          {taskIsOverdue && (
            <Chip
              icon={<Warning fontSize="small" />}
              label="Просрочено"
              size="small"
              color="error"
            />
          )}

          {/* Приоритет (только если не выполнено и не просрочено) */}
          {!taskIsDone && !taskIsOverdue && task.priority !== 'normal' && (
            <Chip
              icon={getPriorityIcon(task.priority)}
              label={task.priority === 'urgent' ? 'Срочно' : 'Постоянная'}
              size="small"
              color={getPriorityColor(task.priority)}
            />
          )}

          {/* Дедлайн */}
          {dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarToday sx={{ 
                fontSize: 14, 
                color: taskIsOverdue ? 'error.main' : taskIsDone ? 'success.main' : 'text.secondary' 
              }} />
              <Typography 
                variant="caption" 
                color={taskIsOverdue ? 'error.main' : taskIsDone ? 'success.main' : 'text.secondary'}
              >
                {format(dueDate, 'dd.MM.yyyy')}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Правая часть - иконки */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Вложения */}
          {task.attachments && task.attachments.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AttachFile sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {task.attachments.length}
              </Typography>
            </Box>
          )}

          {/* Комментарии */}
          {task.commentsCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Comment sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {task.commentsCount}
              </Typography>
            </Box>
          )}

          {/* Исполнитель */}
          {task.assigneeId && (
            <Avatar
              sx={{ width: 24, height: 24, fontSize: 12 }}
              alt={task.assigneeName}
            >
              {task.assigneeName?.charAt(0) || '?'}
            </Avatar>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// Мемоизация для предотвращения лишних ререндеров
export default React.memo(TaskCard, (prevProps, nextProps) => {
  // Возвращаем true если props не изменились (пропускаем ререндер)
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.dueDate === nextProps.task.dueDate &&
    prevProps.task.assigneeId === nextProps.task.assigneeId
  );
});
