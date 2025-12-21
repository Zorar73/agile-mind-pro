// src/pages/MyLearningStatsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  LinearProgress,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  School,
  CheckCircle,
  Timer,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';

const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

function MyLearningStatsPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    notStartedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    completionRate: 0,
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setLoading(true);

    // Get user teams first
    const teamsResult = await learningService.getUserTeams(user.uid);
    const userTeams = teamsResult.success ? teamsResult.teams : [];

    const result = await learningService.getUserCoursesWithProgress(user.uid, userTeams);

    if (result.success) {
      const coursesData = result.courses;
      setCourses(coursesData);

      // Вычисляем общую статистику
      const completed = coursesData.filter(c => c.userProgress.progress === 100).length;
      const inProgress = coursesData.filter(c => c.userProgress.progress > 0 && c.userProgress.progress < 100).length;
      const notStarted = coursesData.filter(c => c.userProgress.progress === 0).length;

      // Подсчитываем уроки
      let totalLessons = 0;
      let completedLessons = 0;

      coursesData.forEach(course => {
        totalLessons += course.lessonsCount || 0;
        completedLessons += (course.userProgress.completedLessons || []).length;
      });

      const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      setStats({
        totalCourses: coursesData.length,
        completedCourses: completed,
        inProgressCourses: inProgress,
        notStartedCourses: notStarted,
        totalLessons,
        completedLessons,
        completionRate,
      });
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

  return (
    <MainLayout>
      <Container>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/learning')}
            sx={{ mb: 2 }}
          >
            Вернуться к курсам
          </Button>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <School sx={{ fontSize: 40, color: bauhaus.blue }} />
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Моя статистика обучения
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Детальный отчет о вашем прогрессе
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Общая статистика */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <School sx={{ fontSize: 40, color: bauhaus.blue, mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color={bauhaus.blue}>
                  {stats.totalCourses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего курсов
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: bauhaus.teal, mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color={bauhaus.teal}>
                  {stats.completedCourses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Завершено
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: bauhaus.yellow, mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color={bauhaus.yellow}>
                  {stats.inProgressCourses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  В процессе
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Timer sx={{ fontSize: 40, color: bauhaus.purple, mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color={bauhaus.purple}>
                  {stats.completionRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Общий прогресс
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Прогресс по урокам */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Прогресс по урокам
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {stats.completedLessons} из {stats.totalLessons} уроков завершено
            </Typography>
            <LinearProgress
              variant="determinate"
              value={stats.completionRate}
              sx={{
                height: 12,
                borderRadius: 2,
                bgcolor: `${bauhaus.blue}20`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: stats.completionRate === 100 ? bauhaus.teal : bauhaus.blue,
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Детальная статистика по курсам */}
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
          Детализация по курсам
        </Typography>

        {courses.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <School sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Вы еще не записаны на курсы
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/learning')}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Перейти к курсам
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => {
              const progress = course.userProgress?.progress || 0;
              const completedLessons = course.userProgress?.completedLessons || [];
              const totalLessons = course.lessonsCount || 0;
              const isCompleted = progress === 100;
              const isStarted = progress > 0;

              return (
                <Grid item xs={12} key={course.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: isCompleted ? bauhaus.teal : 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => navigate(`/learning/course/${course.id}`)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <Typography variant="h6" fontWeight={700}>
                              {course.title}
                            </Typography>
                            {isCompleted && (
                              <Chip
                                icon={<CheckCircle />}
                                label="Завершено"
                                size="small"
                                sx={{
                                  bgcolor: bauhaus.teal,
                                  color: 'white',
                                  '& .MuiChip-icon': { color: 'white' },
                                }}
                              />
                            )}
                            {isStarted && !isCompleted && (
                              <Chip
                                label="В процессе"
                                size="small"
                                sx={{
                                  bgcolor: bauhaus.blue,
                                  color: 'white',
                                }}
                              />
                            )}
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {course.description}
                          </Typography>
                        </Box>

                        <Stack spacing={1} alignItems="flex-end" sx={{ minWidth: 120 }}>
                          <Typography variant="h4" fontWeight={700} color={isCompleted ? bauhaus.teal : bauhaus.blue}>
                            {progress}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {completedLessons.length}/{totalLessons} уроков
                          </Typography>
                        </Stack>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          bgcolor: `${bauhaus.blue}20`,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: isCompleted ? bauhaus.teal : bauhaus.blue,
                          },
                        }}
                      />

                      {course.userProgress?.startedAt && (
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Начат: {new Date(course.userProgress.startedAt).toLocaleDateString('ru-RU')}
                          </Typography>
                          {course.userProgress?.completedAt && (
                            <Typography variant="caption" color="text.secondary">
                              Завершен: {new Date(course.userProgress.completedAt).toLocaleDateString('ru-RU')}
                            </Typography>
                          )}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Достижения */}
        {stats.completedCourses > 0 && (
          <Card sx={{ mt: 4, borderRadius: 3, background: `linear-gradient(135deg, ${bauhaus.teal}15 0%, ${bauhaus.blue}15 100%)` }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <EmojiEvents sx={{ fontSize: 48, color: bauhaus.teal }} />
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Поздравляем с достижениями!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Вы завершили {stats.completedCourses} {stats.completedCourses === 1 ? 'курс' : 'курса'}. Продолжайте в том же духе!
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Container>
    </MainLayout>
  );
}

export default MyLearningStatsPage;
