import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
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
  Divider,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  Pending,
  Quiz,
} from '@mui/icons-material';
import { UserContext } from '../../App';
import learningService from '../../services/learning.service';
import { useToast } from '../../contexts/ToastContext';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
  yellow: '#FDD835',
  red: '#E53935',
};

function ExamResultsTab({ courseId, course }) {
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [grading, setGrading] = useState(false);
  const [editedPoints, setEditedPoints] = useState({});
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    if (courseId) {
      loadExams();
    }
  }, [courseId]);

  const loadExams = async () => {
    setLoading(true);
    const examsResult = await learningService.getCourseExams(courseId);
    if (examsResult.success) {
      setExams(examsResult.exams);
      if (examsResult.exams.length > 0) {
        handleSelectExam(examsResult.exams[0]);
      }
    }
    setLoading(false);
  };

  const handleSelectExam = async (exam) => {
    setSelectedExam(exam);
    setResultsLoading(true);
    const resultsData = await learningService.getExamResults(exam.id);
    if (resultsData.success) {
      setResults(resultsData.results);

      // Load user names for all unique user IDs in results
      const uniqueUserIds = [...new Set(resultsData.results.map(r => r.userId))];
      await loadUserNames(uniqueUserIds);
    }
    setResultsLoading(false);
  };

  const loadUserNames = async (userIds) => {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('../../config/firebase');

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

    // Initialize edited points with current values
    const initialPoints = {};
    result.questionResults?.forEach((qr, index) => {
      initialPoints[index] = qr.earnedPoints || 0;
    });
    setEditedPoints(initialPoints);
  };

  const handlePointsChange = (questionIndex, value) => {
    const numValue = parseFloat(value) || 0;
    const maxPoints = selectedResult.questionResults[questionIndex].points;

    setEditedPoints(prev => ({
      ...prev,
      [questionIndex]: Math.min(Math.max(0, numValue), maxPoints)
    }));
  };

  const handleSaveGrading = async () => {
    if (!selectedResult) return;

    setGrading(true);

    // Update question results with new points
    const updatedQuestionResults = selectedResult.questionResults.map((qr, index) => ({
      ...qr,
      earnedPoints: editedPoints[index] || 0,
      isCorrect: qr.type === 'text' ? null : qr.isCorrect, // Keep auto-graded status for non-text
    }));

    // Recalculate total score
    const newEarnedPoints = updatedQuestionResults.reduce((sum, qr) => sum + (qr.earnedPoints || 0), 0);
    const totalPoints = selectedResult.totalPoints;
    const scorePercentage = Math.round((newEarnedPoints / totalPoints) * 100);
    const passed = scorePercentage >= (selectedExam?.passingScore || 70);

    const updates = {
      questionResults: updatedQuestionResults,
      earnedPoints: newEarnedPoints,
      scorePercentage,
      passed,
    };

    const result = await learningService.updateExamResult(selectedResult.id, updates);

    if (result.success) {
      toast.success('Оценка сохранена');

      // Refresh results
      if (selectedExam) {
        const resultsData = await learningService.getExamResults(selectedExam.id);
        if (resultsData.success) {
          setResults(resultsData.results);

          // Update selected result
          const updated = resultsData.results.find(r => r.id === selectedResult.id);
          if (updated) {
            setSelectedResult(updated);
          }
        }
      }
    } else {
      toast.error('Ошибка сохранения оценки');
    }

    setGrading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('ru-RU');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (exams.length === 0) {
    return (
      <Card sx={{ p: 6, textAlign: 'center' }}>
        <Quiz sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Нет экзаменов для проверки
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Создайте экзамен во вкладке "Экзамены"
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Проверка результатов экзаменов
        </Typography>
        <TextField
          fullWidth
          select
          label="Выберите экзамен"
          value={selectedExam?.id || ''}
          onChange={(e) => {
            const exam = exams.find(ex => ex.id === e.target.value);
            if (exam) handleSelectExam(exam);
          }}
          sx={{ maxWidth: 500 }}
        >
          {exams.map((exam) => (
            <MenuItem key={exam.id} value={exam.id}>
              {exam.title} ({exam.questions?.length || 0} вопросов)
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {selectedExam && (
        <>
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

          {resultsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
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
          )}
        </>
      )}

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

              {selectedResult.questionResults?.map((qr, index) => {
                const requiresGrading = qr.type === 'text' || qr.isCorrect === null;

                return (
                  <Card key={index} variant="outlined" sx={{ bgcolor: requiresGrading ? '#FFF3E0' : 'transparent' }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Вопрос {index + 1}: {qr.question}
                        </Typography>
                        {requiresGrading && (
                          <Chip label="Требует проверки" color="warning" size="small" />
                        )}
                      </Stack>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Ответ студента:
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                          {Array.isArray(qr.userAnswer)
                            ? qr.userAnswer.join(', ')
                            : qr.userAnswer || 'Не отвечено'}
                        </Typography>
                      </Box>

                      {qr.isCorrect !== null && qr.correctAnswer && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Правильный ответ:
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5 }}>
                            {qr.correctAnswer}
                          </Typography>
                        </Box>
                      )}

                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                        {!requiresGrading && (
                          <Chip
                            label={qr.isCorrect ? 'Правильно' : 'Неправильно'}
                            color={qr.isCorrect ? 'success' : 'error'}
                            size="small"
                          />
                        )}

                        <TextField
                          label="Баллы"
                          type="number"
                          size="small"
                          value={editedPoints[index] || 0}
                          onChange={(e) => handlePointsChange(index, e.target.value)}
                          InputProps={{
                            inputProps: { min: 0, max: qr.points, step: 0.5 }
                          }}
                          sx={{ width: 100 }}
                        />

                        <Typography variant="caption" color="text.secondary">
                          из {qr.points}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Закрыть</Button>
          <Button
            variant="contained"
            onClick={handleSaveGrading}
            disabled={grading}
            startIcon={grading ? <CircularProgress size={20} color="inherit" /> : undefined}
            sx={{ background: 'linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)' }}
          >
            {grading ? 'Сохранение...' : 'Сохранить оценку'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ExamResultsTab;
