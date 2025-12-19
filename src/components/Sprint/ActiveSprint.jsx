// src/components/Sprint/ActiveSprint.jsx
// Упрощённый - статистика вынесена в SprintStats
import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { Stop } from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import SprintStats from './SprintStats';

const toSafeDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date.toDate === 'function') return date.toDate();
  if (typeof date === 'string' || typeof date === 'number') return new Date(date);
  return null;
};

function ActiveSprint({ sprint, tasks, onComplete, onUpdate }) {
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [retrospective, setRetrospective] = useState('');

  if (!sprint) return null;

  const sprintTasks = tasks.filter(t => sprint.tasks?.includes(t.id));
  const startDate = toSafeDate(sprint.startDate);
  const endDate = toSafeDate(sprint.endDate);

  if (!startDate || !endDate) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography color="error">Ошибка: даты спринта не заданы</Typography>
        </CardContent>
      </Card>
    );
  }

  const daysLeft = differenceInDays(endDate, new Date());

  const handleComplete = () => {
    const completedTaskIds = sprintTasks.filter(t => t.status === 'done').map(t => t.id);
    onComplete(sprint.id, completedTaskIds, retrospective);
    setCompleteDialogOpen(false);
    setRetrospective('');
  };

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
          {/* Заголовок */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h6" fontWeight={600}>{sprint.name}</Typography>
                <Chip
                  label={sprint.status === 'active' ? 'Активный' : 'Планирование'}
                  color={sprint.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
                {daysLeft <= 2 && daysLeft >= 0 && (
                  <Chip label={`${daysLeft} дн.`} color="warning" size="small" />
                )}
                {daysLeft < 0 && (
                  <Chip label="Просрочен" color="error" size="small" />
                )}
              </Box>
              {sprint.goal && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Цель: {sprint.goal}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {format(startDate, 'dd MMM', { locale: ru })} — {format(endDate, 'dd MMM yyyy', { locale: ru })}
              </Typography>
            </Box>

            {sprint.status === 'active' && (
              <Button variant="outlined" color="error" size="small" startIcon={<Stop />} onClick={() => setCompleteDialogOpen(true)} sx={{ borderRadius: 50 }}>
                Завершить
              </Button>
            )}
          </Box>

          {/* Статистика через SprintStats */}
          <SprintStats sprint={sprint} tasks={tasks} />
        </CardContent>
      </Card>

      {/* Диалог завершения */}
      <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Завершить спринт</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Добавьте итоги спринта (опционально):
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Ретроспектива"
            placeholder="Что получилось хорошо? Что можно улучшить?"
            value={retrospective}
            onChange={(e) => setRetrospective(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleComplete} variant="contained" color="error">Завершить спринт</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ActiveSprint;
