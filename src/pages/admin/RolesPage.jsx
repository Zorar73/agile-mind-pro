// src/pages/admin/RolesPage.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { UserContext } from '../../App';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControl,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  Select,
  InputLabel,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Security,
  People,
  AdminPanelSettings,
  Visibility,
  Lock,
  Check,
  Close,
  Info,
  PersonAdd,
} from '@mui/icons-material';
import { useToast } from '../../contexts/ToastContext';
import roleService from '../../services/role.service';
import userService from '../../services/user.service';
import {
  ACCESS_LEVELS,
  MODULES,
  MODULE_META,
  MODULE_GROUPS,
  SYSTEM_ROLES,
} from '../../constants';
import ProtectedModule from '../../components/Common/ProtectedModule';
import MainLayout from '../../components/Layout/MainLayout';

/**
 * Страница управления ролями и правами доступа
 */
function RolesPage() {
  const { user: currentUser } = useContext(UserContext);
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRole, setMenuRole] = useState(null);
  const [assignUsersDialogOpen, setAssignUsersDialogOpen] = useState(false);

  // Загрузка ролей и пользователей
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [rolesResult, usersResult] = await Promise.all([
      roleService.getRoles(),
      userService.getAllUsers(),
    ]);

    if (rolesResult.success) {
      setRoles(rolesResult.roles);
    } else {
      toast.error('Ошибка загрузки ролей');
    }

    if (usersResult.success) {
      setUsers(usersResult.users);
    }

    setLoading(false);
  };

  // Открыть меню действий
  const handleMenuOpen = (event, role) => {
    setAnchorEl(event.currentTarget);
    setMenuRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRole(null);
  };

  // Создать роль
  const handleCreateRole = () => {
    setSelectedRole(null);
    setCreateDialogOpen(true);
  };

  // Редактировать роль
  const handleEditRole = (role) => {
    setSelectedRole(role);
    setEditDrawerOpen(true);
    handleMenuClose();
  };

  // Удалить роль
  const handleDeleteRole = async (role) => {
    if (role.isSystem) {
      toast.error('Системные роли нельзя удалять');
      return;
    }

    if (role.usersCount > 0) {
      toast.error(`Нельзя удалить роль с назначенными пользователями (${role.usersCount})`);
      return;
    }

    if (!window.confirm(`Удалить роль "${role.name}"?`)) {
      return;
    }

    const result = await roleService.deleteRole(role.id);

    if (result.success) {
      toast.success('Роль удалена');
      loadData();
    } else {
      toast.error(result.error || 'Ошибка удаления роли');
    }

    handleMenuClose();
  };

  // Установить роль по умолчанию
  const handleSetDefault = async (role) => {
    const result = await roleService.setDefaultRole(role.id);

    if (result.success) {
      toast.success(`"${role.name}" установлена по умолчанию`);
      loadData();
    } else {
      toast.error('Ошибка установки роли по умолчанию');
    }

    handleMenuClose();
  };

  // Назначить пользователей
  const handleAssignUsers = (role) => {
    setSelectedRole(role);
    setAssignUsersDialogOpen(true);
    handleMenuClose();
  };

  // Получить количество модулей с доступом
  const getAccessibleModulesCount = (role) => {
    if (!role.modules) return 0;
    return Object.values(role.modules).filter(level => level !== ACCESS_LEVELS.NONE).length;
  };

  // Получить иконку уровня доступа
  const getAccessLevelIcon = (level) => {
    switch (level) {
      case ACCESS_LEVELS.ADMIN:
        return <AdminPanelSettings fontSize="small" color="error" />;
      case ACCESS_LEVELS.EDIT:
        return <Edit fontSize="small" color="primary" />;
      case ACCESS_LEVELS.VIEW:
        return <Visibility fontSize="small" color="action" />;
      default:
        return <Lock fontSize="small" color="disabled" />;
    }
  };

  // Проверка доступа: либо новая система (isSystemAdmin), либо старый админ
  // ВАЖНО: все хуки должны быть ДО любых условных return!
  const hasAccess = React.useMemo(() => {
    // Старые админы (для периода миграции)
    if (currentUser?.role === 'admin' || currentUser?.role === 'owner') {
      return true;
    }
    // Новая система - проверим через хук permissions (будет проверено в ProtectedModule)
    return false;
  }, [currentUser]);

  // Получить цвет роли
  const getRoleColor = (role) => {
    if (role.isSystem) {
      if (role.id === SYSTEM_ROLES.ADMIN) return 'error';
      if (role.id === SYSTEM_ROLES.OFFICE) return 'primary';
      return 'info';
    }
    return 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Если старый админ - показываем без ProtectedModule
  if (currentUser?.role === 'admin' || currentUser?.role === 'owner') {
    return renderContent();
  }

  // Иначе проверяем через новую систему
  return (
    <ProtectedModule module={MODULES.PROFILE} requiredLevel={ACCESS_LEVELS.ADMIN}>
      {renderContent()}
    </ProtectedModule>
  );

  function renderContent() {
    return (
      <MainLayout title="Роли и права доступа">
        <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Роли и права доступа
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Управление ролями и модульными правами пользователей
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateRole}
            size="large"
          >
            Создать роль
          </Button>
        </Box>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }} icon={<Info />}>
          Система использует модульный подход к правам доступа. Каждая роль имеет доступ к модулям
          с уровнями: <strong>view</strong> (просмотр), <strong>edit</strong> (редактирование),
          <strong>admin</strong> (администрирование). Системные роли нельзя удалить.
        </Alert>

        {/* Roles Grid */}
        <Grid container spacing={3}>
          {roles.map((role) => (
            <Grid item xs={12} sm={6} md={4} key={role.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: role.isDefault ? 2 : 1,
                  borderColor: role.isDefault ? 'primary.main' : 'divider',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Role Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {role.name}
                        </Typography>
                        {role.isSystem && (
                          <Chip
                            label="Системная"
                            size="small"
                            color={getRoleColor(role)}
                            icon={<Security />}
                          />
                        )}
                      </Box>
                      {role.isDefault && (
                        <Chip
                          label="По умолчанию"
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ mb: 1 }}
                        />
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, role)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  {/* Description */}
                  {role.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {role.description}
                    </Typography>
                  )}

                  {/* Stats */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Tooltip title="Пользователей с этой ролью">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <People fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {role.usersCount || 0}
                        </Typography>
                      </Box>
                    </Tooltip>
                    <Tooltip title="Доступных модулей">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Security fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {getAccessibleModulesCount(role)} / {Object.keys(MODULES).length}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>

                  {/* Users Preview */}
                  {role.usersCount > 0 && (
                    <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                      {users
                        .filter(u => u.roleId === role.id)
                        .slice(0, 4)
                        .map(u => (
                          <Avatar
                            key={u.id}
                            src={u.avatar}
                            sx={{ width: 28, height: 28 }}
                          >
                            {u.firstName?.charAt(0)}
                          </Avatar>
                        ))}
                    </AvatarGroup>
                  )}
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEditRole(role)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PersonAdd />}
                    onClick={() => handleAssignUsers(role)}
                  >
                    Назначить
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleEditRole(menuRole)}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Редактировать</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAssignUsers(menuRole)}>
            <ListItemIcon>
              <PersonAdd fontSize="small" />
            </ListItemIcon>
            <ListItemText>Назначить пользователей</ListItemText>
          </MenuItem>
          {!menuRole?.isDefault && (
            <MenuItem onClick={() => handleSetDefault(menuRole)}>
              <ListItemIcon>
                <Check fontSize="small" />
              </ListItemIcon>
              <ListItemText>Установить по умолчанию</ListItemText>
            </MenuItem>
          )}
          <Divider />
          <MenuItem
            onClick={() => handleDeleteRole(menuRole)}
            disabled={menuRole?.isSystem || menuRole?.usersCount > 0}
          >
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Удалить</ListItemText>
          </MenuItem>
        </Menu>

        {/* Create/Edit Dialogs */}
        <CreateRoleDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={loadData}
          currentUser={currentUser}
        />

        <EditRoleDrawer
          open={editDrawerOpen}
          role={selectedRole}
          onClose={() => {
            setEditDrawerOpen(false);
            setSelectedRole(null);
          }}
          onSuccess={loadData}
        />

        <AssignUsersDialog
          open={assignUsersDialogOpen}
          role={selectedRole}
          users={users}
          onClose={() => {
            setAssignUsersDialogOpen(false);
            setSelectedRole(null);
          }}
          onSuccess={loadData}
        />
      </Container>
      </MainLayout>
    );
  }
}

