// src/pages/LearningAdminPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  CircularProgress,
  Stack,
  Paper,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  Save,
  School,
  Category,
  People,
  TrendingUp,
  CheckCircle,
  Timer,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';
import { useToast } from '../contexts/ToastContext';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
};

function LearningAdminPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    requiredRole: 'all',
    coverImage: null,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    completedEnrollments: 0,
    averageProgress: 0,
    topCourses: [],
  });

  // Проверка прав на создание курсов
  const canCreateCourse = user?.role === 'admin' || user?.canCreateCourses === true;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Загружаем категории
    const categoriesResult = await learningService.getCategories();
    if (categoriesResult.success) {
      const cats = categoriesResult.categories.filter(c => c.value !== 'all'); // Убираем "Все" из списка категорий курса
      setCategories(cats);
      // Устанавливаем первую категорию по умолчанию
      if (cats.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: cats[0].value }));
      }
    }

    // Загружаем курсы
    await loadCourses();

    // Загружаем аналитику
    await loadAnalytics();

    setLoading(false);
  };

  const loadAnalytics = async () => {
    try {
      // Получаем всех пользователей для подсчета
      const allProgressResult = await learningService.getAllProgress();
      if (allProgressResult.success) {
        const progressList = allProgressResult.progress || [];

        // Уникальные студенты
        const uniqueStudents = new Set(progressList.map(p => p.userId)).size;

        // Завершенные записи (progress = 100)
        const completedCount = progressList.filter(p => p.progress === 100).length;

        // Средний прогресс
        const totalProgress = progressList.reduce((sum, p) => sum + (p.progress || 0), 0);
        const avgProgress = progressList.length > 0 ? Math.round(totalProgress / progressList.length) : 0;

        // Топ курсов по количеству студентов
        const coursesMap = {};
        progressList.forEach(p => {
          if (!coursesMap[p.courseId]) {
            coursesMap[p.courseId] = {
              courseId: p.courseId,
              students: 0,
              completed: 0,
              avgProgress: 0,
            };
          }
          coursesMap[p.courseId].students++;
          if (p.progress === 100) {
            coursesMap[p.courseId].completed++;
          }
        });

        // Получаем информацию о курсах
        const topCoursesData = await Promise.all(
          Object.keys(coursesMap).slice(0, 5).map(async (courseId) => {
            const courseResult = await learningService.getCourse(courseId);
            if (courseResult.success) {
              return {
                ...coursesMap[courseId],
                title: courseResult.course.title,
              };
            }
            return null;
          })
        );

        const topCourses = topCoursesData
          .filter(c => c !== null)
          .sort((a, b) => b.students - a.students)
          .slice(0, 3);

        setAnalytics({
          totalStudents: uniqueStudents,
          completedEnrollments: completedCount,
          averageProgress: avgProgress,
          topCourses,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadCourses = async () => {
    const result = await learningService.getAllCourses();
    if (result.success) {
      setCourses(result.courses);
    }
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        category: course.category,
        duration: course.duration,
        requiredRole: course.requiredRole || 'all',
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        category: 'general',
        duration: '',
        requiredRole: 'all',
      });
    }
    setDialogOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!formData.title.trim()) {
      toast.error('Введите название курса');
      return;
    }

    if (editingCourse) {
      const result = await learningService.updateCourse(editingCourse.id, formData);
      if (result.success) {
        toast.success('Курс обновлен');
        loadCourses();
        setDialogOpen(false);
      } else {
        toast.error('Ошибка обновления курса');
      }
    } else {
      const result = await learningService.createCourse(formData, user.uid);
      if (result.success) {
        toast.success('Курс создан');
        loadCourses();
        setDialogOpen(false);
      } else {
        toast.error('Ошибка создания курса');
      }
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Удалить курс? Это действие нельзя отменить.')) {
      return;
    }

    const result = await learningService.deleteCourse(courseId);
    if (result.success) {
      toast.success('Курс удален');
      loadCourses();
    } else {
      toast.error('Ошибка удаления курса');
    }
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

          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2
          }}>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Управление курсами
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Создавайте и редактируйте обучающие курсы
              </Typography>
            </Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              <Button
                variant="outlined"
                startIcon={<Category />}
                onClick={() => navigate('/learning/admin/categories')}
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                Категории
              </Button>
              {canCreateCourse && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                  }}
                >
                  Создать курс
                </Button>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Analytics Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Аналитика обучения
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{
                p: 2,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${bauhaus.blue}20 0%, ${bauhaus.blue}10 100%)`,
                border: '1px solid',
                borderColor: bauhaus.blue + '30',
              }}>
                <People sx={{ fontSize: 32, color: bauhaus.blue, mb: 1 }} />
                <Typography variant="h4" fontWeight={700} color={bauhaus.blue}>
                  {analytics.totalStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего студентов
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{
                p: 2,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${bauhaus.teal}20 0%, ${bauhaus.teal}10 100%)`,
                border: '1px solid',
                borderColor: bauhaus.teal + '30',
              }}>
                <CheckCircle sx={{ fontSize: 32, color: bauhaus.teal, mb: 1 }} />
                <Typography variant="h4" fontWeight={700} color={bauhaus.teal}>
                  {analytics.completedEnrollments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Завершенных курсов
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{
                p: 2,
                textAlign: 'center',
                background: `linear-gradient(135deg, #7E57C220 0%, #7E57C210 100%)`,
                border: '1px solid',
                borderColor: '#7E57C230',
              }}>
                <TrendingUp sx={{ fontSize: 32, color: '#7E57C2', mb: 1 }} />
                <Typography variant="h4" fontWeight={700} color="#7E57C2">
                  {analytics.averageProgress}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Средний прогресс
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{
                p: 2,
                textAlign: 'center',
                background: `linear-gradient(135deg, #FF980020 0%, #FF980010 100%)`,
                border: '1px solid',
                borderColor: '#FF980030',
              }}>
                <School sx={{ fontSize: 32, color: '#FF9800', mb: 1 }} />
                <Typography variant="h4" fontWeight={700} color="#FF9800">
                  {courses.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Активных курсов
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Top Courses */}
          {analytics.topCourses.length > 0 && (
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Популярные курсы
                </Typography>
                <Stack spacing={1.5}>
                  {analytics.topCourses.map((course, index) => (
                    <Box
                      key={course.courseId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => navigate(`/learning/admin/course/${course.courseId}/stats`)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <Chip
                          label={index + 1}
                          size="small"
                          sx={{
                            bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                            color: 'white',
                            fontWeight: 700,
                            minWidth: 28,
                          }}
                        />
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
                          {course.title}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={2}>
                        <Chip
                          icon={<People sx={{ fontSize: 16 }} />}
                          label={course.students}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: 16 }} />}
                          label={course.completed}
                          size="small"
                          sx={{ bgcolor: `${bauhaus.teal}15`, borderColor: bauhaus.teal }}
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>

        {courses.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <School sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {canCreateCourse ? 'Курсы еще не созданы' : 'Нет доступных курсов'}
            </Typography>
            {canCreateCourse && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Создать первый курс
              </Button>
            )}
          </Card>
        ) : (
          <Box sx={{ overflow: 'hidden', width: '100%' }}>
            <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} md={6} key={course.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 1,
                      mb: 2
                    }}>
                      <Typography variant="h6" fontWeight={700}>
                        {course.title}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/learning/admin/course/${course.id}`)}
                          sx={{ color: bauhaus.blue }}
                          title="Настройки курса"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCourse(course.id)}
                          color="error"
                          title="Удалить курс"
                        >
                          <Delete />
                        </IconButton>
                      </Stack>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {course.description || 'Нет описания'}
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        label={categories.find(c => c.value === course.category)?.label || course.category}
                        size="small"
                        sx={{ bgcolor: `${bauhaus.blue}15`, color: bauhaus.blue }}
                      />
                      {course.duration && (
                        <Chip label={course.duration} size="small" variant="outlined" />
                      )}
                      <Chip
                        label={`${course.lessonsCount || 0} уроков`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>

                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate(`/learning/admin/course/${course.id}`)}
                      sx={{ mt: 2, borderRadius: 2 }}
                    >
                      Управление курсом
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          </Box>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCourse ? 'Редактировать курс' : 'Создать курс'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Название курса"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                autoFocus
              />
              <TextField
                fullWidth
                label="Описание"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                select
                label="Категория"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Длительность (например: 30 мин, 2 часа)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="30 мин"
              />
              <TextField
                fullWidth
                select
                label="Кому доступен"
                value={formData.requiredRole}
                onChange={(e) => setFormData({ ...formData, requiredRole: e.target.value })}
              >
                <MenuItem value="all">Всем</MenuItem>
                <MenuItem value="member">Только участникам</MenuItem>
                <MenuItem value="admin">Только админам</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button
              onClick={handleSaveCourse}
              variant="contained"
              startIcon={<Save />}
            >
              {editingCourse ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}

export default LearningAdminPage;
