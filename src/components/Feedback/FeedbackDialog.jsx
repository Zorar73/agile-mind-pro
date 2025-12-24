// src/components/Feedback/FeedbackDialog.jsx
import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import {
  Close,
  BugReport,
  Lightbulb,
  Help,
  Screenshot,
  Delete,
  Send,
  Warning,
  ErrorOutline,
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import { UserContext } from '../../App';
import feedbackService from '../../services/feedback.service';
import cloudinaryService from '../../services/cloudinary.service';
import { useToast } from '../../contexts/ToastContext';

const colors = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

const feedbackTypes = [
  { value: 'bug', label: 'Баг', icon: <BugReport />, color: colors.danger },
  { value: 'feature', label: 'Идея', icon: <Lightbulb />, color: colors.warning },
  { value: 'question', label: 'Вопрос', icon: <Help />, color: colors.primary },
];

const categories = [
  { value: 'ui', label: 'Интерфейс (UI)' },
  { value: 'backend', label: 'Функциональность' },
  { value: 'performance', label: 'Производительность' },
  { value: 'other', label: 'Другое' },
];

function FeedbackDialog({ open, onClose, criticalMode = false }) {
  const { user } = useContext(UserContext);
  const toast = useToast();

  const [type, setType] = useState(criticalMode ? 'bug' : 'bug');
  const [title, setTitle] = useState(criticalMode ? 'Критическая ошибка' : '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);

  // Сбор системной информации
  const collectSystemInfo = () => {
    const info = {
      // Браузер и ОС
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      
      // Экран
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      
      // Время и локация
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      
      // Память (если доступна)
      ...(navigator.deviceMemory && { deviceMemory: navigator.deviceMemory + ' GB' }),
      ...(navigator.hardwareConcurrency && { cpuCores: navigator.hardwareConcurrency }),
      
      // Соединение (если доступно)
      ...(navigator.connection && {
        connectionType: navigator.connection.effectiveType,
        connectionDownlink: navigator.connection.downlink + ' Mbps',
      }),
      
      // Данные пользователя
      userId: user?.uid,
      userRole: user?.role || user?.roleName,
      
      // Local Storage (размер)
      localStorageSize: Object.keys(localStorage).length + ' items',
      
      // Консольные ошибки (последние)
      consoleErrors: window.__consoleErrors || [],
    };

    return info;
  };

  const handleClose = () => {
    setType('bug');
    setTitle('');
    setDescription('');
    setCategory('other');
    setScreenshot(null);
    setScreenshotPreview(null);
    setSystemInfo(null);
    onClose();
  };

  const handleCriticalReport = async () => {
    setCapturing(true);
    
    // Собираем системную информацию
    const sysInfo = collectSystemInfo();
    setSystemInfo(sysInfo);
    
    // Захватываем скриншот
    const dialogElement = document.querySelector('[role="dialog"]');
    if (dialogElement) {
      dialogElement.style.display = 'none';
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        logging: false,
      });

      if (dialogElement) {
        dialogElement.style.display = '';
      }

      canvas.toBlob(async (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          setScreenshotPreview(previewUrl);

          const file = new File([blob], 'critical_screenshot.png', { type: 'image/png' });
          const uploadResult = await cloudinaryService.upload(file, {
            folder: 'feedback/critical',
            resourceType: 'image',
          });

          if (uploadResult.success) {
            setScreenshot(uploadResult.url);
          }
        }
        setCapturing(false);
      }, 'image/png');
    } catch (error) {
      if (dialogElement) {
        dialogElement.style.display = '';
      }
      setCapturing(false);
    }

    // Автозаполняем описание системной информацией
    const formattedInfo = `
=== СИСТЕМНАЯ ИНФОРМАЦИЯ ===
Браузер: ${sysInfo.userAgent}
Платформа: ${sysInfo.platform}
Язык: ${sysInfo.language}
Онлайн: ${sysInfo.onLine ? 'Да' : 'Нет'}

=== ЭКРАН ===
Разрешение: ${sysInfo.screenWidth}x${sysInfo.screenHeight}
Окно: ${sysInfo.windowWidth}x${sysInfo.windowHeight}
DPI: ${sysInfo.devicePixelRatio}

=== УСТРОЙСТВО ===
${sysInfo.deviceMemory ? `Память: ${sysInfo.deviceMemory}` : ''}
${sysInfo.cpuCores ? `Ядра CPU: ${sysInfo.cpuCores}` : ''}
${sysInfo.connectionType ? `Соединение: ${sysInfo.connectionType} (${sysInfo.connectionDownlink})` : ''}

=== КОНТЕКСТ ===
Страница: ${sysInfo.pageUrl}
Время: ${sysInfo.timestamp}
Часовой пояс: ${sysInfo.timezone}
Пользователь: ${sysInfo.userId}
Роль: ${sysInfo.userRole}

=== ОПИСАНИЕ ПРОБЛЕМЫ ===
`;
    setDescription(formattedInfo);
    setTitle('🚨 Критическая ошибка');
    setType('bug');
    setCategory('other');
  };

  const handleCaptureScreen = async () => {
    setCapturing(true);
    
    const dialogElement = document.querySelector('[role="dialog"]');
    if (dialogElement) {
      dialogElement.style.display = 'none';
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        logging: false,
      });

      if (dialogElement) {
        dialogElement.style.display = '';
      }

      canvas.toBlob(async (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          setScreenshotPreview(previewUrl);

          const file = new File([blob], 'screenshot.png', { type: 'image/png' });
          const uploadResult = await cloudinaryService.upload(file, {
            folder: 'feedback',
            resourceType: 'image',
          });

          if (uploadResult.success) {
            setScreenshot(uploadResult.url);
            toast.success('Скриншот захвачен');
          } else {
            toast.error('Ошибка загрузки скриншота');
          }
        }
        setCapturing(false);
      }, 'image/png');
    } catch (error) {
      if (dialogElement) {
        dialogElement.style.display = '';
      }
      toast.error('Ошибка захвата экрана');
      setCapturing(false);
    }
  };

  const handleRemoveScreenshot = () => {
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
    }
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Введите заголовок');
      return;
    }

    if (!description.trim()) {
      toast.error('Введите описание');
      return;
    }

    setSubmitting(true);

    const feedbackData = {
      type,
      title: title.trim(),
      description: description.trim(),
      category,
      screenshot,
      pageUrl: window.location.href,
      isCritical: title.includes('Критическая'),
      systemInfo: systemInfo,
    };

    const result = await feedbackService.create(feedbackData, user);

    if (result.success) {
      toast.success('Спасибо за отзыв! Мы рассмотрим его в ближайшее время.');
      handleClose();
    } else {
      toast.error('Ошибка отправки отзыва');
    }

    setSubmitting(false);
  };

  const currentType = feedbackTypes.find(t => t.value === type);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            💬 Обратная связь
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Critical Error Button */}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<ErrorOutline />}
          onClick={handleCriticalReport}
          disabled={capturing}
          sx={{
            mb: 3,
            py: 1.5,
            borderStyle: 'dashed',
            borderWidth: 2,
            '&:hover': {
              borderStyle: 'solid',
              bgcolor: 'error.50',
            },
          }}
        >
          {capturing ? 'Сбор информации...' : '🚨 Сообщить о критической ошибке'}
        </Button>

        {/* Tabs для типа */}
        <Tabs
          value={type}
          onChange={(e, val) => setType(val)}
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          {feedbackTypes.map((t) => (
            <Tab
              key={t.value}
              value={t.value}
              icon={t.icon}
              label={t.label}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: t.color,
                },
              }}
            />
          ))}
        </Tabs>

        {/* Подсказка по типу */}
        <Alert 
          severity={type === 'bug' ? 'error' : type === 'feature' ? 'warning' : 'info'}
          sx={{ mb: 3 }}
        >
          {type === 'bug' && 'Опишите проблему как можно подробнее: что делали, что ожидали, что произошло.'}
          {type === 'feature' && 'Расскажите, какую функцию хотели бы видеть и зачем она нужна.'}
          {type === 'question' && 'Задайте свой вопрос, и мы постараемся помочь.'}
        </Alert>

        {/* Форма */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            placeholder={
              type === 'bug' ? 'Кратко опишите проблему' :
              type === 'feature' ? 'Название функции' :
              'Тема вопроса'
            }
          />

          <TextField
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            multiline
            rows={6}
            placeholder={
              type === 'bug' ? 'Шаги для воспроизведения:\n1. ...\n2. ...\n\nОжидаемое поведение: ...\nФактическое поведение: ...' :
              type === 'feature' ? 'Подробно опишите функцию и почему она будет полезна...' :
              'Подробно опишите ваш вопрос...'
            }
          />

          <FormControl fullWidth>
            <InputLabel>Категория</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Категория"
            >
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Скриншот */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Скриншот (опционально)
            </Typography>
            
            {screenshotPreview ? (
              <Paper
                sx={{
                  p: 1,
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  style={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 8,
                  }}
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveScreenshot}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'error.light', color: 'white' },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Paper>
            ) : (
              <Button
                variant="outlined"
                startIcon={capturing ? <CircularProgress size={20} /> : <Screenshot />}
                onClick={handleCaptureScreen}
                disabled={capturing}
                fullWidth
              >
                {capturing ? 'Захват...' : 'Захватить экран'}
              </Button>
            )}
          </Box>

          {/* System Info Indicator */}
          {systemInfo && (
            <Alert severity="info" icon={<Warning />}>
              Системная информация собрана и будет отправлена вместе с отчётом
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={submitting}>
          Отмена
        </Button>
        <Button
          variant="contained"
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || !description.trim()}
          sx={{
            background: `linear-gradient(135deg, ${currentType?.color || colors.primary} 0%, ${colors.primary} 100%)`,
          }}
        >
          {submitting ? 'Отправка...' : 'Отправить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FeedbackDialog;
