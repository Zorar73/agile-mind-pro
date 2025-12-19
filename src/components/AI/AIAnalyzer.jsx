// src/components/AI/AIAnalyzer.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider
} from '@mui/material';
import {
  Close,
  Psychology,
  Delete,
  CallSplit,
  Edit
} from '@mui/icons-material';
import { UserContext } from '../../App';
import aiService from '../../services/ai.service';
import taskService from '../../services/task.service';
import userService from '../../services/user.service';

function AIAnalyzer({ boardId, board, columns, onClose }) {
  const { user } = useContext(UserContext);

  const [step, setStep] = useState(1); // 1 - ввод текста, 2 - предпросмотр задач
  const [recapText, setRecapText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [boards, setBoards] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadContext();
  }, []);

  const loadContext = async () => {
    // Загружаем пользователей
    const usersResult = await userService.getAllUsers();
    if (usersResult.success) {
      setUsers(usersResult.users.filter(u => u.role !== 'pending'));
    }

    // Временно: пустые теги и доски (можно добавить сервисы для них)
    setTags([]);
    setBoards([{ id: boardId, title: board?.title || 'Доска' }]);
  };

  const handleAnalyze = async () => {
    if (!recapText.trim()) {
      setError('Введите текст протокола');
      return;
    }

    setAnalyzing(true);
    setError('');

    // Подготавливаем контекст для AI
    const context = {
      boards: boards,
      tags: tags,
      users: users.map(u => ({
        firstName: u.firstName,
        lastName: u.lastName,
        position: u.position,
        responsibility: u.responsibility
      }))
    };

    const result = await aiService.analyzeRecap(recapText, context);
    setAnalyzing(false);

    if (result.success) {
      setSuggestedTasks(result.tasks.map(task => ({
        ...task,
        boardId: task.suggestedBoard || boardId,
        columnId: columns[0]?.id, // Первая колонка по умолчанию
        assigneeId: task.suggestedAssignee !== 'TBD' 
          ? users.find(u => `${u.firstName} ${u.lastName}` === task.suggestedAssignee)?.id || null
          : null
      })));
      setStep(2);
    } else {
      setError(result.message);
    }
  };

  const handleSplitTask = async (index) => {
    const task = suggestedTasks[index];
    
    setAnalyzing(true);
    const result = await aiService.splitTask(task, {
      boards,
      tags,
      users: users.map(u => ({
        firstName: u.firstName,
        lastName: u.lastName,
        position: u.position,
        responsibility: u.responsibility
      }))
    });
    setAnalyzing(false);

    if (result.success) {
      // Заменяем текущую задачу на подзадачи
      const newTasks = [...suggestedTasks];
      newTasks.splice(index, 1, ...result.tasks.map(task => ({
        ...task,
        boardId: task.suggestedBoard || boardId,
        columnId: columns[0]?.id,
        assigneeId: task.suggestedAssignee !== 'TBD' 
          ? users.find(u => `${u.firstName} ${u.lastName}` === task.suggestedAssignee)?.id || null
          : null
      })));
      setSuggestedTasks(newTasks);
    }
  };

  const handleRemoveTask = (index) => {
    setSuggestedTasks(suggestedTasks.filter((_, i) => i !== index));
  };

  const handleUpdateTask = (index, field, value) => {
    const newTasks = [...suggestedTasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setSuggestedTasks(newTasks);
  };

  const handleCreateTasks = async () => {
    if (suggestedTasks.length === 0) return;

    setAnalyzing(true);

    for (const task of suggestedTasks) {
      await taskService.createTask(boardId, {
        title: task.title,
        description: task.description,
        columnId: task.columnId,
        assigneeId: task.assigneeId,
        priority: task.suggestedPriority,
        tags: task.suggestedTags,
        dueDate: task.suggestedDueDate,
        creatorId: user.uid
      });
    }

    setAnalyzing(false);
    onClose();
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology color="primary" />
            <Typography variant="h6">AI-Анализатор протоколов</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      {analyzing && <LinearProgress />}

      <DialogContent>
        {step === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Вставьте текст протокола встречи, и AI автоматически извлечет задачи с учетом контекста вашей команды
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={15}
              value={recapText}
              onChange={(e) => setRecapText(e.target.value)}
              placeholder={`Пример протокола:

Встреча команды разработки 25.11.2024

1. Обсудили редизайн главной страницы
   - Иван возьмется за создание макетов в Figma
   - Срок: до конца недели
   - Приоритет: высокий

2. Нашли критический баг в системе авторизации
   - Мария исправит до завтра (СРОЧНО!)
   
3. Код-ревью нового модуля
   - Петр проведет ревью до пятницы
   - Написать комментарии в PR
   
4. Обновить документацию API
   - Добавить примеры для новых эндпоинтов
   - Описать изменения в v2.0`}
              disabled={analyzing}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              AI нашла {suggestedTasks.length} задач(и). Проверьте и отредактируйте перед созданием.
            </Alert>

            {suggestedTasks.map((task, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      Задача {index + 1}
                    </Typography>
                    
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleSplitTask(index)}
                        title="Разделить на подзадачи"
                        disabled={analyzing}
                      >
                        <CallSplit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveTask(index)}
                        title="Удалить задачу"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    label="Название"
                    value={task.title}
                    onChange={(e) => handleUpdateTask(index, 'title', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Описание"
                    value={task.description}
                    onChange={(e) => handleUpdateTask(index, 'description', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Колонка</InputLabel>
                      <Select
                        value={task.columnId}
                        label="Колонка"
                        onChange={(e) => handleUpdateTask(index, 'columnId', e.target.value)}
                      >
                        {columns.map((col) => (
                          <MenuItem key={col.id} value={col.id}>
                            {col.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel>Исполнитель</InputLabel>
                      <Select
                        value={task.assigneeId || ''}
                        label="Исполнитель"
                        onChange={(e) => handleUpdateTask(index, 'assigneeId', e.target.value)}
                      >
                        <MenuItem value="">Не назначен</MenuItem>
                        {users.map((u) => (
                          <MenuItem key={u.id} value={u.id}>
                            {u.firstName} {u.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel>Приоритет</InputLabel>
                      <Select
                        value={task.suggestedPriority}
                        label="Приоритет"
                        onChange={(e) => handleUpdateTask(index, 'suggestedPriority', e.target.value)}
                      >
                        <MenuItem value="normal">Нормально</MenuItem>
                        <MenuItem value="urgent">Срочно</MenuItem>
                        <MenuItem value="recurring">Постоянная</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {task.suggestedTags && task.suggestedTags.map((tag, tagIndex) => (
                      <Chip
                        key={tagIndex}
                        label={tag}
                        size="small"
                        onDelete={() => {
                          const newTags = task.suggestedTags.filter((_, i) => i !== tagIndex);
                          handleUpdateTask(index, 'suggestedTags', newTags);
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}

            {suggestedTasks.length === 0 && (
              <Alert severity="warning">
                Все задачи удалены. Добавьте хотя бы одну задачу или вернитесь назад.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        {step === 1 ? (
          <>
            <Button onClick={onClose}>Отмена</Button>
            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={analyzing || !recapText.trim()}
              startIcon={<Psychology />}
            >
              {analyzing ? 'Анализирую...' : 'Анализировать'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setStep(1)} disabled={analyzing}>
              Назад
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button onClick={onClose} disabled={analyzing}>
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateTasks}
              disabled={analyzing || suggestedTasks.length === 0}
            >
              {analyzing ? 'Создаю...' : `Создать ${suggestedTasks.length} задач(и)`}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default AIAnalyzer;