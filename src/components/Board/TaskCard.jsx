// src/components/Board/TaskCard.jsx
import React from 'react';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import {
  Flag,
  AttachFile,
  Comment,
  CalendarToday,
  Loop
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';

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

  const getPriorityColor = (priority) => {
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
    switch (priority) {
      case 'urgent':
        return <Flag fontSize="small" />;
      case 'recurring':
        return <Loop fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      sx={{
        bgcolor: 'white',
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
        sx={{ mb: 1, wordBreak: 'break-word' }}
      >
        {task.title}
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
        {/* Левая часть - приоритет и дата */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Приоритет */}
          {task.priority !== 'normal' && (
            <Chip
              icon={getPriorityIcon(task.priority)}
              label={task.priority === 'urgent' ? 'Срочно' : 'Постоянная'}
              size="small"
              color={getPriorityColor(task.priority)}
            />
          )}

          {/* Дедлайн */}
          {task.dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {format(new Date(task.dueDate), 'dd.MM.yyyy')}
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

export default TaskCard;