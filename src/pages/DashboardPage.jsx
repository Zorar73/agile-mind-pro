// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, Divider, FormControl, InputLabel, Select, Slider, IconButton, useTheme,
} from '@mui/material';
import { Add, Settings, CheckCircle, Lightbulb, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUserStore, useBoardStore, useNotificationStore } from '../stores';
import { queryKeys } from '../queries/queryClient';
import MainLayout from '../components/Layout/MainLayout';
import TaskDrawer from '../components/Task/TaskDrawer';
import SketchDrawer from '../components/Sketch/SketchDrawer';
import TeamDrawer from '../components/Team/TeamDrawer';
import {
  StatsWidget,
  TasksWidget,
  OverdueWidget,
  BoardsWidget,
  SketchesWidget,
  TeamsWidget,
  NotificationsWidget,
} from '../components/Dashboard/widgets';
import boardService from '../services/board.service';
import sketchService from '../services/sketch.service';
import teamService from '../services/team.service';
import notificationService from '../services/notification.service';
import taskService from '../services/task.service';
import { isAfter, isBefore, addDays, startOfDay } from 'date-fns';

const toSafeDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date.toDate === 'function') return date.toDate();
  return new Date(date);
};

const bauhaus = { blue: '#1E88E5', yellow: '#FDD835' };

// Типы виджетов
const WIDGET_TYPES = {
  stats: { name: 'Статистика', icon: '📊', defaultWidth: 4, defaultHeight: 1 },
  tasks: { name: 'Ближайшие задачи', icon: '✅', defaultWidth: 2, defaultHeight: 2 },
  overdue: { name: 'Просроченные', icon: '⚠️', defaultWidth: 2, defaultHeight: 2 },
  boards: { name: 'Доски', icon: '📋', defaultWidth: 2, defaultHeight: 2 },
  sketches: { name: 'Наброски', icon: '💡', defaultWidth: 2, defaultHeight: 2 },
  teams: { name: 'Команды', icon: '👥', defaultWidth: 2, defaultHeight: 2 },
  notifications: { name: 'Уведомления', icon: '🔔', defaultWidth: 2, defaultHeight: 2 },
};

const DEFAULT_WIDGETS = [
  { id: 'w1', type: 'stats', width: 4, height: 2, config: { visibleStats: ['boards', 'completed', 'overdue', 'progress'] } },
  { id: 'w2', type: 'overdue', width: 2, height: 2, config: {} },
  { id: 'w3', type: 'tasks', width: 2, height: 2, config: {} },
  { id: 'w4', type: 'boards', width: 2, height: 2, config: {} },
  { id: 'w5', type: 'sketches', width: 2, height: 2, config: {} },
];

const GRID_COLS = 4;

