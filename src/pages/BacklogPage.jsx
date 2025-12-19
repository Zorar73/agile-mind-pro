// src/pages/BacklogPage.jsx
// Страница бэклога - задачи не в спринтах

import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Tooltip,
  LinearProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Sort,
  MoreVert,
  DragIndicator,
  Delete,
  Edit,
  PlayArrow,
  Flag,
  Schedule,
  ViewKanban,
  CheckBox,
  CheckBoxOutlineBlank,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import taskService from '../services/task.service';
import boardService from '../services/board.service';
import userService from '../services/user.service';
import TaskDrawer from '../components/Task/TaskDrawer';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const PRIORITY_CONFIG = {
  urgent: { label: 'Срочный', color: '#E53935', order: 0 },
  high: { label: 'Высокий', color: '#FB8C00', order: 1 },
  normal: { label: 'Нормальный', color: '#1E88E5', order: 2 },
  low: { label: 'Низкий', color: '#78909C', order: 3 },
};

// Компонент перетаскиваемой задачи
function SortableBacklogTask({ task, users, onSelect, isSelected, onOpenTask, onMenuOpen }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
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

  const assignee = users.find(u => u.id === task.assigneeId);
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.normal;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 1,
        cursor: 'pointer',
        bgcolor: isSelected 
          ? (isDark ? 'rgba(30, 136, 229, 0.15)' : 'rgba(30, 136, 229, 0.08)')
          : (isDark ? 'background.paper' : 'white'),
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : (isDark ? 'divider' : 'grey.200'),
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: 2,
        },
      }}
      onClick={() => onOpenTask(task)}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Drag handle */}
          <IconButton
            size="small"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            sx={{ 
              cursor: 'grab', 
              color: 'text.disabled',
              '&:hover': { color: 'text.secondary' },
            }}
          >
            <DragIndicator fontSize="small" />
          </IconButton>

          {/* Checkbox */}
          <Checkbox
            size="small"
            checked={isSelected}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(task.id);
            }}
            icon={<CheckBoxOutlineBlank fontSize="small" />}
            checkedIcon={<CheckBox fontSize="small" />}
            sx={{ p: 0.5 }}
          />

          {/* Priority indicator */}
          <Tooltip title={priority.label}>
            <Flag sx={{ fontSize: 18, color: priority.color }} />
          </Tooltip>

          {/* Title */}
          <Typography 
            variant="body2" 
            fontWeight={500}
            sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {task.title}
          </Typography>

          {/* Board */}
          {task.boardTitle && (
            <Chip
              icon={<ViewKanban sx={{ fontSize: 14 }} />}
              label={task.boardTitle}
              size="small"
              sx={{ 
                height: 22, 
                fontSize: '0.7rem',
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'grey.100',
              }}
            />
          )}

          {/* Due date */}
          {task.dueDate && (
            <Chip
              icon={<Schedule sx={{ fontSize: 14 }} />}
              label={format(
                task.dueDate?.toDate?.() || new Date(task.dueDate), 
                'dd MMM', 
                { locale: ru }
              )}
              size="small"
              sx={{ 
                height: 22, 
                fontSize: '0.7rem',
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'grey.100',
              }}
            />
          )}

          {/* Assignee */}
          {assignee && (
            <Tooltip title={`${assignee.firstName} ${assignee.lastName}`}>
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                {assignee.firstName?.charAt(0)}
              </Avatar>
            </Tooltip>
          )}

          {/* Menu */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMenuOpen(e, task);
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}

