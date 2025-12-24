// src/components/Learning/PracticeAssignment.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  Divider,
  Paper,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Upload,
  AttachFile,
  Send,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Delete,
  Download,
  Description,
} from '@mui/icons-material';
import { UserContext } from '../../App';
import learningService from '../../services/learning.service';
import cloudinaryService from '../../services/cloudinary.service';
import { useToast } from '../../contexts/ToastContext';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
  red: '#E53935',
  orange: '#FF9800',
};

const statusConfig = {
  pending: {
    label: 'На проверке',
    color: 'warning',
    icon: <HourglassEmpty />,
    bgColor: bauhaus.orange,
  },
  approved: {
    label: 'Принято',
    color: 'success',
    icon: <CheckCircle />,
    bgColor: bauhaus.teal,
  },
  rejected: {
    label: 'Отклонено',
    color: 'error',
    icon: <Cancel />,
    bgColor: bauhaus.red,
  },
};

function PracticeAssignment({ lesson, onComplete }) {
  const { user } = useContext(UserContext);
  const toast = useToast();
  
  const [submission, setSubmission] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmission();
  }, [lesson.id, user?.uid]);

  const loadSubmission = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    const result = await learningService.getSubmission(lesson.id, user.uid);
    if (result.success && result.submission) {
      setSubmission(result.submission);
    }
    setLoading(false);
  };

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Проверка типов файлов
    const acceptedTypes = lesson.acceptedFileTypes || ['pdf', 'doc', 'docx', 'zip'];
    const maxSize = (lesson.maxFileSize || 10) * 1024 * 1024; // в байтах

    for (const file of selectedFiles) {
      const ext = file.name.split('.').pop().toLowerCase();
      
      if (!acceptedTypes.includes(ext)) {
        toast.error(`Недопустимый тип файла: ${ext}. Разрешены: ${acceptedTypes.join(', ')}`);
        continue;
      }

      if (file.size > maxSize) {
        toast.error(`Файл ${file.name} слишком большой. Максимум: ${lesson.maxFileSize || 10}MB`);
        continue;
      }

      // Загружаем файл на Cloudinary
      setUploading(true);
      try {
        const result = await cloudinaryService.upload(file, {
          folder: 'assignments',
          resourceType: 'auto',
        });

        if (result.success) {
          setFiles(prev => [...prev, {
            name: file.name,
            url: result.url,
            size: file.size,
          }]);
          toast.success(`Файл ${file.name} загружен`);
        } else {
          toast.error(`Ошибка загрузки ${file.name}`);
        }
      } catch (error) {
        toast.error(`Ошибка загрузки ${file.name}`);
      }
      setUploading(false);
    }

    // Очищаем input
    event.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error('Загрузите хотя бы один файл');
      return;
    }

    setSubmitting(true);
    
    const userData = {
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    };

    const result = await learningService.submitAssignment(lesson.id, user.uid, userData, files);
    
    if (result.success) {
      toast.success('Задание отправлено на проверку!');
      setFiles([]);
      loadSubmission();
    } else {
      toast.error('Ошибка отправки задания');
    }
    
    setSubmitting(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const acceptedTypes = lesson.acceptedFileTypes || ['pdf', 'doc', 'docx', 'zip'];

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ 
        background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
        p: 3,
        color: 'white',
      }}>
        <Typography variant="h6" fontWeight={700}>
          📝 Практическое задание
        </Typography>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Описание задания */}
        {lesson.assignmentDescription && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Описание задания
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ whiteSpace: 'pre-line' }}
            >
              {lesson.assignmentDescription}
            </Typography>
          </Box>
        )}

        {/* Требования */}
        {lesson.requirements && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Требования
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ whiteSpace: 'pre-line' }}
            >
              {lesson.requirements}
            </Typography>
          </Box>
        )}

        {/* Информация о файлах */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Допустимые форматы: {acceptedTypes.join(', ').toUpperCase()}
          <br />
          Максимальный размер: {lesson.maxFileSize || 10} MB
        </Alert>

        <Divider sx={{ my: 3 }} />

        {/* Если есть submission */}
        {submission ? (
          <Box>
            {/* Статус */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Chip
                icon={statusConfig[submission.status].icon}
                label={statusConfig[submission.status].label}
                sx={{ 
                  bgcolor: statusConfig[submission.status].bgColor,
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Отправлено: {submission.submittedAt?.toLocaleDateString?.('ru-RU') || 'Недавно'}
              </Typography>
            </Box>

            {/* Загруженные файлы */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Загруженные файлы:
            </Typography>
            <List dense>
              {submission.files?.map((file, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Description color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={file.name}
                    secondary={formatFileSize(file.size)}
                  />
                  <IconButton 
                    href={file.url} 
                    target="_blank"
                    size="small"
                    color="primary"
                  >
                    <Download />
                  </IconButton>
                </ListItem>
              ))}
            </List>

            {/* Feedback от проверяющего */}
            {submission.feedback && (
              <Paper 
                sx={{ 
                  p: 2, 
                  mt: 2, 
                  bgcolor: submission.status === 'approved' ? 'success.50' : 'error.50',
                  borderLeft: 4,
                  borderColor: submission.status === 'approved' ? 'success.main' : 'error.main',
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Комментарий проверяющего:
                </Typography>
                <Typography variant="body2">
                  {submission.feedback}
                </Typography>
                {submission.grade !== null && (
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                    Оценка: {submission.grade}
                  </Typography>
                )}
              </Paper>
            )}

            {/* Если отклонено - можно переотправить */}
            {submission.status === 'rejected' && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                Задание отклонено. Вы можете загрузить исправленную версию ниже.
              </Alert>
            )}

            {/* Если принято - можно отметить урок как пройденный */}
            {submission.status === 'approved' && onComplete && (
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={onComplete}
                fullWidth
                sx={{ 
                  mt: 3,
                  background: `linear-gradient(135deg, ${bauhaus.teal} 0%, ${bauhaus.blue} 100%)`,
                }}
              >
                Отметить урок как пройденный
              </Button>
            )}
          </Box>
        ) : null}

        {/* Форма загрузки (если нет submission или отклонено) */}
        {(!submission || submission.status === 'rejected') && (
          <Box sx={{ mt: submission ? 3 : 0 }}>
            {submission?.status === 'rejected' && (
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Загрузить новую версию:
              </Typography>
            )}

            {/* Загруженные файлы (ещё не отправленные) */}
            {files.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Файлы для отправки:
                </Typography>
                <Stack spacing={1}>
                  {files.map((file, index) => (
                    <Paper key={index} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachFile color="primary" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <Delete />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Кнопка загрузки */}
            <Button
              component="label"
              variant="outlined"
              startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
              disabled={uploading}
              fullWidth
              sx={{ mb: 2 }}
            >
              {uploading ? 'Загрузка...' : 'Выбрать файлы'}
              <input
                type="file"
                hidden
                multiple
                accept={acceptedTypes.map(t => `.${t}`).join(',')}
                onChange={handleFileSelect}
              />
            </Button>

            {/* Кнопка отправки */}
            <Button
              variant="contained"
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
              onClick={handleSubmit}
              disabled={files.length === 0 || submitting}
              fullWidth
              sx={{ 
                background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
              }}
            >
              {submitting ? 'Отправка...' : 'Отправить на проверку'}
            </Button>
          </Box>
        )}

        {/* Если на проверке */}
        {submission?.status === 'pending' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Ваше задание находится на проверке. Вы получите уведомление, когда проверяющий оценит работу.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default PracticeAssignment;
