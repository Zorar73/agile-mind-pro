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
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '../../contexts/ToastContext';
import soundNotifications from '../../utils/soundNotifications';
import browserPush from '../../utils/browserPushNotifications';

function NotificationCenter() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const toast = useToast();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0); // 0 = Свежие, 1 = Просмотренные
  const [previousNotificationIds, setPreviousNotificationIds] = useState(new Set());

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToUserNotifications(
      user.uid,
      (updatedNotifications) => {
        // Проверяем, есть ли новые уведомления
        const newNotifications = updatedNotifications.filter(n => !previousNotificationIds.has(n.id) && !n.read);

        // Показываем toast для новых уведомлений
        newNotifications.forEach(notification => {
          // Воспроизводим специальный звук для упоминаний
          if (notification.type === 'task_mention') {
            soundNotifications.mention();
          } else {
            soundNotifications.notification();
          }

          // Показываем toast если окно активно, иначе browser push
          if (document.hasFocus()) {
            toast.info(notification.message, {
              title: notification.title,
              duration: 5000,
            });
          } else {
            // Показываем browser push если окно не в фокусе
            const onClick = () => {
              if (notification.link) {
                navigate(notification.link);
              }
            };

            switch (notification.type) {
              case 'task_assigned':
                browserPush.taskAssigned(notification.message, '', onClick);
                break;
              case 'task_comment':
                browserPush.taskComment(notification.message, '', onClick);
                break;
              case 'task_mention':
                browserPush.taskMention(notification.message, '', onClick);
                break;
              case 'task_deadline':
                browserPush.taskDeadline(notification.message, onClick);
                break;
              case 'user_approved':
                browserPush.userApproved(onClick);
                break;
              case 'board_invitation':
                browserPush.boardInvitation(notification.message, '', onClick);
                break;
              default:
                browserPush.generic(notification.title, notification.message, onClick);
            }
          }
        });

        // Обновляем список ID уведомлений
        setPreviousNotificationIds(new Set(updatedNotifications.map(n => n.id)));

        setNotifications(updatedNotifications);
        const unread = updatedNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    );

    return () => unsubscribe();
  }, [user, previousNotificationIds, toast]);

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