function DashboardPage() {
  // Zustand stores
  const user = useUserStore((state) => state.user);
  const setBoards = useBoardStore((state) => state.setBoards);
  const notifications = useNotificationStore((state) => state.notifications);
  
  const navigate = useNavigate();
  const theme = useTheme();

  // Данные
  const [boards, setBoardsLocal] = useState([]);
  const [sketches, setSketches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, overdue: 0, boards: 0 });

  // Виджеты
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('dashboard_widgets_v3');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [configWidget, setConfigWidget] = useState(null);

  // Drawers
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedSketchId, setSelectedSketchId] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // Quick create
  const [quickCreateType, setQuickCreateType] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');

  // Загрузка данных с подписками
  useEffect(() => {
    if (!user) return;
    
    const unsubBoards = boardService.subscribeToUserBoards(user.uid, (data) => {
      setBoardsLocal(data);
      setBoards(data); // Синхронизация с Zustand
    });
    const unsubTeams = teamService.subscribeToUserTeams(user.uid, setTeams);
    
    loadSketches();
    loadTasks();
    
    return () => { 
      unsubBoards(); 
      unsubTeams(); 
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem('dashboard_widgets_v3', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    setStats(prev => ({ ...prev, boards: boards.length }));
  }, [boards]);

  const loadSketches = async () => {
    if (!user) return;
    const result = await sketchService.getUserSketches(user.uid);
    if (result.success) setSketches(result.sketches);
  };

  const loadTasks = async () => {
    if (!user) return;
    const boardsRes = await boardService.getUserBoards(user.uid);
    if (!boardsRes.success) return;

    const tasks = [];
    const now = new Date();
    const today = startOfDay(now);

    for (const board of boardsRes.boards) {
      const tasksRes = await taskService.getTasksByBoard(board.id);
      if (tasksRes.success) {
        tasksRes.tasks.forEach(t => {
          const dueDate = toSafeDate(t.dueDate);
          tasks.push({ ...t, boardTitle: board.title, boardId: board.id, dueDate });
        });
      }
    }

    let completed = 0, overdue = 0;
    tasks.forEach(t => {
      if (t.status === 'done') { completed++; return; }
      if (t.dueDate && isBefore(t.dueDate, today)) overdue++;
    });

    setAllTasks(tasks);
    setStats(prev => ({ ...prev, total: tasks.length, completed, overdue }));
  };

  // Фильтрация задач
  const upcomingTasks = allTasks.filter(t => {
    if (t.status === 'done') return false;
    if (!t.dueDate) return false;
    const now = new Date();
    return isAfter(t.dueDate, now) && isBefore(t.dueDate, addDays(now, 7));
  });

  const overdueTasks = allTasks.filter(t => {
    if (t.status === 'done') return false;
    if (!t.dueDate) return false;
    return isBefore(t.dueDate, startOfDay(new Date()));
  });

  // Обработчики
  const handleQuickCreate = async () => {
    if (!quickTitle.trim()) return;
    if (quickCreateType === 'board') {
      const result = await boardService.createBoard(quickTitle, user.uid);
      if (result.success) navigate(`/board/${result.boardId}`);
    } else if (quickCreateType === 'sketch') {
      await sketchService.createSketch({ title: quickTitle, type: 'idea', content: '' }, user.uid);
      loadSketches();
    }
    setQuickCreateType(null);
    setQuickTitle('');
  };

  const handleAddWidget = (type) => {
    const typeConfig = WIDGET_TYPES[type];
    const newWidget = {
      id: `w_${Date.now()}`,
      type,
      width: typeConfig.defaultWidth,
      height: typeConfig.defaultHeight,
      config: type === 'stats' ? { visibleStats: ['boards', 'completed', 'overdue', 'progress'] } : {},
    };
    setWidgets([...widgets, newWidget]);
    setAddMenuAnchor(null);
  };

  const handleRemoveWidget = (id) => setWidgets(widgets.filter(w => w.id !== id));

  const handleResizeWidget = (id, newWidth, newHeight) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, width: Math.max(1, Math.min(4, newWidth)), height: Math.max(1, Math.min(4, newHeight)) } : w));
  };

  const handleUpdateWidgetConfig = (id, newConfig) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, config: { ...w.config, ...newConfig } } : w));
    if (configWidget?.id === id) setConfigWidget({ ...configWidget, config: { ...configWidget.config, ...newConfig } });
  };

  const handleResetToDefault = () => setWidgets(DEFAULT_WIDGETS);

  const handleNotificationClick = async (notification) => {
    await notificationService.markAsRead(notification.id);
    if (notification.link) navigate(notification.link);
  };

  // Рендер виджета по типу
  const renderWidget = (widget) => {
    const commonProps = {
      widget,
      isEditMode,
      onRemove: handleRemoveWidget,
      onOpenConfig: setConfigWidget,
      onResize: handleResizeWidget,
      onNavigate: navigate,
    };

    switch (widget.type) {
      case 'stats':
        return <StatsWidget {...commonProps} stats={stats} />;
      case 'tasks':
        return <TasksWidget {...commonProps} tasks={upcomingTasks} users={users} onTaskClick={setSelectedTask} />;
      case 'overdue':
        return <OverdueWidget {...commonProps} tasks={overdueTasks} users={users} onTaskClick={setSelectedTask} />;
      case 'boards':
        return <BoardsWidget {...commonProps} boards={boards} onCreateBoard={() => setQuickCreateType('board')} />;
      case 'sketches':
        return <SketchesWidget {...commonProps} sketches={sketches} onSketchClick={setSelectedSketchId} onCreateSketch={() => setQuickCreateType('sketch')} />;
      case 'teams':
        return <TeamsWidget {...commonProps} teams={teams} onTeamClick={setSelectedTeamId} />;
      case 'notifications':
        return <NotificationsWidget {...commonProps} notifications={notifications} onNotificationClick={handleNotificationClick} />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2,
        mb: 3
      }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Добро пожаловать, {user?.firstName}!</Typography>
          <Typography variant="body1" color="text.secondary">Управляйте проектами и задачами эффективно</Typography>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          width: { xs: '100%', sm: 'auto' }
        }}>
          {isEditMode && (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={handleResetToDefault}
                sx={{ borderRadius: 50 }}
                fullWidth={theme.breakpoints.down('sm')}
              >
                По умолчанию
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={(e) => setAddMenuAnchor(e.currentTarget)}
                sx={{ borderRadius: 50 }}
                fullWidth={theme.breakpoints.down('sm')}
              >
                Виджет
              </Button>
            </>
          )}
          <Button
            variant={isEditMode ? 'contained' : 'outlined'}
            startIcon={isEditMode ? <CheckCircle /> : <Settings />}
            onClick={() => setIsEditMode(!isEditMode)}
            sx={{ borderRadius: 50 }}
            fullWidth={theme.breakpoints.down('sm')}
          >
            {isEditMode ? 'Готово' : 'Настроить'}
          </Button>
        </Box>
      </Box>

      {/* Quick actions */}
      {!isEditMode && (
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3
        }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setQuickCreateType('board')}
            fullWidth
            sx={{
              borderWidth: 2,
              borderColor: bauhaus.blue,
              color: bauhaus.blue,
              borderRadius: 50,
              '&:hover': { borderWidth: 2 }
            }}
          >
            Новая доска
          </Button>
          <Button
            variant="outlined"
            startIcon={<Lightbulb />}
            onClick={() => setQuickCreateType('sketch')}
            fullWidth
            sx={{
              borderWidth: 2,
              borderColor: bauhaus.yellow,
              color: '#B8860B',
              borderRadius: 50,
              '&:hover': { borderWidth: 2 }
            }}
          >
            Новый набросок
          </Button>
        </Box>
      )}

      {/* Widgets Grid - адаптивная сетка для мобильных */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)', // 1 колонка на телефонах (< 600px)
          sm: 'repeat(2, 1fr)', // 2 колонки на планшетах (600-900px)
          md: 'repeat(4, 1fr)', // 4 колонки на десктопе (> 900px)
        },
        gap: 2,
        maxWidth: '100%',
        overflow: 'hidden',
      }}>
        {widgets.map(widget => (
          <Box
            key={widget.id}
            sx={{
              gridColumn: {
                xs: 'span 1',  // Всегда 1 колонка на телефонах
                sm: `span ${Math.min(widget.width, 2)}`,  // Максимум 2 на планшетах
                md: `span ${widget.width}`,  // Полная ширина на десктопе
              }
            }}
          >
            {renderWidget(widget)}
          </Box>
        ))}
      </Box>

      {/* Add widget menu */}
      <Menu anchorEl={addMenuAnchor} open={Boolean(addMenuAnchor)} onClose={() => setAddMenuAnchor(null)}>
        {Object.entries(WIDGET_TYPES).map(([key, config]) => (
          <MenuItem key={key} onClick={() => handleAddWidget(key)}>{config.icon} {config.name}</MenuItem>
        ))}
      </Menu>

      {/* Widget config dialog */}
      <Dialog open={Boolean(configWidget)} onClose={() => setConfigWidget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Настройки виджета</DialogTitle>
        <DialogContent>
          {configWidget && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Ширина (1-4 ячейки)</Typography>
              <Slider value={configWidget.width} min={1} max={4} step={1} marks onChange={(e, v) => handleResizeWidget(configWidget.id, v, configWidget.height)} sx={{ mb: 3 }} />

              <Typography variant="subtitle2" gutterBottom>Высота (1-4 ячейки)</Typography>
              <Slider value={configWidget.height} min={1} max={4} step={1} marks onChange={(e, v) => handleResizeWidget(configWidget.id, configWidget.width, v)} sx={{ mb: 3 }} />

              {configWidget.type === 'stats' && (
                <FormControl fullWidth size="small">
                  <InputLabel>Показатели</InputLabel>
                  <Select
                    multiple
                    value={configWidget.config?.visibleStats || []}
                    onChange={(e) => handleUpdateWidgetConfig(configWidget.id, { visibleStats: e.target.value })}
                    label="Показатели"
                  >
                    <MenuItem value="boards">Досок</MenuItem>
                    <MenuItem value="completed">Выполнено</MenuItem>
                    <MenuItem value="overdue">Просрочено</MenuItem>
                    <MenuItem value="progress">Прогресс</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigWidget(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Quick create dialog */}
      <Dialog open={Boolean(quickCreateType)} onClose={() => setQuickCreateType(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{quickCreateType === 'board' ? 'Создать доску' : 'Создать набросок'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Название" value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleQuickCreate()} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickCreateType(null)}>Отмена</Button>
          <Button onClick={handleQuickCreate} variant="contained" disabled={!quickTitle.trim()}>Создать</Button>
        </DialogActions>
      </Dialog>

      {/* Drawers */}
      {selectedTask && <TaskDrawer taskId={selectedTask.id} open={true} onClose={() => setSelectedTask(null)} drawerId={`task-${selectedTask.id}`} />}
      {selectedSketchId && <SketchDrawer open={Boolean(selectedSketchId)} onClose={() => setSelectedSketchId(null)} sketchId={selectedSketchId} onUpdate={loadSketches} />}
      {selectedTeamId && <TeamDrawer open={Boolean(selectedTeamId)} onClose={() => setSelectedTeamId(null)} teamId={selectedTeamId} />}
    </MainLayout>
  );
}

export default DashboardPage;
