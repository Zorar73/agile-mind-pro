import React, { useState, useContext } from 'react';
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
  Switch,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  ViewKanban,
  Psychology,
  CalendarMonth,
  Description,
  Assignment,
  People,
  Settings,
  Group,
  AccountCircle,
  Logout,
  ExpandLess,
  ExpandMore,
  LightMode,
  DarkMode,
  ChevronLeft,
  Menu as MenuIcon,
  Event,
  Person,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../App';
import authService from '../../services/auth.service';

const DRAWER_WIDTH = 260;

function Sidebar({ open, onClose, boards = [] }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [boardsOpen, setBoardsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { title: 'Главная', icon: <Dashboard />, path: '/' },
    { title: 'Календарь', icon: <Event />, path: '/calendar' },
    { title: 'Мои задачи', icon: <Assignment />, path: '/my-tasks' },
    { title: 'Команда', icon: <Group />, path: '/team' },
    { title: 'Наброски', icon: <Description />, path: '/sketches' },
  ];

  const adminItems = [
    { title: 'Пользователи', icon: <People />, path: '/users' },
  ];

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : 64,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: 'width 0.2s',
          overflowX: 'hidden',
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
          <Typography variant="h6" fontWeight="bold" color="primary">
            🎯 Agile Mind
          </Typography>
        )}
        <IconButton onClick={onClose} size="small">
          {open ? <ChevronLeft /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* User Profile */}
      {open && (
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
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
          <Tooltip
            key={item.path}
            title={!open ? item.title : ''}
            placement="right"
          >
            <ListItem disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive(item.path) ? 'primary.main' : 'text.secondary',
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
                      },
                    }}
                  />
                )}
                {open && item.badge && (
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}

        {/* Доски (Collapsible) */}
        {open && boards.length > 0 && (
          <>
            <ListItemButton onClick={() => setBoardsOpen(!boardsOpen)} sx={{ px: 2.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <ViewKanban />
              </ListItemIcon>
              <ListItemText primary="Доски" />
              {boardsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={boardsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {boards.slice(0, 5).map((board) => (
                  <ListItemButton
                    key={board.id}
                    sx={{ pl: 6 }}
                    selected={location.pathname === `/board/${board.id}`}
                    onClick={() => navigate(`/board/${board.id}`)}
                  >
                    <ListItemText 
                      primary={board.title}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        noWrap: true,
                      }}
                    />
                  </ListItemButton>
                ))}
                {boards.length > 5 && (
                  <ListItemButton sx={{ pl: 6 }} onClick={() => navigate('/')}>
                    <ListItemText 
                      primary={`+${boards.length - 5} еще`}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                      }}
                    />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
          </>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Admin Section */}
        {user?.role === 'admin' && open && (
          <>
            <ListItemButton onClick={() => setAdminOpen(!adminOpen)} sx={{ px: 2.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <People />
              </ListItemIcon>
              <ListItemText primary="Администрирование" />
              {adminOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {adminItems.map((item) => (
                  <ListItemButton
                    key={item.path}
                    sx={{ pl: 6 }}
                    selected={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemText 
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Settings & Profile */}
        <Tooltip title={!open ? 'Настройки' : ''} placement="right">
          <ListItem disablePadding>
            <ListItemButton
              selected={isActive('/settings')}
              onClick={() => navigate('/settings')}
              sx={{ px: 2.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Settings />
              </ListItemIcon>
              {open && <ListItemText primary="Настройки" />}
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Tooltip title={!open ? 'Профиль' : ''} placement="right">
          <ListItem disablePadding>
            <ListItemButton
              selected={isActive('/profile')}
              onClick={() => navigate('/profile')}
              sx={{ px: 2.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AccountCircle />
              </ListItemIcon>
              {open && <ListItemText primary="Профиль" />}
            </ListItemButton>
          </ListItem>
        </Tooltip>

        {/* Theme Toggle */}
        {open && (
          <ListItem sx={{ px: 2.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              {darkMode ? <DarkMode /> : <LightMode />}
            </ListItemIcon>
            <ListItemText primary="Тёмная тема" />
            <Switch
              size="small"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
          </ListItem>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Logout */}
        <Tooltip title={!open ? 'Выход' : ''} placement="right">
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ px: 2.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                <Logout />
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary="Выход" 
                  sx={{ '& .MuiTypography-root': { color: 'error.main' } }}
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
