// src/pages/AssignmentReviewsPage.jsx
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
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Download,
  Visibility,
  Close,
  Send,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';
import { useToast } from '../contexts/ToastContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
  red: '#E53935',
  orange: '#FF9800',
};

const statusConfig = {
  pending: { label: 'На проверке', color: 'warning', icon: <HourglassEmpty /> },
  approved: { label: 'Принято', color: 'success', icon: <CheckCircle /> },
  rejected: { label: 'Отклонено', color: 'error', icon: <Cancel /> },
};

function AssignmentReviewsPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const toast = useToast();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    const result = await learningService.getPendingSubmissions();
    if (result.success) {
      setSubmissions(result.submissions);
    } else {
      toast.error('Ошибка загрузки заданий');
    }
    setLoading(false);
  };

  const handleOpenReview = (submission) => {
    setSelectedSubmission(submission);
    setFeedback('');
    setGrade('');
    setReviewDialogOpen(true);
  };

  const handleReview = async (status) => {
    if (!selectedSubmission) return;

    setSubmitting(true);
    const result = await learningService.reviewSubmission(
      selectedSubmission.lessonId,
      selectedSubmission.id,
      user.uid,
      status,
      feedback,
      grade ? parseInt(grade) : null
    );

    if (result.success) {
      toast.success(status === 'approved' ? 'Задание принято!' : 'Задание отклонено');
      setReviewDialogOpen(false);
      loadSubmissions();
    } else {
      toast.error('Ошибка при проверке задания');
    }
    setSubmitting(false);
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

  const filteredSubmissions = statusFilter === 'all'
    ? submissions
    : submissions.filter(s => s.status === statusFilter);

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

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
      <Container maxWidth="xl">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/learning/admin')}
          sx={{ mb: 3 }}
        >
          Назад к курсам
        </Button>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            📝 Проверка заданий
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Практические задания студентов на проверку
          </Typography>
        </Box>

        {/* Stats */}
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Card sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h3" fontWeight={800} color={bauhaus.orange}>
                {pendingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ожидают проверки
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h3" fontWeight={800} color={bauhaus.teal}>
                {submissions.filter(s => s.status === 'approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Принято
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h3" fontWeight={800} color={bauhaus.red}>
                {submissions.filter(s => s.status === 'rejected').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Отклонено
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={statusFilter}
            onChange={(e, val) => setStatusFilter(val)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab value="all" label={`Все (${submissions.length})`} />
            <Tab value="pending" label={`На проверке (${pendingCount})`} />
            <Tab value="approved" label={`Принято (${submissions.filter(s => s.status === 'approved').length})`} />
            <Tab value="rejected" label={`Отклонено (${submissions.filter(s => s.status === 'rejected').length})`} />
          </Tabs>
        </Box>

        {/* Table */}
        {filteredSubmissions.length === 0 ? (
          <Alert severity="info">Нет заданий для отображения</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>Студент</TableCell>
                  <TableCell>Курс / Урок</TableCell>
                  <TableCell>Файлы</TableCell>
                  <TableCell>Отправлено</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={submission.userAvatar} sx={{ width: 36, height: 36 }}>
                          {submission.userName?.[0]}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {submission.userName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {submission.courseName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {submission.lessonTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {submission.files?.map((file, idx) => (
                          <IconButton
                            key={idx}
                            size="small"
                            href={file.url}
                            target="_blank"
                            title={file.name}
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(submission.submittedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        icon={statusConfig[submission.status].icon}
                        label={statusConfig[submission.status].label}
                        color={statusConfig[submission.status].color}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleOpenReview(submission)}
                      >
                        {submission.status === 'pending' ? 'Проверить' : 'Просмотр'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Review Dialog */}
        <Dialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700}>
                Проверка задания
              </Typography>
              <IconButton onClick={() => setReviewDialogOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedSubmission && (
              <Box>
                {/* Student info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar src={selectedSubmission.userAvatar} sx={{ width: 48, height: 48 }}>
                    {selectedSubmission.userName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {selectedSubmission.userName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSubmission.courseName} → {selectedSubmission.lessonTitle}
                    </Typography>
                  </Box>
                </Box>

                {/* Files */}
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Загруженные файлы:
                </Typography>
                <Stack spacing={1} sx={{ mb: 3 }}>
                  {selectedSubmission.files?.map((file, idx) => (
                    <Paper key={idx} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Download color="primary" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {file.name}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        href={file.url}
                        target="_blank"
                      >
                        Скачать
                      </Button>
                    </Paper>
                  ))}
                </Stack>

                {/* Feedback form */}
                {selectedSubmission.status === 'pending' && (
                  <>
                    <TextField
                      label="Комментарий / Обратная связь"
                      multiline
                      rows={4}
                      fullWidth
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Напишите комментарий для студента..."
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Оценка (необязательно)"
                      type="number"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      inputProps={{ min: 0, max: 100 }}
                      sx={{ width: 200 }}
                    />
                  </>
                )}

                {/* Show existing feedback */}
                {selectedSubmission.status !== 'pending' && selectedSubmission.feedback && (
                  <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Комментарий:
                    </Typography>
                    <Typography variant="body2">
                      {selectedSubmission.feedback}
                    </Typography>
                    {selectedSubmission.grade !== null && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Оценка:</strong> {selectedSubmission.grade}
                      </Typography>
                    )}
                  </Paper>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            {selectedSubmission?.status === 'pending' && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => handleReview('rejected')}
                  disabled={submitting}
                >
                  Отклонить
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => handleReview('approved')}
                  disabled={submitting}
                >
                  Принять
                </Button>
              </>
            )}
            {selectedSubmission?.status !== 'pending' && (
              <Button onClick={() => setReviewDialogOpen(false)}>
                Закрыть
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}

export default AssignmentReviewsPage;
