// src/pages/LearningPortalPage.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Stack,
  LinearProgress,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  PlayCircleOutline,
  Article,
  School,
  Timer,
  CheckCircle,
  EmojiEvents,
  Add,
  Settings as SettingsIcon,
  BarChart,
  StarRate,
  Warning,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '../stores';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';

const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

// Функция для расчета статуса дедлайна
function getDeadlineStatus(course, userProgress) {
  if (!course.isRequired || !course.deadline || !userProgress) {
    return null;
  }

  // Если курс уже завершен
  if (userProgress.progress === 100) {
    return null;
  }

  let deadlineDate = null;

  if (course.deadline.type === 'fixed_date') {
    deadlineDate = course.deadline.value?.toDate?.() || new Date(course.deadline.value);
  } else if (course.deadline.type === 'days_after_assign' && userProgress.startedAt) {
    const startDate = userProgress.startedAt?.toDate?.() || new Date(userProgress.startedAt);
    deadlineDate = new Date(startDate);
    deadlineDate.setDate(deadlineDate.getDate() + course.deadline.value);
  }

  if (!deadlineDate) {
    return null;
  }

  const now = new Date();
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'overdue', days: Math.abs(diffDays), date: deadlineDate };
  } else if (diffDays <= 3) {
    return { status: 'urgent', days: diffDays, date: deadlineDate };
  } else if (diffDays <= 7) {
    return { status: 'soon', days: diffDays, date: deadlineDate };
  }

  return { status: 'normal', days: diffDays, date: deadlineDate };
}

function LearningPortalPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // React Query — категории
  const { data: categories = [] } = useQuery({
    queryKey: ['learning', 'categories'],
    queryFn: async () => {
      const result = await learningService.getCategories();
      return result.success ? result.categories : [];
    },
    staleTime: 30 * 60 * 1000, // 30 минут
  });

  // React Query — курсы с прогрессом
  const { data: coursesData, isLoading: loading } = useQuery({
    queryKey: ['learning', 'courses', 'withProgress', user?.uid],
    queryFn: async () => {
      const teamsResult = await learningService.getUserTeams(user.uid);
      const userTeams = teamsResult.success ? teamsResult.teams : [];
      const result = await learningService.getUserCoursesWithProgress(user.uid, userTeams, user.roleId);
      
      if (result.success) {
        const courses = result.courses;
        const completed = courses.filter(c => c.userProgress.progress === 100).length;
        const inProgress = courses.filter(c => c.userProgress.progress > 0 && c.userProgress.progress < 100).length;
        
        return {
          courses,
          stats: {
            totalCourses: courses.length,
            completedCourses: completed,
            inProgressCourses: inProgress,
          }
        };
      }
      return { courses: [], stats: { totalCourses: 0, completedCourses: 0, inProgressCourses: 0 } };
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });

  const courses = coursesData?.courses || [];
  const stats = coursesData?.stats || { totalCourses: 0, completedCourses: 0, inProgressCourses: 0 };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

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
      {/* Hero */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${bauhaus.blue}15 0%, ${bauhaus.teal}15 100%)`,
          py: { xs: 3, md: 6 },
          mb: 4,
          borderRadius: 4,
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 3,
            mb: 3
          }}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <School sx={{ fontSize: 40, color: bauhaus.blue }} />
                <Typography variant="h4" fontWeight={800}>
                  Портал обучения
                </Typography>
              </Stack>
              <Typography variant="body1" color="text.secondary">
                Освойте Agile Mind Pro. {stats.totalCourses} курсов доступно.
              </Typography>
            </Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              <Button
                variant="outlined"
                startIcon={<BarChart />}
                onClick={() => navigate('/learning/stats')}
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                Моя статистика
              </Button>
              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/learning/admin')}
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                  }}
                >
                  Управление курсами
                </Button>
              )}
            </Stack>
          </Box>

          {/* Stats */}
          <Box sx={{ overflow: 'hidden', width: '100%' }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight={700} color={bauhaus.blue}>
                    {stats.totalCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего курсов
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight={700} color={bauhaus.teal}>
                    {stats.completedCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Завершено
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight={700} color={bauhaus.yellow}>
                    {stats.inProgressCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    В процессе
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          </Box>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Найти курс..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
      </Box>

      <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Categories */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={selectedCategory}
            onChange={(e, value) => setSelectedCategory(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
              },
            }}
          >
            <Tab value="all" label="Все курсы" />
            {categories.map((category) => (
              <Tab
                key={category.id}
                value={category.id}
                label={category.label}
              />
            ))}
          </Tabs>
        </Box>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <EmojiEvents sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'Курсы не найдены' : 'Курсы еще не добавлены'}
            </Typography>
            {isAdmin && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate('/learning/admin')}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Создать первый курс
              </Button>
            )}
          </Card>
        ) : (
          <Box sx={{ overflow: 'hidden', width: '100%' }}>
            <Grid container spacing={3}>
              {filteredCourses.map((course) => {
              const progress = course.userProgress?.progress || 0;
              const isCompleted = progress === 100;
              const isStarted = progress > 0;
              const deadlineStatus = getDeadlineStatus(course, course.userProgress);

              return (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: '2px solid',
                      borderColor: deadlineStatus?.status === 'overdue'
                        ? bauhaus.red
                        : isCompleted
                        ? bauhaus.teal
                        : 'divider',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => navigate(`/learning/course/${course.id}`)}
                  >
                    <Box
                      sx={{
                        height: 140,
                        background: course.coverImage
                          ? `url(${course.coverImage}) center/cover`
                          : `linear-gradient(135deg, ${bauhaus.blue}40 0%, ${bauhaus.teal}40 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      {!course.coverImage && (
                        <School sx={{ fontSize: 64, color: 'white', opacity: 0.8 }} />
                      )}

                      {/* Chips Stack */}
                      <Stack
                        direction="column"
                        spacing={0.5}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                        }}
                      >
                        {/* Обязательный курс */}
                        {course.isRequired && !isCompleted && (
                          <Chip
                            icon={<StarRate />}
                            label="Обязательный"
                            size="small"
                            sx={{
                              bgcolor: '#FF9800',
                              color: 'white',
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: 'white' }
                            }}
                          />
                        )}

                        {/* Дедлайн */}
                        {deadlineStatus && deadlineStatus.status === 'overdue' && (
                          <Chip
                            icon={<Warning />}
                            label={`Просрочен на ${deadlineStatus.days} дн.`}
                            size="small"
                            sx={{
                              bgcolor: bauhaus.red,
                              color: 'white',
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: 'white' }
                            }}
                          />
                        )}

                        {deadlineStatus && deadlineStatus.status === 'urgent' && (
                          <Chip
                            icon={<Schedule />}
                            label={deadlineStatus.days === 0 ? 'Сегодня!' : `Осталось ${deadlineStatus.days} дн.`}
                            size="small"
                            sx={{
                              bgcolor: bauhaus.yellow,
                              color: '#000',
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: '#000' }
                            }}
                          />
                        )}

                        {deadlineStatus && deadlineStatus.status === 'soon' && (
                          <Chip
                            icon={<Schedule />}
                            label={`До ${deadlineStatus.days} дн.`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                              color: bauhaus.blue,
                              fontWeight: 600,
                            }}
                          />
                        )}

                        {/* Статус прохождения */}
                        {isCompleted && (
                          <Chip
                            icon={<CheckCircle />}
                            label="Завершено"
                            size="small"
                            sx={{
                              bgcolor: bauhaus.teal,
                              color: 'white',
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: 'white' }
                            }}
                          />
                        )}

                        {isStarted && !isCompleted && !deadlineStatus && (
                          <Chip
                            label="В процессе"
                            size="small"
                            sx={{
                              bgcolor: bauhaus.blue,
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {course.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {course.description}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        {course.duration && (
                          <Chip
                            icon={<Timer />}
                            label={course.duration}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <Chip
                          icon={<Article />}
                          label={`${course.lessonsCount || 0} уроков`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>

                      {isStarted && (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Прогресс
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {progress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 6,
                              borderRadius: 1,
                              bgcolor: `${bauhaus.blue}20`,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: isCompleted ? bauhaus.teal : bauhaus.blue,
                              },
                            }}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
            </Grid>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}

export default LearningPortalPage;
