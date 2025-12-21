// src/components/Dashboard/widgets/OverdueWidget.jsx
import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Stack, Avatar } from '@mui/material';
import { Warning, Celebration } from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import WidgetWrapper from './WidgetWrapper';

const bauhaus = { red: '#E53935' };

function OverdueWidget({ widget, tasks, users, isEditMode, onRemove, onOpenConfig, onResize, onTaskClick, onNavigate }) {
  const { width, height } = widget;
  const cells = width * height;
  
  const isMini = cells === 1;
  const maxTasks = isMini ? 0 : Math.min(cells * 2, 6);
  const displayTasks = tasks.slice(0, maxTasks);
  const getUser = (userId) => users?.find(u => u.id === userId);

  // Мини режим
  if (isMini) {
    return (
      <WidgetWrapper widget={widget} isEditMode={isEditMode} onRemove={onRemove} onOpenConfig={onOpenConfig} onResize={onResize}>
        <Box
          onClick={() => onNavigate?.('/my-tasks')}
          sx={{
            bgcolor: tasks.length > 0 ? bauhaus.red : '#4CAF50',
            borderRadius: 2,
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { transform: 'scale(1.02)' },
          }}
        >
          <Typography variant="h3" fontWeight={700} color="white">{tasks.length}</Typography>
          <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
            {tasks.length > 0 ? 'Просрочено' : 'Всё ок!'}
          </Typography>
        </Box>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper
      widget={widget}
      title={`Просроченные (${tasks.length})`}
      icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: bauhaus.red }} />}
      isEditMode={isEditMode}
      onRemove={onRemove}
      onOpenConfig={onOpenConfig}
      onResize={onResize}
    >
      {tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Celebration sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">Нет просроченных задач! 🎉</Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {displayTasks.map(task => {
            const assignee = getUser(task.assigneeId);
            const daysOverdue = task.dueDate ? formatDistanceToNow(task.dueDate, { locale: ru }) : '';
            return (
              <Card
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                sx={{
                  borderLeft: 4,
                  borderColor: bauhaus.red,
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 2 },
                }}
              >
                <CardContent sx={{ py: 1, px: { xs: 1, sm: 2 }, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: { xs: 0.5, sm: 1 } }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{task.title}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>{task.boardTitle}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, ml: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
                      {assignee && (
                        <Avatar src={assignee.avatar} sx={{ width: { xs: 20, sm: 24 }, height: { xs: 20, sm: 24 }, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                          {assignee.firstName?.charAt(0)}
                        </Avatar>
                      )}
                      <Chip
                        icon={<Warning sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                        label={daysOverdue}
                        size="small"
                        sx={{
                          bgcolor: `${bauhaus.red}15`,
                          color: bauhaus.red,
                          height: { xs: 20, sm: 24 },
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          '& .MuiChip-label': { px: { xs: 0.5, sm: 1 } }
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
          {tasks.length > maxTasks && (
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
              +{tasks.length - maxTasks} ещё
            </Typography>
          )}
        </Stack>
      )}
    </WidgetWrapper>
  );
}

export default OverdueWidget;
