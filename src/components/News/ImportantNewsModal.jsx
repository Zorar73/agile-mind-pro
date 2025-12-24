// src/components/News/ImportantNewsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Close,
  Warning,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
} from '@mui/icons-material';
import newsService from '../../services/news.service';
import { useToast } from '../../contexts/ToastContext';

function ImportantNewsModal({ userId, open, onClose }) {
  const toast = useToast();
  const [importantNews, setImportantNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadUnreadImportantNews();
    }
  }, [open, userId]);

  const loadUnreadImportantNews = async () => {
    setLoading(true);
    const result = await newsService.getUnreadImportantNews(userId);
    if (result.success) {
      setImportantNews(result.news);
      setCurrentIndex(0);
    } else {
      toast.error('Ошибка загрузки важных новостей: ' + result.error);
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    const currentNews = importantNews[currentIndex];
    if (!currentNews) return;

    setConfirming(true);
    const result = await newsService.confirmNewsRead(currentNews.id, userId);

    if (result.success) {
      // Если это последняя новость, закрываем модал
      if (currentIndex === importantNews.length - 1) {
        toast.success('Все важные новости прочитаны');
        onClose();
      } else {
        // Переходим к следующей новости
        setCurrentIndex(currentIndex + 1);
      }
    } else {
      toast.error('Ошибка подтверждения: ' + result.error);
    }
    setConfirming(false);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < importantNews.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!open || importantNews.length === 0) return null;

  const currentNews = importantNews[currentIndex];
  const progress = ((currentIndex + 1) / importantNews.length) * 100;

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      // Не позволяем закрыть клавишей Escape или кликом вне диалога
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
        onClose();
      }}
    >
      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Загрузка важных новостей...
          </Typography>
        </Box>
      ) : (
        <>
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Warning />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                Важная новость
              </Typography>
              <Typography variant="caption">
                {currentIndex + 1} из {importantNews.length}
              </Typography>
            </Box>
          </DialogTitle>

          {/* Progress indicator */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%)',
              },
            }}
          />

          <DialogContent sx={{ py: 3 }}>
            {currentNews && (
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  {/* Title */}
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {currentNews.title}
                  </Typography>

                  {/* Tags */}
                  {currentNews.tags && currentNews.tags.length > 0 && (
                    <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {currentNews.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Content */}
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.8,
                      mb: 2,
                    }}
                  >
                    {currentNews.content}
                  </Typography>

                  {/* Image */}
                  {currentNews.imageUrl && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={currentNews.imageUrl}
                        alt={currentNews.title}
                        style={{
                          width: '100%',
                          maxHeight: '400px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                        }}
                      />
                    </Box>
                  )}

                  {/* Created date */}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Опубликовано:{' '}
                    {currentNews.createdAt instanceof Date
                      ? currentNews.createdAt.toLocaleString('ru-RU')
                      : new Date(currentNews.createdAt).toLocaleString('ru-RU')}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Warning message */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: 'warning.lighter',
                border: '1px solid',
                borderColor: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Warning color="warning" />
              <Typography variant="body2" color="text.secondary">
                Пожалуйста, подтвердите, что вы прочитали эту важную новость, чтобы продолжить.
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<NavigateBefore />}
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Назад
              </Button>
              {currentIndex < importantNews.length - 1 && (
                <Button
                  endIcon={<NavigateNext />}
                  onClick={handleNext}
                  disabled={currentIndex === importantNews.length - 1}
                >
                  Далее
                </Button>
              )}
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={confirming ? null : <CheckCircle />}
              onClick={handleConfirm}
              disabled={confirming}
              sx={{
                minWidth: 200,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                },
              }}
            >
              {confirming
                ? 'Подтверждение...'
                : currentIndex === importantNews.length - 1
                ? 'Прочитано и понятно'
                : 'Прочитано, далее'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export default ImportantNewsModal;
