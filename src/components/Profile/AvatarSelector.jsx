// src/components/Profile/AvatarSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  Grid,
  Tabs,
  Tab,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  CloudUpload,
  AutoAwesome,
  Refresh,
  Check,
  Close,
} from '@mui/icons-material';
import { STANDARD_AVATARS, generateLetterAvatar, generateAvatarColor } from '../../utils/avatarGenerator';
import aiService from '../../services/ai.service';
import cloudinaryService from '../../services/cloudinary.service';

function AvatarSelector({ open, onClose, onSelect, currentAvatar, firstName, lastName }) {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState(0);
  const [selected, setSelected] = useState(currentAvatar);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // AI генерация
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState(null);
  const [aiError, setAiError] = useState('');
  
  // Сгенерированный аватар с буквой (кэшируем)
  const [letterAvatar, setLetterAvatar] = useState('');

  useEffect(() => {
    // Генерируем аватар с буквой только когда диалог открыт
    if (open && firstName) {
      try {
        const avatar = generateLetterAvatar(firstName, lastName);
        setLetterAvatar(avatar);
      } catch (e) {
        console.error('Error generating letter avatar:', e);
        setLetterAvatar('');
      }
    }
  }, [open, firstName, lastName]);

  const handleSelect = () => {
    let avatarToSave = selected;
    
    // Если выбрано загруженное изображение
    if (selected === 'uploaded' && uploadedImage) {
      avatarToSave = uploadedImage;
    }
    // Если выбран AI сгенерированный
    else if (selected === 'ai-generated' && aiGeneratedImage) {
      avatarToSave = aiGeneratedImage;
    }
    // Если выбран сгенерированный с буквой
    else if (selected === 'generated' && letterAvatar) {
      avatarToSave = letterAvatar;
    }
    // Если выбран стандартный аватар (default-N)
    else if (selected?.startsWith('default-')) {
      const index = parseInt(selected.replace('default-', ''), 10) - 1;
      if (index >= 0 && index < STANDARD_AVATARS.length) {
        avatarToSave = STANDARD_AVATARS[index];
      }
    }
    
    onSelect(avatarToSave);
    onClose();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    setUploading(true);

    try {
      // Загружаем в Cloudinary
      const result = await cloudinaryService.upload(file, { folder: 'avatars' });

      if (result.success) {
        setUploadedImage(result.url);
        setSelected('uploaded');
      } else {
        alert('Ошибка загрузки: ' + result.error);
      }
    } catch (error) {
      alert('Ошибка загрузки изображения');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Введите описание для генерации');
      return;
    }

    setAiGenerating(true);
    setAiError('');
    setAiGeneratedImage(null);

    try {
      const result = await aiService.generateAvatar(aiPrompt);
      
      if (result.success) {
        setAiGeneratedImage(result.imageUrl);
        setSelected('ai-generated');
      } else {
        setAiError(result.error || 'Ошибка генерации');
      }
    } catch (error) {
      setAiError(error.message || 'Ошибка генерации');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleRegenerateAi = () => {
    handleAiGenerate();
  };

  const bgColor = generateAvatarColor(firstName);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>Выбрать аватар</DialogTitle>
      <DialogContent>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)} 
          sx={{ mb: 2 }}
          variant="fullWidth"
        >
          <Tab label="Стандартные" />
          <Tab label="Загрузить" icon={<CloudUpload fontSize="small" />} iconPosition="start" />
          <Tab label="AI" icon={<AutoAwesome fontSize="small" />} iconPosition="start" />
        </Tabs>

        {/* Таб 1: Стандартные аватары */}
        {activeTab === 0 && (
          <Box>
            {/* Сгенерированный с буквой */}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              С первой буквой имени:
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: bgColor,
                  fontSize: '2rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selected === 'generated' ? '3px solid' : '2px solid transparent',
                  borderColor: selected === 'generated' ? 'primary.main' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.light',
                    transform: 'scale(1.05)',
                  },
                }}
                onClick={() => setSelected('generated')}
              >
                {firstName?.charAt(0)?.toUpperCase() || '?'}
              </Avatar>
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Стандартные аватары:
            </Typography>
            <Grid container spacing={1.5} sx={{ mt: 1 }}>
              {STANDARD_AVATARS.slice(0, 15).map((avatar, index) => (
                <Grid item key={index}>
                  <Box
                    component="img"
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    sx={{
                      width: 50,
                      height: 50,
                      cursor: 'pointer',
                      border: selected === `default-${index + 1}` ? '3px solid' : '2px solid transparent',
                      borderColor: selected === `default-${index + 1}` ? 'primary.main' : 'transparent',
                      borderRadius: '50%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.light',
                        transform: 'scale(1.1)',
                      },
                    }}
                    onClick={() => setSelected(`default-${index + 1}`)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Таб 2: Загрузить с устройства */}
        {activeTab === 1 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {uploading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Загрузка изображения...
                </Typography>
              </Box>
            ) : uploadedImage ? (
              <Box>
                <Avatar
                  src={uploadedImage}
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto',
                    mb: 2,
                    border: selected === 'uploaded' ? '3px solid' : 'none',
                    borderColor: 'primary.main',
                  }}
                  onClick={() => setSelected('uploaded')}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    Выбрать другое
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => {
                      setUploadedImage(null);
                      if (selected === 'uploaded') setSelected(currentAvatar);
                    }}
                    disabled={uploading}
                  >
                    Удалить
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 4,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  Нажмите для загрузки
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PNG, JPG до 5MB
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Таб 3: AI генерация */}
        {activeTab === 2 && (
          <Box sx={{ py: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Опишите, как должен выглядеть ваш аватар, и AI сгенерирует его.
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Например: профессиональный портрет мужчины в деловом костюме, дружелюбный взгляд"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={aiGenerating}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleAiGenerate}
              disabled={aiGenerating || !aiPrompt.trim()}
              startIcon={aiGenerating ? <CircularProgress size={20} /> : <AutoAwesome />}
              sx={{ mb: 2 }}
            >
              {aiGenerating ? 'Генерация...' : 'Сгенерировать'}
            </Button>

            {aiError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {aiError}
              </Alert>
            )}

            {aiGeneratedImage && (
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={aiGeneratedImage}
                  sx={{
                    width: 150,
                    height: 150,
                    margin: '0 auto',
                    mb: 2,
                    border: selected === 'ai-generated' ? '3px solid' : '2px solid transparent',
                    borderColor: selected === 'ai-generated' ? 'primary.main' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelected('ai-generated')}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Check />}
                    variant={selected === 'ai-generated' ? 'contained' : 'outlined'}
                    onClick={() => setSelected('ai-generated')}
                  >
                    Выбрать
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={handleRegenerateAi}
                    disabled={aiGenerating}
                  >
                    Перегенерировать
                  </Button>
                </Box>
              </Box>
            )}

            {!aiGeneratedImage && !aiGenerating && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AutoAwesome sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Введите описание и нажмите "Сгенерировать"
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 50 }}>
          Отмена
        </Button>
        <Button 
          onClick={handleSelect} 
          variant="contained"
          disabled={!selected}
          sx={{ borderRadius: 50 }}
        >
          Выбрать
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AvatarSelector;
