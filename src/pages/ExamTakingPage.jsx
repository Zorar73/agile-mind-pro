// src/pages/ExamTakingPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Checkbox,
  FormGroup,
  CircularProgress,
  Stack,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  Timer,
  Send,
  Quiz,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';
import { useToast } from '../contexts/ToastContext';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
  red: '#E53935',
  yellow: '#FDD835',
};

function ExamTakingPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [exam, setExam] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [attemptsExceeded, setAttemptsExceeded] = useState(false);
  const [hasPendingResult, setHasPendingResult] = useState(false);

  useEffect(() => {
    if (examId && user) {
      loadExamData();
    }
  }, [examId, user]);

  useEffect(() => {
    if (examStarted && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(true); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted, timeRemaining]);

  const loadExamData = async () => {
    setLoading(true);

    // Load exam
    const examResult = await learningService.getExam(examId);
    if (examResult.success) {
      setExam(examResult.exam);

      // Load course if exam is linked to one
      if (examResult.exam.courseId) {
        const courseResult = await learningService.getCourse(examResult.exam.courseId);
        if (courseResult.success) {
          setCourse(courseResult.course);
        }
      }

      // Check user attempts
      const attemptsResult = await learningService.getUserExamAttempts(user.uid, examId);
      if (attemptsResult.success) {
        setTotalAttempts(attemptsResult.totalAttempts);

        // Check if user already passed this exam
        const passedAttempt = attemptsResult.attempts.find(a => a.passed);
        if (passedAttempt) {
          setAlreadyTaken(true);
        }

        // Check if user has pending result (awaiting grading)
        const pendingAttempt = attemptsResult.attempts.find(a => a.gradingStatus === 'pending');
        if (pendingAttempt) {
          setHasPendingResult(true);
        }

        // Check if attempts exceeded (only count if no pending result)
        if (examResult.exam.maxAttempts && attemptsResult.totalAttempts >= examResult.exam.maxAttempts && !pendingAttempt) {
          setAttemptsExceeded(true);
        }
      }
    } else {
      toast.error('Не удалось загрузить экзамен');
    }

    setLoading(false);
  };

  const handleStartExam = () => {
    setExamStarted(true);
    if (exam.timeLimit) {
      setTimeRemaining(exam.timeLimit * 60); // Convert minutes to seconds
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      // Check if all questions are answered
      const unansweredCount = exam.questions.filter(q => !answers[q.id]).length;
      if (unansweredCount > 0) {
        const confirmSubmit = window.confirm(
          `У вас ${unansweredCount} неотвеченных вопросов. Вы уверены, что хотите отправить экзамен?`
        );
        if (!confirmSubmit) return;
      }
    }

    setSubmitting(true);

    // Calculate score for auto-graded questions
    let totalPoints = 0;
    let earnedPoints = 0;
    const questionResults = [];

    exam.questions.forEach(question => {
      totalPoints += question.points || 1;
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'single') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'multiple') {
        // For multiple choice, correctAnswer should be a comma-separated string
        const correctAnswers = (question.correctAnswer || '').split(',').map(a => a.trim()).sort();
        const userAnswers = Array.isArray(userAnswer) ? userAnswer.sort() : [];
        isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);
      } else if (question.type === 'text') {
        // Text questions need manual grading
        isCorrect = null;
      }

      if (isCorrect === true) {
        earnedPoints += question.points || 1;
      }

      questionResults.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: question.points || 1,
        earnedPoints: isCorrect === true ? (question.points || 1) : 0,
      });
    });

    // Calculate percentage score
    const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercentage >= (exam.passingScore || 70);

    // Determine grading status
    const hasTextQuestions = exam.questions.some(q => q.type === 'text');
    const gradingStatus = hasTextQuestions ? 'pending' : 'graded';

    const resultData = {
      examId,
      userId: user.uid,
      courseId: exam.courseId || null,
      answers,
      questionResults,
      totalPoints,
      earnedPoints,
      scorePercentage,
      passed,
      gradingStatus,
      submittedAt: new Date().toISOString(),
      timeSpent: exam.timeLimit ? (exam.timeLimit * 60 - (timeRemaining || 0)) : null,
    };

    const result = await learningService.submitExamResult(resultData);

    setSubmitting(false);

    if (result.success) {
      toast.success(autoSubmit ? 'Время истекло. Экзамен отправлен автоматически.' : 'Экзамен успешно отправлен!');
      navigate(`/learning/exam/${examId}/result`);
    } else {
      toast.error('Ошибка отправки экзамена');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  if (hasPendingResult) {
    return (
      <MainLayout>
        <Container>
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <HourglassEmpty sx={{ fontSize: 64, color: bauhaus.yellow, mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Экзамен на проверке
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Ваши ответы отправлены и ожидают проверки преподавателем
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Вы получите уведомление, когда результаты будут готовы
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(course ? `/learning/course/${course.id}` : '/learning')}
              >
                Вернуться к курсу
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate(`/learning/exam/${examId}/result`)}
                sx={{
                  background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                }}
              >
                Посмотреть статус
              </Button>
            </Stack>
          </Card>
        </Container>
      </MainLayout>
    );
  }

  if (attemptsExceeded) {
    return (
      <MainLayout>
        <Container>
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <Warning sx={{ fontSize: 64, color: bauhaus.red, mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Попытки исчерпаны
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Вы использовали все доступные попытки ({exam.maxAttempts})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Свяжитесь с преподавателем для получения дополнительной попытки
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(course ? `/learning/course/${course.id}` : '/learning')}
              >
                Вернуться к курсу
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate(`/learning/exam/${examId}/result`)}
                sx={{
                  background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                }}
              >
                Посмотреть результаты
              </Button>
            </Stack>
          </Card>
        </Container>
      </MainLayout>
    );
  }

  if (alreadyTaken) {
    return (
      <MainLayout>
        <Container>
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: bauhaus.teal, mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Вы уже прошли этот экзамен
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Вы можете просмотреть результаты
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(course ? `/learning/course/${course.id}` : '/learning')}
              >
                Вернуться к курсу
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate(`/learning/exam/${examId}/result`)}
                sx={{
                  background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                }}
              >
                Посмотреть результаты
              </Button>
            </Stack>
          </Card>
        </Container>
      </MainLayout>
    );
  }

  if (!examStarted) {
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

          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Quiz sx={{ fontSize: 64, color: bauhaus.blue, mb: 2 }} />
                  <Typography variant="h4" fontWeight={800} gutterBottom>
                    {exam.title}
                  </Typography>
                  {exam.description && (
                    <Typography variant="body1" color="text.secondary">
                      {exam.description}
                    </Typography>
                  )}
                </Box>

                <Divider />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${bauhaus.blue}10` }}>
                      <Typography variant="body2" color="text.secondary">
                        Вопросов
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {exam.questions.length}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${bauhaus.teal}10` }}>
                      <Typography variant="body2" color="text.secondary">
                        Проходной балл
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {exam.passingScore}%
                      </Typography>
                    </Paper>
                  </Grid>
                  {exam.timeLimit && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${bauhaus.yellow}10` }}>
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                          <Timer />
                          <Typography variant="body2" color="text.secondary">
                            Ограничение времени:
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {exam.timeLimit} минут
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  )}
                  {exam.maxAttempts && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${bauhaus.purple}10` }}>
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                          <Quiz />
                          <Typography variant="body2" color="text.secondary">
                            Попыток осталось:
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {exam.maxAttempts - totalAttempts} из {exam.maxAttempts}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  )}
                </Grid>

                <Alert severity="info" icon={<Warning />}>
                  <Typography variant="body2">
                    После начала экзамена вы не сможете вернуться к этой странице.
                    {exam.timeLimit && ' Таймер начнется сразу после нажатия кнопки "Начать экзамен".'}
                  </Typography>
                </Alert>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartExam}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                  }}
                >
                  Начать экзамен
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </MainLayout>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.questions.length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const currentQuestion = exam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="md">
        {/* Timer and Progress Bar */}
        <Paper
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            mb: 3,
            p: 2,
            borderRadius: 2,
          }}
        >
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700}>
                {exam.title}
              </Typography>
              {timeRemaining !== null && (
                <Chip
                  icon={<Timer />}
                  label={formatTime(timeRemaining)}
                  color={timeRemaining < 300 ? 'error' : 'primary'}
                  sx={{ fontWeight: 700, fontSize: '1rem' }}
                />
              )}
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Вопрос {currentQuestionIndex + 1} из {totalQuestions}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Отвечено: {answeredCount} / {totalQuestions}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: `${bauhaus.blue}20`,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progress === 100 ? bauhaus.teal : bauhaus.blue,
                  },
                }}
              />
            </Box>
          </Stack>
        </Paper>

        {/* Current Question */}
        <Stack spacing={3}>
          {currentQuestion && (
            <Card key={currentQuestion.id} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        Вопрос {currentQuestionIndex + 1}
                      </Typography>
                      <Chip
                        label={`${currentQuestion.points || 1} ${currentQuestion.points === 1 ? 'балл' : 'балла'}`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                    <Typography variant="body1">
                      {currentQuestion.question}
                    </Typography>
                    {currentQuestion.questionImage && (
                      <Box sx={{ mt: 2 }}>
                        <img
                          src={currentQuestion.questionImage}
                          alt="Question"
                          style={{
                            maxWidth: '100%',
                            maxHeight: 300,
                            display: 'block',
                            borderRadius: 8,
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {currentQuestion.type === 'single' && (
                    <FormControl component="fieldset">
                      <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      >
                        {currentQuestion.options.filter(o => o.trim()).map((option, optIndex) => (
                          <Box key={optIndex}>
                            <FormControlLabel
                              value={(optIndex + 1).toString()}
                              control={<Radio />}
                              label={option}
                            />
                            {currentQuestion.optionImages && currentQuestion.optionImages[optIndex] && (
                              <Box sx={{ ml: 4, mb: 1 }}>
                                <img
                                  src={currentQuestion.optionImages[optIndex]}
                                  alt={`Option ${optIndex + 1}`}
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: 150,
                                    display: 'block',
                                    borderRadius: 4,
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  )}

                  {currentQuestion.type === 'multiple' && (
                    <FormControl component="fieldset">
                      <FormGroup>
                        {currentQuestion.options.filter(o => o.trim()).map((option, optIndex) => (
                          <Box key={optIndex}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={(answers[currentQuestion.id] || []).includes((optIndex + 1).toString())}
                                  onChange={(e) => {
                                    const currentAnswers = answers[currentQuestion.id] || [];
                                    const value = (optIndex + 1).toString();
                                    if (e.target.checked) {
                                      handleAnswerChange(currentQuestion.id, [...currentAnswers, value]);
                                    } else {
                                      handleAnswerChange(currentQuestion.id, currentAnswers.filter(a => a !== value));
                                    }
                                  }}
                                />
                              }
                              label={option}
                            />
                            {currentQuestion.optionImages && currentQuestion.optionImages[optIndex] && (
                              <Box sx={{ ml: 4, mb: 1 }}>
                                <img
                                  src={currentQuestion.optionImages[optIndex]}
                                  alt={`Option ${optIndex + 1}`}
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: 150,
                                    display: 'block',
                                    borderRadius: 4,
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                        ))}
                      </FormGroup>
                    </FormControl>
                  )}

                  {currentQuestion.type === 'text' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Введите ваш ответ..."
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>

        {/* Navigation Buttons */}
        <Box sx={{ mt: 4, mb: 4 }}>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={handlePreviousQuestion}
              disabled={isFirstQuestion}
              sx={{ px: 4 }}
            >
              Предыдущий
            </Button>
            {isLastQuestion ? (
              <Button
                variant="contained"
                size="large"
                startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                sx={{
                  py: 1.5,
                  px: 6,
                  background: 'linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)',
                }}
              >
                {submitting ? 'Отправка...' : 'Отправить экзамен'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNextQuestion}
                sx={{
                  px: 4,
                  background: 'linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)',
                }}
              >
                Следующий
              </Button>
            )}
          </Stack>
        </Box>
      </Container>
    </MainLayout>
  );
}

export default ExamTakingPage;
