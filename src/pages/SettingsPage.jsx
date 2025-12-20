// src/pages/SettingsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  Snackbar,
  IconButton,
  useTheme,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Notifications,
  Email,
  ViewKanban,
  Assignment,
  CalendarToday,
  Language,
  Storage,
  Security,
  Info,
  Check,
  Warning,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import { useThemeMode } from '../contexts/ThemeContext';
import { gradients } from '../theme';
import soundNotifications from '../utils/soundNotifications';
import browserPush from '../utils/browserPushNotifications';
import { VolumeUp, VolumeOff } from '@mui/icons-material';

// Сохранение настроек в localStorage
const SETTINGS_KEY = 'app_settings';

const defaultSettings = {
  // Внешний вид
  theme: 'system', // light, dark, system
  compactMode: false,

  // Уведомления
  emailNotifications: true,
  pushNotifications: true,
  taskReminders: true,
  teamUpdates: true,
  weeklyDigest: false,
  soundNotifications: true, // Звуковые уведомления
  soundVolume: 0.3, // 30% громкости

  // Детальные настройки Email (для будущей реализации)
  emailSettings: {
    newTasks: true,           // Новые назначенные задачи
    comments: true,           // Комментарии к задачам
    mentions: true,           // Упоминания
    deadlines: true,          // Приближающиеся дедлайны
    boardInvitations: true,   // Приглашения на доски
    teamUpdates: true,        // Обновления команды
    weeklyDigest: false,      // Еженедельная сводка
  },
  
  // Задачи
  defaultTaskView: 'kanban', // kanban, list, table, cards
  defaultPriority: 'normal',
  autoArchiveDays: 30, // 0 = отключено
  showCompletedTasks: true,
  
  // Календарь
  calendarStartDay: 1, // 0 = воскресенье, 1 = понедельник
  defaultCalendarView: 'month', // day, week, month
  
  // Язык
  language: 'ru',
};

