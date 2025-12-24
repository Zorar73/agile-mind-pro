// src/components/Notifications/NotificationCenter.jsx
import React, { useState, useContext } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  Box,
  Typography,
  Divider,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  Assignment,
  Comment,
  AlternateEmail,
  Event,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../App.jsx';
import notificationService from '../../services/notification.service';
import { useNotifications } from '../../contexts/NotificationProvider';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

function NotificationCenter() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Используем данные из NotificationProvider - единый источник правды
  const { notifications, unreadCount } = useNotifications();

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = Свежие, 1 = Просмотренные

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    await notificationService.markAsRead(notification.id);

    if (notification.link) {
      navigate(notification.link);
    }

    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead(user.uid);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <Assignment color="primary" />;
      case 'task_comment':
        return <Comment color="info" />;
      case 'task_mention':
        return <AlternateEmail color="secondary" />;
      case 'task_deadline':
        return <Event color="warning" />;
      case 'user_approved':
        return <CheckCircle color="success" />;
      default:
        return <Notifications />;
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(timestamp.toDate(), {
        addSuffix: true,
        locale: ru
      });
    } catch {
      return '';
    }
  };

  // Фильтрация уведомлений по табу
  const filteredNotifications = activeTab === 0 
    ? notifications.filter(n => !n.read) 
    : notifications.filter(n => n.read);

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              Уведомления
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Прочитать все
              </Button>
            )}
          </Box>

          {/* Табы */}
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ mt: 1 }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Свежие
                  {unreadCount > 0 && (
                    <Box 
                      component="span" 
                      sx={{ 
                        bgcolor: 'error.main', 
                        color: 'white', 
                        borderRadius: '10px', 
                        px: 0.8, 
                        py: 0.2, 
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {unreadCount}
                    </Box>
                  )}
                </Box>
              }
            />
            <Tab label="Просмотренные" />
          </Tabs>
        </Box>

        <Divider />

        {filteredNotifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsNone sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {activeTab === 0 ? 'Нет новых уведомлений' : 'Нет просмотренных уведомлений'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
            {filteredNotifications.map((notification) => (
              <ListItem
                key={notification.id}
                disablePadding
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                }}
              >
                <ListItemButton onClick={() => handleNotificationClick(notification)}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.read ? 'grey.300' : 'primary.light' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Box component="span">
                        <Box component="span" display="block" mb={0.5}>
                          {notification.message}
                        </Box>
                        <Box component="span" display="block" fontSize="0.75rem" color="text.secondary">
                          {getTimeAgo(notification.createdAt)}
                        </Box>
                      </Box>
                    }
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: notification.read ? 400 : 600
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
}

export default NotificationCenter;
