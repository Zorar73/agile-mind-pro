// src/components/Dashboard/widgets/TasksWidget.jsx
import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Stack, Button, Avatar, AvatarGroup } from '@mui/material';
import { ArrowForward, CheckCircle, Schedule } from '@mui/icons-material';
import { format } from 'date-fns';
import WidgetWrapper from './WidgetWrapper';

const bauhaus = { teal: '#26A69A', blue: '#1E88E5' };

function TasksWidget({ widget, tasks, users, isEditMode, onRemove, onOpenConfig, onResize, onTaskClick, onNavigate }) {
  const { width, height, config = {} } = widget;
  const cells = width * height;
  
  const isMini = cells === 1;
  const isCompact = cells <= 2;
  const maxTasks = isMini ? 1 : isCompact ? 3 : Math.min(cells * 2, 8);
  
  const displayTasks = tasks.slice(0, maxTasks);
  const getUser = (userId) => users?.find(u => u.id === userId);

  // Мини режим - только счетчик
  if (isMini) {
    return (
      <WidgetWrapper widget={widget} isEditMode={isEditMode} onRemove={onRemove} onOpenConfig={onOpenConfig} onResize={onResize}>
        <Box
          onClick={() => onNavigate?.('/my-tasks')}
          sx={{
            bgcolor: bauhaus.teal,
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
          <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>Задач</Typography>
        </Box>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper
      widget={widget}
      title="Ближайшие задачи"
      icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: bauhaus.teal }} />}
      isEditMode={isEditMode}
      onRemove={onRemove}
      onOpenConfig={onOpenConfig}
      onResize={onResize}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, mt: -1 }}>
        <Button size="small" endIcon={<ArrowForward />} onClick={() => onNavigate?.('/my-tasks')}>Все</Button>
      </Box>

      {displayTasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CheckCircle sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">Нет задач на неделю</Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {displayTasks.map(task => {
            const assignee = getUser(task.assigneeId);
            return (
              <Card
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                sx={{
                  borderLeft: 4,
                  borderColor: bauhaus.teal,
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 2 },
                }}
              >
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{task.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{task.boardTitle}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                      {assignee && (
                        <Avatar src={assignee.avatar} sx={{ width: 24, height: 24 }}>
                          {assignee.firstName?.charAt(0)}
                        </Avatar>
                      )}
                      {task.dueDate && (
                        <Chip
                          icon={<Schedule sx={{ fontSize: 14 }} />}
                          label={format(task.dueDate, 'dd.MM')}
                          size="small"
                          sx={{ bgcolor: `${bauhaus.teal}15`, color: bauhaus.teal }}
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </WidgetWrapper>
  );
}

export default TasksWidget;
