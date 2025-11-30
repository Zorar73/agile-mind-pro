// src/components/Notifications/NotificationCenter.jsx
import React, { useState, useEffect, useContext } from 'react';
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
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

function NotificationCenter() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToUserNotifications(
      user.uid,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        const unread = updatedNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    );

    return () => unsubscribe();
  }, [user]);

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Уведомления
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Прочитать все
              </Button>
            )}
          </Box>
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsNone sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Нет уведомлений
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification) => (
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
                    primary={
                      <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getTimeAgo(notification.createdAt)}
                        </Typography>
                      </>
                    }
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