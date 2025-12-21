// src/pages/ExamResultPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Quiz,
  EmojiEvents,
  Warning,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
  red: '#E53935',
  yellow: '#FDD835',
};

function ExamResultPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { user } = useContext(UserContext);
  const [exam, setExam] = useState(null);
  const [course, setCourse] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [allAttempts, setAllAttempts] = useState([]);

  useEffect(() => {
    if (examId && user) {
      loadResultData();
    }
  }, [examId, user]);

  const loadResultData = async () => {
    setLoading(true);

    // Load exam
    const examResult = await learningService.getExam(examId);
    if (examResult.success) {
      setExam(examResult.exam);

      // Load course if linked
      if (examResult.exam.courseId) {
        const courseResult = await learningService.getCourse(examResult.exam.courseId);
        if (courseResult.success) {
          setCourse(courseResult.course);
        }
      }
    }

    // Load user result (latest attempt)
    const userResult = await learningService.getUserExamResult(user.uid, examId);
    if (userResult.success && userResult.result) {
      setResult(userResult.result);
    }

    // Load all user attempts
    const attemptsResult = await learningService.getUserExamAttempts(user.uid, examId);
    if (attemptsResult.success) {
      setAllAttempts(attemptsResult.attempts);
      setTotalAttempts(attemptsResult.totalAttempts);
    }

    setLoading(false);
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

  if (!exam || !result) {
    return (
      <MainLayout>
        <Container>
          <Typography variant="h6" color="text.secondary">
            Результаты не найдены
          </Typography>
        </Container>
      </MainLayout>
    );
  }

  const isPending = result.gradingStatus === 'pending';
  const passed = result.passed;

  return (
    <MainLayout>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(course ? `/learning/course/${course.id}` : '/learning')}
            sx={{ mb: 2 }}
          >
            Вернуться к курсу
          </Button>
        </Box>

        {/* Result Header */}
        <Card
          sx={{
            borderRadius: 3,
            mb: 3,
            background: isPending
              ? `linear-gradient(135deg, ${bauhaus.yellow}15 0%, ${bauhaus.yellow}05 100%)`
              : passed
              ? `linear-gradient(135deg, ${bauhaus.teal}15 0%, ${bauhaus.teal}05 100%)`
              : `linear-gradient(135deg, ${bauhaus.red}15 0%, ${bauhaus.red}05 100%)`,
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {isPending ? (
              <HourglassEmpty sx={{ fontSize: 80, color: bauhaus.yellow, mb: 2 }} />
            ) : passed ? (
              <EmojiEvents sx={{ fontSize: 80, color: bauhaus.teal, mb: 2 }} />
            ) : (
              <Warning sx={{ fontSize: 80, color: bauhaus.red, mb: 2 }} />
            )}

            <Typography variant="h4" fontWeight={800} gutterBottom>
              {exam.title}
            </Typography>

            {isPending ? (
              <>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Ожидает проверки
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Ваши ответы отправлены. Преподаватель проверит открытые вопросы и выставит итоговую оценку.
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{ color: passed ? bauhaus.teal : bauhaus.red, mb: 1 }}
                >
                  {result.scorePercentage}%
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {passed ? 'Экзамен сдан!' : 'Экзамен не сдан'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Проходной балл: {exam.passingScore}%
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Баллов набрано
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {result.earnedPoints} / {result.totalPoints}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Вопросов отвечено
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {Object.keys(result.answers || {}).length} / {exam.questions.length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Попытка
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {totalAttempts}
                {exam.maxAttempts ? ` / ${exam.maxAttempts}` : ''}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Дата сдачи
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {new Date(result.submittedAt).toLocaleDateString('ru-RU')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Detailed Results */}
        {!isPending && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Детализация по вопросам
              </Typography>

              <List>
                {result.questionResults?.map((qResult, index) => {
                  const question = exam.questions.find(q => q.id === qResult.questionId);
                  if (!question) return null;

                  const isCorrect = qResult.isCorrect;
                  const isText = question.type === 'text';

                  return (
                    <React.Fragment key={qResult.questionId}>
                      {index > 0 && <Divider />}
                      <ListItem
                        sx={{
                          py: 2,
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, width: '100%' }}>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
                            {index + 1}. {qResult.question}
                          </Typography>
                          {isText ? (
                            <Chip
                              label="Текстовый ответ"
                              size="small"
                              color="default"
                              variant="outlined"
                            />
                          ) : isCorrect ? (
                            <Chip
                              icon={<CheckCircle />}
                              label="Правильно"
                              size="small"
                              sx={{
                                bgcolor: bauhaus.teal,
                                color: 'white',
                                '& .MuiChip-icon': { color: 'white' },
                              }}
                            />
                          ) : (
                            <Chip
                              icon={<Cancel />}
                              label="Неправильно"
                              size="small"
                              sx={{
                                bgcolor: bauhaus.red,
                                color: 'white',
                                '& .MuiChip-icon': { color: 'white' },
                              }}
                            />
                          )}
                          <Chip
                            label={`${qResult.earnedPoints}/${qResult.points}`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>

                        {question.type === 'single' && (
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Ваш ответ: {question.options[parseInt(qResult.userAnswer) - 1] || 'Не отвечено'}
                            </Typography>
                            {!isCorrect && qResult.correctAnswer && (
                              <Typography variant="body2" sx={{ color: bauhaus.teal }}>
                                Правильный ответ: {question.options[parseInt(qResult.correctAnswer) - 1]}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {question.type === 'multiple' && (
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Ваши ответы:{' '}
                              {Array.isArray(qResult.userAnswer) && qResult.userAnswer.length > 0
                                ? qResult.userAnswer.map(a => question.options[parseInt(a) - 1]).join(', ')
                                : 'Не отвечено'}
                            </Typography>
                            {!isCorrect && qResult.correctAnswer && (
                              <Typography variant="body2" sx={{ color: bauhaus.teal }}>
                                Правильные ответы:{' '}
                                {qResult.correctAnswer
                                  .split(',')
                                  .map(a => question.options[parseInt(a.trim()) - 1])
                                  .join(', ')}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {question.type === 'text' && (
                          <Box sx={{ width: '100%' }}>
                            <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                              <Typography variant="body2">
                                {qResult.userAnswer || 'Не отвечено'}
                              </Typography>
                            </Paper>
                          </Box>
                        )}
                      </ListItem>
                    </React.Fragment>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Pending Message */}
        {isPending && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              Экзамен содержит открытые вопросы, требующие ручной проверки. Вы получите уведомление, когда результаты будут готовы.
            </Typography>
          </Alert>
        )}

        {/* Retry Option */}
        {!isPending && !passed && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            {exam.maxAttempts && totalAttempts >= exam.maxAttempts ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  К сожалению, вы не набрали проходной балл и исчерпали все попытки ({exam.maxAttempts}).
                </Typography>
                <Typography variant="body2">
                  Свяжитесь с преподавателем для получения дополнительной попытки.
                </Typography>
              </Alert>
            ) : (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    К сожалению, вы не набрали проходной балл.
                    {exam.maxAttempts && (
                      <> У вас осталось попыток: {exam.maxAttempts - totalAttempts}</>
                    )}
                  </Typography>
                </Alert>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Quiz />}
                  onClick={() => navigate(`/learning/exam/${examId}`)}
                  sx={{
                    py: 1.5,
                    px: 6,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                  }}
                >
                  Пройти повторно
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Success - Show stats of all attempts */}
        {!isPending && passed && allAttempts.length > 1 && (
          <Card sx={{ mt: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                История попыток
              </Typography>
              <List>
                {allAttempts.map((attempt, index) => (
                  <React.Fragment key={attempt.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body1">
                              Попытка {allAttempts.length - index}
                            </Typography>
                            <Chip
                              label={attempt.passed ? 'Сдано' : 'Не сдано'}
                              color={attempt.passed ? 'success' : 'error'}
                              size="small"
                            />
                            <Typography variant="body2" fontWeight={600}>
                              {attempt.scorePercentage}%
                            </Typography>
                          </Stack>
                        }
                        secondary={new Date(attempt.submittedAt).toLocaleString('ru-RU')}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Container>
    </MainLayout>
  );
}

export default ExamResultPage;