function BacklogPage() {
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBoard, setFilterBoard] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('asc');

  // Выбранные задачи
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Меню и drawer
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuTask, setMenuTask] = useState(null);
  const [drawerTask, setDrawerTask] = useState(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Загрузка досок
      const boardsResult = await boardService.getUserBoards(user.uid);
      if (boardsResult.success) {
        setBoards(boardsResult.boards);
      }

      // Загрузка пользователей
      const usersResult = await userService.getAllUsers();
      if (usersResult.success) {
        setUsers(usersResult.users.filter(u => u.role !== 'pending'));
      }

      // Загрузка задач из всех досок (только не в спринтах)
      const allTasks = [];
      
      if (boardsResult.success) {
        for (const board of boardsResult.boards) {
          const tasksResult = await taskService.getTasksByBoard(board.id);
          if (tasksResult.success) {
            // Фильтруем задачи без спринта
            const backlogTasks = tasksResult.tasks.filter(t => !t.sprintId);
            backlogTasks.forEach(task => {
              allTasks.push({
                ...task,
                boardTitle: board.title,
                boardId: board.id,
              });
            });
          }
        }
      }

      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading backlog:', error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и сортировка
  const filteredTasks = tasks
    .filter(task => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterBoard && task.boardId !== filterBoard) {
        return false;
      }
      if (filterPriority && task.priority !== filterPriority) {
        return false;
      }
      if (filterAssignee && task.assigneeId !== filterAssignee) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'priority':
          comparison = (PRIORITY_CONFIG[a.priority]?.order || 2) - (PRIORITY_CONFIG[b.priority]?.order || 2);
          break;
        case 'dueDate':
          const dateA = a.dueDate?.toDate?.() || new Date(a.dueDate || '9999-12-31');
          const dateB = b.dueDate?.toDate?.() || new Date(b.dueDate || '9999-12-31');
          comparison = dateA - dateB;
          break;
        case 'created':
          const createdA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const createdB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          comparison = createdB - createdA;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(t => t.id));
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = filteredTasks.findIndex(t => t.id === active.id);
      const newIndex = filteredTasks.findIndex(t => t.id === over.id);
      
      // Обновляем порядок (только визуально, без сохранения)
      setTasks(prev => {
        const taskIds = prev.map(t => t.id);
        const filteredIds = filteredTasks.map(t => t.id);
        const newFilteredOrder = arrayMove(filteredIds, oldIndex, newIndex);
        
        // Восстанавливаем полный список с новым порядком
        return prev.sort((a, b) => {
          const indexA = newFilteredOrder.indexOf(a.id);
          const indexB = newFilteredOrder.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Удалить ${selectedTasks.length} задач?`)) return;
    
    for (const taskId of selectedTasks) {
      await taskService.deleteTask(taskId);
    }
    
    setSelectedTasks([]);
    loadData();
  };

  const handleMenuOpen = (e, task) => {
    setMenuAnchor(e.currentTarget);
    setMenuTask(task);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuTask(null);
  };

  const handleDeleteTask = async () => {
    if (!menuTask) return;
    
    if (window.confirm('Удалить задачу?')) {
      await taskService.deleteTask(menuTask.id);
      loadData();
    }
    handleMenuClose();
  };

  return (
    <MainLayout>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Бэклог
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Задачи, не назначенные в спринты • {filteredTasks.length} задач
          </Typography>
        </Box>
      </Box>

      {/* Панель фильтров */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Поиск */}
            <TextField
              size="small"
              placeholder="Поиск задач..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              sx={{ minWidth: 200 }}
            />

            {/* Фильтр по доске */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Доска</InputLabel>
              <Select
                value={filterBoard}
                onChange={(e) => setFilterBoard(e.target.value)}
                label="Доска"
              >
                <MenuItem value="">Все доски</MenuItem>
                {boards.map(board => (
                  <MenuItem key={board.id} value={board.id}>{board.title}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Фильтр по приоритету */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                label="Приоритет"
              >
                <MenuItem value="">Все</MenuItem>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Flag sx={{ fontSize: 16, color: config.color }} />
                      {config.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Фильтр по исполнителю */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Исполнитель</InputLabel>
              <Select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                label="Исполнитель"
              >
                <MenuItem value="">Все</MenuItem>
                {users.map(u => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider orientation="vertical" flexItem />

            {/* Сортировка */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Сортировка</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Сортировка"
              >
                <MenuItem value="priority">Приоритет</MenuItem>
                <MenuItem value="dueDate">Срок</MenuItem>
                <MenuItem value="created">Дата создания</MenuItem>
                <MenuItem value="title">Название</MenuItem>
              </Select>
            </FormControl>

            <IconButton
              size="small"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
            >
              {sortOrder === 'asc' ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Массовые действия */}
      {selectedTasks.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                color="error" 
                onClick={handleDeleteSelected}
                startIcon={<Delete />}
              >
                Удалить ({selectedTasks.length})
              </Button>
            </Box>
          }
        >
          Выбрано {selectedTasks.length} задач
        </Alert>
      )}

      {/* Список задач */}
      {loading ? (
        <LinearProgress sx={{ borderRadius: 2 }} />
      ) : filteredTasks.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Бэклог пуст
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Все задачи назначены в спринты или ещё не созданы
          </Typography>
        </Card>
      ) : (
        <Box>
          {/* Заголовок списка */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 1, 
            px: 2,
            py: 1,
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'grey.50',
            borderRadius: 2,
          }}>
            <Checkbox
              size="small"
              checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
              indeterminate={selectedTasks.length > 0 && selectedTasks.length < filteredTasks.length}
              onChange={handleSelectAll}
              sx={{ p: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
              {selectedTasks.length > 0 
                ? `Выбрано ${selectedTasks.length} из ${filteredTasks.length}`
                : `Всего ${filteredTasks.length} задач`
              }
            </Typography>
          </Box>

          {/* DnD список */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredTasks.map(task => (
                <SortableBacklogTask
                  key={task.id}
                  task={task}
                  users={users}
                  isSelected={selectedTasks.includes(task.id)}
                  onSelect={handleSelectTask}
                  onOpenTask={setDrawerTask}
                  onMenuOpen={handleMenuOpen}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Box>
      )}

      {/* Меню действий */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setDrawerTask(menuTask);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Редактировать
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteTask} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Удалить
        </MenuItem>
      </Menu>

      {/* Drawer задачи */}
      {drawerTask && (
        <TaskDrawer
          taskId={drawerTask.id}
          open={true}
          onClose={() => setDrawerTask(null)}
          drawerId={`task-${drawerTask.id}`}
        />
      )}
    </MainLayout>
  );
}

export default BacklogPage;
