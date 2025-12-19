// src/components/Common/AttachmentViewer.jsx
// Компонент для отображения вложений (изображения, видео, аудио, файлы)

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Link,
  Stack,
} from '@mui/material';
import {
  Download,
  PictureAsPdf,
  InsertDriveFile,
  Description,
} from '@mui/icons-material';

/**
 * Компонент для отображения вложения
 * @param {Object} props
 * @param {Object} props.attachment - { type, name, url, mimeType, size }
 * @param {string} props.size - Размер ('small' | 'medium' | 'large')
 */
function AttachmentViewer({ attachment, size = 'medium' }) {
  if (!attachment || !attachment.url) return null;

  const { type, name, url, mimeType } = attachment;

  // Размеры для разных вариантов
  const sizes = {
    small: { maxWidth: 200, maxHeight: 150 },
    medium: { maxWidth: 400, maxHeight: 300 },
    large: { maxWidth: '100%', maxHeight: 500 },
  };

  const maxSize = sizes[size] || sizes.medium;

  // Изображение
  if (type === 'image') {
    return (
      <Box sx={{ mt: 1 }}>
        <Link href={url} target="_blank" rel="noopener noreferrer">
          <Box
            component="img"
            src={url}
            alt={name}
            sx={{
              maxWidth: maxSize.maxWidth,
              maxHeight: maxSize.maxHeight,
              borderRadius: 2,
              display: 'block',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          />
        </Link>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {name}
        </Typography>
      </Box>
    );
  }

  // Видео
  if (type === 'video') {
    return (
      <Box sx={{ mt: 1 }}>
        <video
          controls
          style={{
            maxWidth: maxSize.maxWidth,
            maxHeight: maxSize.maxHeight,
            borderRadius: 8,
            display: 'block',
          }}
        >
          <source src={url} type={mimeType || 'video/mp4'} />
          Ваш браузер не поддерживает воспроизведение видео.
        </video>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {name}
        </Typography>
      </Box>
    );
  }

  // Аудио
  if (type === 'audio') {
    return (
      <Box sx={{ mt: 1 }}>
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.default',
            maxWidth: maxSize.maxWidth,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1 }}>
              {name}
            </Typography>
            <IconButton
              size="small"
              component="a"
              href={url}
              download={name}
              target="_blank"
            >
              <Download fontSize="small" />
            </IconButton>
          </Stack>
          <audio
            controls
            style={{ width: '100%', height: 40 }}
          >
            <source src={url} type={mimeType || 'audio/mpeg'} />
            Ваш браузер не поддерживает воспроизведение аудио.
          </audio>
        </Paper>
      </Box>
    );
  }

  // PDF
  if (type === 'pdf') {
    return (
      <Box sx={{ mt: 1 }}>
        <Paper
          sx={{
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            maxWidth: maxSize.maxWidth,
            bgcolor: 'background.default',
          }}
        >
          <PictureAsPdf sx={{ fontSize: 32, color: 'error.main' }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={500} noWrap>
              {name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                variant="caption"
                underline="hover"
              >
                Открыть
              </Link>
              <Typography variant="caption" color="text.secondary">
                •
              </Typography>
              <Link
                href={url}
                download={name}
                variant="caption"
                underline="hover"
              >
                Скачать
              </Link>
            </Stack>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Другие файлы
  return (
    <Box sx={{ mt: 1 }}>
      <Paper
        sx={{
          p: 1.5,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          maxWidth: maxSize.maxWidth,
          bgcolor: 'background.default',
        }}
      >
        <InsertDriveFile sx={{ fontSize: 32, color: 'text.secondary' }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={500} noWrap>
            {name}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              variant="caption"
              underline="hover"
            >
              Открыть
            </Link>
            <Typography variant="caption" color="text.secondary">
              •
            </Typography>
            <Link
              href={url}
              download={name}
              variant="caption"
              underline="hover"
            >
              Скачать
            </Link>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default AttachmentViewer;
