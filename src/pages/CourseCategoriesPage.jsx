// src/pages/CourseCategoriesPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Stack,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  Save,
  ArrowUpward,
  ArrowDownward,
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

function CourseCategoriesPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    value: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const result = await learningService.getCategories();
    if (result.success) {
      setCategories(result.categories);
    }
    setLoading(false);
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        label: category.label,
        value: category.value,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        label: '',
        value: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.label.trim()) {
      toast.error('Введите название категории');
      return;
    }

    // Генерируем value из label если не указан
    const categoryData = {
      label: formData.label,
      value: formData.value || formData.label.toLowerCase().replace(/\s+/g, '-'),
      order: editingCategory ? editingCategory.order : categories.length,
    };

    if (editingCategory) {
      const result = await learningService.updateCategory(editingCategory.id, categoryData);
      if (result.success) {
        toast.success('Категория обновлена');
        loadCategories();
        setDialogOpen(false);
      } else {
        toast.error('Ошибка обновления категории');
      }
    } else {
      const result = await learningService.createCategory(categoryData, user.uid);
      if (result.success) {
        toast.success('Категория создана');
        loadCategories();
        setDialogOpen(false);
      } else {
        toast.error('Ошибка создания категории');
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Удалить категорию? Курсы с этой категорией останутся, но потеряют привязку.')) {
      return;
    }

    const result = await learningService.deleteCategory(categoryId);
    if (result.success) {
      toast.success('Категория удалена');
      loadCategories();
    } else {
      toast.error('Ошибка удаления категории');
    }
  };

  const handleMoveCategory = async (categoryId, direction) => {
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === categories.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedCategories = [...categories];
    const [movedCategory] = updatedCategories.splice(currentIndex, 1);
    updatedCategories.splice(newIndex, 0, movedCategory);

    // Обновляем order для всех категорий
    const updatePromises = updatedCategories.map((category, index) => {
      if (category.order !== index) {
        return learningService.updateCategory(category.id, { order: index });
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
    loadCategories();
  };

  const handleInitializeDefaults = async () => {
    if (!window.confirm('Инициализировать категории по умолчанию? Это добавит стандартные категории.')) {
      return;
    }

    const result = await learningService.initializeDefaultCategories(user.uid);
    if (result.success) {
      toast.success('Категории инициализированы');
      loadCategories();
    } else {
      toast.error('Ошибка инициализации категорий');
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
            onClick={() => navigate('/learning/admin')}
            sx={{ mb: 2 }}
          >
            Вернуться к управлению курсами
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Категории курсов
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Управление категориями для организации курсов
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              {categories.length === 1 && (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleInitializeDefaults}
                  sx={{ borderRadius: 2 }}
                >
                  Добавить стандартные
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                }}
              >
                Создать категорию
              </Button>
            </Stack>
          </Box>
        </Box>

        {categories.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <Category sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Категории еще не созданы
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleInitializeDefaults}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Инициализировать категории по умолчанию
            </Button>
          </Card>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              Первая категория "Все курсы" (value: "all") обязательна и показывает все курсы без фильтрации
            </Alert>

            <Card sx={{ borderRadius: 3 }}>
              <List>
                {categories.map((category, index) => (
                  <ListItem
                    key={category.id}
                    sx={{
                      py: 2,
                      borderBottom: index < categories.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveCategory(category.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUpward fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveCategory(category.id, 'down')}
                          disabled={index === categories.length - 1}
                        >
                          <ArrowDownward fontSize="small" />
                        </IconButton>
                      </Box>

                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight={600}>
                            {category.label}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            ID: {category.value}
                          </Typography>
                        }
                      />

                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            edge="end"
                            onClick={() => handleOpenDialog(category)}
                            sx={{ color: bauhaus.blue }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteCategory(category.id)}
                            color="error"
                            disabled={category.value === 'all'}
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </ListItemSecondaryAction>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Card>
          </>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Название категории"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                autoFocus
                placeholder="Например: Основы работы"
              />
              <TextField
                fullWidth
                label="ID категории (value)"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Например: basics (автоматически из названия)"
                helperText="Используется для идентификации. Оставьте пустым для автогенерации"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button
              onClick={handleSaveCategory}
              variant="contained"
              startIcon={<Save />}
            >
              {editingCategory ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}

export default CourseCategoriesPage;
