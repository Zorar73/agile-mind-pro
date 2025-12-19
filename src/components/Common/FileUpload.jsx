// src/components/Common/FileUpload.jsx
import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  IconButton,
  Paper,
  Stack,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  CloudUpload,
  Close,
  InsertDriveFile,
  Image,
  VideoFile,
  AudioFile,
  PictureAsPdf,
  Description,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import cloudinaryService from '../../services/cloudinary.service';

// Иконки по типу файла
const FILE_ICONS = {
  image: Image,
  video: VideoFile,
  audio: AudioFile,
  pdf: PictureAsPdf,
  document: Description,
  default: InsertDriveFile,
};

const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) return FILE_ICONS.image;
  if (mimeType.startsWith('video/')) return FILE_ICONS.video;
  if (mimeType.startsWith('audio/')) return FILE_ICONS.audio;
  if (mimeType.includes('pdf')) return FILE_ICONS.pdf;
  if (mimeType.includes('word') || mimeType.includes('document')) return FILE_ICONS.document;
  return FILE_ICONS.default;
};

/**
 * Универсальный компонент загрузки файлов
 * @param {Object} props
 * @param {string} props.folder - Папка в Cloudinary (tasks, sketches, avatars, chat)
 * @param {boolean} props.multiple - Множественная загрузка
 * @param {string[]} props.accept - Принимаемые типы файлов
 * @param {number} props.maxSize - Макс размер в МБ
 * @param {function} props.onUpload - Callback после успешной загрузки ({url, publicId, ...})
 * @param {function} props.onError - Callback при ошибке
 * @param {string} props.variant - Вариант отображения ('dropzone' | 'button' | 'compact')
 */
function FileUpload({
  folder = 'general',
  multiple = false,
  accept = '*/*',
  maxSize = 10,
  onUpload,
  onError,
  variant = 'dropzone',
  disabled = false,
  sx = {},
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const inputRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]); // {file, progress, status, result}
  
  // Обработка выбора файлов
  const handleFiles = async (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      file,
      progress: 0,
      status: 'pending', // pending, uploading, success, error
      result: null,
      error: null,
    }));
    
    // Валидация размера
    const validFiles = newFiles.filter(f => {
      if (!cloudinaryService.validateFileSize(f.file, maxSize)) {
        f.status = 'error';
        f.error = `Файл слишком большой (макс. ${maxSize} МБ)`;
        return false;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Загружаем валидные файлы
    for (let i = 0; i < validFiles.length; i++) {
      const fileObj = validFiles[i];
      
      setFiles(prev => prev.map(f => 
        f.file === fileObj.file ? { ...f, status: 'uploading' } : f
      ));
      
      const result = await cloudinaryService.upload(fileObj.file, {
        folder,
        onProgress: (percent) => {
          setFiles(prev => prev.map(f =>
            f.file === fileObj.file ? { ...f, progress: percent } : f
          ));
        },
      });
      
      if (result.success) {
        setFiles(prev => prev.map(f =>
          f.file === fileObj.file 
            ? { ...f, status: 'success', progress: 100, result } 
            : f
        ));
        
        if (onUpload) {
          onUpload(result);
        }
      } else {
        setFiles(prev => prev.map(f =>
          f.file === fileObj.file 
            ? { ...f, status: 'error', error: result.error } 
            : f
        ));
        
        if (onError) {
          onError(result.error);
        }
      }
    }
  };
  
  // Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  // Клик по инпуту
  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };
  
  const handleInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  };
  
  // Удаление файла из списка
  const handleRemove = (file) => {
    setFiles(prev => prev.filter(f => f.file !== file));
  };
  
  // Скрытый input
  const renderInput = () => (
    <input
      ref={inputRef}
      type="file"
      multiple={multiple}
      accept={accept}
      onChange={handleInputChange}
      style={{ display: 'none' }}
    />
  );
  
  // Вариант: Dropzone
  if (variant === 'dropzone') {
    return (
      <Box sx={sx}>
        {renderInput()}
        
        <Paper
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          sx={{
            p: 4,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: '2px dashed',
            borderColor: isDragging 
              ? 'primary.main' 
              : isDark ? 'divider' : 'grey.300',
            bgcolor: isDragging 
              ? isDark ? 'rgba(100, 181, 246, 0.08)' : 'rgba(30, 136, 229, 0.04)'
              : 'transparent',
            borderRadius: 3,
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.5 : 1,
            '&:hover': !disabled && {
              borderColor: 'primary.main',
              bgcolor: isDark ? 'rgba(100, 181, 246, 0.04)' : 'rgba(30, 136, 229, 0.02)',
            },
          }}
        >
          <CloudUpload 
            sx={{ 
              fontSize: 48, 
              color: isDragging ? 'primary.main' : 'text.secondary',
              mb: 1,
            }} 
          />
          <Typography variant="body1" fontWeight={600} gutterBottom>
            {isDragging ? 'Отпустите файлы' : 'Перетащите файлы сюда'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            или нажмите для выбора
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Максимум {maxSize} МБ
          </Typography>
        </Paper>
        
        {/* Список файлов */}
        {files.length > 0 && (
          <Stack spacing={1} sx={{ mt: 2 }}>
            {files.map((f, idx) => {
              const Icon = getFileIcon(f.file.type);
              
              return (
                <Paper
                  key={idx}
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: f.status === 'success' 
                        ? 'success.main' 
                        : f.status === 'error'
                          ? 'error.main'
                          : isDark ? 'grey.800' : 'grey.100',
                    }}
                  >
                    {f.status === 'success' ? (
                      <CheckCircle />
                    ) : f.status === 'error' ? (
                      <ErrorIcon />
                    ) : (
                      <Icon sx={{ color: isDark ? 'grey.400' : 'grey.600' }} />
                    )}
                  </Avatar>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {f.file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cloudinaryService.formatFileSize(f.file.size)}
                      {f.error && (
                        <Typography component="span" color="error.main" sx={{ ml: 1 }}>
                          {f.error}
                        </Typography>
                      )}
                    </Typography>
                    
                    {f.status === 'uploading' && (
                      <LinearProgress
                        variant="determinate"
                        value={f.progress}
                        sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                      />
                    )}
                  </Box>
                  
                  <IconButton size="small" onClick={() => handleRemove(f.file)}>
                    <Close fontSize="small" />
                  </IconButton>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    );
  }
  
  // Вариант: Button
  if (variant === 'button') {
    return (
      <Box sx={sx}>
        {renderInput()}
        <Button
          variant="outlined"
          startIcon={<CloudUpload />}
          onClick={handleClick}
          disabled={disabled}
          sx={{ borderRadius: 50 }}
        >
          Загрузить {multiple ? 'файлы' : 'файл'}
        </Button>
        
        {files.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
            {files.map((f, idx) => (
              <Chip
                key={idx}
                label={f.file.name}
                size="small"
                color={f.status === 'success' ? 'success' : f.status === 'error' ? 'error' : 'default'}
                onDelete={() => handleRemove(f.file)}
                sx={{ maxWidth: 200 }}
              />
            ))}
          </Stack>
        )}
      </Box>
    );
  }
  
  // Вариант: Compact (только иконка)
  return (
    <Box sx={sx}>
      {renderInput()}
      <IconButton onClick={handleClick} disabled={disabled}>
        <CloudUpload />
      </IconButton>
    </Box>
  );
}

export default FileUpload;