/**
 * Диалог создания роли
 */
function CreateRoleDialog({ open, onClose, onSuccess, currentUser }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
    modules: {},
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Инициализируем все модули с уровнем NONE
      const initialModules = {};
      Object.values(MODULES).forEach(module => {
        initialModules[module] = ACCESS_LEVELS.NONE;
      });

      setFormData({
        name: '',
        description: '',
        isDefault: false,
        modules: initialModules,
      });
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Введите название роли');
      return;
    }

    setLoading(true);

    const result = await roleService.createRole(formData, currentUser?.uid || currentUser?.id || 'unknown');

    if (result.success) {
      toast.success('Роль создана');
      onSuccess();
      onClose();
    } else {
      toast.error(result.error || 'Ошибка создания роли');
    }

    setLoading(false);
  };

  const handleModuleChange = (module, level) => {
    setFormData(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [module]: level,
      },
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Создать новую роль</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Название роли"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
              }
              label="Роль по умолчанию для новых пользователей"
            />

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle1" fontWeight={600}>
              Права доступа к модулям
            </Typography>

            <ModulesMatrix
              modules={formData.modules}
              onChange={handleModuleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

/**
 * Drawer редактирования роли
 */
function EditRoleDrawer({ open, role, onClose, onSuccess }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
    modules: {},
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        isDefault: role.isDefault || false,
        modules: role.modules || {},
      });
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Введите название роли');
      return;
    }

    setLoading(true);

    const result = await roleService.updateRole(role.id, formData);

    if (result.success) {
      toast.success('Роль обновлена');
      onSuccess();
      onClose();
    } else {
      toast.error(result.error || 'Ошибка обновления роли');
    }

    setLoading(false);
  };

  const handleModuleChange = (module, level) => {
    setFormData(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [module]: level,
      },
    }));
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 500 }, p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5" fontWeight={700}>
              Редактировать роль
            </Typography>

            {role?.isSystem && (
              <Alert severity="warning" icon={<Security />}>
                Системная роль. Название и описание изменить нельзя.
              </Alert>
            )}

            <TextField
              label="Название роли"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              disabled={role?.isSystem}
            />
            <TextField
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
              disabled={role?.isSystem}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
              }
              label="Роль по умолчанию"
            />

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle1" fontWeight={600}>
              Права доступа к модулям
            </Typography>

            <ModulesMatrix
              modules={formData.modules}
              onChange={handleModuleChange}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button onClick={onClose} fullWidth disabled={loading}>
                Отмена
              </Button>
              <Button type="submit" variant="contained" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Сохранить'}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
}

