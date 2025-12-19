// src/components/Board/BoardGrouping.jsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Avatar,
  Stack,
} from '@mui/material';
import {
  GroupWork,
  ExpandMore,
  ExpandLess,
  CalendarToday,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { format, isToday, isPast } from 'date-fns';
import { ru } from 'date-fns/locale';

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

function BoardGrouping({ tasks, users, boards, teams, groupBy, onTaskClick, showCompleted = false }) {
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Группируем задачи с помощью useMemo (без бесконечного цикла)
  const groupedTasks = useMemo(() => {
    const groups = {};
    
    // Фильтруем выполненные если showCompleted = false
    const filteredTasks = showCompleted ? tasks : tasks.filter(task => !isDone(task));

    filteredTasks.forEach(task => {
      let groupKey = 'all';
      let groupLabel = 'Все задачи';
      let groupColor = 'default';

      switch (groupBy) {
        case 'dueDate':
          if (task.dueDate) {
            const dueDate = toSafeDate(task.dueDate);
            if (!dueDate) {
              groupKey = 'no-date';
              groupLabel = 'Без срока';
              groupColor = 'default';
            } else if (isDone(task)) {
              groupKey = 'done';
              groupLabel = 'Выполнено';
              groupColor = 'success';
            } else if (isPast(dueDate) && !isToday(dueDate)) {
              groupKey = 'overdue';
              groupLabel = 'Просрочено';
              groupColor = 'error';
            } else if (isToday(dueDate)) {
              groupKey = 'today';
              groupLabel = 'Сегодня';
              groupColor = 'warning';
            } else {
              groupKey = format(dueDate, 'yyyy-MM-dd');
              groupLabel = format(dueDate, 'dd MMMM yyyy', { locale: ru });
              groupColor = 'primary';
            }
          } else {
            groupKey = 'no-date';
            groupLabel = 'Без срока';
            groupColor = 'default';
          }
          break;

        case 'assignee':
          if (task.assigneeId) {
            const user = users?.[task.assigneeId];
            groupKey = task.assigneeId;
            groupLabel = user ? `${user.firstName} ${user.lastName}` : 'Неизвестно';
            groupColor = 'primary';
          } else {
            groupKey = 'unassigned';
            groupLabel = 'Не назначено';
            groupColor = 'default';
          }
          break;

        case 'priority':
          groupKey = task.priority || 'normal';
          groupLabel = task.priority === 'urgent' ? 'Срочные' : 
                      task.priority === 'recurring' ? 'Повторяющиеся' : 'Обычные';
          groupColor = task.priority === 'urgent' ? 'error' : 
                      task.priority === 'recurring' ? 'info' : 'primary';
          break;

        case 'board':
          if (task.boardId) {
            const board = boards?.[task.boardId];
            groupKey = task.boardId;
            groupLabel = board?.title || 'Неизвестная доска';
            groupColor = 'secondary';
          }
          break;

        case 'status':
          if (isDone(task)) {
            groupKey = 'done';
            groupLabel = 'Выполнено';
            groupColor = 'success';
          } else if (isOverdue(task)) {
            groupKey = 'overdue';
            groupLabel = 'Просрочено';
            groupColor = 'error';
          } else {
            groupKey = task.status || 'todo';
            groupLabel = task.status === 'in_progress' ? 'В работе' : 'К выполнению';
            groupColor = task.status === 'in_progress' ? 'info' : 'default';
          }
          break;

        default:
          groupKey = 'all';
          groupLabel = 'Все задачи';
          groupColor = 'default';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          label: groupLabel,
          color: groupColor,
          tasks: [],
          sortOrder: groupKey === 'overdue' ? 0 : groupKey === 'today' ? 1 : groupKey === 'done' ? 99 : 2,
        };
      }

      groups[groupKey].tasks.push(task);
    });

    return groups;
  }, [tasks, groupBy, users, boards, showCompleted]);

  const toggleGroup = (groupKey) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const getTaskStyle = (task) => {
    if (isDone(task)) {
      return {
        borderLeft: 4,
        borderColor: 'success.main',
        bgcolor: 'success.50',
        opacity: 0.8,
      };
    }
    if (isOverdue(task)) {
      return {
        borderLeft: 4,
        borderColor: 'error.main',
        bgcolor: 'error.50',
      };
    }
    return {
      bgcolor: 'background.paper',
    };
  };

  const getPriorityColor = (task) => {
    if (isDone(task)) return 'success';
    if (isOverdue(task)) return 'error';
    switch (task.priority) {
      case 'urgent': return 'error';
      case 'recurring': return 'info';
      default: return 'primary';
    }
  };

  // Сортируем группы
  const sortedGroups = Object.entries(groupedTasks).sort((a, b) => 
    (a[1].sortOrder || 50) - (b[1].sortOrder || 50)
  );

  return (
    <Box>
      {sortedGroups.map(([groupKey, group]) => (
        <Box key={groupKey} sx={{ mb: 3 }}>
          {/* Заголовок группы */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              cursor: 'pointer',
              p: 1,
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => toggleGroup(groupKey)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small">
                {collapsedGroups[groupKey] ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
              {groupKey === 'overdue' && <Warning color="error" />}
              {groupKey === 'done' && <CheckCircle color="success" />}
              <Typography variant="h6" fontWeight="600">
                {group.label}
              </Typography>
              <Chip
                label={group.tasks.length}
                size="small"
                color={group.color}
              />
            </Box>
          </Box>

          {/* Задачи группы */}
          {!collapsedGroups[groupKey] && (
            <Stack spacing={1.5} sx={{ pl: 6 }}>
              {group.tasks.map(task => {
                const taskDueDate = toSafeDate(task.dueDate);
                const taskIsDone = isDone(task);
                const taskIsOverdue = isOverdue(task);
                
                return (
                  <Card
                    key={task.id}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: 2 },
                      ...getTaskStyle(task),
                    }}
                    onClick={() => onTaskClick(task)}
                  >
                    <CardContent sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography 
                            variant="body1" 
                            fontWeight="600" 
                            gutterBottom
                            sx={{ 
                              textDecoration: taskIsDone ? 'line-through' : 'none',
                              color: taskIsDone ? 'text.secondary' : 'text.primary',
                            }}
                          >
                            {taskIsDone && '✓ '}{task.title}
                          </Typography>
                          
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {/* Статус для выполненных */}
                            {taskIsDone && (
                              <Chip
                                icon={<CheckCircle sx={{ fontSize: '1rem' }} />}
                                label="Выполнено"
                                color="success"
                                size="small"
                              />
                            )}
                            
                            {/* Приоритет */}
                            {groupBy !== 'priority' && !taskIsDone && (
                              <Chip
                                label={task.priority === 'urgent' ? 'Срочная' : 
                                      task.priority === 'recurring' ? 'Повторяющаяся' : 'Обычная'}
                                color={getPriorityColor(task)}
                                size="small"
                              />
                            )}
                            
                            {/* Исполнитель */}
                            {groupBy !== 'assignee' && task.assigneeId && users?.[task.assigneeId] && (
                              <Chip
                                avatar={<Avatar sx={{ width: 20, height: 20 }}>{users[task.assigneeId]?.firstName?.charAt(0)}</Avatar>}
                                label={`${users[task.assigneeId].firstName} ${users[task.assigneeId].lastName}`}
                                size="small"
                              />
                            )}
                            
                            {/* Дата */}
                            {groupBy !== 'dueDate' && taskDueDate && (
                              <Chip
                                icon={taskIsOverdue ? <Warning sx={{ fontSize: '1rem' }} /> : <CalendarToday sx={{ fontSize: '1rem' }} />}
                                label={format(taskDueDate, 'dd.MM.yyyy')}
                                size="small"
                                color={taskIsOverdue ? 'error' : taskIsDone ? 'success' : 'default'}
                              />
                            )}

                            {/* Доска */}
                            {groupBy !== 'board' && task.boardTitle && (
                              <Chip
                                label={task.boardTitle}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      ))}

      {sortedGroups.length === 0 && (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <GroupWork sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Нет задач для отображения
          </Typography>
        </Card>
      )}
    </Box>
  );
}

export default BoardGrouping;