function SettingsPage() {
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const { mode, setMode } = useThemeMode();
  const isDark = theme.palette.mode === 'dark';
  
  const [settings, setSettings] = useState(defaultSettings);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hasChanges, setHasChanges] = useState(false);
  const [emailDetailsExpanded, setEmailDetailsExpanded] = useState(false);

  // Загрузка настроек
  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  // Синхронизация темы
  useEffect(() => {
    if (settings.theme !== mode) {
      setSettings(prev => ({ ...prev, theme: mode }));
    }
  }, [mode]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);

    // Немедленно применяем некоторые настройки
    if (key === 'theme') {
      setMode(value);
    } else if (key === 'soundNotifications') {
      soundNotifications.setEnabled(value);
    } else if (key === 'soundVolume') {
      soundNotifications.setVolume(value);
      // Воспроизводим звук для тестирования громкости
      soundNotifications.notification();
    } else if (key === 'pushNotifications') {
      // Асинхронно запрашиваем разрешение если включаем
      browserPush.setEnabled(value).then(result => {
        if (!result.success) {
          // Если не удалось - откатываем настройку
          setSettings(prev => ({ ...prev, pushNotifications: false }));
          setSnackbar({
            open: true,
            message: 'Не удалось включить push уведомления. Проверьте разрешения браузера.',
            severity: 'error',
          });
        }
      });
    }
  };

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setHasChanges(false);
    setSnackbar({ open: true, message: 'Настройки сохранены', severity: 'success' });
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setMode('system');
    localStorage.removeItem(SETTINGS_KEY);
    setHasChanges(false);
    setSnackbar({ open: true, message: 'Настройки сброшены', severity: 'info' });
  };

  return (
    <MainLayout>
      {/* Заголовок */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Настройки
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Персонализируйте приложение под себя
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Внешний вид */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {isDark ? <DarkMode color="primary" /> : <LightMode color="primary" />}
              <Typography variant="h6" fontWeight="600">
                Внешний вид
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  {settings.theme === 'dark' ? <DarkMode /> : <LightMode />}
                </ListItemIcon>
                <ListItemText 
                  primary="Тема оформления" 
                  secondary="Выберите светлую, тёмную или системную тему"
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                    >
                      <MenuItem value="light">☀️ Светлая</MenuItem>
                      <MenuItem value="dark">🌙 Тёмная</MenuItem>
                      <MenuItem value="system">🖥️ Системная</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Компактный режим" 
                  secondary="Уменьшенные отступы для большей информации на экране"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.compactMode}
                    onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Уведомления */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Notifications color="primary" />
              <Typography variant="h6" fontWeight="600">
                Уведомления
              </Typography>
              <Chip label="Требует бэкенд" size="small" color="warning" variant="outlined" />
            </Box>
            
            <List>
              <ListItem>
                <ListItemIcon><Email /></ListItemIcon>
                <ListItemText
                  primary="Email уведомления"
                  secondary="Получать уведомления на почту"
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => setEmailDetailsExpanded(!emailDetailsExpanded)}
                      disabled={!settings.emailNotifications}
                    >
                      {emailDetailsExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>

              {/* Детальные настройки Email */}
              <Collapse in={emailDetailsExpanded && settings.emailNotifications}>
                <Box sx={{ pl: { xs: 2, sm: 7 }, pr: 2, pb: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Выберите типы уведомлений:
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={settings.emailSettings?.newTasks ?? true}
                        onChange={(e) => handleSettingChange('emailSettings', {
                          ...settings.emailSettings,
                          newTasks: e.target.checked,
                        })}
                      />
                    }
                    label="Новые назначенные задачи"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={settings.emailSettings?.comments ?? true}
                        onChange={(e) => handleSettingChange('emailSettings', {
                          ...settings.emailSettings,
                          comments: e.target.checked,
                        })}
                      />
                    }
                    label="Комментарии к задачам"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={settings.emailSettings?.mentions ?? true}
                        onChange={(e) => handleSettingChange('emailSettings', {
                          ...settings.emailSettings,
                          mentions: e.target.checked,
                        })}
                      />
                    }
                    label="Упоминания (@user)"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={settings.emailSettings?.deadlines ?? true}
                        onChange={(e) => handleSettingChange('emailSettings', {
                          ...settings.emailSettings,
                          deadlines: e.target.checked,
                        })}
                      />
                    }
                    label="Приближающиеся дедлайны"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={settings.emailSettings?.boardInvitations ?? true}
                        onChange={(e) => handleSettingChange('emailSettings', {
                          ...settings.emailSettings,
                          boardInvitations: e.target.checked,
                        })}
                      />
                    }
                    label="Приглашения на доски"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={settings.emailSettings?.weeklyDigest ?? false}
                        onChange={(e) => handleSettingChange('emailSettings', {
                          ...settings.emailSettings,
                          weeklyDigest: e.target.checked,
                        })}
                      />
                    }
                    label="Еженедельная сводка"
                  />
                </Box>
              </Collapse>

              <Divider component="li" />

              <ListItem>
                <ListItemIcon><Notifications /></ListItemIcon>
                <ListItemText
                  primary="Push уведомления"
                  secondary={
                    browserPush.isSupported()
                      ? browserPush.hasPermission()
                        ? "Разрешение получено"
                        : "Требуется разрешение браузера"
                      : "Не поддерживается браузером"
                  }
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    disabled={!browserPush.isSupported()}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon><Assignment /></ListItemIcon>
                <ListItemText 
                  primary="Напоминания о задачах" 
                  secondary="Напоминать о приближающихся дедлайнах"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.taskReminders}
                    onChange={(e) => handleSettingChange('taskReminders', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon><Email /></ListItemIcon>
                <ListItemText
                  primary="Еженедельный дайджест"
                  secondary="Сводка активности за неделю"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.weeklyDigest}
                    onChange={(e) => handleSettingChange('weeklyDigest', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <Divider component="li" />

              <ListItem>
                <ListItemIcon>{settings.soundNotifications ? <VolumeUp /> : <VolumeOff />}</ListItemIcon>
                <ListItemText
                  primary="Звуковые уведомления"
                  secondary="Воспроизводить звук при получении уведомлений"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.soundNotifications}
                    onChange={(e) => handleSettingChange('soundNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>

              {settings.soundNotifications && (
                <ListItem>
                  <ListItemText
                    primary="Громкость звуков"
                    secondary={`${Math.round(settings.soundVolume * 100)}%`}
                    sx={{ pl: { xs: 2, sm: 7 } }}
                  />
                  <ListItemSecondaryAction sx={{ width: { xs: '100%', sm: 200 }, pr: 2, position: { xs: 'relative', sm: 'absolute' }, mt: { xs: 2, sm: 0 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VolumeOff fontSize="small" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.soundVolume * 100}
                        onChange={(e) => handleSettingChange('soundVolume', e.target.value / 100)}
                        style={{ flex: 1 }}
                      />
                      <VolumeUp fontSize="small" />
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>

        {/* Задачи */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Assignment color="primary" />
              <Typography variant="h6" fontWeight="600">
                Задачи
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemIcon><ViewKanban /></ListItemIcon>
                <ListItemText 
                  primary="Вид по умолчанию" 
                  secondary="При открытии списка задач"
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={settings.defaultTaskView}
                      onChange={(e) => handleSettingChange('defaultTaskView', e.target.value)}
                    >
                      <MenuItem value="kanban">Канбан</MenuItem>
                      <MenuItem value="list">Список</MenuItem>
                      <MenuItem value="table">Таблица</MenuItem>
                      <MenuItem value="cards">Карточки</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Приоритет по умолчанию" 
                  secondary="Для новых задач"
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={settings.defaultPriority}
                      onChange={(e) => handleSettingChange('defaultPriority', e.target.value)}
                    >
                      <MenuItem value="low">Низкий</MenuItem>
                      <MenuItem value="normal">Обычный</MenuItem>
                      <MenuItem value="high">Высокий</MenuItem>
                      <MenuItem value="urgent">Срочный</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon><Storage /></ListItemIcon>
                <ListItemText 
                  primary="Автоархивация" 
                  secondary="Архивировать выполненные задачи через N дней (0 = отключено)"
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      value={settings.autoArchiveDays}
                      onChange={(e) => handleSettingChange('autoArchiveDays', e.target.value)}
                    >
                      <MenuItem value={0}>Отключено</MenuItem>
                      <MenuItem value={7}>7 дней</MenuItem>
                      <MenuItem value={14}>14 дней</MenuItem>
                      <MenuItem value={30}>30 дней</MenuItem>
                      <MenuItem value={60}>60 дней</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Показывать выполненные" 
                  secondary="Отображать завершённые задачи в списках"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.showCompletedTasks}
                    onChange={(e) => handleSettingChange('showCompletedTasks', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Календарь */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarToday color="primary" />
              <Typography variant="h6" fontWeight="600">
                Календарь
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Начало недели" 
                  secondary="Первый день недели в календаре"
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={settings.calendarStartDay}
                      onChange={(e) => handleSettingChange('calendarStartDay', e.target.value)}
                    >
                      <MenuItem value={1}>Понедельник</MenuItem>
                      <MenuItem value={0}>Воскресенье</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Масштаб по умолчанию" 
                  secondary="При открытии календаря"
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={settings.defaultCalendarView}
                      onChange={(e) => handleSettingChange('defaultCalendarView', e.target.value)}
                    >
                      <MenuItem value="day">День</MenuItem>
                      <MenuItem value="week">Неделя</MenuItem>
                      <MenuItem value="month">Месяц</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Язык */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Language color="primary" />
              <Typography variant="h6" fontWeight="600">
                Язык
              </Typography>
              <Chip label="Скоро" size="small" color="info" variant="outlined" />
            </Box>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Язык интерфейса" 
                  secondary="Выберите язык приложения"
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                      <MenuItem value="ru">🇷🇺 Русский</MenuItem>
                      <MenuItem value="en" disabled>🇬🇧 English (скоро)</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Кнопки */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          gap: 2,
          justifyContent: 'flex-end'
        }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{ borderRadius: 50, width: { xs: '100%', sm: 'auto' } }}
          >
            Сбросить
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!hasChanges}
            startIcon={<Check />}
            sx={{ borderRadius: 50, px: 4, width: { xs: '100%', sm: 'auto' } }}
          >
            Сохранить
          </Button>
        </Box>

        {/* Информация */}
        <Alert severity="info" icon={<Info />}>
          Некоторые настройки (email, push уведомления, автоархивация) требуют настройки бэкенда
          и будут работать после его подключения. Настройки темы и интерфейса применяются сразу.
        </Alert>
      </Stack>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

export default SettingsPage;
