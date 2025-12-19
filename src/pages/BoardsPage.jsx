// src/pages/BoardsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Skeleton,
  Divider,
  LinearProgress,
  FormControlLabel,
  Switch,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add,
  Search,
  ViewModule,
  ViewList,
  Sort,
  MoreVert,
  Edit,
  Delete,
  Share,
  ViewKanban,
  FilterList,
  Public,
  Lock,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import boardService from '../services/board.service';
import taskService from '../services/task.service';
import userService from '../services/user.service';

// Bauhaus цвета
const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

function BoardsPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newBoardData, setNewBoardData] = useState({ title: '', description: '' });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);
  const [filterAnchor, setFilterAnchor] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editBoardData, setEditBoardData] = useState({ title: '', description: '', color: '', isPublic: true });
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharingBoardId, setSharingBoardId] = useState(null);
  const [searchUserQuery, setSearchUserQuery] = useState('');

  const [boardsStats, setBoardsStats] = useState({});
  const [users, setUsers] = useState({});

  useEffect(() => {
    if (!user) return;
    loadBoards();
    loadUsers();
  }, [user]);

  const loadBoards = async () => {
    setLoading(true);
    // Используем getAllAvailableBoards чтобы видеть публичные доски
    const result = await boardService.getAllAvailableBoards(user.uid);
    if (result.success) {
      const userBoards = result.boards;
      setBoards(userBoards);
      
      const stats = {};
      for (const board of userBoards) {
        const tasksResult = await taskService.getTasksByBoard(board.id);
        if (tasksResult.success) {
          stats[board.id] = {
            totalTasks: tasksResult.tasks.length,
            completedTasks: tasksResult.tasks.filter(t => t.status === 'done').length,
          };
        }
      }
      setBoardsStats(stats);
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const result = await userService.getAllUsers();
    if (result.success) {
      const usersMap = {};
      result.users.forEach(u => { usersMap[u.id] = u; });
      setUsers(usersMap);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardData.title.trim()) return;

    const result = await boardService.createBoard(newBoardData, user.uid);
    if (result.success) {
      setCreateDialogOpen(false);
      setNewBoardData({ title: '', description: '' });
      navigate(`/board/${result.boardId}`);
    }
  };

  const handleDeleteBoard = async () => {
    if (!selectedBoard) return;
    if (!window.confirm(`Удалить доску "${selectedBoard.title}"?`)) return;

    const result = await boardService.deleteBoard(selectedBoard.id);
    if (result.success) {
      await loadBoards();
    }
    setMenuAnchor(null);
    setSelectedBoard(null);
  };

  const handleMenuOpen = (event, board) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedBoard(board);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedBoard(null);
  };

  const handleJoinBoard = async (boardId, event) => {
    event.stopPropagation();
    const result = await boardService.requestBoardAccess(boardId, user.uid);
    if (result.success) {
      // Перезагружаем доски
      loadBoards();
    }
  };

  const handleEditBoard = () => {
    if (!selectedBoard) return;
    setEditingBoardId(selectedBoard.id);
    setEditBoardData({
      title: selectedBoard.title || '',
      description: selectedBoard.description || '',
      color: selectedBoard.color || bauhaus.blue,
      isPublic: selectedBoard.isPublic !== false
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveEditBoard = async () => {
    if (!editingBoardId || !editBoardData.title.trim()) return;

    const result = await boardService.updateBoard(
      editingBoardId,
      {
        title: editBoardData.title,
        description: editBoardData.description,
        color: editBoardData.color,
        isPublic: editBoardData.isPublic
      },
      user.uid
    );

    if (result.success) {
      setEditDialogOpen(false);
      setEditingBoardId(null);
      await loadBoards();
    } else {
      alert('Ошибка сохранения: ' + (result.error || 'Неизвестная ошибка'));
    }
  };

  const handleShareBoard = () => {
    if (!selectedBoard) return;
    setSharingBoardId(selectedBoard.id);
    setShareDialogOpen(true);
    setSearchUserQuery('');
    handleMenuClose();
  };

  const handleAddMember = async (userId, role) => {
    if (!sharingBoardId) return;

    const result = await boardService.addMember(
      sharingBoardId,
      userId,
      role,
      user.uid,
      false // Not an invitation, direct add
    );

    if (result.success) {
      await loadBoards();
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!sharingBoardId) return;

    const result = await boardService.removeMember(
      sharingBoardId,
      userId,
      user.uid
    );

    if (result.success) {
      await loadBoards();
    }
  };

  const handleChangeMemberRole = async (userId, newRole) => {
    if (!sharingBoardId) return;

    const result = await boardService.changeMemberRole(
      sharingBoardId,
      userId,
      newRole,
      user.uid
    );

    if (result.success) {
      await loadBoards();
    }
  };

  const sharingBoard = React.useMemo(() => {
    if (!sharingBoardId) return null;
    return boards.find(b => b.id === sharingBoardId);
  }, [sharingBoardId, boards]);

  const filteredAndSortedBoards = React.useMemo(() => {
    let result = [...boards];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.title?.toLowerCase().includes(query) ||
        b.description?.toLowerCase().includes(query)
      );
    }

    if (filterCategory === 'my') {
      result = result.filter(b => b.createdBy === user.uid);
    } else if (filterCategory === 'shared') {
      result = result.filter(b => b.createdBy !== user.uid);
    }

    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'createdAt') {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        comparison = dateA - dateB;
      } else {
        const dateA = a.updatedAt?.toDate?.() || a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.updatedAt?.toDate?.() || b.createdAt?.toDate?.() || new Date(0);
        comparison = dateA - dateB;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [boards, searchQuery, filterCategory, sortBy, sortOrder, user.uid]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: ru });
    } catch {
      return '';
    }
  };

  const renderBoardCard = (board) => {
    const stats = boardsStats[board.id] || { totalTasks: 0, completedTasks: 0 };
    const members = Object.keys(board.members || {});
    const progress = stats.totalTasks > 0 
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
      : 0;

    return (
      <Card
        key={board.id}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.2s',
          borderLeft: 4,
          borderColor: board.color || bauhaus.blue,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
        {board.isMember && (
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, board)}
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        )}

        {board.isMember ? (
          <CardActionArea
            onClick={() => navigate(`/board/${board.id}`)}
            sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, pr: 4 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: board.color || bauhaus.blue,
                }}
              />
              <Typography variant="h6" fontWeight="600" noWrap sx={{ flexGrow: 1 }}>
                {board.title || 'Без названия'}
              </Typography>
              {board.isPublic ? (
                <Chip icon={<Public />} label="Публичная" size="small" color="success" variant="outlined" />
              ) : (
                <Chip icon={<Lock />} label="Приватная" size="small" variant="outlined" />
              )}
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                minHeight: 40,
              }}
            >
              {board.description || 'Без описания'}
            </Typography>

            {/* Прогресс */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {stats.completedTasks} / {stats.totalTasks} задач
                </Typography>
                <Typography variant="caption" fontWeight="600" color={progress === 100 ? 'success.main' : 'text.secondary'}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: 'grey.100',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progress === 100 ? bauhaus.teal : board.color || bauhaus.blue,
                  },
                }} 
              />
            </Box>

            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem' } }}>
                {members.map(memberId => (
                  <Tooltip key={memberId} title={users[memberId]?.firstName || ''}>
                    <Avatar sx={{ bgcolor: bauhaus.blue }}>
                      {users[memberId]?.firstName?.charAt(0) || '?'}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
              
              <Typography variant="caption" color="text.secondary">
                {formatDate(board.updatedAt || board.createdAt)}
              </Typography>
            </Box>
          </CardContent>
          </CardActionArea>
        ) : (
          <>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: board.color || bauhaus.blue,
                  }}
                />
                <Typography variant="h6" fontWeight="600" noWrap sx={{ flexGrow: 1 }}>
                  {board.title || 'Без названия'}
                </Typography>
                {board.isPublic ? (
                  <Chip icon={<Public />} label="Публичная" size="small" color="success" variant="outlined" />
                ) : (
                  <Chip icon={<Lock />} label="Приватная" size="small" variant="outlined" />
                )}
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  minHeight: 40,
                }}
              >
                {board.description || 'Без описания'}
              </Typography>

              <Box sx={{ mt: 'auto' }}>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  fullWidth
                  onClick={(e) => handleJoinBoard(board.id, e)}
                  sx={{ borderRadius: 2 }}
                >
                  Присоединиться
                </Button>
              </Box>
            </CardContent>
          </>
        )}
      </Card>
    );
  };

  const renderBoardRow = (board) => {
    const stats = boardsStats[board.id] || { totalTasks: 0, completedTasks: 0 };
    const members = Object.keys(board.members || {});

    return (
      <Card
        key={board.id}
        sx={{
          mb: 1.5,
          cursor: 'pointer',
          transition: 'all 0.2s',
          borderLeft: 4,
          borderColor: board.color || bauhaus.blue,
          '&:hover': { boxShadow: 3, transform: 'translateX(4px)' },
        }}
        onClick={() => navigate(`/board/${board.id}`)}
      >
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: board.color || bauhaus.blue }} />
            
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight="600" noWrap>
                {board.title || 'Без названия'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.completedTasks}/{stats.totalTasks} задач • {formatDate(board.updatedAt || board.createdAt)}
              </Typography>
            </Box>

            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem' } }}>
              {members.map(memberId => (
                <Avatar key={memberId} sx={{ bgcolor: bauhaus.blue }}>
                  {users[memberId]?.firstName?.charAt(0) || '?'}
                </Avatar>
              ))}
            </AvatarGroup>

            <IconButton size="small" onClick={(e) => handleMenuOpen(e, board)}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            Мои доски
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {boards.length} {boards.length === 1 ? 'доска' : boards.length < 5 ? 'доски' : 'досок'}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ borderRadius: 50, px: 3 }}
        >
          Создать доску
        </Button>
      </Box>

      {/* Фильтры */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Поиск досок..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Button
          size="small"
          startIcon={<FilterList />}
          onClick={(e) => setFilterAnchor(e.currentTarget)}
          variant={filterCategory !== 'all' ? 'contained' : 'outlined'}
          sx={{ borderRadius: 50 }}
        >
          {filterCategory === 'all' ? 'Все' : filterCategory === 'my' ? 'Мои' : 'Общие'}
        </Button>

        <Button
          size="small"
          startIcon={<Sort />}
          onClick={(e) => setSortAnchor(e.currentTarget)}
          variant="outlined"
          sx={{ borderRadius: 50 }}
        >
          Сортировка
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, value) => value && setViewMode(value)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              borderRadius: '50px !important',
              px: 1.5,
              '&.Mui-selected': {
                bgcolor: bauhaus.blue,
                color: 'white',
                '&:hover': { bgcolor: bauhaus.blue },
              },
            },
          }}
        >
          <ToggleButton value="grid">
            <ViewModule fontSize="small" />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewList fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Контент */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : filteredAndSortedBoards.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8, border: '2px dashed', borderColor: 'divider' }}>
          <ViewKanban sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchQuery ? 'Доски не найдены' : 'У вас пока нет досок'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery ? 'Попробуйте изменить запрос' : 'Создайте первую доску для управления задачами'}
          </Typography>
          {!searchQuery && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)} sx={{ borderRadius: 50 }}>
              Создать доску
            </Button>
          )}
        </Card>
      ) : viewMode === 'grid' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          {filteredAndSortedBoards.map(renderBoardCard)}
        </Box>
      ) : (
        <Box>
          {filteredAndSortedBoards.map(renderBoardRow)}
        </Box>
      )}

      {/* Диалог создания */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Создать новую доску</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Название доски"
            value={newBoardData.title}
            onChange={(e) => setNewBoardData({ ...newBoardData, title: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
            placeholder="Frontend Development"
          />
          <TextField
            fullWidth
            label="Описание"
            value={newBoardData.description}
            onChange={(e) => setNewBoardData({ ...newBoardData, description: e.target.value })}
            multiline
            rows={3}
            placeholder="Краткое описание проекта..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ borderRadius: 50 }}>Отмена</Button>
          <Button onClick={handleCreateBoard} variant="contained" disabled={!newBoardData.title.trim()} sx={{ borderRadius: 50 }}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Меню доски */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { navigate(`/board/${selectedBoard?.id}`); handleMenuClose(); }}>
          <ViewKanban sx={{ mr: 1 }} fontSize="small" /> Открыть
        </MenuItem>
        <MenuItem onClick={handleEditBoard}>
          <Edit sx={{ mr: 1 }} fontSize="small" /> Редактировать
        </MenuItem>
        <MenuItem onClick={handleShareBoard}>
          <Share sx={{ mr: 1 }} fontSize="small" /> Поделиться
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteBoard} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" /> Удалить
        </MenuItem>
      </Menu>

      {/* Меню сортировки */}
      <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
        <MenuItem selected={sortBy === 'updatedAt'} onClick={() => { setSortBy('updatedAt'); setSortAnchor(null); }}>
          По обновлению
        </MenuItem>
        <MenuItem selected={sortBy === 'createdAt'} onClick={() => { setSortBy('createdAt'); setSortAnchor(null); }}>
          По созданию
        </MenuItem>
        <MenuItem selected={sortBy === 'title'} onClick={() => { setSortBy('title'); setSortAnchor(null); }}>
          По названию
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortAnchor(null); }}>
          {sortOrder === 'desc' ? '↓ По убыванию' : '↑ По возрастанию'}
        </MenuItem>
      </Menu>

      {/* Меню фильтра */}
      <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}>
        <MenuItem selected={filterCategory === 'all'} onClick={() => { setFilterCategory('all'); setFilterAnchor(null); }}>
          Все доски
        </MenuItem>
        <MenuItem selected={filterCategory === 'my'} onClick={() => { setFilterCategory('my'); setFilterAnchor(null); }}>
          Мои доски
        </MenuItem>
        <MenuItem selected={filterCategory === 'shared'} onClick={() => { setFilterCategory('shared'); setFilterAnchor(null); }}>
          Общие доски
        </MenuItem>
      </Menu>

      {/* Диалог редактирования */}
      <Dialog open={editDialogOpen} onClose={() => { setEditDialogOpen(false); setEditingBoardId(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Редактировать доску</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Название доски"
            value={editBoardData.title}
            onChange={(e) => setEditBoardData({ ...editBoardData, title: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Описание"
            value={editBoardData.description}
            onChange={(e) => setEditBoardData({ ...editBoardData, description: e.target.value })}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Цвет доски</InputLabel>
            <Select
              value={editBoardData.color}
              label="Цвет доски"
              onChange={(e) => setEditBoardData({ ...editBoardData, color: e.target.value })}
            >
              <MenuItem value={bauhaus.blue}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 20, height: 20, bgcolor: bauhaus.blue, borderRadius: 1 }} /> Синий</Box></MenuItem>
              <MenuItem value={bauhaus.red}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 20, height: 20, bgcolor: bauhaus.red, borderRadius: 1 }} /> Красный</Box></MenuItem>
              <MenuItem value={bauhaus.yellow}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 20, height: 20, bgcolor: bauhaus.yellow, borderRadius: 1 }} /> Желтый</Box></MenuItem>
              <MenuItem value={bauhaus.teal}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 20, height: 20, bgcolor: bauhaus.teal, borderRadius: 1 }} /> Бирюзовый</Box></MenuItem>
              <MenuItem value={bauhaus.purple}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 20, height: 20, bgcolor: bauhaus.purple, borderRadius: 1 }} /> Фиолетовый</Box></MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={editBoardData.isPublic}
                onChange={(e) => setEditBoardData({ ...editBoardData, isPublic: e.target.checked })}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {editBoardData.isPublic ? <Public fontSize="small" /> : <Lock fontSize="small" />}
                {editBoardData.isPublic ? 'Публичная доска' : 'Приватная доска'}
              </Box>
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setEditDialogOpen(false); setEditingBoardId(null); }} sx={{ borderRadius: 50 }}>Отмена</Button>
          <Button onClick={handleSaveEditBoard} variant="contained" disabled={!editBoardData.title.trim()} sx={{ borderRadius: 50 }}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог совместного доступа */}
      <Dialog open={shareDialogOpen} onClose={() => { setShareDialogOpen(false); setSharingBoardId(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Совместный доступ к доске</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {sharingBoard?.isPublic ? 'Публичная доска - все могут присоединиться' : 'Приватная доска - только приглашенные'}
          </Typography>

          <TextField
            fullWidth
            placeholder="Поиск пользователей..."
            value={searchUserQuery}
            onChange={(e) => setSearchUserQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Участники ({Object.keys(sharingBoard?.members || {}).length})</Typography>
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {Object.entries(sharingBoard?.members || {}).map(([memberId, role]) => {
              const memberUser = users[memberId];
              if (!memberUser) return null;

              const canManage = sharingBoard?.members[user.uid] === 'owner' || sharingBoard?.members[user.uid] === 'admin';
              const isOwner = role === 'owner';

              return (
                <ListItem key={memberId}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: bauhaus.blue }}>
                      {memberUser.firstName?.charAt(0) || '?'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${memberUser.firstName} ${memberUser.lastName}`}
                    secondary={memberUser.email}
                  />
                  <ListItemSecondaryAction>
                    {canManage && !isOwner && memberId !== user.uid ? (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Select
                          size="small"
                          value={role}
                          onChange={(e) => handleChangeMemberRole(memberId, e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="admin">Админ</MenuItem>
                          <MenuItem value="editor">Редактор</MenuItem>
                          <MenuItem value="viewer">Наблюдатель</MenuItem>
                        </Select>
                        <IconButton size="small" onClick={() => handleRemoveMember(memberId)} color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Chip label={role === 'owner' ? 'Владелец' : role === 'admin' ? 'Админ' : role === 'editor' ? 'Редактор' : 'Наблюдатель'} size="small" />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>

          {sharingBoard?.members[user.uid] === 'owner' || sharingBoard?.members[user.uid] === 'admin' ? (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Добавить участников</Typography>
              <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                {Object.values(users)
                  .filter(u => {
                    if (!searchUserQuery) return !sharingBoard?.members[u.id];
                    const query = searchUserQuery.toLowerCase();
                    return !sharingBoard?.members[u.id] && (
                      u.firstName?.toLowerCase().includes(query) ||
                      u.lastName?.toLowerCase().includes(query) ||
                      u.email?.toLowerCase().includes(query)
                    );
                  })
                  .slice(0, 5)
                  .map(targetUser => (
                    <ListItem key={targetUser.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: bauhaus.teal }}>
                          {targetUser.firstName?.charAt(0) || '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${targetUser.firstName} ${targetUser.lastName}`}
                        secondary={targetUser.email}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PersonAdd />}
                          onClick={() => handleAddMember(targetUser.id, 'editor')}
                        >
                          Добавить
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
              </List>
            </>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setShareDialogOpen(false); setSharingBoardId(null); }} variant="contained" sx={{ borderRadius: 50 }}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

export default BoardsPage;
