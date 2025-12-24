// src/pages/admin/FeedbackAdminPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack,
  BugReport,
  Lightbulb,
  Help,
  Visibility,
  Close,
  Send,
  OpenInNew,
  Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../App';
import MainLayout from '../../components/Layout/MainLayout';
import feedbackService from '../../services/feedback.service';
import { useToast } from '../../contexts/ToastContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
  red: '#E53935',
  orange: '#FF9800',
  purple: '#7E57C2',
};

const typeConfig = {
  bug: { label: 'Баг', icon: <BugReport />, color: bauhaus.red },
  feature: { label: 'Идея', icon: <Lightbulb />, color: bauhaus.orange },
  question: { label: 'Вопрос', icon: <Help />, color: bauhaus.blue },
};

const statusConfig = {
  new: { label: 'Новый', color: 'info' },
  in_progress: { label: 'В работе', color: 'warning' },
  resolved: { label: 'Решён', color: 'success' },
  closed: { label: 'Закрыт', color: 'default' },
};

const priorityConfig = {
  low: { label: 'Низкий', color: 'default' },
  medium: { label: 'Средний', color: 'warning' },
  high: { label: 'Высокий', color: 'error' },
};

const categoryLabels = {
  ui: 'Интерфейс',
  backend: 'Функциональность',
  performance: 'Производительность',
  other: 'Другое',
};

function FeedbackAdminPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const toast = useToast();

  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    
    const filters = {};
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (typeFilter !== 'all') filters.type = typeFilter;

    const [feedbacksResult, statsResult] = await Promise.all([
      feedbackService.getAll(filters),
      feedbackService.getStats(),
    ]);

    if (feedbacksResult.success) {
      setFeedbacks(feedbacksResult.feedbacks);
    }
    if (statsResult.success) {
      setStats(statsResult.stats);
    }

    setLoading(false);
  };

  const handleOpenDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setResponse(feedback.response || '');
    setDetailsOpen(true);
  };

  const handleUpdateStatus = async (feedbackId, newStatus) => {
    const result = await feedbackService.updateStatus(feedbackId, newStatus, user.uid);
    if (result.success) {
      toast.success('Статус обновлён');
      loadData();
      if (selectedFeedback?.id === feedbackId) {
        setSelectedFeedback(prev => ({ ...prev, status: newStatus }));
      }
    } else {
      toast.error('Ошибка обновления статуса');
    }
  };

  const handleUpdatePriority = async (feedbackId, newPriority) => {
    const result = await feedbackService.updatePriority(feedbackId, newPriority);
    if (result.success) {
      toast.success('Приоритет обновлён');
      loadData();
      if (selectedFeedback?.id === feedbackId) {
        setSelectedFeedback(prev => ({ ...prev, priority: newPriority }));
      }
    } else {
      toast.error('Ошибка обновления приоритета');
    }
  };

  const handleRespond = async () => {
    if (!response.trim()) {
      toast.error('Введите ответ');
      return;
    }

    setSubmitting(true);
    const result = await feedbackService.respond(
      selectedFeedback.id,
      response.trim(),
      user.uid,
      user.displayName || `${user.firstName} ${user.lastName}`
    );

    if (result.success) {
      toast.success('Ответ отправлен');
      setDetailsOpen(false);
      loadData();
    } else {
      toast.error('Ошибка отправки ответа');
    }
    setSubmitting(false);
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Удалить этот отзыв?')) return;

    const result = await feedbackService.delete(feedbackId);
    if (result.success) {
      toast.success('Отзыв удалён');
      setDetailsOpen(false);
      loadData();
    } else {
      toast.error('Ошибка удаления');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = date instanceof Date ? date : new Date(date);
      return format(d, 'd MMM yyyy, HH:mm', { locale: ru });
    } catch {
      return '-';
    }
  };

  if (loading && feedbacks.length === 0) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="xl">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/users')}
          sx={{ mb: 3 }}
        >
          Назад
        </Button>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            💬 Обратная связь
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Управление отзывами пользователей
          </Typography>
        </Box>

        {/* Stats */}
        {stats && (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
            gap: 2, 
            mb: 4 
          }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={800} color="primary">
                  {stats.byStatus.new}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Новых
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={800} color={bauhaus.orange}>
                  {stats.byStatus.in_progress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  В работе
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={800} color={bauhaus.teal}>
                  {stats.byStatus.resolved}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Решено
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={800}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Filters */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Статус"
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="new">Новые</MenuItem>
              <MenuItem value="in_progress">В работе</MenuItem>
              <MenuItem value="resolved">Решённые</MenuItem>
              <MenuItem value="closed">Закрытые</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Тип</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Тип"
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="bug">Баги</MenuItem>
              <MenuItem value="feature">Идеи</MenuItem>
              <MenuItem value="question">Вопросы</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Table */}
        {feedbacks.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Нет отзывов для отображения
            </Typography>
          </Card>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>Тип</TableCell>
                  <TableCell>От кого</TableCell>
                  <TableCell>Заголовок</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Приоритет</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback.id} hover>
                    <TableCell>
                      <Chip
                        size="small"
                        icon={typeConfig[feedback.type]?.icon}
                        label={typeConfig[feedback.type]?.label}
                        sx={{
                          bgcolor: `${typeConfig[feedback.type]?.color}20`,
                          color: typeConfig[feedback.type]?.color,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={feedback.userAvatar} sx={{ width: 32, height: 32 }}>
                          {feedback.userName?.[0]}
                        </Avatar>
                        <Typography variant="body2">{feedback.userName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 200 }}>
                        {feedback.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {categoryLabels[feedback.category]}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={statusConfig[feedback.status]?.label}
                        color={statusConfig[feedback.status]?.color}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={priorityConfig[feedback.priority]?.label}
                        color={priorityConfig[feedback.priority]?.color}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(feedback.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDetails(feedback)}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {typeConfig[selectedFeedback?.type]?.icon}
                <Typography variant="h6" fontWeight={700}>
                  {selectedFeedback?.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setDetailsOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedFeedback && (
              <Box>
                {/* User info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar src={selectedFeedback.userAvatar} sx={{ width: 48, height: 48 }}>
                    {selectedFeedback.userName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {selectedFeedback.userName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedFeedback.userEmail} • {formatDate(selectedFeedback.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {/* Controls */}
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Статус</InputLabel>
                    <Select
                      value={selectedFeedback.status}
                      onChange={(e) => handleUpdateStatus(selectedFeedback.id, e.target.value)}
                      label="Статус"
                    >
                      <MenuItem value="new">Новый</MenuItem>
                      <MenuItem value="in_progress">В работе</MenuItem>
                      <MenuItem value="resolved">Решён</MenuItem>
                      <MenuItem value="closed">Закрыт</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Приоритет</InputLabel>
                    <Select
                      value={selectedFeedback.priority}
                      onChange={(e) => handleUpdatePriority(selectedFeedback.id, e.target.value)}
                      label="Приоритет"
                    >
                      <MenuItem value="low">Низкий</MenuItem>
                      <MenuItem value="medium">Средний</MenuItem>
                      <MenuItem value="high">Высокий</MenuItem>
                    </Select>
                  </FormControl>

                  <Chip
                    label={categoryLabels[selectedFeedback.category]}
                    variant="outlined"
                  />
                </Stack>

                {/* Description */}
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Описание
                </Typography>
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover', whiteSpace: 'pre-wrap' }}>
                  <Typography variant="body2">
                    {selectedFeedback.description}
                  </Typography>
                </Paper>

                {/* Screenshot */}
                {selectedFeedback.screenshot && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Скриншот
                    </Typography>
                    <Paper sx={{ p: 1, borderRadius: 2 }}>
                      <img
                        src={selectedFeedback.screenshot}
                        alt="Screenshot"
                        style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8 }}
                      />
                    </Paper>
                  </Box>
                )}

                {/* Page URL */}
                {selectedFeedback.pageUrl && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Страница
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<OpenInNew />}
                      href={selectedFeedback.pageUrl}
                      target="_blank"
                    >
                      {selectedFeedback.pageUrl}
                    </Button>
                  </Box>
                )}

                {/* Response */}
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Ответ пользователю
                </Typography>
                {selectedFeedback.response ? (
                  <Paper sx={{ p: 2, bgcolor: 'success.50', borderLeft: 4, borderColor: 'success.main' }}>
                    <Typography variant="body2">{selectedFeedback.response}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Ответил: {selectedFeedback.respondedByName} • {formatDate(selectedFeedback.respondedAt)}
                    </Typography>
                  </Paper>
                ) : (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Напишите ответ пользователю..."
                  />
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Button
              color="error"
              startIcon={<Delete />}
              onClick={() => handleDelete(selectedFeedback?.id)}
            >
              Удалить
            </Button>
            <Box>
              <Button onClick={() => setDetailsOpen(false)} sx={{ mr: 1 }}>
                Закрыть
              </Button>
              {!selectedFeedback?.response && (
                <Button
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                  onClick={handleRespond}
                  disabled={submitting || !response.trim()}
                >
                  Отправить ответ
                </Button>
              )}
            </Box>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}

export default FeedbackAdminPage;
