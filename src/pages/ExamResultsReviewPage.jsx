// src/pages/ExamResultsReviewPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  CheckCircle,
  Cancel,
  Pending,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';
import { useToast } from '../contexts/ToastContext';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
  yellow: '#FDD835',
  red: '#E53935',
};

function ExamResultsReviewPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    if (examId && user) {
      loadData();
    }
  }, [examId, user]);

  const loadData = async () => {
    setLoading(true);

    // Load exam
    const examResult = await learningService.getExam(examId);
    if (examResult.success) {
      setExam(examResult.exam);
    }

    // Load all results for this exam
    const resultsData = await learningService.getExamResults(examId);
    if (resultsData.success) {
      setResults(resultsData.results);

      // Load user names for all unique user IDs in results
      const uniqueUserIds = [...new Set(resultsData.results.map(r => r.userId))];
      await loadUserNames(uniqueUserIds);
    }

    setLoading(false);
  };

  const loadUserNames = async (userIds) => {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');

      const usersQuery = query(collection(db, 'users'), where('__name__', 'in', userIds));
      const usersSnapshot = await getDocs(usersQuery);

      const names = {};
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        names[doc.id] = userData.name || userData.email || 'Неизвестный пользователь';
      });

      setUserNames(names);
    } catch (error) {
      console.error('Error loading user names:', error);
    }
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setDetailDialogOpen(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('ru-RU');
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

  if (!exam) {
    return (
      <MainLayout>
        <Container>
          <Typography variant="h6" color="text.secondary">
            Экзамен не найден
          </Typography>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Назад
          </Button>

          <Typography variant="h4" fontWeight={800} gutterBottom>
            Результаты экзамена
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {exam.title}
          </Typography>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Всего попыток
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {results.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Сдали
                </Typography>
                <Typography variant="h5" fontWeight={700} color={bauhaus.teal}>
                  {results.filter(r => r.passed).length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Не сдали
                </Typography>
                <Typography variant="h5" fontWeight={700} color={bauhaus.red}>
                  {results.filter(r => !r.passed).length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Средний балл
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {results.length > 0
                    ? Math.round(results.reduce((sum, r) => sum + (r.scorePercentage || 0), 0) / results.length)
                    : 0}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell><strong>Студент</strong></TableCell>
                <TableCell><strong>Дата</strong></TableCell>
                <TableCell><strong>Баллы</strong></TableCell>
                <TableCell><strong>Результат</strong></TableCell>
                <TableCell><strong>Статус</strong></TableCell>
                <TableCell align="center"><strong>Действия</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Нет результатов
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{userNames[result.userId] || result.userId}</TableCell>
                    <TableCell>{formatDate(result.submittedAt)}</TableCell>
                    <TableCell>
                      {result.earnedPoints} / {result.totalPoints} ({result.scorePercentage}%)
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.passed ? 'Сдано' : 'Не сдано'}
                        color={result.passed ? 'success' : 'error'}
                        size="small"
                        icon={result.passed ? <CheckCircle /> : <Cancel />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          result.gradingStatus === 'graded'
                            ? 'Проверено'
                            : result.gradingStatus === 'pending'
                            ? 'На проверке'
                            : 'Автопроверка'
                        }
                        color={
                          result.gradingStatus === 'graded'
                            ? 'success'
                            : result.gradingStatus === 'pending'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                        icon={result.gradingStatus === 'pending' ? <Pending /> : undefined}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(result)}
                        sx={{ color: bauhaus.blue }}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Детали результата экзамена
          </DialogTitle>
          <DialogContent>
            {selectedResult && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Студент
                  </Typography>
                  <Typography variant="body1">{userNames[selectedResult.userId] || selectedResult.userId}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Дата отправки
                  </Typography>
                  <Typography variant="body1">{formatDate(selectedResult.submittedAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Результат
                  </Typography>
                  <Typography variant="body1">
                    {selectedResult.earnedPoints} / {selectedResult.totalPoints} баллов ({selectedResult.scorePercentage}%)
                  </Typography>
                </Box>

                <Divider />

                <Typography variant="h6" fontWeight={700}>
                  Ответы на вопросы
                </Typography>

                {selectedResult.questionResults?.map((qr, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Вопрос {index + 1}: {qr.question}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Ответ студента:
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                          {Array.isArray(qr.userAnswer)
                            ? qr.userAnswer.join(', ')
                            : qr.userAnswer || 'Не отвечено'}
                        </Typography>
                      </Box>
                      {qr.isCorrect !== null && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Правильный ответ:
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5 }}>
                            {qr.correctAnswer}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={
                            qr.isCorrect === true
                              ? 'Правильно'
                              : qr.isCorrect === false
                              ? 'Неправильно'
                              : 'Требует проверки'
                          }
                          color={
                            qr.isCorrect === true
                              ? 'success'
                              : qr.isCorrect === false
                              ? 'error'
                              : 'warning'
                          }
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                          {qr.earnedPoints} / {qr.points} баллов
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Закрыть</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}

export default ExamResultsReviewPage;
