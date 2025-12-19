// src/components/Sprint/SprintPlanning.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Chip,
  Divider,
  Stack,
  LinearProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';

function SprintPlanning({ open, onClose, tasks, onCreateSprint }) {
  const [sprintData, setSprintData] = useState({
    name: '',
    goal: '',
    startDate: new Date(),
    endDate: addWeeks(new Date(), 2),
  });

  const [selectedTasks, setSelectedTasks] = useState([]);

  useEffect(() => {
    if (open) {
      // Генерируем название спринта
      const sprintNumber = Math.floor(Date.now() / 1000) % 1000;
      setSprintData({
        name: `Спринт ${sprintNumber}`,
        goal: '',
        startDate: new Date(),
        endDate: addWeeks(new Date(), 2),
      });
      setSelectedTasks([]);
    }
  }, [open]);

  const handleToggleTask = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleCreate = () => {
    onCreateSprint({
      ...sprintData,
      taskIds: selectedTasks,
    });
    onClose();
  };

  const backlogTasks = tasks.filter(t => !t.sprintId);
  const totalPoints = selectedTasks.reduce((sum, taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return sum + (task?.storyPoints || 0);
  }, 0);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Планирование спринта</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Основная информация */}
            <TextField
              fullWidth
              label="Название спринта"
              value={sprintData.name}
              onChange={(e) => setSprintData({ ...sprintData, name: e.target.value })}
            />

            <TextField
              fullWidth
              label="Цель спринта"
              value={sprintData.goal}
              onChange={(e) => setSprintData({ ...sprintData, goal: e.target.value })}
              multiline
              rows={2}
              placeholder="Например: Завершить основной функционал аутентификации"
            />

            {/* Даты */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Начало"
                value={sprintData.startDate}
                onChange={(date) => setSprintData({ ...sprintData, startDate: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="Конец"
                value={sprintData.endDate}
                onChange={(date) => setSprintData({ ...sprintData, endDate: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>

            <Divider />

            {/* Метрики */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Выбрано задач: {selectedTasks.length} из {backlogTasks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Story Points: {totalPoints}
              </Typography>
            </Box>

            {/* Список задач бэклога */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Бэклог
              </Typography>
              {backlogTasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Нет задач в бэклоге
                </Typography>
              ) : (
                <List sx={{ maxHeight: 300, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  {backlogTasks.map((task) => (
                    <ListItem
                      key={task.id}
                      button
                      onClick={() => handleToggleTask(task.id)}
                      dense
                    >
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        edge="start"
                      />
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {task.priority === 'urgent' && (
                              <Chip label="Срочная" color="error" size="small" />
                            )}
                            {task.storyPoints && (
                              <Chip label={`${task.storyPoints} SP`} size="small" />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!sprintData.name.trim() || selectedTasks.length === 0}
          >
            Создать спринт
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default SprintPlanning;
