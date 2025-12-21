import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Save,
  Image as ImageIcon,
} from '@mui/icons-material';
import learningService from '../../services/learning.service';
import { useToast } from '../../contexts/ToastContext';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
};

function SettingsTab({ courseId, course, onUpdate }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || '',
    duration: course?.duration || '',
    requiredRole: course?.requiredRole || 'all',
    coverImage: course?.coverImage || null,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        duration: course.duration || '',
        requiredRole: course.requiredRole || 'all',
        coverImage: course.coverImage || null,
      });
    }
  }, [course]);

  const loadCategories = async () => {
    const result = await learningService.getCategories();
    if (result.success) {
      const cats = result.categories.filter(c => c.value !== 'all');
      setCategories(cats);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('upload_preset', 'ml_default');
    formDataUpload.append('folder', 'courses/covers');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload,
        }
      );

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        const url = await uploadToCloudinary(file);

        // Сразу сохраняем в базу данных
        const result = await learningService.updateCourse(courseId, { coverImage: url });

        if (result.success) {
          setFormData({ ...formData, coverImage: url });
          toast.success('Обложка курса сохранена');

          // Перезагружаем данные курса
          if (onUpdate) {
            await onUpdate();
          }
        } else {
          toast.error('Ошибка сохранения обложки');
        }
      } catch (error) {
        toast.error('Ошибка загрузки изображения');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Введите название курса');
      return;
    }

    setLoading(true);

    const result = await learningService.updateCourse(courseId, formData);

    if (result.success) {
      toast.success('Настройки курса сохранены');

      // Перезагружаем данные курса
      if (onUpdate) {
        await onUpdate();
      }
    } else {
      toast.error('Ошибка сохранения настроек');
    }

    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Настройки курса
      </Typography>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
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
              label="Длительность (например: 4 часа, 2 недели)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="4 часа"
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Обложка курса
              </Typography>
              {formData.coverImage && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={formData.coverImage}
                    alt="Course cover"
                    style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                  />
                </Box>
              )}
              <Button
                component="label"
                startIcon={<ImageIcon />}
                variant="outlined"
                disabled={uploadingImage}
              >
                {uploadingImage ? 'Загрузка...' : 'Загрузить обложку'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            </Box>

            <TextField
              fullWidth
              select
              label="Требуемая роль для доступа"
              value={formData.requiredRole}
              onChange={(e) => setFormData({ ...formData, requiredRole: e.target.value })}
              helperText="Кто может видеть и проходить этот курс"
            >
              <MenuItem value="all">Все пользователи</MenuItem>
              <MenuItem value="member">Участники (не pending)</MenuItem>
              <MenuItem value="admin">Только администраторы</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={loading}
          sx={{
            py: 1.5,
            px: 6,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)',
          }}
        >
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </Box>
    </Box>
  );
}

export default SettingsTab;
