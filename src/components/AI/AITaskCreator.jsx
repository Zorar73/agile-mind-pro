// src/components/AI/AITaskCreator.jsx
// Компонент для создания задач из AI с полной формой редактирования
import React, { useState, useEffect, useContext } from "react";
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
  Tooltip,
} from "@mui/material";
import {
  ExpandMore,
  Delete,
  Add,
  Flag,
  CheckCircle,
  RadioButtonUnchecked,
  Refresh,
  CallSplit,
} from "@mui/icons-material";
import { UserContext } from "../../App";
import taskService from "../../services/task.service";
import boardService from "../../services/board.service";
import userService from "../../services/user.service";
import aiService from "../../services/ai.service";
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
  onRegenerate, // Новый проп для перегенерации
}) {
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [boards, setBoards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editableTasks, setEditableTasks] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);
  const [splittingTaskId, setSplittingTaskId] = useState(null); // ID задачи которую разделяем

  useEffect(() => {
    if (open && user?.uid) {
      loadData();
    }
  }, [open, user?.uid]);

  useEffect(() => {
    if (aiTasks.length > 0) {
      // Инициализируем редактируемые задачи с полными полями
      const initialTasks = aiTasks.map((task, index) => ({
        ...task,
        id: `temp_${index}`,
        boardId: task.suggestedBoardId || task.suggestedBoard || '',
        assigneeId: task.assigneeId || '',
        priority: task.priority || task.suggestedPriority || 'normal',
        dueDate: task.dueDate || task.suggestedDueDate || '',
        startDate: '',
        tags: task.suggestedTags || task.tags || [],
        columnId: '', // Будет установлен при выборе доски
        authorId: task.authorId || '',
        createdBy: user?.uid || '', // Постановщик - текущий пользователь
      }));
      setEditableTasks(initialTasks);
      // Открываем первую задачу
      if (initialTasks.length > 0) {
        setExpandedTask(initialTasks[0].id);
      }
      
      // Логируем для отладки
      console.log('📋 AI Tasks initialized:', initialTasks);
    }
  }, [aiTasks, user?.uid]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📂 Loading boards for user:', user?.uid);
      
      const [boardsRes, usersRes] = await Promise.all([
        boardService.getUserBoardsWithData(user?.uid),
        userService.getApprovedUsers(),
      ]);

      console.log('📂 Boards result:', boardsRes);
      console.log('👥 Users result:', usersRes);

      if (boardsRes.success && boardsRes.boards) {
        // Добавляем колонки к каждой доске
        const boardsWithColumns = boardsRes.boards.map(board => ({
          ...board,
          columns: boardsRes.columns?.[board.id] || []
        }));
        
        console.log('📂 Boards with columns:', boardsWithColumns);
        setBoards(boardsWithColumns);
        
        // Если есть хотя бы одна доска, установим её по умолчанию
        if (boardsWithColumns.length > 0) {
          const defaultBoard = boardsWithColumns[0];
          const defaultColumn = defaultBoard.columns?.[0];
          setEditableTasks(prev =>
            prev.map(task => ({
              ...task,
              boardId: task.boardId || defaultBoard.id,
              columnId: task.columnId || defaultColumn?.id || '',
            }))
          );
        }
      } else {
        console.error('❌ Failed to load boards:', boardsRes.error);
      }

      if (usersRes.success) {
        setUsers(usersRes.users || []);
      } else {
        console.error('❌ Failed to load users:', usersRes.message);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
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
    
    console.log('👤 User context:', user);
    
    if (!user?.uid) {
      toast.error('Ошибка авторизации. Перезагрузите страницу.', { title: 'Ошибка' });
      return;
    }

    // Проверяем что все задачи имеют доску
    const tasksWithoutBoard = editableTasks.filter(t => !t.boardId);
    if (tasksWithoutBoard.length > 0) {
      toast.error(`Выберите доску для ${tasksWithoutBoard.length} задач`, { title: 'Ошибка' });
      return;
    }

    setCreating(true);
    try {
      const results = [];
      const errors = [];

      for (const task of editableTasks) {
        if (!task.title) {
          errors.push(`Задача без названия пропущена`);
          continue;
        }

        const taskData = {
          title: task.title,
          description: task.description || '',
          boardId: task.boardId,
          columnId: task.columnId,
          assigneeId: task.assigneeId || null,
          authorId: task.authorId || null,
          priority: task.priority || 'normal',
          dueDate: task.dueDate || null,
          startDate: task.startDate || null,
          tags: task.tags || [],
          createdBy: task.createdBy || user.uid,
        };

        console.log('📝 Creating task:', taskData);

        const result = await taskService.createTask(taskData);
        if (result.success) {
          results.push(result.task);
        } else {
          errors.push(`Ошибка создания "${task.title}": ${result.message}`);
        }
      }

      if (errors.length > 0) {
        console.error('Task creation errors:', errors);
        toast.error(errors.join('\n'), { title: 'Ошибки' });
      }

      if (results.length > 0) {
        toast.success(
          `Создано ${results.length} ${results.length === 1 ? "задача" : results.length < 5 ? "задачи" : "задач"}!`,
          { title: "Успешно" }
        );
        
        if (onTasksCreated) {
          onTasksCreated(results);
        }
        
        onClose();
      }
    } catch (error) {
      console.error("Error creating tasks:", error);
      toast.error(`Ошибка при создании задач: ${error.message}`, { title: "Ошибка" });
    } finally {
      setCreating(false);
    }
  };

  // Разделить задачу на подзадачи через AI
  const handleSplitTask = async (taskId) => {
    const task = editableTasks.find(t => t.id === taskId);
    if (!task) return;

    setSplittingTaskId(taskId);
    
    try {
      const result = await aiService.breakdownTask(task);
      
      if (result.success && result.subtasks?.length > 0) {
        // Удаляем исходную задачу и добавляем подзадачи
        const taskIndex = editableTasks.findIndex(t => t.id === taskId);
        const newTasks = result.subtasks.map((subtask, i) => ({
          id: `split_${taskId}_${i}`,
          title: subtask.title,
          description: subtask.description || '',
          priority: task.priority,
          dueDate: task.dueDate,
          boardId: task.boardId,
          columnId: task.columnId,
          assigneeId: task.assigneeId,
          tags: task.tags || [],
          estimatedHours: subtask.estimatedHours,
        }));

        setEditableTasks(prev => {
          const updated = [...prev];
          updated.splice(taskIndex, 1, ...newTasks);
          return updated;
        });

        toast.success(`Задача разделена на ${newTasks.length} подзадач`);
      } else {
        toast.error('Не удалось разделить задачу');
      }
    } catch (error) {
      console.error('Split task error:', error);
      toast.error(`Ошибка: ${error.message}`);
    } finally {
      setSplittingTaskId(null);
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
                  <AccordionSummary 
                    expandIcon={<ExpandMore />}
                    sx={{ 
                      '& .MuiAccordionSummary-content': { 
                        alignItems: 'center',
                        gap: 1,
                      }
                    }}
                  >
                    <CheckCircle color="primary" fontSize="small" />
                    <Typography sx={{ flex: 1 }}>{task.title}</Typography>
                    <Box 
                      component="span"
                      onClick={(e) => e.stopPropagation()}
                      sx={{ display: 'flex', gap: 0.5 }}
                    >
                      <Tooltip title="Разделить на подзадачи">
                        <Box
                          component="span"
                          onClick={() => handleSplitTask(task.id)}
                          sx={{ 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            p: 0.5,
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          {splittingTaskId === task.id ? (
                            <CircularProgress size={18} />
                          ) : (
                            <CallSplit fontSize="small" />
                          )}
                        </Box>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <Box
                          component="span"
                          onClick={() => handleRemoveTask(task.id)}
                          sx={{ 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            p: 0.5,
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <Delete fontSize="small" />
                        </Box>
                      </Tooltip>
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
                            value={task.assigneeId || ''}
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

                      {/* Автор и Постановщик */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <FormControl fullWidth>
                          <InputLabel>Автор идеи</InputLabel>
                          <Select
                            value={task.authorId || ''}
                            onChange={(e) => handleUpdateTask(task.id, 'authorId', e.target.value)}
                            label="Автор идеи"
                          >
                            <MenuItem value="">Не указан</MenuItem>
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
                          <InputLabel>Постановщик</InputLabel>
                          <Select
                            value={task.createdBy || user?.uid || ''}
                            onChange={(e) => handleUpdateTask(task.id, 'createdBy', e.target.value)}
                            label="Постановщик"
                          >
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

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Box>
          {onRegenerate && !generating && (
            <Button 
              onClick={onRegenerate} 
              disabled={creating}
              startIcon={<Refresh />}
              color="secondary"
            >
              Сгенерировать заново
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} disabled={creating}>
            Отмена
          </Button>
          {editableTasks.length > 0 && !generating && !error && (
            <Button
              variant="contained"
              onClick={handleCreateTasks}
              disabled={creating || editableTasks.length === 0}
              startIcon={creating ? <CircularProgress size={20} /> : <CheckCircle />}
            >
              {creating ? 'Создаём...' : `Создать ${editableTasks.length} ${editableTasks.length === 1 ? 'задачу' : 'задач'}`}
            </Button>
          )}
        </Box>
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
