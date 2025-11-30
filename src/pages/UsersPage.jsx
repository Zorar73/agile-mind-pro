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
  IconButton
} from '@mui/material';
import {
  MoreVert,
  Check,
  Close,
  Edit,
  Delete,
  Search
} from '@mui/icons-material';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import userService from '../services/user.service';
import { format } from 'date-fns';

function UsersPage() {
  const { user } = useContext(UserContext);

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

  // src/pages/UsersPage.jsx - замени только useEffect (строка 43)
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
    setAnchorEl(event.currentTarget);
    setSelectedUser(userObj);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
          <Skeleton variant="rectangular" height={48} />
        </Box>
        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Управление пользователями">
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Пользователь</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Должность</TableCell>
              <TableCell>Ответственность</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Дата регистрации</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    {searchQuery ? 'Пользователи не найдены' : 'Нет пользователей'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={u.avatar}>
                        {u.firstName?.charAt(0) || '?'}
                      </Avatar>
                      <Typography variant="body2">
                        {u.firstName} {u.middleName} {u.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.position}</TableCell>
                  <TableCell>{u.responsibility}</TableCell>
                  <TableCell>{getRoleChip(u.role)}</TableCell>
                  <TableCell>
                    {u.createdAt && format(u.createdAt.toDate(), 'dd.MM.yyyy')}
                  </TableCell>
                  <TableCell align="right">
                    {u.role === 'pending' ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<Check />}
                          onClick={() => {
                            setSelectedUser(u);
                            setDialogType('approve');
                            setDialogOpen(true);
                          }}
                        >
                          Одобрить
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Close />}
                          onClick={() => {
                            setSelectedUser(u);
                            setDialogType('reject');
                            setDialogOpen(true);
                          }}
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
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
        >
          <Delete sx={{ mr: 1 }} /> Удалить
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={() => !actionLoading && setDialogOpen(false)}>
        {dialogType === 'approve' && (
          <>
            <DialogTitle>Одобрить пользователя</DialogTitle>
            <DialogContent>
              <Typography>
                Одобрить регистрацию пользователя {selectedUser?.firstName} {selectedUser?.lastName}?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} disabled={actionLoading}>
                Отмена
              </Button>
              <Button 
                onClick={handleApprove} 
                variant="contained" 
                color="success"
                disabled={actionLoading}
                startIcon={actionLoading && <CircularProgress size={16} />}
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
              <Button onClick={() => setDialogOpen(false)} disabled={actionLoading}>
                Отмена
              </Button>
              <Button 
                onClick={handleReject} 
                variant="contained" 
                color="error"
                disabled={actionLoading}
                startIcon={actionLoading && <CircularProgress size={16} />}
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
                >
                  Пользователь
                </Button>
                <Button
                  variant={selectedUser?.role === 'admin' ? 'contained' : 'outlined'}
                  color="error"
                  onClick={() => handleChangeRole('admin')}
                  disabled={actionLoading}
                >
                  Администратор
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} disabled={actionLoading}>
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
              <Button onClick={() => setDialogOpen(false)} disabled={actionLoading}>
                Отмена
              </Button>
              <Button
                onClick={handleDelete}
                variant="contained"
                color="error"
                disabled={actionLoading}
                startIcon={actionLoading && <CircularProgress size={16} />}
              >
                Удалить
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </MainLayout>
  );
}

export default UsersPage;