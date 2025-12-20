// src/pages/CalendarPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Fab,
  Divider,
  Avatar,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  FilterList,
  Add,
} from '@mui/icons-material';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MainLayout from '../components/Layout/MainLayout';
import { UserContext } from '../App';
import taskService from '../services/task.service';
import boardService from '../services/board.service';
import userService from '../services/user.service';
import notificationService from '../services/notification.service';
// ⚠️ ИСПРАВЛЕНО: Заменяем TaskModal на TaskDrawer
import TaskDrawer from '../components/Task/TaskDrawer';
import UnifiedTagInput from '../components/Common/UnifiedTagInput';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  addYears,
  addQuarters,
  startOfYear,
  endOfYear,
  startOfQuarter,
  endOfQuarter,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  isWeekend,
  eachDayOfInterval,
  eachMonthOfInterval,
} from 'date-fns';
import { ru } from 'date-fns/locale';

// Bauhaus цвета
const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

// Компонент для перетаскиваемой задачи
function DraggableTaskCard({ task, onClick }) {
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
    mb: 0.25,
    px: 0.5,
    py: 0.25,
    bgcolor: task.priority === 'urgent' ? 'error.main' : 'primary.main',
    borderRadius: 0.5,
    cursor: isDragging ? 'grabbing' : 'grab',
    '&:hover': { opacity: 0.8 },
  };

  return (
    <Box
      ref={setNodeRef}
      sx={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: 'white',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '0.65rem',
          lineHeight: 1.2,
        }}
      >
        {task.title}
      </Typography>
    </Box>
  );
}

