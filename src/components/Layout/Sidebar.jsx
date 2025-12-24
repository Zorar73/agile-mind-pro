// src/components/Layout/Sidebar.jsx
import React, { useContext, useEffect, useCallback } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard,
  ViewKanban,
  Description,
  Assignment,
  People,
  Settings,
  Group,
  AccountCircle,
  Logout,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Event,
  Notifications,
  FolderOpen,
  Add,
  Article,
  School,
  Feedback,
  SupportAgent,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../App';
import { useUIStore, useUserStore } from '../../stores';
import authService from '../../services/auth.service';
import { usePermissions } from '../../hooks/usePermissions';
import { MODULES } from '../../constants';

const DRAWER_WIDTH = 280;
const DRAWER_COLLAPSED = 72;

// Современная цветовая палитра
const colors = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
};

function Sidebar({ open, onClose, boards = [], onCreateBoard }) {
  // Zustand stores
  const user = useUserStore((state) => state.user);
  const { 
    sidebarBoardsExpanded, 
    sidebarAdminExpanded,
    toggleBoardsExpanded,
    toggleAdminExpanded 
  } = useUIStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { hasAccess, getAccessibleModules, isSystemAdmin } = usePermissions();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Используем Zustand вместо localStorage напрямую
  const boardsOpen = sidebarBoardsExpanded;
  const adminOpen = sidebarAdminExpanded;
  const setBoardsOpen = toggleBoardsExpanded;
  const setAdminOpen = toggleAdminExpanded;

  useEffect(() => {
    if (isMobile && open && onClose) {
      onClose();
    }
  }, [location.pathname, isMobile]);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    navigate('/login');
  }, [navigate]);

  const isActive = (path) => location.pathname === path;
  const isPathStartsWith = (path) => location.pathname.startsWith(path);
  const isBoardActive = (boardId) => location.pathname === `/board/${boardId}`;

  // Маппинг модулей
  const moduleToMenuItem = {
    [MODULES.TASKS]: { title: 'Мои задачи', icon: <Assignment />, path: '/my-tasks', color: colors.secondary },
    [MODULES.BOARDS]: null,
    [MODULES.SPRINTS]: null,
    [MODULES.CALENDAR]: { title: 'Календарь', icon: <Event />, path: '/calendar', color: colors.info },
    [MODULES.SKETCHES]: { title: 'Наброски', icon: <Description />, path: '/sketches', color: colors.warning },
    [MODULES.TEAMS]: { title: 'Команды', icon: <Group />, path: '/team', color: colors.danger },
    [MODULES.NEWS]: { title: 'Новости', icon: <Article />, path: '/news', color: colors.success },
    [MODULES.LEARNING]: { title: 'Обучение', icon: <School />, path: '/learning', color: colors.primary },
    [MODULES.CHAT]: null,
    [MODULES.KNOWLEDGE]: null,
    [MODULES.PROFILE]: null,
  };

  const mainMenuItems = [
    { title: 'Главная', icon: <Dashboard />, path: '/', color: colors.primary },
    ...getAccessibleModules()
      .map(module => moduleToMenuItem[module])
      .filter(Boolean),
  ];

  const adminItems = React.useMemo(() => {
    const items = [];
    
    if (isSystemAdmin() || user?.role === 'admin' || user?.role === 'owner') {
      items.push(
        { title: 'Пользователи', icon: <People />, path: '/users' },
        { title: 'Роли и доступ', icon: <AdminPanelSettings />, path: '/admin/roles' },
      );
      
      // Проверяем доступ к модулю обратной связи
      if (hasAccess(MODULES.FEEDBACK_ADMIN) || isSystemAdmin() || user?.role === 'admin' || user?.role === 'owner') {
        items.push({ title: 'Обратная связь', icon: <SupportAgent />, path: '/admin/feedback' });
      }
      
      if (user?.role === 'admin' || user?.role === 'owner') {
        items.push({ title: 'Миграция ролей', icon: <Settings />, path: '/admin/migrate' });
      }
    }

    return items;
  }, [isSystemAdmin, user?.role, hasAccess]);

  const visibleBoards = boards.filter(board => board && board.title).slice(0, 5);
  const hasMoreBoards = boards.length > 5;

  // Компонент пункта меню
  const MenuItem = ({ item, nested = false }) => {
    const active = isActive(item.path) || (item.path !== '/' && isPathStartsWith(item.path));
    
    return (
      <Tooltip title={!open ? item.title : ''} placement="right" arrow>
        <ListItemButton
          onClick={() => navigate(item.path)}
          sx={{
            mx: 1.5,
            mb: 0.5,
            px: nested ? 2 : 1.5,
            py: 1,
            borderRadius: 2,
            minHeight: 44,
            justifyContent: open ? 'flex-start' : 'center',
            bgcolor: active ? alpha(item.color || colors.primary, 0.12) : 'transparent',
            color: active ? item.color || colors.primary : 'text.secondary',
            '&:hover': {
              bgcolor: active 
                ? alpha(item.color || colors.primary, 0.18)
                : alpha(theme.palette.action.hover, 0.08),
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : 0,
              justifyContent: 'center',
              color: active ? item.color || colors.primary : 'inherit',
            }}
          >
            {item.icon}
          </ListItemIcon>
          {open && (
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 500,
              }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    );
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: open ? DRAWER_WIDTH : (isMobile ? 0 : DRAWER_COLLAPSED),
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : (isMobile ? DRAWER_WIDTH : DRAWER_COLLAPSED),
          boxSizing: 'border-box',
          border: 'none',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          bgcolor: isDark ? 'background.paper' : '#FAFBFC',
          boxShadow: isDark ? 'none' : '1px 0 0 0 rgba(0,0,0,0.05)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          minHeight: 64,
        }}
      >
        {open && (
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
          >
            {/* Modern Logo */}
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.1rem',
              }}
            >
              A
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Agile Mind
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            bgcolor: isDark ? 'action.hover' : 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            '&:hover': { bgcolor: isDark ? 'action.selected' : 'grey.100' },
          }}
        >
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>

      {/* User Card */}
      {open && (
        <Box
          onClick={() => navigate('/profile')}
          sx={{
            mx: 2,
            mb: 2,
            p: 1.5,
            borderRadius: 3,
            bgcolor: isDark ? alpha(colors.primary, 0.08) : 'white',
            border: '1px solid',
            borderColor: isDark ? 'divider' : 'grey.200',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: colors.primary,
              boxShadow: `0 0 0 1px ${alpha(colors.primary, 0.2)}`,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={user?.avatar}
              sx={{
                width: 40,
                height: 40,
                bgcolor: colors.primary,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                noWrap
                color="text.primary"
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.roleName || user?.role || 'Пользователь'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <List sx={{ px: 0.5, flex: 1 }}>
        {/* Main Menu */}
        {mainMenuItems.map((item) => (
          <MenuItem key={item.path} item={item} />
        ))}

        {/* Boards Section */}
        {hasAccess(MODULES.BOARDS) && (
          <>
            <Box sx={{ mx: 2, mt: 2, mb: 1 }}>
              {open && (
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.disabled"
                  sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  Проекты
                </Typography>
              )}
            </Box>

            <Tooltip title={!open ? 'Доски' : ''} placement="right" arrow>
              <ListItemButton
                onClick={() => open && setBoardsOpen(!boardsOpen)}
                sx={{
                  mx: 1.5,
                  mb: 0.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  minHeight: 44,
                  justifyContent: open ? 'flex-start' : 'center',
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 0, justifyContent: 'center' }}>
                  <Badge
                    badgeContent={boards.length}
                    color="primary"
                    max={99}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.65rem',
                        minWidth: 18,
                        height: 18,
                      },
                    }}
                  >
                    <ViewKanban />
                  </Badge>
                </ListItemIcon>
                {open && (
                  <>
                    <ListItemText
                      primary="Доски"
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                    />
                    {boardsOpen ? <ExpandLess /> : <ExpandMore />}
                  </>
                )}
              </ListItemButton>
            </Tooltip>

            {open && (
              <Collapse in={boardsOpen} timeout="auto" unmountOnExit>
                <List disablePadding sx={{ pl: 2 }}>
                  {/* Create Board */}
                  <ListItemButton
                    onClick={() => onCreateBoard ? onCreateBoard() : navigate('/boards?create=true')}
                    sx={{
                      mx: 1.5,
                      mb: 0.5,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 2,
                      color: colors.primary,
                      '&:hover': { bgcolor: alpha(colors.primary, 0.08) },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, color: colors.primary }}>
                      <Add fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Создать доску"
                      primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 500 }}
                    />
                  </ListItemButton>

                  {/* All Boards */}
                  <ListItemButton
                    selected={location.pathname === '/boards'}
                    onClick={() => navigate('/boards')}
                    sx={{
                      mx: 1.5,
                      mb: 0.5,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 2,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <FolderOpen fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Все доски"
                      primaryTypographyProps={{
                        fontSize: '0.8rem',
                        fontWeight: location.pathname === '/boards' ? 600 : 400,
                      }}
                    />
                  </ListItemButton>

                  {visibleBoards.length > 0 && <Divider sx={{ my: 1, mx: 3 }} />}

                  {/* Board List */}
                  {visibleBoards.map((board) => (
                    <ListItemButton
                      key={board.id}
                      selected={isBoardActive(board.id)}
                      onClick={() => navigate(`/board/${board.id}`)}
                      sx={{
                        mx: 1.5,
                        mb: 0.25,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: board.color || colors.primary,
                          mr: 1.5,
                          flexShrink: 0,
                        }}
                      />
                      <ListItemText
                        primary={board.title || 'Без названия'}
                        primaryTypographyProps={{
                          fontSize: '0.8rem',
                          noWrap: true,
                          fontWeight: isBoardActive(board.id) ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  ))}

                  {hasMoreBoards && (
                    <ListItemButton
                      onClick={() => navigate('/boards')}
                      sx={{ mx: 1.5, px: 1.5, py: 0.5, borderRadius: 2 }}
                    >
                      <ListItemText
                        primary={`+${boards.length - 5} ещё`}
                        primaryTypographyProps={{ fontSize: '0.75rem', color: 'text.secondary' }}
                      />
                    </ListItemButton>
                  )}

                  {boards.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 3, py: 1 }}>
                      Нет досок
                    </Typography>
                  )}
                </List>
              </Collapse>
            )}
          </>
        )}

        {/* Admin Section */}
        {adminItems.length > 0 && (
          <>
            <Box sx={{ mx: 2, mt: 3, mb: 1 }}>
              {open && (
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.disabled"
                  sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  Администрирование
                </Typography>
              )}
            </Box>

            {open ? (
              <>
                <ListItemButton
                  onClick={() => setAdminOpen(!adminOpen)}
                  sx={{ mx: 1.5, mb: 0.5, px: 1.5, py: 1, borderRadius: 2, minHeight: 44 }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: 2, color: colors.danger }}>
                    <AdminPanelSettings />
                  </ListItemIcon>
                  <ListItemText
                    primary="Админ-панель"
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                  />
                  {adminOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                <Collapse in={adminOpen} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ pl: 2 }}>
                    {adminItems.map((item) => (
                      <ListItemButton
                        key={item.path}
                        selected={isActive(item.path)}
                        onClick={() => navigate(item.path)}
                        sx={{ mx: 1.5, mb: 0.5, px: 1.5, py: 0.75, borderRadius: 2 }}
                      >
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          primaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <Tooltip title="Админ-панель" placement="right" arrow>
                <ListItemButton
                  onClick={() => navigate('/users')}
                  sx={{
                    mx: 1.5,
                    mb: 0.5,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    minHeight: 44,
                    justifyContent: 'center',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, color: colors.danger }}>
                    <AdminPanelSettings />
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            )}
          </>
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Bottom Section */}
        <Box sx={{ mx: 2, mt: 2, mb: 1 }}>
          {open && (
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.disabled"
              sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
            >
              Аккаунт
            </Typography>
          )}
        </Box>

        <MenuItem
          item={{ title: 'Уведомления', icon: <Notifications />, path: '/notifications', color: colors.warning }}
        />
        <MenuItem
          item={{ title: 'Мои обращения', icon: <Feedback />, path: '/my-feedback', color: colors.success }}
        />
        <MenuItem
          item={{ title: 'Настройки', icon: <Settings />, path: '/settings', color: colors.info }}
        />
        <MenuItem
          item={{ title: 'Профиль', icon: <AccountCircle />, path: '/profile', color: colors.primary }}
        />

        <Divider sx={{ my: 1.5, mx: 2 }} />

        {/* Logout */}
        <Tooltip title={!open ? 'Выход' : ''} placement="right" arrow>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1.5,
              mb: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              minHeight: 44,
              justifyContent: open ? 'flex-start' : 'center',
              color: colors.danger,
              '&:hover': { bgcolor: alpha(colors.danger, 0.08) },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 0, justifyContent: 'center', color: colors.danger }}>
              <Logout />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Выход"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </List>
    </Drawer>
  );
}

export default Sidebar;
