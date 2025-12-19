// src/components/Task/TaskCreateModal.jsx
import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  InputAdornment,
  Stack,
  Autocomplete,
} from '@mui/material';
import {
  Close,
  CalendarToday,
  Person,
  Flag,
  Label,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { UserContext } from '../../App';
import taskService from '../../services/task.service';

// Bauhaus цвета
const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
};

const PRIORITIES = [
  { value: 'normal', label: 'Обычная', color: 'default' },
  { value: 'urgent', label: 'Срочная', color: 'error' },
  { value: 'recurring', label: 'Повторяющаяся', color: 'info' },
];

function TaskCreateModal({ open, onClose, boardId, columnId, onSuccess, users = [], boards = [] }) {
  const { user } = useContext(UserContext);
  
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    boardId: boardId || '',
    columnId: columnId || '',
    assigneeId: '',
    priority: 'normal',
    dueDate: null,
    tags: [],
    storyPoints: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    setTaskData({
      title: '',
      description: '',
      boardId: boardId || '',
      columnId: columnId || '',
      assigneeId: '',
      priority: 'normal',
      dueDate: null,
      tags: [],
      storyPoints: '',
    });
    setErrors({});
    onClose();
  };

  const validate = () => {
    const newErrors = {};
    if (!taskData.title.trim()) {
      newErrors.title = 'Введите название задачи';
    }
    if (!taskData.boardId) {
      newErrors.boardId = 'Выберите доску';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await taskService.createTask({
        title: taskData.title,
        description: taskData.description,
        boardId: taskData.boardId,
        columnId: taskData.columnId,
        assigneeId: taskData.assigneeId || null,
        priority: taskData.priority,
        dueDate: taskData.dueDate || null,
        tags: taskData.tags,
        storyPoints: taskData.storyPoints ? parseInt(taskData.storyPoints) : 0,
        status: 'todo',
        createdBy: user.uid,
      });

      if (result.success) {
        handleClose();
        if (onSuccess) onSuccess(result.taskId);
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setErrors({ submit: 'Не удалось создать задачу' });
    } finally {
      setLoading(false);
    }
  };

  const usersArray = Object.values(users);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, minHeight: '60vh' } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '50%',
                  bgcolor: `${bauhaus.blue}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Flag sx={{ color: bauhaus.blue, fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight="600">
                Новая задача
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Название задачи */}
            <TextField
              fullWidth
              label="Название задачи"
              placeholder="Например: Реализовать авторизацию"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title}
              autoFocus
              required
            />

            {/* Описание */}
            <TextField
              fullWidth
              label="Описание"
              placeholder="Добавьте детали задачи..."
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              multiline
              rows={4}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <DescriptionIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {/* Доска */}
              {boards.length > 0 && (
                <TextField
                  select
                  fullWidth
                  label="Доска"
                  value={taskData.boardId}
                  onChange={(e) => setTaskData({ ...taskData, boardId: e.target.value })}
                  error={!!errors.boardId}
                  helperText={errors.boardId}
                  required
                >
                  {boards.map((board) => (
                    <MenuItem key={board.id} value={board.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: board.color || bauhaus.blue }} />
                        {board.title}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {/* Исполнитель */}
              <TextField
                select
                fullWidth
                label="Исполнитель"
                value={taskData.assigneeId}
                onChange={(e) => setTaskData({ ...taskData, assigneeId: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">
                  <em>Не назначен</em>
                </MenuItem>
                {usersArray.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: bauhaus.blue, fontSize: '0.75rem' }}>
                        {u.firstName?.charAt(0)}
                      </Avatar>
                      {u.firstName} {u.lastName}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              {/* Приоритет */}
              <TextField
                select
                fullWidth
                label="Приоритет"
                value={taskData.priority}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Flag sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    <Chip label={p.label} color={p.color} size="small" />
                  </MenuItem>
                ))}
              </TextField>

              {/* Срок */}
              <DatePicker
                label="Срок выполнения"
                value={taskData.dueDate}
                onChange={(date) => setTaskData({ ...taskData, dueDate: date })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />

              {/* Story Points */}
              <TextField
                fullWidth
                type="number"
                label="Story Points"
                value={taskData.storyPoints}
                onChange={(e) => setTaskData({ ...taskData, storyPoints: e.target.value })}
                inputProps={{ min: 0, max: 100 }}
                placeholder="0"
              />
            </Box>

            {/* Теги */}
            <Box>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={taskData.tags}
                onChange={(e, newValue) => setTaskData({ ...taskData, tags: newValue })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option}
                        {...tagProps}
                        size="small"
                        sx={{ borderRadius: 50 }}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Теги"
                    placeholder="Добавьте теги..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <Label sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Нажмите Enter для добавления тега
              </Typography>
            </Box>

            {/* Ошибка */}
            {errors.submit && (
              <Typography color="error" variant="body2">
                {errors.submit}
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading} sx={{ borderRadius: 50 }}>
            Отмена
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={loading || !taskData.title.trim()}
            sx={{ borderRadius: 50, minWidth: 120 }}
          >
            {loading ? 'Создание...' : 'Создать задачу'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default TaskCreateModal;
