// src/components/Common/AttachmentInput.jsx
// Компонент для добавления вложений: файлы + AI генерация изображений

import React, { useState, useRef } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  AttachFile,
  Image,
  AutoAwesome,
  Close,
  Refresh,
  Check,
  InsertDriveFile,
} from '@mui/icons-material';
import aiService from '../../services/ai.service';

function AttachmentInput({ 
  onAttach, 
  disabled = false,
  maxSize = 10 * 1024 * 1024, // 10MB по умолчанию
  acceptedTypes = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt',
  showAiGeneration = true,
}) {
  const fileInputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // AI диалог
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState(null);
  const [aiError, setAiError] = useState('');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFileSelect = () => {
    handleMenuClose();
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.size > maxSize) {
        alert(`Файл ${file.name} слишком большой (макс ${maxSize / 1024 / 1024}MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        onAttach({
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
          size: file.size,
          mimeType: file.type,
          data: e.target.result,
          source: 'upload',
        });
      };
      reader.readAsDataURL(file);
    });

    // Сброс input для повторной загрузки того же файла
    event.target.value = '';
  };

  const handleAiGenerateOpen = () => {
    handleMenuClose();
    setAiDialogOpen(true);
    setAiPrompt('');
    setAiGeneratedImage(null);
    setAiError('');
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Введите описание изображения');
      return;
    }

    setAiGenerating(true);
    setAiError('');
    setAiGeneratedImage(null);

    try {
      const result = await aiService.generateAttachmentImage(aiPrompt);
      
      if (result.success) {
        setAiGeneratedImage(result.imageUrl);
      } else {
        setAiError(result.error || 'Ошибка генерации');
      }
    } catch (error) {
      setAiError(error.message || 'Ошибка генерации');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAiAccept = () => {
    if (aiGeneratedImage) {
      onAttach({
        type: 'image',
        name: `ai-generated-${Date.now()}.png`,
        data: aiGeneratedImage,
        source: 'ai',
        prompt: aiPrompt,
      });
      setAiDialogOpen(false);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedTypes}
        multiple
        style={{ display: 'none' }}
      />

      <Tooltip title="Прикрепить">
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          disabled={disabled}
        >
          <AttachFile />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleFileSelect}>
          <ListItemIcon>
            <InsertDriveFile fontSize="small" />
          </ListItemIcon>
          <ListItemText>Загрузить файл</ListItemText>
        </MenuItem>
        {showAiGeneration && (
          <MenuItem onClick={handleAiGenerateOpen}>
            <ListItemIcon>
              <AutoAwesome fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Создать изображение AI</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* AI диалог */}
      <Dialog 
        open={aiDialogOpen} 
        onClose={() => !aiGenerating && setAiDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" />
          Создать изображение AI
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Опишите изображение, которое хотите создать
          </Alert>

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Например: современный офис с панорамными окнами, минималистичный дизайн..."
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
              <Box
                component="img"
                src={aiGeneratedImage}
                alt="AI Generated"
                sx={{
                  maxWidth: '100%',
                  maxHeight: 300,
                  borderRadius: 2,
                  mb: 2,
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Check />}
                  onClick={handleAiAccept}
                >
                  Прикрепить
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleAiGenerate}
                  disabled={aiGenerating}
                >
                  Перегенерировать
                </Button>
              </Box>
            </Box>
          )}

          {!aiGeneratedImage && !aiGenerating && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Image sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Введите описание и нажмите "Сгенерировать"
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setAiDialogOpen(false)} 
            disabled={aiGenerating}
            sx={{ borderRadius: 50 }}
          >
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Компонент для отображения прикреплённых файлов
export function AttachmentPreview({ attachments, onRemove, editable = true }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      {attachments.map((attachment, index) => (
        <Chip
          key={index}
          icon={attachment.type === 'image' ? <Image fontSize="small" /> : <InsertDriveFile fontSize="small" />}
          label={attachment.name}
          onDelete={editable ? () => onRemove(index) : undefined}
          size="small"
          sx={{
            '& .MuiChip-icon': {
              color: attachment.source === 'ai' ? 'primary.main' : 'text.secondary',
            },
          }}
        />
      ))}
    </Box>
  );
}

export default AttachmentInput;
