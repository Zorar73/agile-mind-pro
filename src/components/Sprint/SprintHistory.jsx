// src/components/Sprint/SprintHistory.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Collapse,
  LinearProgress,
  Stack,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  History,
  CheckCircle,
  TrendingUp,
  Assignment,
  CalendarToday,
  Speed,
  Delete,
  RadioButtonUnchecked,
  PlayArrow,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Безопасное преобразование даты
const toSafeDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date.toDate === 'function') return date.toDate();
  if (typeof date === 'string' || typeof date === 'number') return new Date(date);
  return null;
};

function SprintHistory({ sprints, allTasks = [], users = {}, onDeleteSprint, onTaskClick }) {
  const [expandedSprint, setExpandedSprint] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState(null);

  if (!sprints || sprints.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <History sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Нет завершённых спринтов
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Завершённые спринты будут отображаться здесь
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const toggleExpand = (sprintId) => {
    setExpandedSprint(expandedSprint === sprintId ? null : sprintId);
  };

  const handleDeleteClick = (sprint) => {
    setSprintToDelete(sprint);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (sprintToDelete && onDeleteSprint) {
      onDeleteSprint(sprintToDelete.id);
    }
    setDeleteDialogOpen(false);
    setSprintToDelete(null);
  };

  // Получить задачи спринта
  const getSprintTasks = (sprint) => {
    if (!sprint.tasks || !allTasks.length) return [];
    return allTasks.filter(task => sprint.tasks.includes(task.id));
  };

  // Расчёт средней velocity
  const averageVelocity = sprints.length > 0
    ? Math.round(sprints.reduce((sum, s) => sum + (s.finalMetrics?.velocity || s.completedPoints || 0), 0) / sprints.length)
    : 0;

  return (
    <Box>
      {/* Заголовок и статистика */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History color="action" />
          <Typography variant="h6" fontWeight="600">
            Архив спринтов
          </Typography>
          <Chip label={sprints.length} size="small" />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Speed fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Средняя velocity: <strong>{averageVelocity} SP</strong>
          </Typography>
        </Box>
      </Box>

      {/* Список спринтов */}
      <Stack spacing={2}>
        {sprints.map((sprint) => {
          const startDate = toSafeDate(sprint.startDate);
          const endDate = toSafeDate(sprint.endDate);
          const completedDate = toSafeDate(sprint.completedDate);
          const isExpanded = expandedSprint === sprint.id;
          const sprintTasks = getSprintTasks(sprint);
          
          const metrics = sprint.finalMetrics || {
            completedTasks: sprintTasks.filter(t => t.status === 'done').length,
            totalTasks: sprintTasks.length,
            completedPoints: sprintTasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.storyPoints || 0), 0),
            totalPoints: sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0),
          };
          
          const taskProgress = metrics.totalTasks > 0 
            ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) 
            : 0;
          const pointsProgress = metrics.totalPoints > 0 
            ? Math.round((metrics.completedPoints / metrics.totalPoints) * 100) 
            : 0;

          return (
            <Card key={sprint.id} variant="outlined">
              {/* Заголовок спринта */}
              <CardContent 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  pb: isExpanded ? 1 : 2,
                }}
                onClick={() => toggleExpand(sprint.id)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight="600">
                        {sprint.name}
                      </Typography>
                      <Chip 
                        label="Завершён" 
                        color="success" 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {startDate && endDate && (
                        <Typography variant="caption" color="text.secondary">
                          <CalendarToday sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                          {format(startDate, 'dd MMM', { locale: ru })} - {format(endDate, 'dd MMM yyyy', { locale: ru })}
                        </Typography>
                      )}
                      
                      <Typography variant="caption" color="text.secondary">
                        <Assignment sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                        {metrics.completedTasks}/{metrics.totalTasks} задач
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary">
                        <TrendingUp sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                        {metrics.completedPoints}/{metrics.totalPoints} SP
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={`${metrics.completedPoints || 0} SP`}
                      color="primary"
                      size="small"
                    />
                    <IconButton size="small">
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>

              {/* Развёрнутая информация */}
              <Collapse in={isExpanded}>
                <Divider />
                <CardContent>
                  {/* Цель спринта */}
                  {sprint.goal && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Цель спринта:
                      </Typography>
                      <Typography variant="body2">
                        {sprint.goal}
                      </Typography>
                    </Box>
                  )}

                  {/* Прогресс бары */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Задачи выполнены</Typography>
                      <Typography variant="caption">{taskProgress}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={taskProgress} 
                      sx={{ height: 6, borderRadius: 1, mb: 1.5 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Story Points</Typography>
                      <Typography variant="caption">{pointsProgress}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={pointsProgress} 
                      color="success"
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Box>

                  {/* Список задач спринта */}
                  {sprintTasks.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Задачи спринта ({sprintTasks.length}):
                      </Typography>
                      <List dense sx={{ 
                        bgcolor: 'background.default', 
                        borderRadius: 1,
                        maxHeight: 300,
                        overflow: 'auto',
                      }}>
                        {sprintTasks.map((task) => {
                          const isDone = task.status === 'done';
                          const isInProgress = task.status === 'in_progress';
                          const assignee = users[task.assigneeId];
                          
                          return (
                            <ListItem
                              key={task.id}
                              sx={{
                                cursor: onTaskClick ? 'pointer' : 'default',
                                '&:hover': onTaskClick ? { bgcolor: 'action.hover' } : {},
                                borderLeft: 3,
                                borderColor: isDone ? 'success.main' : isInProgress ? 'info.main' : 'grey.300',
                                mb: 0.5,
                                borderRadius: 1,
                                bgcolor: 'background.paper',
                              }}
                              onClick={() => onTaskClick && onTaskClick(task)}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                {isDone ? (
                                  <CheckCircle color="success" fontSize="small" />
                                ) : isInProgress ? (
                                  <PlayArrow color="info" fontSize="small" />
                                ) : (
                                  <RadioButtonUnchecked color="disabled" fontSize="small" />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      textDecoration: isDone ? 'line-through' : 'none',
                                      color: isDone ? 'text.secondary' : 'text.primary',
                                    }}
                                  >
                                    {task.title}
                                  </Typography>
                                }
                                secondary={
                                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                    {task.storyPoints > 0 && (
                                      <Chip 
                                        label={`${task.storyPoints} SP`} 
                                        size="small" 
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                      />
                                    )}
                                    {task.priority === 'urgent' && (
                                      <Chip 
                                        label="Срочная" 
                                        size="small" 
                                        color="error"
                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                      />
                                    )}
                                    {assignee && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Avatar sx={{ width: 16, height: 16, fontSize: '0.6rem' }}>
                                          {assignee.firstName?.charAt(0)}
                                        </Avatar>
                                        <Typography variant="caption" color="text.secondary">
                                          {assignee.firstName}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                }
                              />
                              <Chip
                                label={isDone ? 'Готово' : isInProgress ? 'В работе' : 'К выполнению'}
                                size="small"
                                color={isDone ? 'success' : isInProgress ? 'info' : 'default'}
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Box>
                  )}

                  {/* Ретроспектива */}
                  {sprint.retrospective && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Ретроспектива:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {sprint.retrospective}
                      </Typography>
                    </Box>
                  )}

                  {/* Дата завершения и действия */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {completedDate && (
                      <Typography variant="caption" color="text.secondary">
                        Завершён: {format(completedDate, 'dd MMMM yyyy, HH:mm', { locale: ru })}
                      </Typography>
                    )}
                    
                    {onDeleteSprint && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(sprint);
                        }}
                      >
                        Удалить
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Collapse>
            </Card>
          );
        })}
      </Stack>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удалить спринт?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить спринт "{sprintToDelete?.name}"? 
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SprintHistory;
