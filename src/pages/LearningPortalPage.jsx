// src/pages/LearningPortalPage.jsx
import React, { useState, useEffect, useContext } from 'react';
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

const categories = [
  { id: 'all', label: 'Все' },
  { id: 'getting-started', label: 'Начало работы' },
  { id: 'boards', label: 'Доски' },
  { id: 'sprints', label: 'Спринты' },
  { id: 'teams', label: 'Команды' },
  { id: 'analytics', label: 'Аналитика' },
  { id: 'ai', label: 'AI Ассистент' },
  { id: 'general', label: 'Общее' },
];

function LearningPortalPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
  });

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    setLoading(true);
    const result = await learningService.getUserCoursesWithProgress(user.uid);

    if (result.success) {
      setCourses(result.courses);

      // Вычисляем статистику
      const completed = result.courses.filter(c => c.userProgress.progress === 100).length;
      const inProgress = result.courses.filter(c => c.userProgress.progress > 0 && c.userProgress.progress < 100).length;

      setStats({
        totalCourses: result.courses.length,
        completedCourses: completed,
        inProgressCourses: inProgress,
      });
    }

    setLoading(false);
  };

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
          py: 6,
          mb: 4,
          borderRadius: 4,
        }}
      >
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/learning/admin')}
                sx={{
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                }}
              >
                Управление курсами
              </Button>
            )}
          </Box>

          {/* Stats */}
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
        </Container>
      </Box>

      <Container>
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
          <Grid container spacing={3}>
            {filteredCourses.map((course) => {
              const progress = course.userProgress?.progress || 0;
              const isCompleted = progress === 100;
              const isStarted = progress > 0;

              return (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: '1px solid',
                      borderColor: isCompleted ? bauhaus.teal : 'divider',
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
                        background: course.thumbnail
                          ? `url(${course.thumbnail}) center/cover`
                          : `linear-gradient(135deg, ${bauhaus.blue}40 0%, ${bauhaus.teal}40 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      {!course.thumbnail && (
                        <School sx={{ fontSize: 64, color: 'white', opacity: 0.8 }} />
                      )}
                      {isCompleted && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Завершено"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: bauhaus.teal,
                            color: 'white',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: 'white' }
                          }}
                        />
                      )}
                      {isStarted && !isCompleted && (
                        <Chip
                          label="В процессе"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: bauhaus.blue,
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      )}
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
        )}
      </Container>
    </MainLayout>
  );
}

export default LearningPortalPage;
