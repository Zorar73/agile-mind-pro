// src/components/Layout/Sidebar.jsx
import React, { useState, useContext, useEffect } from 'react';
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
  Menu as MenuIcon,
  Event,
  Notifications,
  FolderOpen,
  Add,
  Article,
  School,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../App';
import authService from '../../services/auth.service';

const DRAWER_WIDTH = 260;

// Bauhaus цвета
const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

function Sidebar({ open, onClose, boards = [], onCreateBoard }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Определяем мобильный экран (< 900px)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Восстанавливаем состояние из localStorage
  const [boardsOpen, setBoardsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar_boards_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [adminOpen, setAdminOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar_admin_open');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Сохраняем состояние при изменении
  useEffect(() => {
    localStorage.setItem('sidebar_boards_open', JSON.stringify(boardsOpen));
  }, [boardsOpen]);

  useEffect(() => {
    localStorage.setItem('sidebar_admin_open', JSON.stringify(adminOpen));
  }, [adminOpen]);

  // Автоматически закрываем Sidebar при навигации на мобильных
  useEffect(() => {
    if (isMobile && open && onClose) {
      onClose();
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isBoardActive = (boardId) => location.pathname === `/board/${boardId}`;

  const menuItems = [
    { title: 'Главная', icon: <Dashboard />, path: '/', color: bauhaus.blue },
    { title: 'Календарь', icon: <Event />, path: '/calendar', color: bauhaus.teal },
    { title: 'Мои задачи', icon: <Assignment />, path: '/my-tasks', color: bauhaus.purple },
    { title: 'Команда', icon: <Group />, path: '/team', color: bauhaus.red },
    { title: 'Наброски', icon: <Description />, path: '/sketches', color: bauhaus.yellow },
    { title: 'Обучение', icon: <School />, path: '/learning', color: bauhaus.teal },
    { title: 'Новости', icon: <Article />, path: '/news', color: bauhaus.teal },
    { title: 'Уведомления', icon: <Notifications />, path: '/notifications', color: bauhaus.blue },
  ];

  const adminItems = [
    { title: 'Пользователи', icon: <People />, path: '/users' },
  ];

  const visibleBoards = boards.filter(board => board && board.title).slice(0, 7);
  const hasMoreBoards = boards.length > 7;

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Улучшает производительность на мобильных
      }}
      sx={{
        width: open ? DRAWER_WIDTH : (isMobile ? 0 : 64),
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : (isMobile ? DRAWER_WIDTH : 64),
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: 'width 0.2s',
          overflowX: 'hidden',
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Header с логотипом */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          minHeight: 64,
          position: 'relative',
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
            {/* Bauhaus логотип */}
            <Box sx={{ position: 'relative', width: 32, height: 32 }}>
              <Box sx={{ 
                position: 'absolute', 
                width: 16, 
                height: 16, 
                bgcolor: bauhaus.blue, 
                borderRadius: '50%',
                top: 0,
                left: 0,
              }} />
              <Box sx={{ 
                position: 'absolute', 
                width: 12, 
                height: 12, 
                bgcolor: bauhaus.red, 
                top: 10,
                right: 0,
              }} />
              <Box sx={{ 
                position: 'absolute', 
                width: 10, 
                height: 10, 
                bgcolor: bauhaus.yellow, 
                borderRadius: '50%',
                bottom: 0,
                left: 8,
              }} />
            </Box>
            <Typography variant="h6" fontWeight="700" color="text.primary">
              Agile Mind
            </Typography>
          </Box>
        )}
        <IconButton onClick={onClose} size="small">
          {open ? <ChevronLeft /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* User Profile */}
      {open && (
        <Box 
          sx={{ 
            p: 2, 
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          onClick={() => navigate('/profile')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={user?.avatar}
              sx={{
                width: 40,
                height: 40,
                bgcolor: bauhaus.blue,
                fontWeight: 600,
              }}
            >
              {user?.firstName?.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight="600" noWrap>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.position || 'Пользователь'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Divider />

      {/* Main Menu */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {menuItems.map((item) => (
          <Tooltip key={item.path} title={!open ? item.title : ''} placement="right">
            <ListItem disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 44,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2,
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: `${item.color}15`,
                    '&:hover': { bgcolor: `${item.color}20` },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive(item.path) ? item.color : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.title}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: isActive(item.path) ? 600 : 400,
                        fontSize: '0.875rem',
                        color: isActive(item.path) ? item.color : 'text.primary',
                      },
                    }}
                  />
                )}
                {/* Bauhaus индикатор активности */}
                {isActive(item.path) && open && (
                  <Box 
                    sx={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      bgcolor: item.color,
                    }} 
                  />
                )}
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}

        <Divider sx={{ my: 1, mx: 2 }} />

        {/* Доски */}
        <Tooltip title={!open ? 'Доски' : ''} placement="right">
          <ListItemButton 
            onClick={() => open ? setBoardsOpen(!boardsOpen) : navigate('/boards')} 
            sx={{ 
              px: 2, 
              mx: 1, 
              borderRadius: 2,
              minHeight: 44,
            }}
            selected={location.pathname === '/boards' || location.pathname.startsWith('/board/')}
          >
            <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', mr: open ? 0 : 'auto' }}>
              <Badge 
                badgeContent={boards.length} 
                color="primary" 
                max={99}
                sx={{ 
                  '& .MuiBadge-badge': { 
                    fontSize: '0.65rem', 
                    minWidth: 18, 
                    height: 18,
                    borderRadius: 50,
                  } 
                }}
              >
                <ViewKanban />
              </Badge>
            </ListItemIcon>
            {open && (
              <>
                <ListItemText 
                  primary="Доски" 
                  sx={{ '& .MuiTypography-root': { fontSize: '0.875rem', fontWeight: 500 } }}
                />
                {boardsOpen ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>
        </Tooltip>

        {open && (
          <Collapse in={boardsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Создать доску */}
              <ListItemButton
                sx={{ 
                  pl: 4, 
                  py: 0.75,
                  mx: 1,
                  borderRadius: 2,
                  color: bauhaus.blue,
                  '&:hover': { bgcolor: `${bauhaus.blue}10` },
                }}
                onClick={() => onCreateBoard ? onCreateBoard() : navigate('/boards?create=true')}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Add fontSize="small" sx={{ color: bauhaus.blue }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Создать доску"
                  primaryTypographyProps={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: bauhaus.blue,
                  }}
                />
              </ListItemButton>

              {/* Все доски */}
              <ListItemButton
                sx={{ pl: 4, py: 0.75, mx: 1, borderRadius: 2 }}
                selected={location.pathname === '/boards'}
                onClick={() => navigate('/boards')}
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

              {visibleBoards.length > 0 && <Divider sx={{ my: 0.5, mx: 2 }} />}

              {/* Список досок */}
              {visibleBoards.map((board) => (
                <ListItemButton
                  key={board.id}
                  sx={{ pl: 4, py: 0.5, mx: 1, borderRadius: 2 }}
                  selected={isBoardActive(board.id)}
                  onClick={() => navigate(`/board/${board.id}`)}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: board.color || bauhaus.blue,
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
                  sx={{ pl: 4, py: 0.5, mx: 1, borderRadius: 2 }} 
                  onClick={() => navigate('/boards')}
                >
                  <ListItemText 
                    primary={`+${boards.length - 7} ещё`}
                    primaryTypographyProps={{
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                    }}
                  />
                </ListItemButton>
              )}

              {boards.length === 0 && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ display: 'block', pl: 4, py: 1 }}
                >
                  Нет досок
                </Typography>
              )}
            </List>
          </Collapse>
        )}

        <Divider sx={{ my: 1, mx: 2 }} />

        {/* Admin Section */}
        {user?.role === 'admin' && open && (
          <>
            <ListItemButton 
              onClick={() => setAdminOpen(!adminOpen)} 
              sx={{ px: 2, mx: 1, borderRadius: 2, minHeight: 44 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <People />
              </ListItemIcon>
              <ListItemText 
                primary="Администрирование" 
                sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
              />
              {adminOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {adminItems.map((item) => (
                  <ListItemButton
                    key={item.path}
                    sx={{ pl: 4, py: 0.75, mx: 1, borderRadius: 2 }}
                    selected={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemText 
                      primary={item.title}
                      primaryTypographyProps={{ fontSize: '0.8rem' }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
            <Divider sx={{ my: 1, mx: 2 }} />
          </>
        )}

        {/* Settings & Profile */}
        <Tooltip title={!open ? 'Настройки' : ''} placement="right">
          <ListItem disablePadding>
            <ListItemButton
              selected={isActive('/settings')}
              onClick={() => navigate('/settings')}
              sx={{ px: 2, mx: 1, borderRadius: 2, minHeight: 44 }}
            >
              <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', mr: open ? 0 : 'auto' }}>
                <Settings />
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary="Настройки" 
                  sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Tooltip title={!open ? 'Профиль' : ''} placement="right">
          <ListItem disablePadding>
            <ListItemButton
              selected={isActive('/profile')}
              onClick={() => navigate('/profile')}
              sx={{ px: 2, mx: 1, borderRadius: 2, minHeight: 44 }}
            >
              <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', mr: open ? 0 : 'auto' }}>
                <AccountCircle />
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary="Профиль" 
                  sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Divider sx={{ my: 1, mx: 2 }} />

        {/* Logout */}
        <Tooltip title={!open ? 'Выход' : ''} placement="right">
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleLogout} 
              sx={{ px: 2, mx: 1, borderRadius: 2, minHeight: 44 }}
            >
              <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', mr: open ? 0 : 'auto', color: bauhaus.red }}>
                <Logout />
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary="Выход" 
                  sx={{ '& .MuiTypography-root': { color: bauhaus.red, fontSize: '0.875rem' } }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </Tooltip>
      </List>
    </Drawer>
  );
}

export default Sidebar;
