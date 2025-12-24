// src/pages/MyFeedbackPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Container, Typography, Card, Button, Chip, Paper,
  CircularProgress, TextField, Stack, Badge, alpha, useTheme,
} from '@mui/material';
import {
  ArrowBack, BugReport, Lightbulb, Help, Send,
  CheckCircle, Schedule, Close, SupportAgent,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import feedbackService from '../services/feedback.service';
import { useToast } from '../contexts/ToastContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const colors = {
  primary: '#3B82F6', success: '#10B981', warning: '#F59E0B',
  danger: '#EF4444', info: '#06B6D4',
};

const typeConfig = {
  bug: { label: 'Баг', icon: <BugReport />, color: colors.danger },
  feature: { label: 'Идея', icon: <Lightbulb />, color: colors.warning },
  question: { label: 'Вопрос', icon: <Help />, color: colors.primary },
};

const statusConfig = {
  new: { label: 'Отправлено', color: colors.info },
  in_progress: { label: 'В работе', color: colors.warning },
  resolved: { label: 'Решено', color: colors.success },
  closed: { label: 'Закрыто', color: 'grey' },
};

function MyFeedbackPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const toast = useToast();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    loadFeedbacks();
  }, [user?.uid]);

  const loadFeedbacks = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const result = await feedbackService.getUserFeedbacks(user.uid);
    if (result.success) {
      setFeedbacks(result.feedbacks);
      if (result.feedbacks.length > 0) setSelectedFeedback(result.feedbacks[0]);
    }
    setLoading(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = date instanceof Date ? date : new Date(date);
      return format(d, 'd MMM, HH:mm', { locale: ru });
    } catch { return ''; }
  };

  if (loading) {
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
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>Назад</Button>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>💬 Мои обращения</Typography>
          <Typography variant="body1" color="text.secondary">Просматривайте статус и ответы</Typography>
        </Box>

        {feedbacks.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <SupportAgent sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>Нет обращений</Typography>
            <Typography variant="body2" color="text.secondary">
              Нажмите кнопку "Обратная связь" внизу экрана
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '350px 1fr' }, gap: 3, minHeight: '60vh' }}>
            {/* List */}
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={600}>Обращения ({feedbacks.length})</Typography>
              </Box>
              <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 400px)' }}>
                {feedbacks.map((fb) => (
                  <Box
                    key={fb.id}
                    onClick={() => setSelectedFeedback(fb)}
                    sx={{
                      p: 2, cursor: 'pointer', borderBottom: 1, borderColor: 'divider',
                      bgcolor: selectedFeedback?.id === fb.id ? alpha(colors.primary, 0.08) : 'transparent',
                      '&:hover': { bgcolor: alpha(colors.primary, 0.04) },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha(typeConfig[fb.type]?.color, 0.12), color: typeConfig[fb.type]?.color }}>
                        {typeConfig[fb.type]?.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>{fb.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatDate(fb.createdAt)}</Typography>
                      </Box>
                      {fb.response && <Badge badgeContent="!" color="success" />}
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Chip size="small" label={statusConfig[fb.status]?.label}
                        sx={{ height: 22, fontSize: '0.7rem', bgcolor: alpha(statusConfig[fb.status]?.color || 'grey', 0.12), color: statusConfig[fb.status]?.color }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>

            {/* Chat */}
            <Card sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
              {selectedFeedback && (
                <>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(typeConfig[selectedFeedback.type]?.color, 0.12), color: typeConfig[selectedFeedback.type]?.color }}>
                        {typeConfig[selectedFeedback.type]?.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>{selectedFeedback.title}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={statusConfig[selectedFeedback.status]?.label}
                            sx={{ height: 20, fontSize: '0.7rem', bgcolor: alpha(statusConfig[selectedFeedback.status]?.color || 'grey', 0.12), color: statusConfig[selectedFeedback.status]?.color }} />
                          <Typography variant="caption" color="text.secondary">{formatDate(selectedFeedback.createdAt)}</Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {/* User message */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <Paper sx={{ p: 2, maxWidth: '80%', borderRadius: 3, borderTopRightRadius: 0, bgcolor: colors.primary, color: 'white' }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selectedFeedback.description}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1, textAlign: 'right' }}>{formatDate(selectedFeedback.createdAt)}</Typography>
                      </Paper>
                    </Box>

                    {selectedFeedback.screenshot && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Paper sx={{ p: 1, maxWidth: '80%', borderRadius: 2 }}>
                          <img src={selectedFeedback.screenshot} alt="Screenshot" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }} />
                        </Paper>
                      </Box>
                    )}

                    {/* Admin response */}
                    {selectedFeedback.response && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                        <Paper sx={{ p: 2, maxWidth: '80%', borderRadius: 3, borderTopLeftRadius: 0, bgcolor: isDark ? 'grey.800' : 'grey.100' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <SupportAgent fontSize="small" color="primary" />
                            <Typography variant="caption" fontWeight={600} color="primary">
                              {selectedFeedback.respondedByName || 'Администратор'}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selectedFeedback.response}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            {formatDate(selectedFeedback.respondedAt)}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    {!selectedFeedback.response && selectedFeedback.status !== 'closed' && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Schedule sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">Ожидайте ответа администратора</Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Card>
          </Box>
        )}
      </Container>
    </MainLayout>
  );
}

export default MyFeedbackPage;
