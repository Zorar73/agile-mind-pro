// src/pages/MyTasksPage.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Chip, Avatar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid,
  ToggleButtonGroup, ToggleButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Fab, Menu, Divider, IconButton, Collapse, Badge, InputAdornment,
  useTheme, useMediaQuery,
} from '@mui/material';
import {
  ViewList, ViewModule, ViewKanban, TableChart, Assignment, CalendarToday, Add,
  CheckCircle, Warning, FilterList, Sort, GroupWork, ExpandMore, ExpandLess,
  Search, Clear, Today, DateRange, Schedule,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import taskService from '../services/task.service';
import boardService from '../services/board.service';
import userService from '../services/user.service';
import TaskDrawer from '../components/Task/TaskDrawer';
import { format, isPast, isToday, isThisWeek, isThisMonth, startOfDay } from 'date-fns';

const bauhaus = { blue: '#1E88E5', red: '#E53935', yellow: '#FDD835', teal: '#26A69A', purple: '#7E57C2' };

const DATE_FILTERS = [
  { value: 'all', label: 'Все даты' },
  { value: 'overdue', label: 'Просроченные', color: bauhaus.red },
  { value: 'today', label: 'Сегодня', color: bauhaus.blue },
  { value: 'week', label: 'Эта неделя', color: bauhaus.teal },
  { value: 'month', label: 'Этот месяц', color: bauhaus.purple },
  { value: 'no_date', label: 'Без даты' },
];
const PRIORITY_FILTERS = [
  { value: 'all', label: 'Все приоритеты' },
  { value: 'urgent', label: 'Срочные', color: bauhaus.red },
  { value: 'normal', label: 'Обычные', color: bauhaus.blue },
  { value: 'recurring', label: 'Повторяющиеся', color: bauhaus.purple },
];
const STATUS_FILTERS = [
  { value: 'all', label: 'Все статусы' },
  { value: 'active', label: 'Активные', color: bauhaus.blue },
  { value: 'done', label: 'Выполненные', color: bauhaus.teal },
];
const SORT_OPTIONS = [
  { value: 'dueDate_asc', label: 'По дедлайну ↑' },
  { value: 'dueDate_desc', label: 'По дедлайну ↓' },
  { value: 'priority_desc', label: 'По приоритету ↓' },
  { value: 'title_asc', label: 'По названию А-Я' },
  { value: 'createdAt_desc', label: 'Сначала новые' },
];
const GROUP_OPTIONS = [
  { value: 'none', label: 'Без группировки' },
  { value: 'board', label: 'По доске' },
  { value: 'status', label: 'По статусу' },
  { value: 'priority', label: 'По приоритету' },
  { value: 'dueDate', label: 'По сроку' },
];

function MyTasksPage() {
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState({});
  const [boardsList, setBoardsList] = useState([]);
  const [columns, setColumns] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ board: 'all', priority: 'all', status: 'all', dateRange: 'all' });
  const [sortBy, setSortBy] = useState('dueDate_asc');
  const [groupBy, setGroupBy] = useState('none');
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);
  const [groupAnchor, setGroupAnchor] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', boardId: '', priority: 'normal', dueDate: null });

  // Force list/cards view on mobile
  useEffect(() => {
    if (isMobile && (viewMode === 'kanban' || viewMode === 'table')) {
      setViewMode('cards');
    }
  }, [isMobile, viewMode]);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // Оптимизированная загрузка: все доски, колонки и задачи за 3 параллельных запроса вместо 21 последовательных
    const result = await boardService.getUserBoardsWithData(user.uid);

    if (!result.success) {
      setLoading(false);
      return;
    }

    setBoardsList(result.boards);

    // Формируем map досок для быстрого доступа
    const boardsMap = {};
    result.boards.forEach(board => {
      boardsMap[board.id] = board;
    });

    // Фильтруем задачи, где текущий пользователь является участником
    const allTasks = [];
    Object.entries(result.tasks).forEach(([boardId, tasks]) => {
      const board = boardsMap[boardId];
      tasks.forEach(task => {
        if (task.members && task.members[user.uid]) {
          allTasks.push({
            ...task,
            boardId,
            boardTitle: board.title,
            boardColor: board.color
          });
        }
      });
    });

    setBoards(boardsMap);
    setColumns(result.columns);
    setTasks(allTasks);
    setLoading(false);
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.boardId) return;
    const firstCol = columns[newTask.boardId]?.[0];
    const result = await taskService.createTask({
      title: newTask.title, boardId: newTask.boardId, columnId: firstCol?.id || '',
      priority: newTask.priority, dueDate: newTask.dueDate, status: 'todo',
      members: { [user.uid]: 'assignee' },
    }, user.uid);
    if (result.success) {
      setCreateDialogOpen(false);
      setNewTask({ title: '', boardId: '', priority: 'normal', dueDate: null });
      loadData();
    }
  };

  const toSafeDate = (d) => { if (!d) return null; if (d instanceof Date) return d; if (typeof d.toDate === 'function') return d.toDate(); return new Date(d); };
  const isDone = (t) => t.status === 'done';
  const isOverdue = (t) => { if (isDone(t)) return false; const d = toSafeDate(t.dueDate); return d && isPast(startOfDay(d)) && !isToday(d); };
  const getPriorityValue = (p) => ({ urgent: 3, recurring: 2 }[p] || 1);
  const getPriorityColor = (t) => { if (isDone(t)) return 'success'; if (isOverdue(t)) return 'error'; return { urgent: 'error', recurring: 'info' }[t.priority] || 'primary'; };
  const getPriorityLabel = (t) => { if (isDone(t)) return 'Готово'; if (isOverdue(t)) return 'Просрочено'; return { urgent: 'Срочная', recurring: 'Повторяющаяся' }[t.priority] || 'Обычная'; };
  const getStatusColor = (t) => { if (isDone(t)) return 'success'; const d = toSafeDate(t.dueDate); if (!d) return 'default'; if (isPast(startOfDay(d)) && !isToday(d)) return 'error'; if (isToday(d)) return 'warning'; return 'success'; };
  const getCardStyle = (t) => { 
    if (isDone(t)) return { 
      bgcolor: isDark ? 'rgba(76, 175, 80, 0.15)' : '#e8f5e9', 
      borderLeft: 4, 
      borderColor: bauhaus.teal, 
      opacity: 0.85 
    }; 
    if (isOverdue(t)) return { 
      bgcolor: isDark ? 'rgba(244, 67, 54, 0.15)' : '#ffebee', 
      borderLeft: 4, 
      borderColor: bauhaus.red 
    }; 
    return { borderLeft: 4, borderColor: 'transparent' }; 
  };
  const getColumnTitle = (t) => columns[t.boardId]?.find(c => c.id === t.columnId)?.title || 'Неизвестно';

  const activeFiltersCount = useMemo(() => {
    let c = 0; if (filters.board !== 'all') c++; if (filters.priority !== 'all') c++;
    if (filters.status !== 'all') c++; if (filters.dateRange !== 'all') c++; if (searchQuery) c++; return c;
  }, [filters, searchQuery]);

  const filteredAndSortedTasks = useMemo(() => {
    let r = [...tasks];
    if (searchQuery) { const q = searchQuery.toLowerCase(); r = r.filter(t => t.title?.toLowerCase().includes(q) || t.boardTitle?.toLowerCase().includes(q)); }
    if (filters.board !== 'all') r = r.filter(t => t.boardId === filters.board);
    if (filters.priority !== 'all') r = r.filter(t => t.priority === filters.priority);
    if (filters.status === 'done') r = r.filter(t => isDone(t)); else if (filters.status === 'active') r = r.filter(t => !isDone(t));
    if (filters.dateRange !== 'all') {
      r = r.filter(t => {
        const d = toSafeDate(t.dueDate);
        if (filters.dateRange === 'overdue') return isOverdue(t);
        if (filters.dateRange === 'today') return d && isToday(d);
        if (filters.dateRange === 'week') return d && isThisWeek(d, { locale: ru });
        if (filters.dateRange === 'month') return d && isThisMonth(d);
        if (filters.dateRange === 'no_date') return !d;
        return true;
      });
    }
    const [sf, so] = sortBy.split('_');
    r.sort((a, b) => {
      let cmp = 0;
      if (sf === 'dueDate') { const da = toSafeDate(a.dueDate), db = toSafeDate(b.dueDate); cmp = !da && !db ? 0 : !da ? 1 : !db ? -1 : da - db; }
      else if (sf === 'priority') cmp = getPriorityValue(b.priority) - getPriorityValue(a.priority);
      else if (sf === 'title') cmp = (a.title || '').localeCompare(b.title || '', 'ru');
      else if (sf === 'createdAt') { const ca = toSafeDate(a.createdAt) || new Date(0), cb = toSafeDate(b.createdAt) || new Date(0); cmp = ca - cb; }
      else if (sf === 'board') cmp = (a.boardTitle || '').localeCompare(b.boardTitle || '', 'ru');
      else if (sf === 'status') { const sa = getColumnTitle(a), sb = getColumnTitle(b); cmp = sa.localeCompare(sb, 'ru'); }
      return so === 'desc' ? -cmp : cmp;
    });
    return r;
  }, [tasks, searchQuery, filters, sortBy]);

  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') return { 'Все задачи': filteredAndSortedTasks };
    const g = {};
    filteredAndSortedTasks.forEach(t => {
      let k;
      if (groupBy === 'board') k = t.boardTitle || 'Без доски';
      else if (groupBy === 'status') k = isDone(t) ? 'Выполнено' : isOverdue(t) ? 'Просрочено' : 'В работе';
      else if (groupBy === 'priority') k = { urgent: 'Срочные', recurring: 'Повторяющиеся' }[t.priority] || 'Обычные';
      else if (groupBy === 'dueDate') {
        const d = toSafeDate(t.dueDate);
        k = !d ? 'Без срока' : isOverdue(t) ? 'Просрочено' : isToday(d) ? 'Сегодня' : isThisWeek(d, { locale: ru }) ? 'На этой неделе' : isThisMonth(d) ? 'В этом месяце' : 'Позже';
      } else k = 'Другое';
      if (!g[k]) g[k] = []; g[k].push(t);
    });
    return g;
  }, [filteredAndSortedTasks, groupBy]);

  const resetFilters = () => { setFilters({ board: 'all', priority: 'all', status: 'all', dateRange: 'all' }); setSearchQuery(''); setSortBy('dueDate_asc'); setGroupBy('none'); };
  const toggleGroup = (k) => setCollapsedGroups(p => ({ ...p, [k]: !p[k] }));
  const getGroupColor = (k) => {
    if (groupBy === 'status') return k === 'Выполнено' ? bauhaus.teal : k === 'Просрочено' ? bauhaus.red : bauhaus.blue;
    if (groupBy === 'priority') return k === 'Срочные' ? bauhaus.red : k === 'Повторяющиеся' ? bauhaus.purple : bauhaus.blue;
    if (groupBy === 'dueDate') return k === 'Просрочено' ? bauhaus.red : k === 'Сегодня' ? bauhaus.yellow : bauhaus.blue;
    return bauhaus.blue;
  };

  const renderTaskCard = (task) => {
    const done = isDone(task), over = isOverdue(task), dd = toSafeDate(task.dueDate);
    return (
      <Card key={task.id} sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 3, transform: 'translateX(4px)' }, ...getCardStyle(task) }} onClick={() => setSelectedTask(task)}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'text.secondary' : 'text.primary', flex: 1, mr: 1 }}>{done && '✓ '}{task.title}</Typography>
            <Chip icon={done ? <CheckCircle /> : over ? <Warning /> : undefined} label={getPriorityLabel(task)} color={getPriorityColor(task)} size="small" sx={{ fontWeight: 600 }} />
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={task.boardTitle} size="small" variant="outlined" sx={{ borderColor: task.boardColor || bauhaus.blue, color: task.boardColor || bauhaus.blue }} />
            <Chip label={getColumnTitle(task)} size="small" sx={{ bgcolor: 'grey.100' }} />
            {dd && <Chip icon={<CalendarToday />} label={format(dd, 'dd.MM.yyyy')} size="small" color={getStatusColor(task)} />}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const renderGroup = (gk, gt) => {
    const collapsed = collapsedGroups[gk], gc = getGroupColor(gk);
    return (
      <Box key={gk} sx={{ mb: 3 }}>
        {groupBy !== 'none' && (
          <Box onClick={() => toggleGroup(gk)} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: gc }} />
            <Typography variant="h6" fontWeight="600">{gk}</Typography>
            <Chip label={gt.length} size="small" sx={{ bgcolor: `${gc}20`, color: gc }} />
            <Box sx={{ flex: 1 }} />
            <IconButton size="small">{collapsed ? <ExpandMore /> : <ExpandLess />}</IconButton>
          </Box>
        )}
        <Collapse in={!collapsed}><Stack spacing={1.5}>{gt.map(t => renderTaskCard(t))}</Stack></Collapse>
      </Box>
    );
  };

  const renderTableView = () => {
    const handleTableSort = (column) => {
      const sortMap = {
        title: ['title_asc', 'title_desc'],
        board: ['board_asc', 'board_desc'],
        status: ['status_asc', 'status_desc'],
        priority: ['priority_desc', 'priority_asc'],
        dueDate: ['dueDate_asc', 'dueDate_desc'],
      };
      const options = sortMap[column];
      if (!options) return;
      
      // Переключаем между asc/desc
      const currentIndex = options.indexOf(sortBy);
      const nextIndex = currentIndex === 0 ? 1 : 0;
      setSortBy(options[nextIndex]);
    };

    const getSortIcon = (column) => {
      const isActive = sortBy.startsWith(column);
      if (!isActive) return null;
      const isAsc = sortBy.endsWith('_asc');
      return isAsc ? '↑' : '↓';
    };

    const headerStyle = {
      fontWeight: 600,
      cursor: 'pointer',
      userSelect: 'none',
      '&:hover': { bgcolor: 'action.hover' },
    };

    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={headerStyle} onClick={() => handleTableSort('title')}>
                Задача {getSortIcon('title')}
              </TableCell>
              <TableCell sx={headerStyle} onClick={() => handleTableSort('board')}>
                Доска {getSortIcon('board')}
              </TableCell>
              <TableCell sx={headerStyle} onClick={() => handleTableSort('status')}>
                Статус {getSortIcon('status')}
              </TableCell>
              <TableCell sx={headerStyle} onClick={() => handleTableSort('priority')}>
                Приоритет {getSortIcon('priority')}
              </TableCell>
              <TableCell sx={headerStyle} onClick={() => handleTableSort('dueDate')}>
                Срок {getSortIcon('dueDate')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedTasks.map(t => {
              const done = isDone(t), over = isOverdue(t), dd = toSafeDate(t.dueDate);
              return (
                <TableRow 
                  key={t.id} 
                  hover 
                  sx={{ 
                    cursor: 'pointer', 
                    bgcolor: done 
                      ? (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : '#e8f5e9'
                      : over 
                        ? (theme) => theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.15)' : '#ffebee'
                        : 'transparent',
                  }} 
                  onClick={() => setSelectedTask(t)}
                >
                  <TableCell>
                    <Typography 
                      fontWeight="600" 
                      sx={{ 
                        textDecoration: done ? 'line-through' : 'none', 
                        color: done ? 'text.secondary' : 'text.primary' 
                      }}
                    >
                      {done && '✓ '}{t.title}
                    </Typography>
                  </TableCell>
                  <TableCell><Chip label={t.boardTitle} size="small" sx={{ bgcolor: `${t.boardColor || bauhaus.blue}15`, color: t.boardColor || bauhaus.blue }} /></TableCell>
                  <TableCell><Chip label={getColumnTitle(t)} size="small" /></TableCell>
                  <TableCell><Chip label={getPriorityLabel(t)} color={getPriorityColor(t)} size="small" sx={{ fontWeight: 600 }} /></TableCell>
                  <TableCell>{dd ? format(dd, 'dd.MM.yyyy') : '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderKanbanView = () => {
    const sg = { todo: { title: 'К выполнению', color: bauhaus.blue }, in_progress: { title: 'В работе', color: bauhaus.yellow }, done: { title: 'Готово', color: bauhaus.teal } };
    const kg = { todo: filteredAndSortedTasks.filter(t => t.status === 'todo' || !t.status), in_progress: filteredAndSortedTasks.filter(t => t.status === 'in_progress'), done: filteredAndSortedTasks.filter(t => t.status === 'done') };
    return (
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
        {Object.entries(sg).map(([s, c]) => (
          <Paper key={s} sx={{ minWidth: 300, flex: '0 0 300px', bgcolor: 'grey.50', borderRadius: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color }} /><Typography variant="subtitle1" fontWeight="600">{c.title}</Typography><Chip label={kg[s].length} size="small" sx={{ ml: 'auto' }} /></Box>
            <Stack spacing={1.5}>{kg[s].map(t => renderTaskCard(t))}</Stack>
          </Paper>
        ))}
      </Box>
    );
  };

  const renderCardsView = () => (
    <Grid container spacing={2}>
      {filteredAndSortedTasks.map(t => {
        const done = isDone(t), dd = toSafeDate(t.dueDate);
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={t.id}>
            <Card sx={{ height: 180, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }, ...getCardStyle(t) }} onClick={() => setSelectedTask(t)}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1 }}><Typography variant="subtitle1" fontWeight="600" gutterBottom noWrap sx={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'text.secondary' : 'text.primary' }}>{done && '✓ '}{t.title}</Typography><Typography variant="caption" color="text.secondary">{t.boardTitle} • {getColumnTitle(t)}</Typography></Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>{dd && <Chip label={format(dd, 'dd.MM')} size="small" color={getStatusColor(t)} />}<Chip label={getPriorityLabel(t)} color={getPriorityColor(t)} size="small" sx={{ fontWeight: 600 }} /></Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <MainLayout>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3
        }}>
          <Box>
            <Typography variant="h4" fontWeight="700" gutterBottom>Мои задачи</Typography>
            <Typography variant="body2" color="text.secondary">{filteredAndSortedTasks.length} из {tasks.length} задач</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ borderRadius: 50, px: 3, alignSelf: { xs: 'stretch', sm: 'auto' } }}
          >
            Добавить задачу
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" placeholder="Поиск задач..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ minWidth: 200 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>, endAdornment: searchQuery && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery('')}><Clear fontSize="small" /></IconButton></InputAdornment> }} />
          <Badge badgeContent={activeFiltersCount} color="primary"><Button size="small" startIcon={<FilterList />} onClick={(e) => setFilterAnchor(e.currentTarget)} variant={activeFiltersCount > 0 ? 'contained' : 'outlined'} sx={{ borderRadius: 50 }}>Фильтры</Button></Badge>
          <Button size="small" startIcon={<Sort />} onClick={(e) => setSortAnchor(e.currentTarget)} variant="outlined" sx={{ borderRadius: 50 }}>Сортировка</Button>
          {viewMode === 'list' && <Button size="small" startIcon={<GroupWork />} onClick={(e) => setGroupAnchor(e.currentTarget)} variant={groupBy !== 'none' ? 'contained' : 'outlined'} sx={{ borderRadius: 50 }}>Группировка</Button>}
          {activeFiltersCount > 0 && <Button size="small" startIcon={<Clear />} onClick={resetFilters} color="error" sx={{ borderRadius: 50 }}>Сбросить</Button>}
          <Box sx={{ flexGrow: 1 }} />
          <ToggleButtonGroup value={viewMode} exclusive onChange={(e, v) => v && setViewMode(v)} size="small" sx={{ '& .MuiToggleButton-root': { borderRadius: '50px !important', px: 1.5, '&.Mui-selected': { bgcolor: bauhaus.blue, color: 'white', '&:hover': { bgcolor: bauhaus.blue } } } }}>
            <ToggleButton value="list"><ViewList fontSize="small" /></ToggleButton>
            <ToggleButton value="cards"><ViewModule fontSize="small" /></ToggleButton>
            <ToggleButton value="kanban" sx={{ display: { xs: 'none', md: 'inline-flex' } }}><ViewKanban fontSize="small" /></ToggleButton>
            <ToggleButton value="table" sx={{ display: { xs: 'none', md: 'inline-flex' } }}><TableChart fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {activeFiltersCount > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {filters.board !== 'all' && <Chip label={`Доска: ${boards[filters.board]?.title}`} onDelete={() => setFilters(f => ({ ...f, board: 'all' }))} size="small" />}
            {filters.priority !== 'all' && <Chip label={`Приоритет: ${PRIORITY_FILTERS.find(p => p.value === filters.priority)?.label}`} onDelete={() => setFilters(f => ({ ...f, priority: 'all' }))} size="small" />}
            {filters.status !== 'all' && <Chip label={`Статус: ${STATUS_FILTERS.find(s => s.value === filters.status)?.label}`} onDelete={() => setFilters(f => ({ ...f, status: 'all' }))} size="small" />}
            {filters.dateRange !== 'all' && <Chip label={`Дата: ${DATE_FILTERS.find(d => d.value === filters.dateRange)?.label}`} onDelete={() => setFilters(f => ({ ...f, dateRange: 'all' }))} size="small" />}
          </Box>
        )}

        {loading ? <Box sx={{ textAlign: 'center', py: 8 }}><Typography color="text.secondary">Загрузка...</Typography></Box>
        : filteredAndSortedTasks.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6, border: '2px dashed', borderColor: 'divider' }}>
            <Assignment sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>{tasks.length === 0 ? 'Нет задач' : 'Нет задач по выбранным фильтрам'}</Typography>
            {tasks.length === 0 ? <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)} sx={{ mt: 1, borderRadius: 50 }}>Создать задачу</Button> : <Button variant="outlined" startIcon={<Clear />} onClick={resetFilters} sx={{ mt: 1, borderRadius: 50 }}>Сбросить фильтры</Button>}
          </Card>
        ) : viewMode === 'list' ? Object.entries(groupedTasks).map(([k, t]) => renderGroup(k, t))
        : viewMode === 'cards' ? renderCardsView() : viewMode === 'kanban' ? renderKanbanView() : renderTableView()}

        <Fab color="primary" onClick={() => setCreateDialogOpen(true)} sx={{ position: 'fixed', bottom: 24, right: 24, display: { xs: 'flex', md: 'none' } }}><Add /></Fab>

        <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)} PaperProps={{ sx: { minWidth: 280, p: 1 } }}>
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600 }}>По доске</Typography>
          <MenuItem selected={filters.board === 'all'} onClick={() => setFilters(f => ({ ...f, board: 'all' }))}>Все доски</MenuItem>
          {boardsList.map(b => <MenuItem key={b.id} selected={filters.board === b.id} onClick={() => setFilters(f => ({ ...f, board: b.id }))}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: b.color || bauhaus.blue }} />{b.title}</Box></MenuItem>)}
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600 }}>По приоритету</Typography>
          {PRIORITY_FILTERS.map(o => <MenuItem key={o.value} selected={filters.priority === o.value} onClick={() => setFilters(f => ({ ...f, priority: o.value }))}>{o.color && <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: o.color, mr: 1 }} />}{o.label}</MenuItem>)}
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600 }}>По статусу</Typography>
          {STATUS_FILTERS.map(o => <MenuItem key={o.value} selected={filters.status === o.value} onClick={() => setFilters(f => ({ ...f, status: o.value }))}>{o.color && <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: o.color, mr: 1 }} />}{o.label}</MenuItem>)}
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600 }}>По дате</Typography>
          {DATE_FILTERS.map(o => <MenuItem key={o.value} selected={filters.dateRange === o.value} onClick={() => setFilters(f => ({ ...f, dateRange: o.value }))}>{o.color && <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: o.color, mr: 1 }} />}{o.label}</MenuItem>)}
        </Menu>

        <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
          {SORT_OPTIONS.map(o => <MenuItem key={o.value} selected={sortBy === o.value} onClick={() => { setSortBy(o.value); setSortAnchor(null); }}>{o.label}</MenuItem>)}
        </Menu>

        <Menu anchorEl={groupAnchor} open={Boolean(groupAnchor)} onClose={() => setGroupAnchor(null)}>
          {GROUP_OPTIONS.map(o => <MenuItem key={o.value} selected={groupBy === o.value} onClick={() => { setGroupBy(o.value); setGroupAnchor(null); }}>{o.label}</MenuItem>)}
        </Menu>

        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle>Создать задачу</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField fullWidth label="Название задачи" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Что нужно сделать?" autoFocus />
              <TextField fullWidth select label="Доска" value={newTask.boardId} onChange={(e) => setNewTask({ ...newTask, boardId: e.target.value })}>
                {boardsList.map(b => <MenuItem key={b.id} value={b.id}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: b.color || bauhaus.blue }} />{b.title}</Box></MenuItem>)}
              </TextField>
              <TextField fullWidth select label="Приоритет" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                <MenuItem value="normal">Обычный</MenuItem><MenuItem value="urgent">Срочный</MenuItem><MenuItem value="recurring">Повторяющийся</MenuItem>
              </TextField>
              <DatePicker label="Срок выполнения" value={newTask.dueDate} onChange={(d) => setNewTask({ ...newTask, dueDate: d })} slotProps={{ textField: { fullWidth: true } }} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setCreateDialogOpen(false)} sx={{ borderRadius: 50 }}>Отмена</Button><Button onClick={handleCreateTask} variant="contained" disabled={!newTask.title.trim() || !newTask.boardId} sx={{ borderRadius: 50 }}>Создать</Button></DialogActions>
        </Dialog>

        {selectedTask && <TaskDrawer taskId={selectedTask.id} open={true} onClose={() => { setSelectedTask(null); loadData(); }} drawerId={`task-${selectedTask.id}`} />}
      </MainLayout>
    </LocalizationProvider>
  );
}

export default MyTasksPage;
