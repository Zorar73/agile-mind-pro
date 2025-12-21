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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  Save,
  School,
  Category,
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

    setLoading(false);
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
