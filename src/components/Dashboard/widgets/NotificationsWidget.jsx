// src/components/Dashboard/widgets/NotificationsWidget.jsx
import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Chip, Button, Badge } from '@mui/material';
import { Notifications, ArrowForward, Assignment, Comment, AlternateEmail, Event, CheckCircle } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import WidgetWrapper from './WidgetWrapper';

const bauhaus = { blue: '#1E88E5' };

const getNotificationIcon = (type) => {
  switch (type) {
    case 'task_assigned': return <Assignment fontSize="small" />;
    case 'task_comment': return <Comment fontSize="small" />;
    case 'task_mention': return <AlternateEmail fontSize="small" />;
    case 'task_deadline': return <Event fontSize="small" />;
    case 'user_approved': return <CheckCircle fontSize="small" />;
    default: return <Notifications fontSize="small" />;
  }
};

const toSafeDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date.toDate === 'function') return date.toDate();
  return new Date(date);
};

function NotificationsWidget({ widget, notifications, isEditMode, onRemove, onOpenConfig, onResize, onNotificationClick, onNavigate }) {
  const { width, height } = widget;
  const cells = width * height;
  
  const isMini = cells === 1;
  const maxNotifications = isMini ? 0 : Math.min(cells * 3, 8);
  const displayNotifications = notifications.slice(0, maxNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Мини режим
  if (isMini) {
    return (
      <WidgetWrapper widget={widget} isEditMode={isEditMode} onRemove={onRemove} onOpenConfig={onOpenConfig} onResize={onResize}>
        <Box
          onClick={() => onNavigate?.('/notifications')}
          sx={{
            bgcolor: unreadCount > 0 ? bauhaus.blue : 'grey.400',
            borderRadius: 2,
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { transform: 'scale(1.02)' },
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Typography variant="h3" fontWeight={700} color="white">
              <Notifications sx={{ fontSize: 40 }} />
            </Typography>
          </Badge>
          <Typography variant="body2" color="white" sx={{ opacity: 0.9, mt: 1 }}>
            {unreadCount > 0 ? `${unreadCount} новых` : 'Нет новых'}
          </Typography>
        </Box>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper
      widget={widget}
      title="Уведомления"
      icon={
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Notifications sx={{ fontSize: 18 }} />
        </Badge>
      }
      isEditMode={isEditMode}
      onRemove={onRemove}
      onOpenConfig={onOpenConfig}
      onResize={onResize}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, mt: -1 }}>
        <Button size="small" endIcon={<ArrowForward />} onClick={() => onNavigate?.('/notifications')}>Все</Button>
      </Box>

      {notifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Notifications sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">Нет уведомлений</Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {displayNotifications.map(notification => {
            const time = toSafeDate(notification.createdAt);
            const timeAgo = time ? formatDistanceToNow(time, { addSuffix: true, locale: ru }) : '';
            return (
              <ListItem key={notification.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => onNotificationClick?.(notification)}
                  sx={{
                    borderRadius: 1,
                    py: 0.5,
                    bgcolor: notification.read ? 'transparent' : `${bauhaus.blue}08`,
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 36 }}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: notification.read ? 'grey.200' : `${bauhaus.blue}20`,
                        color: notification.read ? 'grey.500' : bauhaus.blue,
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={notification.read ? 400 : 600} noWrap>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {timeAgo}
                      </Typography>
                    }
                  />
                  {!notification.read && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: bauhaus.blue, ml: 1 }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}
    </WidgetWrapper>
  );
}

export default NotificationsWidget;
