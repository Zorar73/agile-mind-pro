// src/pages/CoursePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  PlayCircleOutline,
  Article,
  CheckCircle,
  RadioButtonUnchecked,
  Timer,
  School,
  Quiz,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
};

function CoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useContext(UserContext);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState({});
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && courseId) {
      loadData();
    }
  }, [user, courseId]);

  const loadData = async () => {
    setLoading(true);

    // Загружаем курс
    const courseResult = await learningService.getCourse(courseId);
    if (courseResult.success) {
      setCourse(courseResult.course);
    }

    // Загружаем уроки
    const lessonsResult = await learningService.getCourseLessons(courseId);
    if (lessonsResult.success) {
      setLessons(lessonsResult.lessons);
    }

    // Загружаем экзамены
    const examsResult = await learningService.getCourseExams(courseId);
    if (examsResult.success) {
      setExams(examsResult.exams);

      // Загружаем результаты для каждого экзамена
      const results = {};
      for (const exam of examsResult.exams) {
        const resultData = await learningService.getUserExamResult(user.uid, exam.id);
        if (resultData.success && resultData.result) {
          results[exam.id] = resultData.result;
        }
      }
      setExamResults(results);
    }

    // Загружаем прогресс
    const progressResult = await learningService.getUserCourseProgress(user.uid, courseId);
    if (progressResult.success) {
      setProgress(progressResult.progress);
    }

    setLoading(false);
  };

  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessons?.includes(lessonId) || false;
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

  if (!course) {
    return (
      <MainLayout>
        <Box sx={{ px: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
          <Typography variant="h6" color="text.secondary">
            Курс не найден
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  const progressPercent = progress?.progress || 0;

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/learning')}
          sx={{ mb: 3 }}
        >
          Вернуться к курсам
        </Button>

        {/* Course Header */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <Box
            sx={{
              height: 200,
              background: `linear-gradient(135deg, ${bauhaus.blue}40 0%, ${bauhaus.teal}40 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <School sx={{ fontSize: 80, color: 'white', opacity: 0.8 }} />
          </Box>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              {course.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {course.description}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              {course.duration && (
                <Chip icon={<Timer />} label={course.duration} />
              )}
              <Chip icon={<Article />} label={`${lessons.length} уроков`} />
              {progressPercent === 100 && (
                <Chip
                  icon={<CheckCircle />}
                  label="Завершено"
                  sx={{ bgcolor: bauhaus.teal, color: 'white', '& .MuiChip-icon': { color: 'white' } }}
                />
              )}
            </Stack>

            {/* Progress */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  Ваш прогресс
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {progressPercent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 10,
                  borderRadius: 1,
                  bgcolor: `${bauhaus.blue}20`,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progressPercent === 100 ? bauhaus.teal : bauhaus.blue,
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
          Уроки
        </Typography>

        {lessons.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Уроки еще не добавлены
            </Typography>
          </Card>
        ) : (
          <Card sx={{ borderRadius: 3 }}>
            <List>
              {lessons.map((lesson, index) => {
                const isCompleted = isLessonCompleted(lesson.id);
                return (
                  <React.Fragment key={lesson.id}>
                    {index > 0 && <Divider />}
                    <ListItemButton
                      onClick={() => navigate(`/learning/lesson/${lesson.id}`)}
                      sx={{
                        py: 2,
                        '&:hover': {
                          bgcolor: `${bauhaus.blue}05`,
                        },
                      }}
                    >
                      <ListItemIcon>
                        {isCompleted ? (
                          <CheckCircle sx={{ color: bauhaus.teal, fontSize: 32 }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ color: 'text.disabled', fontSize: 32 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight={600}>
                            {index + 1}. {lesson.title}
                          </Typography>
                        }
                        secondary={
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                            {lesson.type === 'video' ? (
                              <Chip
                                icon={<PlayCircleOutline />}
                                label="Видео"
                                size="small"
                                variant="outlined"
                              />
                            ) : (
                              <Chip
                                icon={<Article />}
                                label="Статья"
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {lesson.duration && (
                              <Chip label={lesson.duration} size="small" variant="outlined" />
                            )}
                          </Stack>
                        }
                      />
                    </ListItemButton>
                  </React.Fragment>
                );
              })}
            </List>
          </Card>
        )}

        {/* Exams Section */}
        {exams.length > 0 && (
          <>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4, mb: 2 }}>
              Экзамены
            </Typography>

            <Card sx={{ borderRadius: 3 }}>
              <List>
                {exams.map((exam, index) => {
                  const result = examResults[exam.id];
                  const hasTaken = !!result;
                  const isPending = result?.gradingStatus === 'pending';
                  const passed = result?.passed;

                  return (
                    <React.Fragment key={exam.id}>
                      {index > 0 && <Divider />}
                      <ListItemButton
                        onClick={() => {
                          if (hasTaken) {
                            navigate(`/learning/exam/${exam.id}/result`);
                          } else {
                            navigate(`/learning/exam/${exam.id}`);
                          }
                        }}
                        sx={{
                          py: 2,
                          '&:hover': {
                            bgcolor: `${bauhaus.blue}05`,
                          },
                        }}
                      >
                        <ListItemIcon>
                          <Quiz
                            sx={{
                              fontSize: 32,
                              color: hasTaken
                                ? passed
                                  ? bauhaus.teal
                                  : isPending
                                  ? 'warning.main'
                                  : 'error.main'
                                : bauhaus.blue,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {exam.title}
                              </Typography>
                              {hasTaken && (
                                isPending ? (
                                  <Chip
                                    label="На проверке"
                                    size="small"
                                    color="warning"
                                  />
                                ) : passed ? (
                                  <Chip
                                    icon={<CheckCircle />}
                                    label={`Сдан (${result.scorePercentage}%)`}
                                    size="small"
                                    sx={{
                                      bgcolor: bauhaus.teal,
                                      color: 'white',
                                      '& .MuiChip-icon': { color: 'white' },
                                    }}
                                  />
                                ) : (
                                  <Chip
                                    label={`Не сдан (${result.scorePercentage}%)`}
                                    size="small"
                                    color="error"
                                  />
                                )
                              )}
                            </Stack>
                          }
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                              {exam.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {exam.description}
                                </Typography>
                              )}
                              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                <Chip
                                  label={`${exam.questions?.length || 0} вопросов`}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  label={`Проходной балл: ${exam.passingScore}%`}
                                  size="small"
                                  variant="outlined"
                                />
                                {exam.timeLimit && (
                                  <Chip
                                    icon={<Timer />}
                                    label={`${exam.timeLimit} мин`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                            </Stack>
                          }
                        />
                        <ArrowForward sx={{ color: 'text.secondary' }} />
                      </ListItemButton>
                    </React.Fragment>
                  );
                })}
              </List>
            </Card>
          </>
        )}
      </Box>
    </MainLayout>
  );
}

export default CoursePage;
