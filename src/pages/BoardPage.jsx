// src/pages/BoardPage.jsx
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  AvatarGroup,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Delete,
  Edit,
  ViewKanban,
  GroupWork,
  Timeline as TimelineIcon,
  ExpandMore,
  ExpandLess,
  AutoAwesome,
  ArrowBack,
  ArrowForward,
  History,
  TrendingUp,
} from '@mui/icons-material';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import TaskDrawer from '../components/Task/TaskDrawer';
import QuickAddTask from '../components/Board/QuickAddTask';
import BoardFilters from '../components/Board/BoardFilters';
import Breadcrumbs from '../components/Common/Breadcrumbs';
import BoardGrouping from '../components/Board/BoardGrouping';
import GanttChart from '../components/Board/GanttChart';
import SprintPlanning from '../components/Sprint/SprintPlanning';
import ActiveSprint from '../components/Sprint/ActiveSprint';
import SprintHistory from '../components/Sprint/SprintHistory';
import AITaskCreator from '../components/AI/AITaskCreator';
import AIProcessingOverlay from '../components/Common/AIProcessingOverlay';
import { useToast } from '../contexts/ToastContext';
import { UserContext } from '../App';
import boardService from '../services/board.service';
import taskService from '../services/task.service';
import userService from '../services/user.service';
import sprintService from '../services/sprint.service';
import aiService from '../services/ai.service';

// Bauhaus цвета
const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

