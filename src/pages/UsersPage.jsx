// src/pages/UsersPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Skeleton,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  MoreVert,
  Check,
  Close,
  Edit,
  Delete,
  Search,
  Person,
  Article,
  Lock,
  LockOpen,
} from '@mui/icons-material';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import UserProfileDrawer from '../components/User/UserProfileDrawer';
import userService from '../services/user.service';
import { format } from 'date-fns';

function UsersPage() {
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // UserProfileDrawer state
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = userService.subscribeToUsers((usersData) => {
      setUsers(usersData);
      filterUsers(usersData, activeTab, searchQuery);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterUsers(users, activeTab, searchQuery);
  }, [activeTab, searchQuery, users]);

  const filterUsers = (usersData, tab, search) => {
    let filtered = usersData;

    if (tab === 1) {
      filtered = filtered.filter(u => u.role === 'pending');
    }

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(u =>
        u.firstName?.toLowerCase().includes(query) ||
        u.lastName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.position?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleMenuOpen = (event, userObj) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedUser(userObj);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRowClick = (userObj) => {
    setProfileUserId(userObj.id);
    setProfileDrawerOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await userService.approveUser(selectedUser.id, user.uid);
      setDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      alert('Ошибка при одобрении пользователя');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await userService.rejectUser(selectedUser.id);
      setDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      alert('Ошибка при отклонении заявки');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (newRole) => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await userService.changeUserRole(selectedUser.id, newRole);
      setDialogOpen(false);
      setSelectedUser(null);
      handleMenuClose();
    } catch (error) {
      alert('Ошибка при изменении роли');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await userService.rejectUser(selectedUser.id);
      setDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      alert('Ошибка при удалении пользователя');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleNewsPermission = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const newValue = !selectedUser.canCreateNews;
      await userService.updateUserPermissions(selectedUser.id, { canCreateNews: newValue });
      setDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      alert('Ошибка при изменении прав');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleChip = (role) => {
    const roleConfig = {
      admin: { label: 'Администратор', color: 'error' },
      user: { label: 'Пользователь', color: 'success' },
      pending: { label: 'На модерации', color: 'warning' }
    };

    const config = roleConfig[role] || roleConfig.user;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getPendingCount = () => {
    return users.filter(u => u.role === 'pending').length;
  };

  if (loading) {
    return (
      <MainLayout title="Управление пользователями">
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Управление пользователями">
      {/* Заголовок */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Пользователи
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Управление пользователями системы
        </Typography>
      </Box>

      {/* Табы */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label={`Все пользователи (${users.length})`} />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                На модерации
                {getPendingCount() > 0 && (
                  <Chip
                    label={getPendingCount()}
                    size="small"
                    color="warning"
                  />
                )}
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Поиск */}
      <TextField
        fullWidth
        size="small"
        placeholder="Поиск по имени, email или должности..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Таблица */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Пользователь</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Должность</TableCell>
              <TableCell>Ответственность</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Права</TableCell>
              <TableCell>Дата регистрации</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box sx={{ py: 6 }}>
                    <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'Пользователи не найдены' : 'Нет пользователей'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow 
                  key={u.id}
                  hover
                  onClick={() => handleRowClick(u)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={u.avatar?.startsWith('http') ? u.avatar : undefined}
                        sx={{ bgcolor: 'primary.main' }}
                      >
                        {u.firstName?.charAt(0) || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {u.firstName} {u.middleName} {u.lastName}
                        </Typography>
                        {u.status === 'online' && (
                          <Chip 
                            label="Онлайн" 
                            size="small" 
                            sx={{ 
                              height: 18, 
                              fontSize: '0.65rem',
                              bgcolor: 'success.main',
                              color: 'white',
                            }} 
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {u.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{u.position || '—'}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {u.responsibility || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>{getRoleChip(u.role)}</TableCell>
                  <TableCell>
                    {u.role === 'admin' ? (
                      <Chip
                        label="Полный доступ"
                        size="small"
                        color="default"
                        icon={<LockOpen />}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {u.canCreateNews && (
                          <Chip
                            label="Создание новостей"
                            size="small"
                            color="primary"
                            variant="outlined"
                            icon={<Article />}
                          />
                        )}
                        {!u.canCreateNews && u.role !== 'pending' && (
                          <Chip
                            label="Нет особых прав"
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.createdAt && format(
                      u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt),
                      'dd.MM.yyyy'
                    )}
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    {u.role === 'pending' ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<Check />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(u);
                            setDialogType('approve');
                            setDialogOpen(true);
                          }}
                          sx={{ borderRadius: 50 }}
                        >
                          Одобрить
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Close />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(u);
                            setDialogType('reject');
                            setDialogOpen(true);
                          }}
                          sx={{ borderRadius: 50 }}
                        >
                          Отклонить
                        </Button>
                      </Box>
                    ) : (
                      u.id !== user.uid && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, u)}
                        >
                          <MoreVert />
                        </IconButton>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Меню действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedUser) {
              setProfileUserId(selectedUser.id);
              setProfileDrawerOpen(true);
            }
            handleMenuClose();
          }}
        >
          <Person sx={{ mr: 1 }} /> Профиль
        </MenuItem>
        {selectedUser?.role !== 'admin' && (
          <MenuItem
            onClick={() => {
              setDialogType('managePermissions');
              setDialogOpen(true);
              handleMenuClose();
            }}
          >
            <Lock sx={{ mr: 1 }} /> Управление правами
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setDialogType('changeRole');
            setDialogOpen(true);
            handleMenuClose();
          }}
        >
          <Edit sx={{ mr: 1 }} /> Изменить роль
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDialogType('delete');
            setDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} /> Удалить
        </MenuItem>
      </Menu>

      {/* Диалоги */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => !actionLoading && setDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {dialogType === 'approve' && (
          <>
            <DialogTitle>Одобрить пользователя</DialogTitle>
            <DialogContent>
              <Typography>
                Одобрить регистрацию пользователя {selectedUser?.firstName} {selectedUser?.lastName}?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} disabled={actionLoading} sx={{ borderRadius: 50 }}>
                Отмена
              </Button>
              <Button 
                onClick={handleApprove} 
                variant="contained" 
                color="success"
                disabled={actionLoading}
                startIcon={actionLoading && <CircularProgress size={16} />}
                sx={{ borderRadius: 50 }}
              >
                Одобрить
              </Button>
            </DialogActions>
          </>
        )}

        {dialogType === 'reject' && (
          <>
            <DialogTitle>Отклонить заявку</DialogTitle>
            <DialogContent>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Пользователь будет удален из системы. Это действие нельзя отменить.
              </Alert>
              <Typography>
                Отклонить заявку от {selectedUser?.firstName} {selectedUser?.lastName}?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} disabled={actionLoading} sx={{ borderRadius: 50 }}>
                Отмена
              </Button>
              <Button 
                onClick={handleReject} 
                variant="contained" 
                color="error"
                disabled={actionLoading}
                startIcon={actionLoading && <CircularProgress size={16} />}
                sx={{ borderRadius: 50 }}
              >
                Отклонить
              </Button>
            </DialogActions>
          </>
        )}

        {dialogType === 'changeRole' && (
          <>
            <DialogTitle>Изменить роль</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>
                Выберите новую роль для {selectedUser?.firstName} {selectedUser?.lastName}:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <Button
                  variant={selectedUser?.role === 'user' ? 'contained' : 'outlined'}
                  onClick={() => handleChangeRole('user')}
                  disabled={actionLoading}
                  sx={{ borderRadius: 50 }}
                >
                  Пользователь
                </Button>
                <Button
                  variant={selectedUser?.role === 'admin' ? 'contained' : 'outlined'}
                  color="error"
                  onClick={() => handleChangeRole('admin')}
                  disabled={actionLoading}
                  sx={{ borderRadius: 50 }}
                >
                  Администратор
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} disabled={actionLoading} sx={{ borderRadius: 50 }}>
                Отмена
              </Button>
            </DialogActions>
          </>
        )}

        {dialogType === 'delete' && (
          <>
            <DialogTitle>Удалить пользователя</DialogTitle>
            <DialogContent>
              <Alert severity="error" sx={{ mb: 2 }}>
                Это действие нельзя отменить!
              </Alert>
              <Typography>
                Удалить пользователя {selectedUser?.firstName} {selectedUser?.lastName}?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} disabled={actionLoading} sx={{ borderRadius: 50 }}>
                Отмена
              </Button>
              <Button
                onClick={handleDelete}
                variant="contained"
                color="error"
                disabled={actionLoading}
                startIcon={actionLoading && <CircularProgress size={16} />}
                sx={{ borderRadius: 50 }}
              >
                Удалить
              </Button>
            </DialogActions>
          </>
        )}

        {dialogType === 'managePermissions' && (
          <>
            <DialogTitle>Управление правами пользователя</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>
                Настройка прав для {selectedUser?.firstName} {selectedUser?.lastName}:
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Article color="primary" />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Создание новостей
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Разрешить пользователю создавать и публиковать новости
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={selectedUser?.canCreateNews ? 'Разрешено' : 'Запрещено'}
                    color={selectedUser?.canCreateNews ? 'success' : 'default'}
                    size="small"
                    icon={selectedUser?.canCreateNews ? <LockOpen /> : <Lock />}
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} disabled={actionLoading} sx={{ borderRadius: 50 }}>
                Отмена
              </Button>
              <Button
                onClick={handleToggleNewsPermission}
                variant="contained"
                color={selectedUser?.canCreateNews ? 'error' : 'success'}
                disabled={actionLoading}
                startIcon={actionLoading ? <CircularProgress size={16} /> : selectedUser?.canCreateNews ? <Lock /> : <LockOpen />}
                sx={{ borderRadius: 50 }}
              >
                {selectedUser?.canCreateNews ? 'Запретить' : 'Разрешить'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* UserProfileDrawer */}
      <UserProfileDrawer
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        userId={profileUserId}
      />
    </MainLayout>
  );
}

export default UsersPage;
