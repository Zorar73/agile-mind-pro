// src/components/News/NewsCreateDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Close, Image as ImageIcon, Add } from '@mui/icons-material';
import cloudinaryService from '../../services/cloudinary.service';
import { useToast } from '../../contexts/ToastContext';

function NewsCreateDialog({ open, onClose, onCreate }) {
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Введите заголовок новости');
      return;
    }

    if (!content.trim()) {
      toast.error('Введите содержание новости');
      return;
    }

    onCreate({
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim() || null,
      tags,
    });

    // Очищаем форму
    setTitle('');
    setContent('');
    setImageUrl('');
    setTags([]);
    setTagInput('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка размера файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Можно загружать только изображения');
      return;
    }

    setUploading(true);

    try {
      const result = await cloudinaryService.upload(file, { folder: 'news' });
      if (result.success) {
        setImageUrl(result.url);
        toast.success('Изображение загружено');
      } else {
        toast.error('Ошибка загрузки изображения: ' + result.error);
      }
    } catch (error) {
      toast.error('Ошибка загрузки изображения');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Создать новость
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Заголовок */}
          <TextField
            label="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            autoFocus
          />

          {/* Содержание */}
          <TextField
            label="Содержание"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={6}
            fullWidth
            required
          />

          {/* Загрузка изображения */}
          <Box>
            <input
              accept="image/*"
              id="image-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={uploading ? <CircularProgress size={20} /> : <ImageIcon />}
                disabled={uploading}
              >
                {uploading ? 'Загрузка...' : 'Загрузить изображение'}
              </Button>
            </label>
            {imageUrl && (
              <Box sx={{ mt: 2, position: 'relative' }}>
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
                <IconButton
                  onClick={() => setImageUrl('')}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                  size="small"
                >
                  <Close />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Теги */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Теги
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Добавить тег"
                fullWidth
              />
              <IconButton onClick={handleAddTag} color="primary">
                <Add />
              </IconButton>
            </Box>
            {tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewsCreateDialog;
