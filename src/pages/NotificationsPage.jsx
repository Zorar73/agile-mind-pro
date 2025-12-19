// src/pages/NotificationsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  IconButton,
  Button,
  Card,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  Assignment,
  Comment,
  AlternateEmail,
  Event,
  CheckCircle,
  MoreVert,
  Delete,
  DoneAll,
  Archive,
  Unarchive,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import notificationService from '../services/notification.service';
import { formatDistanceToNow, format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Bauhaus цвета
const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

function NotificationsPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToUserNotifications(
      user.uid,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleMenuOpen = (event, notification) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleNotificationClick = async (notification) => {
    await notificationService.markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    await notificationService.markAsRead(notificationId);
    handleMenuClose();
  };

  const handleArchive = async (notificationId) => {
    console.log('Archive:', notificationId);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;
    console.log('Delete:', selectedNotification.id);
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead(user.uid);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <Assignment sx={{ color: bauhaus.blue }} />;
      case 'task_comment':
        return <Comment sx={{ color: bauhaus.teal }} />;
      case 'task_mention':
        return <AlternateEmail sx={{ color: bauhaus.purple }} />;
      case 'task_deadline':
        return <Event sx={{ color: bauhaus.yellow }} />;
      case 'user_approved':
        return <CheckCircle sx={{ color: bauhaus.teal }} />;
      default:
        return <Notifications />;
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: ru });
    } catch {
      return '';
    }
  };

  const getFullDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      return format(timestamp.toDate(), 'dd.MM.yyyy HH:mm');
    } catch {
      return '';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 1 && n.read) return false;
    if (activeTab === 2 && !n.archived) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        n.title?.toLowerCase().includes(query) ||
        n.message?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MainLayout>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            Уведомления
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Все события и обновления в одном месте
          </Typography>
        </Box>
        
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<DoneAll />}
            onClick={handleMarkAllAsRead}
            sx={{ borderRadius: 50 }}
          >
            Прочитать все ({unreadCount})
          </Button>
        )}
      </Box>

      {/* Табы */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              py: 2,
              fontWeight: 600,
            },
            '& .Mui-selected': {
              color: bauhaus.blue,
            },
            '& .MuiTabs-indicator': {
              bgcolor: bauhaus.blue,
              height: 3,
            },
          }}
        >
          <Tab 
            label={`Все (${notifications.length})`}
            icon={<Notifications />}
            iconPosition="start"
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Непрочитанные
                {unreadCount > 0 && (
                  <Chip 
                    label={unreadCount} 
                    size="small" 
                    sx={{ bgcolor: bauhaus.red, color: 'white', fontWeight: 600, minWidth: 24 }}
                  />
                )}
              </Box>
            }
          />
          <Tab 
            label="Архив"
            icon={<Archive />}
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {/* Поиск */}
      <TextField
        fullWidth
        size="small"
        placeholder="Поиск уведомлений..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Список уведомлений */}
      {filteredNotifications.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8, border: '2px dashed', borderColor: 'divider' }}>
          <NotificationsNone sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchQuery ? 'Уведомления не найдены' : 'Нет уведомлений'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 1 && 'Все уведомления прочитаны'}
            {activeTab === 2 && 'Архив пуст'}
          </Typography>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={(e) => handleMenuOpen(e, notification)}
                    >
                      <MoreVert />
                    </IconButton>
                  }
                  sx={{
                    bgcolor: notification.read ? 'transparent' : `${bauhaus.blue}08`,
                  }}
                >
                  <ListItemButton 
                    onClick={() => handleNotificationClick(notification)}
                    sx={{ py: 2 }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: notification.read ? 'grey.100' : `${bauhaus.blue}15`,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography 
                            variant="body1" 
                            fontWeight={notification.read ? 400 : 600}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: bauhaus.blue,
                              }} 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {getTimeAgo(notification.createdAt)}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {getFullDate(notification.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < filteredNotifications.length - 1 && (
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 2 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}

      {/* Меню действий */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={() => handleMarkAsRead(selectedNotification.id)}>
            <DoneAll sx={{ mr: 1 }} fontSize="small" /> Отметить прочитанным
          </MenuItem>
        )}
        <MenuItem onClick={() => handleArchive(selectedNotification?.id)}>
          {selectedNotification?.archived ? (
            <><Unarchive sx={{ mr: 1 }} fontSize="small" /> Разархивировать</>
          ) : (
            <><Archive sx={{ mr: 1 }} fontSize="small" /> Архивировать</>
          )}
        </MenuItem>
        <MenuItem 
          onClick={() => { setDeleteDialogOpen(true); handleMenuClose(); }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} fontSize="small" /> Удалить
        </MenuItem>
      </Menu>

      {/* Диалог удаления */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Удалить уведомление?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Это действие нельзя отменить. Уведомление будет удалено навсегда.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: 50 }}>
            Отмена
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ borderRadius: 50 }}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

export default NotificationsPage;
