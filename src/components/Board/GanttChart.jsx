// src/components/Board/GanttChart.jsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Paper,
  Chip,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  CalendarToday,
  Timeline,
  CheckCircle,
} from '@mui/icons-material';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  format,
  differenceInDays,
  isWithinInterval,
  addDays,
  isSameDay,
  startOfWeek,
  endOfWeek,
  isBefore,
  startOfDay,
} from 'date-fns';
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
  return isBefore(dueDate, startOfDay(new Date()));
};

function GanttChart({ tasks, users }) {
  // Фильтруем задачи: только невыполненные с датами
  const tasksWithDates = useMemo(() => 
    tasks.filter(task => task.dueDate && !isDone(task)),
    [tasks]
  );

  // Вычисляем диапазон дат
  const viewRange = useMemo(() => {
    if (tasksWithDates.length === 0) {
      return {
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
      };
    }

    const allDates = [];
    tasksWithDates.forEach(t => {
      const startDate = toSafeDate(t.startDate);
      const dueDate = toSafeDate(t.dueDate);
      if (startDate) allDates.push(startDate);
      if (dueDate) allDates.push(dueDate);
    });
    
    if (allDates.length === 0) {
      return {
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
      };
    }

    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    return {
      start: startOfWeek(addDays(minDate, -7), { locale: ru }),
      end: endOfWeek(addDays(maxDate, 7), { locale: ru }),
    };
  }, [tasksWithDates]);

  const days = eachDayOfInterval(viewRange);
  const weeks = eachWeekOfInterval(viewRange);

  // Вычисляем позицию и ширину задачи
  const getTaskPosition = (task) => {
    const dueDate = toSafeDate(task.dueDate);
    const startDate = toSafeDate(task.startDate) || dueDate; // Если нет startDate, используем dueDate
    
    if (!dueDate) return { left: '0%', width: '0%' };
    
    const totalDays = differenceInDays(viewRange.end, viewRange.start) + 1;
    
    // Начало задачи
    const daysFromStart = Math.max(0, differenceInDays(startDate, viewRange.start));
    
    // Продолжительность задачи (минимум 1 день)
    const duration = Math.max(1, differenceInDays(dueDate, startDate) + 1);
    
    // Позиция в процентах
    const left = (daysFromStart / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return { 
      left: `${Math.max(0, left)}%`, 
      width: `${Math.min(100 - left, width)}%` 
    };
  };

  const getPriorityColor = (task) => {
    // Просроченные - красные
    if (isOverdue(task)) return '#d32f2f';
    
    switch (task.priority) {
      case 'urgent': return '#f57c00'; // Оранжевый для срочных
      case 'recurring': return '#0288d1';
      default: return '#1976d2';
    }
  };

  if (tasksWithDates.length === 0) {
    return (
      <Card sx={{ textAlign: 'center', py: 8 }}>
        <Timeline sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Нет задач с установленными сроками
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Добавьте сроки выполнения задачам для отображения в Гант-диаграмме
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, overflow: 'auto' }}>
        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Timeline />
          Гант-диаграмма
        </Typography>
        
        <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mb: 2 }}>
          {format(viewRange.start, 'd MMMM', { locale: ru })} - {format(viewRange.end, 'd MMMM yyyy', { locale: ru })}
        </Typography>

        {/* Временная шкала */}
        <Box sx={{ overflowX: 'auto', width: '100%', pb: 1 }}>
        <Box sx={{ minWidth: { xs: 800, sm: 1000, md: 1200 } }}>
          {/* Заголовки недель */}
          <Box sx={{ display: 'flex', borderBottom: 2, borderColor: 'divider', mb: 1 }}>
            {weeks.map((week, index) => {
              const weekDays = eachDayOfInterval({
                start: week,
                end: addDays(week, 6) > viewRange.end ? viewRange.end : addDays(week, 6),
              });
              const totalDays = differenceInDays(viewRange.end, viewRange.start) + 1;
              const weekWidth = (weekDays.length / totalDays) * 100;

              return (
                <Box
                  key={index}
                  sx={{
                    width: `${weekWidth}%`,
                    textAlign: 'center',
                    py: 1,
                    borderRight: index < weeks.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" fontWeight="600">
                    {format(week, 'dd MMM', { locale: ru })}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Заголовки дней */}
          <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            {days.map((day, index) => {
              const isTodayDay = isSameDay(day, new Date());
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              
              return (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    py: 0.5,
                    bgcolor: isTodayDay ? 'primary.light' : isWeekend ? 'action.hover' : 'transparent',
                    borderRight: index < days.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <Typography 
                    variant="caption" 
                    fontWeight={isTodayDay ? 'bold' : 'normal'}
                    color={isTodayDay ? 'primary.main' : 'text.secondary'}
                  >
                    {format(day, 'd')}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Задачи */}
          <Box sx={{ position: 'relative', minHeight: tasksWithDates.length * 60 }}>
            {/* Сетка дней */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
              {days.map((day, index) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      borderRight: index < days.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      bgcolor: isWeekend ? 'action.hover' : 'transparent',
                    }}
                  />
                );
              })}
            </Box>

            {/* Задачи */}
            {tasksWithDates.map((task, index) => {
              const position = getTaskPosition(task);
              const user = users[task.assigneeId];
              const startDate = toSafeDate(task.startDate);
              const dueDate = toSafeDate(task.dueDate);
              const taskIsOverdue = isOverdue(task);

              return (
                <Tooltip
                  key={task.id}
                  title={
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {task.title}
                      </Typography>
                      {startDate && (
                        <Typography variant="caption" display="block">
                          Начало: {format(startDate, 'dd MMM yyyy', { locale: ru })}
                        </Typography>
                      )}
                      <Typography variant="caption" display="block">
                        Срок: {dueDate ? format(dueDate, 'dd MMM yyyy', { locale: ru }) : 'Без даты'}
                      </Typography>
                      {taskIsOverdue && (
                        <Typography variant="caption" color="error.light" display="block">
                          ⚠️ Просрочено!
                        </Typography>
                      )}
                      {user && (
                        <Typography variant="caption" display="block">
                          {user.firstName} {user.lastName}
                        </Typography>
                      )}
                    </Box>
                  }
                  arrow
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: index * 60 + 10,
                      left: position.left,
                      width: position.width,
                      minWidth: 80,
                      height: 40,
                      bgcolor: getPriorityColor(task),
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      px: 1,
                      gap: 1,
                      border: taskIsOverdue ? '2px solid #b71c1c' : 'none',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    {user && (
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {user.firstName?.charAt(0)}
                      </Avatar>
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'white',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {task.title}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
        </Box>

        {/* Легенда */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#d32f2f', borderRadius: 0.5 }} />
            <Typography variant="caption">Просроченные</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#f57c00', borderRadius: 0.5 }} />
            <Typography variant="caption">Срочные</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#1976d2', borderRadius: 0.5 }} />
            <Typography variant="caption">Обычные</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#0288d1', borderRadius: 0.5 }} />
            <Typography variant="caption">Повторяющиеся</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default GanttChart;
