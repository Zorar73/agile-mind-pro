// src/components/AI/AITaskCreator.jsx
// Компонент для создания задач из AI с полной формой редактирования
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Typography,
  IconButton,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  ExpandMore,
  Delete,
  Add,
  Flag,
  CheckCircle,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import taskService from "../../services/task.service";
import boardService from "../../services/board.service";
import userService from "../../services/user.service";
import AIProcessingOverlay from "../Common/AIProcessingOverlay";
import { useToast } from "../../contexts/ToastContext";

const PRIORITY_CONFIG = {
  low: { label: 'Низкий', color: '#9E9E9E' },
  normal: { label: 'Нормальный', color: '#1E88E5' },
  high: { label: 'Высокий', color: '#FDD835' },
  urgent: { label: 'Срочный', color: '#E53935' },
};

function AITaskCreator({
  open,
  onClose,
  aiTasks = [],
  generating = false,
  error = null,
  onTasksCreated,
}) {
  const toast = useToast();
  const [boards, setBoards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editableTasks, setEditableTasks] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (aiTasks.length > 0) {
      // Инициализируем редактируемые задачи с полными полями
      const initialTasks = aiTasks.map((task, index) => ({
        ...task,
        id: `temp_${index}`,
        boardId: task.suggestedBoard || '',
        assigneeId: '',
        priority: task.suggestedPriority || 'normal',
        dueDate: task.suggestedDueDate || '',
        startDate: '',
        tags: task.suggestedTags || [],
        columnId: '', // Будет установлен при выборе доски
      }));
      setEditableTasks(initialTasks);
      // Открываем первую задачу
      if (initialTasks.length > 0) {
        setExpandedTask(initialTasks[0].id);
      }
    }
  }, [aiTasks]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [boardsRes, usersRes] = await Promise.all([
        boardService.getUserBoards(),
        userService.getApprovedUsers(),
      ]);

      if (boardsRes.success) {
        setBoards(boardsRes.boards || []);
        // Если есть хотя бы одна доска, установим её по умолчанию
        if (boardsRes.boards && boardsRes.boards.length > 0) {
          const defaultBoard = boardsRes.boards[0];
          setEditableTasks(prev =>
            prev.map(task => ({
              ...task,
              boardId: task.boardId || defaultBoard.id,
              columnId: defaultBoard.columns?.[0]?.id || '',
            }))
          );
        }
      }

      if (usersRes.success) {
        setUsers(usersRes.users || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = (taskId, field, value) => {
    setEditableTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const updated = { ...task, [field]: value };

          // Если изменили доску, сбросим колонку на первую колонку новой доски
          if (field === 'boardId') {
            const selectedBoard = boards.find(b => b.id === value);
            if (selectedBoard && selectedBoard.columns) {
              updated.columnId = selectedBoard.columns[0]?.id || '';
            }
          }

          return updated;
        }
        return task;
      })
    );
  };

  const handleRemoveTask = (taskId) => {
    setEditableTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleAddTag = (taskId, tag) => {
    if (!tag.trim()) return;
    handleUpdateTask(taskId, 'tags', [...(editableTasks.find(t => t.id === taskId)?.tags || []), tag.trim()]);
  };

  const handleRemoveTag = (taskId, tagIndex) => {
    const task = editableTasks.find(t => t.id === taskId);
    if (!task) return;
    handleUpdateTask(taskId, 'tags', task.tags.filter((_, i) => i !== tagIndex));
  };

  const handleCreateTasks = async () => {
    if (editableTasks.length === 0) return;

    setCreating(true);
    try {
      const results = [];

      for (const task of editableTasks) {
        if (!task.title || !task.boardId) continue;

        const taskData = {
          title: task.title,
          description: task.description || '',
          boardId: task.boardId,
          columnId: task.columnId,
          assigneeId: task.assigneeId || null,
          priority: task.priority || 'normal',
          dueDate: task.dueDate || null,
          startDate: task.startDate || null,
          tags: task.tags || [],
          createdBy: null, // Будет установлен в сервисе
        };

        const result = await taskService.createTask(taskData);
        if (result.success) {
          results.push(result.task);
        }
      }

      if (onTasksCreated) {
        onTasksCreated(results);
      }

      // Show success toast
      if (results.length > 0) {
        toast.success(
          `Создано ${results.length} ${results.length === 1 ? "задача" : results.length < 5 ? "задачи" : "задач"}!`,
          { title: "Успешно" }
        );
      }

      onClose();
    } catch (error) {
      console.error("Error creating tasks:", error);
      toast.error("Ошибка при создании задач", { title: "Ошибка" });
    } finally {
      setCreating(false);
    }
  };

  const getBoard = (boardId) => boards.find(b => b.id === boardId);
  const getUser = (userId) => users.find(u => u.id === userId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Создание задач из AI</Typography>
          {editableTasks.length > 0 && (
            <Chip label={`${editableTasks.length} ${editableTasks.length === 1 ? 'задача' : 'задач'}`} color="primary" />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {generating ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Анализируем и генерируем задачи...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : editableTasks.length === 0 ? (
          <Alert severity="info">AI не смог сгенерировать задачи. Попробуйте изменить текст.</Alert>
        ) : (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Проверьте и отредактируйте задачи перед созданием. Вы можете изменить название, описание, доску, исполнителя и другие параметры.
            </Alert>

            {editableTasks.map((task) => {
              const board = getBoard(task.boardId);
              const assignee = getUser(task.assigneeId);
              const column = board?.columns?.find(c => c.id === task.columnId);

              return (
                <Accordion
                  key={task.id}
                  expanded={expandedTask === task.id}
                  onChange={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 1 }}>
                      <CheckCircle color="primary" fontSize="small" />
                      <Typography sx={{ flex: 1 }}>{task.title}</Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTask(task.id);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Название */}
                      <TextField
                        fullWidth
                        label="Название задачи"
                        value={task.title}
                        onChange={(e) => handleUpdateTask(task.id, 'title', e.target.value)}
                        required
                      />

                      {/* Описание */}
                      <TextField
                        fullWidth
                        label="Описание"
                        multiline
                        rows={3}
                        value={task.description || ''}
                        onChange={(e) => handleUpdateTask(task.id, 'description', e.target.value)}
                      />

                      {/* Доска и Колонка */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <FormControl fullWidth required>
                          <InputLabel>Доска</InputLabel>
                          <Select
                            value={task.boardId}
                            onChange={(e) => handleUpdateTask(task.id, 'boardId', e.target.value)}
                            label="Доска"
                          >
                            {boards.map((b) => (
                              <MenuItem key={b.id} value={b.id}>
                                {b.title}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel>Колонка</InputLabel>
                          <Select
                            value={task.columnId}
                            onChange={(e) => handleUpdateTask(task.id, 'columnId', e.target.value)}
                            label="Колонка"
                            disabled={!task.boardId}
                          >
                            {board?.columns?.map((col) => (
                              <MenuItem key={col.id} value={col.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: col.color || '#c4c4c4' }} />
                                  {col.title}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Исполнитель и Приоритет */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <FormControl fullWidth>
                          <InputLabel>Исполнитель</InputLabel>
                          <Select
                            value={task.assigneeId}
                            onChange={(e) => handleUpdateTask(task.id, 'assigneeId', e.target.value)}
                            label="Исполнитель"
                          >
                            <MenuItem value="">Не назначен</MenuItem>
                            {users.map((u) => (
                              <MenuItem key={u.id} value={u.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar src={u.avatar} sx={{ width: 24, height: 24 }}>
                                    {u.firstName?.charAt(0)}
                                  </Avatar>
                                  {u.firstName} {u.lastName}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel>Приоритет</InputLabel>
                          <Select
                            value={task.priority}
                            onChange={(e) => handleUpdateTask(task.id, 'priority', e.target.value)}
                            label="Приоритет"
                          >
                            {Object.entries(PRIORITY_CONFIG).map(([key, { label, color }]) => (
                              <MenuItem key={key} value={key}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Flag sx={{ color, fontSize: 18 }} />
                                  {label}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Даты */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Дата начала"
                          type="date"
                          value={task.startDate}
                          onChange={(e) => handleUpdateTask(task.id, 'startDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                          fullWidth
                          label="Дедлайн"
                          type="date"
                          value={task.dueDate}
                          onChange={(e) => handleUpdateTask(task.id, 'dueDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>

                      {/* Теги */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Теги
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                          {task.tags?.map((tag, i) => (
                            <Chip
                              key={i}
                              label={tag}
                              size="small"
                              onDelete={() => handleRemoveTag(task.id, i)}
                            />
                          ))}
                          <Chip
                            label="+ Добавить тег"
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const newTag = prompt('Введите тег:');
                              if (newTag) handleAddTag(task.id, newTag);
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={creating}>
          Отмена
        </Button>
        {editableTasks.length > 0 && !generating && !error && (
          <Button
            variant="contained"
            onClick={handleCreateTasks}
            disabled={creating || editableTasks.length === 0}
            startIcon={creating ? <CircularProgress size={20} /> : null}
          >
            {creating ? 'Создаём...' : `Создать ${editableTasks.length} ${editableTasks.length === 1 ? 'задачу' : 'задач'}`}
          </Button>
        )}
      </DialogActions>

      {/* AI Processing Overlay for generation */}
      <AIProcessingOverlay
        open={generating}
        message="AI анализирует и генерирует задачи..."
        progress={null}
        variant="circular"
      />

      {/* AI Processing Overlay for creation */}
      <AIProcessingOverlay
        open={creating}
        message="Создаём задачи..."
        progress={null}
        variant="linear"
      />
    </Dialog>
  );
}

export default AITaskCreator;
