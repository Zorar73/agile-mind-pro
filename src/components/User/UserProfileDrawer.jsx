// src/components/User/UserProfileDrawer.jsx
import React, { useState, useEffect, useContext } from 'react';
import StackedDrawer from '../Common/StackedDrawer';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Chip,
  Button,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Tooltip,
  CircularProgress,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Close,
  Email,
  Phone,
  Telegram,
  WhatsApp,
  Work,
  Assignment,
  CheckCircle,
  Schedule,
  TrendingUp,
  PersonAdd,
  Chat,
  ContentCopy,
} from '@mui/icons-material';
import { UserContext } from '../../App';
import userService from '../../services/user.service';
import taskService from '../../services/task.service';
import boardService from '../../services/board.service';

// Bauhaus цвета
const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

function UserProfileDrawer({ open, onClose, userId, drawerId }) {
  const { user: currentUser } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    overdueTasks: 0,
  });
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (open && userId) {
      loadUserData();
    }
  }, [open, userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Загружаем данные пользователя
      const userResult = await userService.getUserById(userId);
      if (userResult.success) {
        setUserData(userResult.user);
      }

      // Загружаем статистику задач пользователя
      await loadUserStats();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    setLoading(false);
  };

  const loadUserStats = async () => {
    try {
      // Получаем все доски текущего пользователя
      const boardsResult = await boardService.getUserBoards(currentUser.uid);
      if (!boardsResult.success) return;

      let totalTasks = 0;
      let completedTasks = 0;
      let activeTasks = 0;
      let overdueTasks = 0;

      for (const board of boardsResult.boards) {
        const tasksResult = await taskService.getTasks(board.id);
        if (tasksResult.success) {
          tasksResult.tasks.forEach(task => {
            // Проверяем, назначена ли задача на этого пользователя
            if (task.members && task.members[userId]) {
              totalTasks++;
              if (task.status === 'done') {
                completedTasks++;
              } else {
                activeTasks++;
                // Проверяем просрочку
                if (task.dueDate) {
                  const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
                  if (dueDate < new Date() && task.status !== 'done') {
                    overdueTasks++;
                  }
                }
              }
            }
          });
        }
      }

      setStats({ totalTasks, completedTasks, activeTasks, overdueTasks });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getAvatarColor = () => {
    if (!userData?.firstName) return bauhaus.blue;
    const colors = [bauhaus.blue, bauhaus.purple, bauhaus.teal, bauhaus.red];
    return colors[userData.firstName.charCodeAt(0) % colors.length];
  };

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  const isCurrentUser = userId === currentUser?.uid;

  return (
    <StackedDrawer
      open={open}
      onClose={onClose}
      title={userData ? `${userData.firstName} ${userData.lastName}` : 'Профиль'}
      id={drawerId}
      entityType="user"
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : !userData ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Пользователь не найден</Typography>
        </Box>
      ) : (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Контент */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {/* Profile Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                src={userData.avatar && !userData.avatar.startsWith('default-') ? userData.avatar : undefined}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: getAvatarColor(),
                  fontSize: '2rem',
                  fontWeight: 600,
                  margin: '0 auto',
                  mb: 1.5,
                }}
              >
                {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
              </Avatar>
              <Typography variant="h5" fontWeight="700">
                {userData.firstName} {userData.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {userData.position || 'Должность не указана'}
              </Typography>
              <Chip
                label={userData.role === 'admin' ? 'Администратор' : 'Пользователь'}
                size="small"
                color="primary"
                sx={{ mt: 1 }}
              />
            </Box>
            {/* Статистика */}
            <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Статистика задач
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: `${bauhaus.blue}10`, borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="700" color={bauhaus.blue}>
                    {stats.totalTasks}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Всего задач
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: `${bauhaus.teal}10`, borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="700" color={bauhaus.teal}>
                    {stats.completedTasks}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Выполнено
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: `${bauhaus.yellow}15`, borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#B8860B' }}>
                    {stats.activeTasks}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    В работе
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: `${bauhaus.red}10`, borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="700" color={bauhaus.red}>
                    {stats.overdueTasks}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Просрочено
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Выполнение
                  </Typography>
                  <Typography variant="caption" fontWeight="600">
                    {completionRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completionRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.100',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: completionRate === 100 ? bauhaus.teal : bauhaus.blue,
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            </Paper>

            {/* Контакты */}
            <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Контактная информация
              </Typography>

              <List sx={{ p: 0 }}>
                {/* Email */}
                <ListItem
                  sx={{ px: 0 }}
                  secondaryAction={
                    <Tooltip title={copiedField === 'email' ? 'Скопировано!' : 'Копировать'}>
                      <IconButton size="small" onClick={() => handleCopy(userData.email, 'email')}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Email sx={{ color: bauhaus.blue }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={userData.email}
                    secondary="Email"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>

                {/* Телефон */}
                {userData.contacts?.phone && (
                  <ListItem
                    sx={{ px: 0 }}
                    secondaryAction={
                      <Tooltip title={copiedField === 'phone' ? 'Скопировано!' : 'Копировать'}>
                        <IconButton size="small" onClick={() => handleCopy(userData.contacts.phone, 'phone')}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Phone sx={{ color: bauhaus.teal }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={userData.contacts.phone}
                      secondary="Телефон"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}

                {/* Telegram */}
                {userData.contacts?.telegram && (
                  <ListItem
                    sx={{ px: 0 }}
                    secondaryAction={
                      <Tooltip title="Открыть Telegram">
                        <IconButton
                          size="small"
                          component="a"
                          href={`https://t.me/${userData.contacts.telegram.replace('@', '')}`}
                          target="_blank"
                        >
                          <Telegram fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Telegram sx={{ color: '#0088cc' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={userData.contacts.telegram}
                      secondary="Telegram"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}

                {/* WhatsApp */}
                {userData.contacts?.whatsapp && (
                  <ListItem
                    sx={{ px: 0 }}
                    secondaryAction={
                      <Tooltip title="Открыть WhatsApp">
                        <IconButton
                          size="small"
                          component="a"
                          href={`https://wa.me/${userData.contacts.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                        >
                          <WhatsApp fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <WhatsApp sx={{ color: '#25D366' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={userData.contacts.whatsapp}
                      secondary="WhatsApp"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}
              </List>

              {!userData.contacts?.phone && !userData.contacts?.telegram && !userData.contacts?.whatsapp && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Дополнительные контакты не указаны
                </Typography>
              )}
            </Paper>

            {/* Ответственность */}
            {userData.responsibility && (
              <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Зона ответственности
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userData.responsibility}
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Действия */}
          {!isCurrentUser && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Stack direction="row" spacing={1}>
                {onAssignTask && (
                  <Button
                    variant="contained"
                    startIcon={<Assignment />}
                    onClick={() => onAssignTask(userId)}
                    sx={{ flex: 1, borderRadius: 50 }}
                  >
                    Назначить задачу
                  </Button>
                )}
                {onStartChat && (
                  <Button
                    variant="outlined"
                    startIcon={<Chat />}
                    onClick={() => onStartChat(userId)}
                    sx={{ borderRadius: 50 }}
                  >
                    Написать
                  </Button>
                )}
              </Stack>
            </Box>
          )}
        </Box>
      )}
    </StackedDrawer>
  );
}

export default UserProfileDrawer;