/**
 * Матрица прав доступа к модулям
 */
function ModulesMatrix({ modules, onChange }) {
  const accessLevels = [
    { value: ACCESS_LEVELS.NONE, label: 'Нет', icon: <Close fontSize="small" /> },
    { value: ACCESS_LEVELS.VIEW, label: 'Просмотр', icon: <Visibility fontSize="small" /> },
    { value: ACCESS_LEVELS.EDIT, label: 'Редакт.', icon: <Edit fontSize="small" /> },
    { value: ACCESS_LEVELS.ADMIN, label: 'Админ', icon: <AdminPanelSettings fontSize="small" /> },
  ];

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Модуль</TableCell>
            {accessLevels.map(level => (
              <TableCell key={level.value} align="center" sx={{ minWidth: 80 }}>
                <Tooltip title={level.label}>
                  <Box>{level.icon}</Box>
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(MODULE_META).map(([moduleId, meta]) => {
            const IconComponent = meta.icon;
            return (
              <TableRow key={moduleId} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconComponent fontSize="small" />
                    <Typography variant="body2">{meta.label}</Typography>
                  </Box>
                </TableCell>
                {accessLevels.map(level => (
                  <TableCell key={level.value} align="center">
                    <Checkbox
                      checked={modules[moduleId] === level.value}
                      onChange={() => onChange(moduleId, level.value)}
                      size="small"
                    />
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/**
 * Диалог назначения пользователей
 */
function AssignUsersDialog({ open, role, users, onClose, onSuccess }) {
  const toast = useToast();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Фильтруем пользователей с этой ролью
  const currentUsers = useMemo(() => {
    if (!role) return [];
    return users.filter(u => u.roleId === role.id);
  }, [role, users]);

  // Пользователи без этой роли
  const availableUsers = useMemo(() => {
    if (!role) return [];
    return users.filter(u => u.roleId !== role.id);
  }, [role, users]);

  const handleAssign = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Выберите пользователей');
      return;
    }

    setLoading(true);

    const result = await roleService.assignRoleBulk(selectedUsers, role.id);

    if (result.success) {
      toast.success(`Роль назначена ${selectedUsers.length} пользователям`);
      setSelectedUsers([]);
      onSuccess();
      onClose();
    } else {
      toast.error('Ошибка назначения роли');
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Назначить роль "{role?.name}"
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Текущих пользователей: {currentUsers.length}
          </Typography>
        </Box>

        <FormControl fullWidth>
          <InputLabel>Выберите пользователей</InputLabel>
          <Select
            multiple
            value={selectedUsers}
            onChange={(e) => setSelectedUsers(e.target.value)}
            label="Выберите пользователей"
          >
            {availableUsers.map(user => (
              <MenuItem key={user.id} value={user.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={user.avatar} sx={{ width: 24, height: 24 }}>
                    {user.firstName?.charAt(0)}
                  </Avatar>
                  <Typography variant="body2">
                    {user.firstName} {user.lastName}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedUsers.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Будет назначена роль {selectedUsers.length} пользователям
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={loading || selectedUsers.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Назначить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RolesPage;