// SortableTask компонент
function SortableTask({ task, users, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assignee = users[task.assigneeId];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      sx={{
        mb: 1.5,
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="body2" fontWeight="600" gutterBottom>
          {task.title}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
          {task.priority === 'urgent' && (
            <Chip label="Срочная" color="error" size="small" />
          )}
          {task.priority === 'recurring' && (
            <Chip label="Повтор" color="info" size="small" />
          )}
          {task.storyPoints > 0 && (
            <Chip label={`${task.storyPoints} SP`} size="small" variant="outlined" />
          )}
          {task.tags?.slice(0, 2).map(tag => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
          
          {assignee && (
            <Tooltip title={`${assignee.firstName} ${assignee.lastName}`}>
              <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                {assignee.firstName?.charAt(0)}
              </Avatar>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// SortableColumn компонент
function SortableColumn({ column, boardId, tasks, users, onTaskClick, onEditColumn, onDeleteColumn, onMoveColumn, onAddTaskSuccess, canMoveLeft, canMoveRight }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [menuAnchor, setMenuAnchor] = useState(null);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        minWidth: { xs: '100%', sm: 300 }, // Полная ширина на мобильных, фиксированная на десктопе
        maxWidth: { xs: '100%', sm: 300 },
        width: { xs: '100%', sm: 'auto' },
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: { xs: 'none', sm: 'calc(100vh - 280px)' }, // Неограниченная высота на мобильных
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Заголовок колонки */}
        <Box 
          {...attributes}
          {...listeners}
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight="600">
              {column.title}
            </Typography>
            <Chip label={tasks.length} size="small" />
          </Box>
          
          <IconButton 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAnchor(e.currentTarget);
            }}
          >
            <MoreVert />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={() => {
              setMenuAnchor(null);
              onEditColumn(column);
            }}>
              <Edit sx={{ mr: 1 }} fontSize="small" />
              Редактировать
            </MenuItem>
            <MenuItem 
              onClick={() => {
                setMenuAnchor(null);
                onMoveColumn(column.id, 'left');
              }}
              disabled={!canMoveLeft}
            >
              <ArrowBack sx={{ mr: 1 }} fontSize="small" />
              Сдвинуть влево
            </MenuItem>
            <MenuItem 
              onClick={() => {
                setMenuAnchor(null);
                onMoveColumn(column.id, 'right');
              }}
              disabled={!canMoveRight}
            >
              <ArrowForward sx={{ mr: 1 }} fontSize="small" />
              Сдвинуть вправо
            </MenuItem>
            <MenuItem onClick={() => {
              setMenuAnchor(null);
              onDeleteColumn(column);
            }}>
              <Delete sx={{ mr: 1 }} fontSize="small" />
              Удалить
            </MenuItem>
          </Menu>
        </Box>

        {/* Список задач */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight: 100 }}>
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <SortableTask 
                key={task.id} 
                task={task} 
                users={users}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </SortableContext>
        </Box>

        {/* Quick Add */}
        <Box sx={{ mt: 2 }}>
          <QuickAddTask
            boardId={boardId}
            columnId={column.id}
            onSuccess={onAddTaskSuccess}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

function BoardPage() {
  const { user } = useContext(UserContext);
  const { boardId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const theme = useTheme();

  // Определяем мобильный экран для адаптивного Kanban
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px

  // Данные
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState({});
  
  // Режимы просмотра
  const [viewMode, setViewMode] = useState('kanban');
  const [groupBy, setGroupBy] = useState('dueDate');
  const [groupMenuAnchor, setGroupMenuAnchor] = useState(null);
  
  // Фильтры
  const [filters, setFilters] = useState({
    search: '',
    assignees: [],
    tags: [],
    myTasks: false,
  });
  
  // Задачи
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  
  // Колонки
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingColumn, setEditingColumn] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState(null);
  const [targetColumn, setTargetColumn] = useState('');

  // AI
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResultDialogOpen, setAiResultDialogOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');

  // AI создание задач
  const [aiTaskDialog, setAiTaskDialog] = useState(false);
  const [aiTaskInput, setAiTaskInput] = useState('');
  const [aiGeneratingTasks, setAiGeneratingTasks] = useState(false);
  const [aiGeneratedTasks, setAiGeneratedTasks] = useState([]);
  const [aiTaskError, setAiTaskError] = useState('');

  // Спринты
  const [sprints, setSprints] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [completedSprints, setCompletedSprints] = useState([]);
  const [planningDialogOpen, setPlanningDialogOpen] = useState(false);
  const [showSprints, setShowSprints] = useState(false);
  const [showSprintHistory, setShowSprintHistory] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (boardId && user) {
      loadBoardData();
      loadUsers();
      loadSprints();
    }
  }, [boardId, user]);

  const loadBoardData = async () => {
    try {
      const boardResult = await boardService.getBoard(boardId);
      if (!boardResult.success) return;
      setBoard(boardResult.board);

      const columnsResult = await boardService.getColumns(boardId);
      if (columnsResult.success) {
        setColumns(columnsResult.columns);
      }

      const tasksResult = await taskService.getTasksByBoard(boardId);
      if (tasksResult.success) {
        setTasks(tasksResult.tasks);
      }
    } catch (error) {
      console.error('Error loading board data:', error);
    }
  };

  const loadUsers = async () => {
    const result = await userService.getAllUsers();
    if (result.success) {
      const usersMap = {};
      result.users.forEach(u => usersMap[u.id] = u);
      setUsers(usersMap);
    }
  };

  const loadSprints = async () => {
    if (!boardId) return;
    
    try {
      const result = await sprintService.getBoardSprints(boardId);
      if (result.success) {
        setSprints(result.sprints);
        const active = result.sprints.find(s => s.status === 'active');
        if (active) {
          setActiveSprint(active);
          setShowSprints(true);
        }
        
        // Загружаем завершённые спринты отдельно
        const completed = result.sprints.filter(s => s.status === 'completed');
        setCompletedSprints(completed);
      }
    } catch (error) {
      console.error('Error loading sprints:', error);
    }
  };

  // Фильтрация задач (мемоизирована для оптимизации)
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }

    if (filters.assignees?.length > 0) {
      filtered = filtered.filter(t => filters.assignees.includes(t.assigneeId));
    }

    if (filters.tags?.length > 0) {
      filtered = filtered.filter(t =>
        t.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    if (filters.myTasks) {
      filtered = filtered.filter(t => t.assigneeId === user.uid);
    }

    return filtered;
  }, [tasks, filters, user.uid]);

  const getColumnTasks = useCallback((columnId) => {
    return filteredTasks
      .filter(task => task.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }, [filteredTasks]);

  const allTags = useMemo(() => {
    const tagsSet = new Set();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [tasks]);

  // Колонки
  const handleEditColumn = (column) => {
    setEditingColumn(column);
    setNewColumnTitle(column.title);
    setColumnDialogOpen(true);
  };

  const handleDeleteColumn = async (column) => {
    // Проверка наличия задач
    const checkResult = await boardService.checkColumnHasTasks(column.id);
    
    if (checkResult.hasTasks) {
      setColumnToDelete(column);
      setTargetColumn('');
      setDeleteConfirmOpen(true);
    } else {
      if (confirm(`Удалить колонку "${column.title}"?`)) {
        // ИСПРАВЛЕНИЕ: Передача boardId
        await boardService.deleteColumn(boardId, column.id);
        loadBoardData();
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!columnToDelete || !boardId) return;

    if (targetColumn) {
      await boardService.moveTasksToColumn(columnToDelete.id, targetColumn);
    }
    
    // ИСПРАВЛЕНИЕ: Передача boardId
    await boardService.deleteColumn(boardId, columnToDelete.id);
    setDeleteConfirmOpen(false);
    setColumnToDelete(null);
    setTargetColumn('');
    loadBoardData();
  };

  const handleSaveColumn = async () => {
    if (!newColumnTitle.trim() || !boardId) return;

    try {
      if (editingColumn) {
        // ИСПРАВЛЕНИЕ: Передача boardId
        await boardService.updateColumn(boardId, editingColumn.id, { title: newColumnTitle });
      } else {
        const maxOrder = columns.length > 0 
          ? Math.max(...columns.map(c => c.order)) 
          : 0;
        await boardService.addColumn(boardId, {
          title: newColumnTitle,
          order: maxOrder + 1,
        });
      }
      
      setColumnDialogOpen(false);
      setNewColumnTitle('');
      setEditingColumn(null);
      loadBoardData();
    } catch (error) {
      console.error('Error saving column:', error);
    }
  };

  const handleMoveColumn = async (columnId, direction) => {
    if (!boardId) return;
    const currentIndex = columns.findIndex(c => c.id === columnId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;

    const newColumns = arrayMove(columns, currentIndex, newIndex);
    const updates = newColumns.map((col, index) => ({
      id: col.id,
      order: index,
    }));

    // ИСПРАВЛЕНИЕ: Передача boardId
    await boardService.reorderColumns(boardId, updates);
    loadBoardData();
  };

  // DnD для колонок
  const handleColumnDragEnd = (event) => {
    if (!boardId) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = columns.findIndex(c => c.id === active.id);
    const newIndex = columns.findIndex(c => c.id === over.id);

    const newColumns = arrayMove(columns, oldIndex, newIndex);
    const updates = newColumns.map((col, index) => ({
      id: col.id,
      order: index,
    }));

    // ИСПРАВЛЕНИЕ: Передача boardId
    boardService.reorderColumns(boardId, updates);
    setColumns(newColumns);
  };

  // DnD для задач
  const handleTaskDragStart = (event) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task);
  };

  const handleTaskDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Определяем новую колонку
    let newColumnId = task.columnId;
    
    // Если dropped на колонку
    if (columns.find(c => c.id === over.id)) {
      newColumnId = over.id;
    }
    // Если dropped на задачу
    else {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        newColumnId = overTask.columnId;
      }
    }

    // Получаем задачи в новой колонке
    const columnTasks = tasks
      .filter(t => t.columnId === newColumnId)
      .sort((a, b) => a.order - b.order);

    // Находим позицию
    let newOrder;
    if (active.id === over.id) {
      return; // Не двигаем если на себя
    }

    const overIndex = columnTasks.findIndex(t => t.id === over.id);
    
    if (overIndex === -1) {
      // Dropped на колонку (в конец)
      newOrder = columnTasks.length > 0 
        ? columnTasks[columnTasks.length - 1].order + 1000
        : 1000;
    } else {
      // Dropped на задачу
      const overTask = columnTasks[overIndex];
      const prevTask = columnTasks[overIndex - 1];
      
      if (prevTask) {
        newOrder = (prevTask.order + overTask.order) / 2;
      } else {
        newOrder = overTask.order - 1000;
      }
    }

    // Определяем статус на основе колонки
    const targetColumn = columns.find(c => c.id === newColumnId);
    const isLastColumn = columns.indexOf(targetColumn) === columns.length - 1;
    const isDoneColumn = targetColumn?.title?.toLowerCase().includes('готов') || 
                         targetColumn?.title?.toLowerCase().includes('done') ||
                         targetColumn?.title?.toLowerCase().includes('завершен') ||
                         isLastColumn;
    
    // Определяем новый статус
    let newStatus = task.status;
    if (isDoneColumn) {
      newStatus = 'done';
    } else if (task.status === 'done') {
      // Если задача была done и перемещена из колонки Готово - возвращаем в работу
      newStatus = 'in_progress';
    }

    // Обновляем оптимистично
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, columnId: newColumnId, order: newOrder, status: newStatus }
        : t
    ));

    // Отправляем на сервер
    await taskService.updateTask(taskId, { 
      columnId: newColumnId,
      order: newOrder,
      status: newStatus,
    });
  };

  // Спринты
  const handleCreateSprint = async (sprintData) => {
    const result = await sprintService.createSprint(
      boardId,
      {
        name: sprintData.name,
        goal: sprintData.goal,
        startDate: sprintData.startDate,
        endDate: sprintData.endDate,
      },
      user.uid
    );

    if (result.success) {
      await sprintService.addTasksToSprint(result.sprintId, sprintData.taskIds);
      
      for (const taskId of sprintData.taskIds) {
        await taskService.updateTask(taskId, { sprintId: result.sprintId });
      }
      
      await sprintService.startSprint(result.sprintId);
      
      loadSprints();
      loadBoardData();
    }
  };

  const handleCompleteSprint = async (sprintId, completedTaskIds, retrospective = '') => {
    // Рассчитываем финальные метрики перед завершением
    const metrics = sprintService.calculateSprintMetrics(activeSprint, tasks);
    
    await sprintService.completeSprint(sprintId, retrospective, metrics);
    
    const sprintTasks = tasks.filter(t => activeSprint.tasks?.includes(t.id));
    const incompleteTasks = sprintTasks.filter(t => !completedTaskIds.includes(t.id));
    
    for (const task of incompleteTasks) {
      await taskService.updateTask(task.id, { sprintId: null });
    }
    
    loadSprints();
    loadBoardData();
    setActiveSprint(null);
    setShowSprints(false);
  };

  const handleDeleteSprint = async (sprintId) => {
    await sprintService.deleteSprint(sprintId);
    loadSprints();
  };

  // AI - Генерация задач из текста
  const handleGenerateTasksFromText = async () => {
    if (!aiTaskInput.trim()) {
      setAiTaskError('Введите текст для генерации задач');
      return;
    }

    setAiGeneratingTasks(true);
    setAiTaskError('');

    try {
      const result = await aiService.analyzeRecap(aiTaskInput, {
        boards: [board],
        tags: [...new Set(tasks.flatMap(t => t.tags || []))],
        users: Object.values(users),
      });

      if (result.success && result.tasks) {
        setAiGeneratedTasks(result.tasks);
        toast.success(`AI сгенерировал ${result.tasks.length} задач!`, { title: "Успешно" });
      } else {
        const errorMsg = result.message || "Не удалось сгенерировать задачи";
        setAiTaskError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = error.message || "Ошибка генерации задач";
      setAiTaskError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setAiGeneratingTasks(false);
    }
  };

  // AI - Анализ доски
  const handleAIAnalyze = async () => {
    setAiAnalyzing(true);
    try {
      const recapText = `Анализ доски "${board.title}"

Колонок: ${columns.length}
Задач: ${tasks.length}

Детали:
${columns.map(c => `- ${c.title}: ${getColumnTasks(c.id).length} задач`).join('\n')}

Задачи:
${tasks.slice(0, 10).map(t => `- ${t.title} (${t.status || 'todo'})`).join('\n')}

Дай краткий анализ: статус проекта, проблемы, рекомендации.`;

      const result = await aiService.analyzeRecap(recapText, {
        boards: { [board.id]: board },
        tags: [],
        users: Object.values(users)
      });
      
      if (result.success) {
        setAiAnalysis(result.summary || 'Анализ завершён');
        setAiResultDialogOpen(true);
      }
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setAiAnalyzing(false);
    }
  };

  if (!board) {
    return (
      <MainLayout title="Загрузка...">
        <Typography>Загрузка доски...</Typography>
      </MainLayout>
    );
  }

  // members теперь MAP {userId: 'role'}, поэтому используем Object.keys()
  const boardMembers = Object.keys(board.members || {}).map(id => users[id]).filter(Boolean);

  return (
    <MainLayout title={board.title}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Доски', path: '/boards' },
          { label: board.title },
        ]}
      />

      {/* Хедер */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 2
      }}>
        {/* Левая часть: название + команда */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', minWidth: 0 }}>
          <Typography variant="h5" fontWeight="bold" noWrap>
            {board.title}
          </Typography>

          <AvatarGroup max={5}>
            {boardMembers.map(member => (
              <Tooltip key={member.id} title={`${member.firstName} ${member.lastName}`}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {member.firstName?.charAt(0)}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        </Box>

        {/* Правая часть: кнопки */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          {/* AI - Создать задачи */}
          <Button
            variant="contained"
            size="small"
            startIcon={<AutoAwesome />}
            onClick={() => setAiTaskDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #66438e 100%)',
              },
              whiteSpace: 'nowrap',
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>AI Задачи</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>AI</Box>
          </Button>

          {/* Добавить колонку */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={() => {
              setEditingColumn(null);
              setNewColumnTitle('');
              setColumnDialogOpen(true);
            }}
            sx={{ whiteSpace: 'nowrap', display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Колонка
          </Button>

          {/* Спринт */}
          <Button
            variant={showSprints ? 'contained' : 'outlined'}
            size="small"
            startIcon={<TimelineIcon />}
            onClick={() => {
              if (activeSprint) {
                setShowSprints(!showSprints);
              } else {
                setPlanningDialogOpen(true);
              }
            }}
            sx={{ whiteSpace: 'nowrap', display: { xs: 'none', sm: 'inline-flex' } }}
          >
            {activeSprint ? 'Спринт' : 'Начать спринт'}
          </Button>

          {/* Все спринты */}
          <Tooltip title="Управление спринтами">
            <IconButton
              size="small"
              onClick={() => navigate(`/board/${boardId}/sprints`)}
              sx={{ color: 'primary.main' }}
            >
              <TrendingUp />
            </IconButton>
          </Tooltip>

          {/* Виды */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, v) => v && setViewMode(v)}
            size="small"
          >
            <ToggleButton value="kanban">
              <ViewKanban fontSize="small" />
            </ToggleButton>
            <ToggleButton value="grouping">
              <GroupWork fontSize="small" />
            </ToggleButton>
            <ToggleButton value="gantt">
              <TimelineIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Группировка */}
          {viewMode === 'grouping' && (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => setGroupMenuAnchor(e.currentTarget)}
                endIcon={<ExpandMore />}
              >
                {groupBy === 'dueDate' ? 'Срок' : 
                 groupBy === 'assignee' ? 'Исполнитель' :
                 groupBy === 'priority' ? 'Приоритет' : 'Доска'}
              </Button>
              
              <Menu
                anchorEl={groupMenuAnchor}
                open={Boolean(groupMenuAnchor)}
                onClose={() => setGroupMenuAnchor(null)}
              >
                <MenuItem onClick={() => { setGroupBy('dueDate'); setGroupMenuAnchor(null); }}>
                  По сроку
                </MenuItem>
                <MenuItem onClick={() => { setGroupBy('assignee'); setGroupMenuAnchor(null); }}>
                  По исполнителю
                </MenuItem>
                <MenuItem onClick={() => { setGroupBy('priority'); setGroupMenuAnchor(null); }}>
                  По приоритету
                </MenuItem>
              </Menu>
            </>
          )}

          {/* AI (в меню) */}
          <IconButton
            size="small"
            onClick={handleAIAnalyze}
            disabled={aiAnalyzing}
            color="secondary"
          >
            <AutoAwesome />
          </IconButton>
        </Box>
      </Box>

      {/* Фильтры */}
      <Box sx={{ mb: 3 }}>
        <BoardFilters
          users={users}
          allTags={allTags}
          filters={filters}
          onFiltersChange={setFilters}
          currentUserId={user.uid}
        />
      </Box>

      {/* Активный спринт */}
      {showSprints && activeSprint && (
        <Box sx={{ mb: 3 }}>
          <ActiveSprint
            sprint={activeSprint}
            tasks={tasks}
            onComplete={handleCompleteSprint}
            onUpdate={loadSprints}
          />
        </Box>
      )}

      {/* Кнопка архива спринтов (если нет активного но есть завершённые) */}
      {!activeSprint && completedSprints.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="text"
            size="small"
            onClick={() => setShowSprintHistory(!showSprintHistory)}
            startIcon={showSprintHistory ? <ExpandLess /> : <ExpandMore />}
          >
            Архив спринтов ({completedSprints.length})
          </Button>
        </Box>
      )}

      {/* Архив спринтов */}
      {showSprintHistory && completedSprints.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <SprintHistory 
            sprints={completedSprints}
            allTasks={tasks}
            users={users}
            onDeleteSprint={handleDeleteSprint}
            onTaskClick={setSelectedTask}
          />
        </Box>
      )}

      {/* Канбан */}
      {viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleTaskDragStart}
          onDragEnd={handleTaskDragEnd}
        >
          <SortableContext
            items={columns.map(c => c.id)}
            strategy={isMobile ? verticalListSortingStrategy : horizontalListSortingStrategy}
          >
            <Box sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              overflowX: isMobile ? 'visible' : 'auto',
              pb: 2
            }}>
              {columns.map((column, index) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  boardId={boardId}
                  tasks={getColumnTasks(column.id)}
                  users={users}
                  onTaskClick={setSelectedTask}
                  onEditColumn={handleEditColumn}
                  onDeleteColumn={handleDeleteColumn}
                  onMoveColumn={handleMoveColumn}
                  onAddTaskSuccess={loadBoardData}
                  canMoveLeft={index > 0}
                  canMoveRight={index < columns.length - 1}
                />
              ))}
            </Box>
          </SortableContext>

          <DragOverlay>
            {activeTask && (
              <Card sx={{ opacity: 0.8, width: 300 }}>
                <CardContent>
                  <Typography variant="body2" fontWeight="600">
                    {activeTask.title}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Группировка */}
      {viewMode === 'grouping' && (
        <BoardGrouping
          tasks={filteredTasks}
          users={users}
          boards={{ [board.id]: board }}
          teams={{}}
          groupBy={groupBy}
          onTaskClick={setSelectedTask}
        />
      )}

      {/* Гант */}
      {viewMode === 'gantt' && (
        <GanttChart tasks={filteredTasks} users={users} />
      )}

      {/* Диалог колонки */}
      <Dialog open={columnDialogOpen} onClose={() => setColumnDialogOpen(false)}>
        <DialogTitle>
          {editingColumn ? 'Редактировать колонку' : 'Новая колонка'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Название"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveColumn()}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColumnDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveColumn} variant="contained">
            {editingColumn ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Подтверждение удаления колонки */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Удалить колонку?</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            В колонке "{columnToDelete?.title}" есть задачи. Куда их переместить?
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Целевая колонка</InputLabel>
            <Select
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              label="Целевая колонка"
            >
              {columns
                .filter(c => c.id !== columnToDelete?.id)
                .map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.title}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            disabled={!targetColumn}
          >
            Удалить и переместить
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI результат */}
      <Dialog open={aiResultDialogOpen} onClose={() => setAiResultDialogOpen(false)} maxWidth="md">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome color="secondary" />
            AI Анализ
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
            {aiAnalysis}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiResultDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Планирование спринта */}
      <SprintPlanning
        open={planningDialogOpen}
        onClose={() => setPlanningDialogOpen(false)}
        tasks={tasks}
        onCreateSprint={handleCreateSprint}
      />

      {/* AI - Ввод текста для генерации задач */}
      <Dialog open={aiTaskDialog && !aiGeneratedTasks.length} onClose={() => setAiTaskDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome sx={{ color: '#667eea' }} />
            <Typography variant="h6">Создать задачи с помощью AI</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Опишите задачи текстом, и AI автоматически создаст структурированные задачи с предложениями по доске, исполнителю, приоритету и тегам.
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={8}
              label="Текст для анализа"
              placeholder="Например:&#10;- Нужно исправить баг с авторизацией (срочно, для Ивана)&#10;- Добавить темную тему для дашборда&#10;- Протестировать новую функцию экспорта данных"
              value={aiTaskInput}
              onChange={(e) => setAiTaskInput(e.target.value)}
              sx={{ mb: 2 }}
            />

            {aiTaskError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {aiTaskError}
              </Alert>
            )}

            <Alert severity="info" icon={<AutoAwesome />}>
              <Typography variant="caption">
                💡 AI проанализирует текст и извлечет задачи, определив приоритет, исполнителей и теги
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAiTaskDialog(false);
            setAiTaskInput('');
            setAiTaskError('');
          }}>
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateTasksFromText}
            disabled={aiGeneratingTasks || !aiTaskInput.trim()}
            startIcon={aiGeneratingTasks ? <CircularProgress size={20} /> : <AutoAwesome />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #66438e 100%)',
              },
            }}
          >
            {aiGeneratingTasks ? 'Генерация...' : 'Сгенерировать задачи'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Task Creator */}
      <AITaskCreator
        open={aiTaskDialog && aiGeneratedTasks.length > 0}
        onClose={() => {
          setAiTaskDialog(false);
          setAiGeneratedTasks([]);
          setAiTaskInput('');
          setAiTaskError('');
        }}
        aiTasks={aiGeneratedTasks}
        generating={aiGeneratingTasks}
        error={aiTaskError}
        onTasksCreated={(createdTasks) => {
          console.log(`Создано ${createdTasks.length} задач с помощью AI`);
          setAiTaskDialog(false);
          setAiGeneratedTasks([]);
          setAiTaskInput('');
          loadBoardData();
        }}
      />

      {/* TaskModal заменен на TaskDrawer */}
      {selectedTask && (
        <TaskDrawer
          taskId={selectedTask.id}
          open={true}
          onClose={() => {
            setSelectedTask(null);
            // В идеале loadBoardData должен вызываться, чтобы обновить доску после закрытия/сохранения
            loadBoardData();
          }}
          drawerId={`task-${selectedTask.id}`}
        />
      )}

      {/* AI Processing Overlay */}
      <AIProcessingOverlay
        open={aiGeneratingTasks}
        message="AI анализирует текст и генерирует задачи..."
        progress={null}
        variant="circular"
      />
    </MainLayout>
  );
}

export default BoardPage;