// Компонент для дня-приёмника (месячный вид)
function DroppableDay({ date, tasks, isCurrentMonth, isWeekendDay, onTaskClick, onDateClick }) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dateStr}`,
  });

  return (
    <Card
      ref={setNodeRef}
      sx={{
        minHeight: 90,
        maxHeight: 90,
        bgcolor: isCurrentMonth 
          ? (isWeekendDay ? 'error.lighter' : 'background.paper')
          : 'grey.100',
        border: 1,
        borderColor: isToday(date) ? 'primary.main' : (isOver ? 'success.main' : 'divider'),
        borderWidth: isToday(date) || isOver ? 2 : 1,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
        },
        opacity: isOver ? 0.8 : 1,
      }}
      onClick={() => onDateClick(date)}
    >
      <CardContent sx={{ p: 0.5, height: '100%', overflow: 'hidden', '&:last-child': { pb: 0.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, px: 0.5 }}>
          <Typography
            variant="caption"
            fontWeight={isToday(date) ? 'bold' : 'normal'}
            color={
              isToday(date)
                ? 'primary'
                : isCurrentMonth
                ? 'text.primary'
                : 'text.disabled'
            }
          >
            {format(date, 'd')}
          </Typography>
          
          {tasks.length > 0 && (
            <Chip 
              label={tasks.length} 
              size="small" 
              color="primary" 
              sx={{ height: 16, fontSize: '0.6rem', minWidth: 20 }} 
            />
          )}
        </Box>

        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.slice(0, 2).map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {tasks.length > 2 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', px: 0.5 }}>
            +{tasks.length - 2}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// Компонент для недельного вида
function DroppableWeekDay({ day, dayTasks, onTaskClick, onDateClick }) {
  const dateStr = format(day, 'yyyy-MM-dd');
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dateStr}`,
  });

  return (
    <Card
      ref={setNodeRef}
      sx={{
        minHeight: 200,
        bgcolor: isWeekend(day) ? 'error.lighter' : 'background.paper',
        border: 1,
        borderColor: isToday(day) ? 'primary.main' : (isOver ? 'success.main' : 'divider'),
        borderWidth: isToday(day) || isOver ? 2 : 1,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 2 },
        opacity: isOver ? 0.8 : 1,
      }}
      onClick={() => onDateClick(day)}
    >
      <CardContent sx={{ p: 1, height: '100%', overflow: 'auto' }}>
        <Typography variant="h6" fontWeight={isToday(day) ? 'bold' : 'normal'} color={isToday(day) ? 'primary' : 'text.primary'} gutterBottom>
          {format(day, 'd')}
        </Typography>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          {format(day, 'EEE', { locale: ru })}
        </Typography>

        <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {dayTasks.map(task => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}

function CalendarPage() {
  const { user } = useContext(UserContext);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [allColumns, setAllColumns] = useState({});
  const [users, setUsers] = useState([]);
  const [allTags, setAllTags] = useState([]);
  
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [filters, setFilters] = useState({
    myTasks: true,
    assignedToOthers: true,
    urgent: true,
    normal: true,
    recurring: true,
    selectedAssignees: [],
    selectedBoards: [],
    selectedTags: [],
  });


  const [tempFilters, setTempFilters] = useState({
    myTasks: true,
    assignedToOthers: true,
    urgent: true,
    normal: true,
    recurring: true,
    selectedAssignees: [],
    selectedBoards: [],
    selectedTags: [],
  });

  // Синхронизация tempFilters при открытии меню
  useEffect(() => {
    if (filterAnchor) {
      setTempFilters(filters);
    }
  }, [filterAnchor, filters]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    boardId: '',
    priority: 'normal',
    tags: [],
  });

  const [activeTask, setActiveTask] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const boardsResult = await boardService.getUserBoards(user.uid);
      if (!boardsResult.success) return;

      const userBoards = boardsResult.boards;
      setBoards(userBoards);

      const columnsMap = {};
      for (const board of userBoards) {
        const columnsResult = await boardService.getColumns(board.id);
        if (columnsResult.success) {
          columnsMap[board.id] = columnsResult.columns;
        }
      }
      setAllColumns(columnsMap);

      const tasksPromises = userBoards.map(board => taskService.getTasks(board.id));
      const tasksResults = await Promise.all(tasksPromises);

      const tasks = tasksResults
        .filter(result => result.success)
        .flatMap((result, index) =>
          result.tasks.map(task => ({
            ...task,
            boardId: userBoards[index].id,
            boardTitle: userBoards[index].title,
          }))
        );

      const tasksWithDates = tasks.filter(task => task.dueDate);
      setAllTasks(tasksWithDates);

      const tags = [...new Set(tasks.flatMap(t => t.tags || []))];
      setAllTags(tags);

      const usersResult = await userService.getAllUsers();
      if (usersResult.success) {
        setUsers(usersResult.users.filter(u => u.role !== 'pending'));
      }

      applyFilters(tasksWithDates);
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const applyFilters = (tasks = allTasks) => {
    let filtered = tasks;

    // Проверяем членство через members MAP
    const isMyTask = (task) => task.members && task.members[user.uid];
    
    if (!filters.myTasks) {
      filtered = filtered.filter(t => !isMyTask(t));
    }

    if (!filters.assignedToOthers) {
      filtered = filtered.filter(t => isMyTask(t) || Object.keys(t.members || {}).length === 0);
    }

    const priorities = [];
    if (filters.urgent) priorities.push('urgent');
    if (filters.normal) priorities.push('normal');
    if (filters.recurring) priorities.push('recurring');
    
    if (priorities.length > 0 && priorities.length < 3) {
      filtered = filtered.filter(t => priorities.includes(t.priority));
    }

    if (filters.selectedAssignees.length > 0) {
      // Проверяем есть ли выбранный assignee в members
      filtered = filtered.filter(t => 
        filters.selectedAssignees.some(assigneeId => t.members && t.members[assigneeId])
      );
    }

    if (filters.selectedBoards.length > 0) {
      filtered = filtered.filter(t => filters.selectedBoards.includes(t.boardId));
    }

    if (filters.selectedTags.length > 0) {
      filtered = filtered.filter(t => 
        t.tags && t.tags.some(tag => filters.selectedTags.includes(tag))
      );
    }

    setFilteredTasks(filtered);
  };

  const handleDragStart = (event) => {
    const taskId = event.active.id;
    const task = allTasks.find(t => t.id === taskId);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) {
      return;
    }

    const task = allTasks.find(t => t.id === active.id);
    if (!task) return;

    const board = boards.find(b => b.id === task.boardId);
    if (!board) return;

    const userRole = board.members[user.uid];
    if (!userRole) {
      alert('У вас нет доступа к этой доске');
      return;
    }

    if (userRole !== 'owner' && userRole !== 'editor') {
      alert('Только владелец и редакторы могут перемещать задачи');
      return;
    }

    const newDateStr = over.id.replace('day-', '');
    
    const result = await taskService.updateTask(task.id, { dueDate: newDateStr });

    if (result.success) {
      // Уведомляем всех участников кроме текущего пользователя
      const taskMembers = Object.keys(task.members || {});
      for (const memberId of taskMembers) {
        if (memberId !== user.uid) {
          await notificationService.create({
            userId: memberId,
            type: 'task_updated',
            title: 'Изменён дедлайн задачи',
            message: `Дедлайн задачи "${task.title}" изменён на ${format(new Date(newDateStr), 'd MMMM yyyy', { locale: ru })}`,
            taskId: task.id,
            actorId: user.uid,
            link: `/board/${task.boardId}`,
          });
        }
      }

      if (task.creatorId && task.creatorId !== user.uid && !taskMembers.includes(task.creatorId)) {
        await notificationService.create({
          userId: task.creatorId,
          type: 'task_updated',
          title: 'Изменён дедлайн задачи',
          message: `Дедлайн задачи "${task.title}" изменён на ${format(new Date(newDateStr), 'd MMMM yyyy', { locale: ru })}`,
          taskId: task.id,
          actorId: user.uid,
          link: `/board/${task.boardId}`,
        });
      }

      loadData();
    } else {
      alert('Ошибка при переносе задачи');
    }
  };

  const handleDateClick = (date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const handleCreateTask = async () => {
    if (!newTaskData.title || !newTaskData.boardId) {
      alert('Заполните название и выберите доску');
      return;
    }

    const boardColumns = allColumns[newTaskData.boardId] || [];
    if (boardColumns.length === 0) {
      alert('У выбранной доски нет колонок');
      return;
    }

    const result = await taskService.createTask({
      title: newTaskData.title,
      description: '',
      boardId: newTaskData.boardId,
      columnId: boardColumns[0].id,
      dueDate: format(selectedDate, 'yyyy-MM-dd'),
      priority: newTaskData.priority || 'normal',
      tags: newTaskData.tags || [],
    }, user.uid);

    if (result.success) {
      setCreateDialogOpen(false);
      setNewTaskData({ title: '', boardId: '', priority: 'normal', tags: [] });
      loadData();
    } else {
      alert('Ошибка создания задачи');
    }
  };

  const getTasksForDate = (date) => {
    return filteredTasks.filter(task => {
      try {
        let taskDate;
        
        if (!task.dueDate) return false;
        
        if (typeof task.dueDate === 'string') {
          taskDate = new Date(task.dueDate);
        } else if (task.dueDate.toDate && typeof task.dueDate.toDate === 'function') {
          taskDate = task.dueDate.toDate();
        } else if (task.dueDate.seconds) {
          taskDate = new Date(task.dueDate.seconds * 1000);
        } else if (task.dueDate instanceof Date) {
          taskDate = task.dueDate;
        } else {
          taskDate = new Date(task.dueDate);
        }
        
        if (isNaN(taskDate.getTime())) {
          return false;
        }
        
        return isSameDay(taskDate, date);
      } catch (e) {
        return false;
      }
    });
  };

  const renderHeader = () => {
    let title = '';
    if (viewMode === 'year') {
      title = format(currentDate, 'yyyy', { locale: ru });
    } else if (viewMode === 'quarter') {
      title = `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${format(currentDate, 'yyyy', { locale: ru })}`;
    } else if (viewMode === 'month') {
      title = format(currentDate, 'LLLL yyyy', { locale: ru });
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      title = `${format(weekStart, 'd MMM', { locale: ru })} - ${format(weekEnd, 'd MMM yyyy', { locale: ru })}`;
    } else {
      title = format(currentDate, 'd MMMM yyyy', { locale: ru });
    }

    return (
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ textTransform: 'capitalize', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <ButtonGroup size="small" sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <Button
              variant={viewMode === 'year' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('year')}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Год</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Г</Box>
            </Button>
            <Button
              variant={viewMode === 'quarter' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('quarter')}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Квартал</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Кв</Box>
            </Button>
            <Button
              variant={viewMode === 'month' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('month')}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Месяц</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>М</Box>
            </Button>
            <Button
              variant={viewMode === 'week' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('week')}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Неделя</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Н</Box>
            </Button>
            <Button
              variant={viewMode === 'day' ? 'contained' : 'outlined'}
              onClick={() => {
                setCurrentDate(new Date());
                setViewMode('day');
              }}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>День</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Д</Box>
            </Button>
          </ButtonGroup>

          <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
            <FilterList />
          </IconButton>

          <IconButton onClick={() => setCurrentDate(new Date())}>
            <Today />
          </IconButton>

          {viewMode === 'day' && (
            <>
              <IconButton onClick={() => setCurrentDate(addDays(currentDate, -1))}>
                <ChevronLeft />
              </IconButton>
              <IconButton onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                <ChevronRight />
              </IconButton>
            </>
          )}
          {viewMode === 'week' && (
            <>
              <IconButton onClick={() => setCurrentDate(addWeeks(currentDate, -1))}>
                <ChevronLeft />
              </IconButton>
              <IconButton onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                <ChevronRight />
              </IconButton>
            </>
          )}
          {viewMode === 'month' && (
            <>
              <IconButton onClick={() => setCurrentDate(addMonths(currentDate, -1))}>
                <ChevronLeft />
              </IconButton>
              <IconButton onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight />
              </IconButton>
            </>
          )}
          {viewMode === 'quarter' && (
            <>
              <IconButton onClick={() => setCurrentDate(addQuarters(currentDate, -1))}>
                <ChevronLeft />
              </IconButton>
              <IconButton onClick={() => setCurrentDate(addQuarters(currentDate, 1))}>
                <ChevronRight />
              </IconButton>
            </>
          )}
          {viewMode === 'year' && (
            <>
              <IconButton onClick={() => setCurrentDate(addYears(currentDate, -1))}>
                <ChevronLeft />
              </IconButton>
              <IconButton onClick={() => setCurrentDate(addYears(currentDate, 1))}>
                <ChevronRight />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
        {months.map(month => {
          const monthTasks = filteredTasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return isSameMonth(taskDate, month);
          });

          return (
            <Card 
              key={month.toISOString()}
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
              onClick={() => {
                setCurrentDate(month);
                setViewMode('month');
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {format(month, 'LLLL', { locale: ru })}
                </Typography>
                <Chip label={`${monthTasks.length} задач`} size="small" color="primary" />
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };

  const renderQuarterView = () => {
    const quarterStart = startOfQuarter(currentDate);
    const quarterEnd = endOfQuarter(currentDate);
    const months = eachMonthOfInterval({ start: quarterStart, end: quarterEnd });

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {months.map(month => {
          const monthTasks = filteredTasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return isSameMonth(taskDate, month);
          });

          return (
            <Card 
              key={month.toISOString()}
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
              onClick={() => {
                setCurrentDate(month);
                setViewMode('month');
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {format(month, 'LLLL', { locale: ru })}
                </Typography>
                <Chip label={`${monthTasks.length} задач`} size="small" color="primary" />
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const rows = [];
    let day = startDate;

    rows.push(
      <Box key="header" sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
        {days.map((dayName, index) => (
          <Box 
            key={dayName} 
            sx={{ 
              textAlign: 'center', 
              py: 1,
              bgcolor: index >= 5 ? 'error.lighter' : 'transparent',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" fontWeight={600} color={index >= 5 ? 'error.main' : 'text.secondary'}>
              {dayName}
            </Typography>
          </Box>
        ))}
      </Box>
    );

    while (day <= endDate) {
      const weekDays = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const dayTasks = getTasksForDate(currentDay);
        const isWeekendDay = isWeekend(currentDay);

        weekDays.push(
          <DroppableDay
            key={currentDay.toISOString()}
            date={currentDay}
            tasks={dayTasks}
            isCurrentMonth={isSameMonth(currentDay, monthStart)}
            isWeekendDay={isWeekendDay}
            onTaskClick={setSelectedTask}
            onDateClick={handleDateClick}
          />
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <Box key={day.toISOString()} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
          {weekDays}
        </Box>
      );
    }

    return <Box>{rows}</Box>;
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {days.map(day => {
          const dayTasks = getTasksForDate(day);
          return (
            <DroppableWeekDay
              key={day.toISOString()}
              day={day}
              dayTasks={dayTasks}
              onTaskClick={setSelectedTask}
              onDateClick={handleDateClick}
            />
          );
        })}
      </Box>
    );
  };

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);

    return (
      <Box>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Задачи на {format(currentDate, 'd MMMM yyyy', { locale: ru })}
            </Typography>
            
            {dayTasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Нет задач на этот день
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                {dayTasks.map((task) => (
                  <Card 
                    key={task.id}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 },
                    }}
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography variant="body2" color="text.secondary">
                              {task.description.substring(0, 100)}...
                            </Typography>
                          )}
                        </Box>
                        <Chip 
                          label={task.priority === 'urgent' ? 'Срочно' : task.priority === 'recurring' ? 'Постоянная' : 'Обычная'}
                          color={task.priority === 'urgent' ? 'error' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Chip label={task.boardTitle} size="small" variant="outlined" />
                        {task.tags && task.tags.map((tag, idx) => (
                          <Chip key={idx} label={tag} size="small" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedDate(currentDate);
            setCreateDialogOpen(true);
          }}
          sx={{ mt: 2 }}
          fullWidth
          size="large"
        >
          Добавить задачу на этот день
        </Button>
      </Box>
    );
  };

  const renderContent = () => {
    const content = (() => {
      switch (viewMode) {
        case 'year': return renderYearView();
        case 'quarter': return renderQuarterView();
        case 'month': return renderMonthView();
        case 'week': return renderWeekView();
        case 'day': return renderDayView();
        default: return renderMonthView();
      }
    })();

    if (viewMode === 'month' || viewMode === 'week') {
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {content}
          <DragOverlay>
            {activeTask ? (
              <Box
                sx={{
                  px: 0.5,
                  py: 0.25,
                  bgcolor: activeTask.priority === 'urgent' ? 'error.main' : 'primary.main',
                  borderRadius: 0.5,
                  opacity: 0.9,
                  boxShadow: 3,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.65rem',
                  }}
                >
                  {activeTask.title}
                </Typography>
              </Box>
            ) : null}
          </DragOverlay>
        </DndContext>
      );
    }

    return content;
  };

  return (
    <MainLayout title="Календарь задач">
      {renderHeader()}

      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Показать
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={tempFilters.myTasks} onChange={(e) => setTempFilters({ ...tempFilters, myTasks: e.target.checked })} />}
            label="Мои задачи"
          />
          <FormControlLabel
            control={<Checkbox checked={tempFilters.assignedToOthers} onChange={(e) => setTempFilters({ ...tempFilters, assignedToOthers: e.target.checked })} />}
            label="Задачи других"
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Приоритет
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={tempFilters.urgent} onChange={(e) => setTempFilters({ ...tempFilters, urgent: e.target.checked })} />}
            label="Срочные"
          />
          <FormControlLabel
            control={<Checkbox checked={tempFilters.normal} onChange={(e) => setTempFilters({ ...tempFilters, normal: e.target.checked })} />}
            label="Обычные"
          />
          <FormControlLabel
            control={<Checkbox checked={tempFilters.recurring} onChange={(e) => setTempFilters({ ...tempFilters, recurring: e.target.checked })} />}
            label="Постоянные"
          />

          <Divider sx={{ my: 2 }} />

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Исполнители</InputLabel>
            <Select
              multiple
              value={tempFilters.selectedAssignees}
              onChange={(e) => setTempFilters({ ...tempFilters, selectedAssignees: e.target.value })}
              input={<OutlinedInput label="Исполнители" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((userId) => {
                    const userObj = users.find(u => u.id === userId);
                    return (
                      <Chip key={userId} label={userObj ? `${userObj.firstName} ${userObj.lastName}` : userId} size="small" />
                    );
                  })}
                </Box>
              )}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  <Checkbox checked={tempFilters.selectedAssignees.includes(u.id)} />
                  <Avatar src={u.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                  <ListItemText primary={`${u.firstName} ${u.lastName}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Доски</InputLabel>
            <Select
              multiple
              value={tempFilters.selectedBoards}
              onChange={(e) => setTempFilters({ ...tempFilters, selectedBoards: e.target.value })}
              input={<OutlinedInput label="Доски" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((boardId) => {
                    const board = boards.find(b => b.id === boardId);
                    return (
                      <Chip key={boardId} label={board ? board.title : boardId} size="small" />
                    );
                  })}
                </Box>
              )}
            >
              {boards.map((board) => (
                <MenuItem key={board.id} value={board.id}>
                  <Checkbox checked={tempFilters.selectedBoards.includes(board.id)} />
                  <ListItemText primary={board.title} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <UnifiedTagInput
            value={tempFilters.selectedTags}
            onChange={(newTags) => setTempFilters({ ...tempFilters, selectedTags: newTags })}
            existingTags={allTags}
            placeholder="Выберите теги..."
            size="small"
          />

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => {
                const resetFilters = {
                  myTasks: true,
                  assignedToOthers: true,
                  urgent: true,
                  normal: true,
                  recurring: true,
                  selectedAssignees: [],
                  selectedBoards: [],
                  selectedTags: [],
                };
                setTempFilters(resetFilters);
              }}
              fullWidth
            >
              Очистить
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setFilters(tempFilters);
                applyFilters(allTasks);
                setFilterAnchor(null);
              }}
              fullWidth
            >
              Применить
            </Button>
          </Box>
        </Box>
      </Menu>

      {renderContent()}

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Создать задачу на {selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: ru })}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Название задачи"
            value={newTaskData.title}
            onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Доска</InputLabel>
            <Select
              value={newTaskData.boardId}
              label="Доска"
              onChange={(e) => setNewTaskData({ ...newTaskData, boardId: e.target.value })}
            >
              {boards.map((board) => (
                <MenuItem key={board.id} value={board.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: board.color || '#6366f1' }} />
                    {board.title}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Приоритет</InputLabel>
            <Select
              value={newTaskData.priority || 'normal'}
              label="Приоритет"
              onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
            >
              <MenuItem value="normal">
                <Chip label="Обычный" size="small" sx={{ bgcolor: '#579bfc', color: '#fff' }} />
              </MenuItem>
              <MenuItem value="urgent">
                <Chip label="Срочный" size="small" sx={{ bgcolor: '#e2445c', color: '#fff' }} />
              </MenuItem>
              <MenuItem value="recurring">
                <Chip label="Постоянная" size="small" sx={{ bgcolor: '#a25ddc', color: '#fff' }} />
              </MenuItem>
            </Select>
          </FormControl>

          <UnifiedTagInput
            value={newTaskData.tags || []}
            onChange={(newTags) => setNewTaskData({ ...newTaskData, tags: newTags })}
            existingTags={allTags}
            placeholder="Добавить тег..."
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleCreateTask} variant="contained" startIcon={<Add />}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* ⚠️ ИСПРАВЛЕНО: Заменяем TaskModal на TaskDrawer */}
      {selectedTask && (
        <TaskDrawer
          taskId={selectedTask.id}
          open={true}
          onClose={() => {
            setSelectedTask(null);
            loadData();
          }}
          drawerId={`task-${selectedTask.id}`}
        />
      )}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          setSelectedDate(currentDate);
          setCreateDialogOpen(true);
        }}
      >
        <Add />
      </Fab>
    </MainLayout>
  );
}

export default CalendarPage;