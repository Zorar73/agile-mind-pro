import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  PlayCircleOutline,
  Article,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { UserContext } from '../../App';
import learningService from '../../services/learning.service';
import { useToast } from '../../contexts/ToastContext';
import FileUpload from '../Common/FileUpload';
import RichTextEditor from '../Common/RichTextEditor';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
};

const lessonTypes = [
  { value: 'article', label: 'Статья', icon: <Article /> },
  { value: 'video', label: 'Видео', icon: <PlayCircleOutline /> },
];

function LessonsTab({ courseId, course }) {
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    type: 'article',
    duration: '',
    order: 0,
    attachments: [],
  });

  useEffect(() => {
    if (courseId) {
      loadLessons();
    }
  }, [courseId]);

  const loadLessons = async () => {
    setLoading(true);
    const lessonsResult = await learningService.getCourseLessons(courseId);
    if (lessonsResult.success) {
      setLessons(lessonsResult.lessons);
    }
    setLoading(false);
  };

  const handleOpenDialog = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        type: lesson.type || 'article',
        duration: lesson.duration || '',
        order: lesson.order || 0,
        attachments: lesson.attachments || [],
      });
    } else {
      setEditingLesson(null);
      setFormData({
        title: '',
        content: '',
        videoUrl: '',
        type: 'article',
        duration: '',
        order: lessons.length,
        attachments: [],
      });
    }
    setDialogOpen(true);
  };

  const handleFileUpload = (result) => {
    const attachment = {
      url: result.url,
      name: result.originalName || 'файл',
      type: result.resourceType || 'file',
      size: result.bytes || 0,
      publicId: result.publicId,
    };
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, attachment],
    }));
  };

  const handleRemoveAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSaveLesson = async () => {
    if (!formData.title.trim()) {
      toast.error('Введите название урока');
      return;
    }

    if (formData.type === 'video' && !formData.videoUrl.trim()) {
      toast.error('Введите URL видео для видео-урока');
      return;
    }

    if (editingLesson) {
      const result = await learningService.updateLesson(editingLesson.id, formData);
      if (result.success) {
        toast.success('Урок обновлен');
        loadLessons();
        setDialogOpen(false);
      } else {
        toast.error('Ошибка обновления урока');
      }
    } else {
      const result = await learningService.createLesson({ ...formData, courseId }, user.uid);
      if (result.success) {
        toast.success('Урок создан');
        loadLessons();
        setDialogOpen(false);
      } else {
        toast.error('Ошибка создания урока');
      }
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Удалить урок? Это действие нельзя отменить.')) {
      return;
    }

    const result = await learningService.deleteLesson(lessonId, courseId);
    if (result.success) {
      toast.success('Урок удален');
      loadLessons();
    } else {
      toast.error('Ошибка удаления урока');
    }
  };

  const handleMoveLesson = async (lessonId, direction) => {
    const currentIndex = lessons.findIndex(l => l.id === lessonId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === lessons.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedLessons = [...lessons];
    const [movedLesson] = updatedLessons.splice(currentIndex, 1);
    updatedLessons.splice(newIndex, 0, movedLesson);

    const updatePromises = updatedLessons.map((lesson, index) => {
      if (lesson.order !== index) {
        return learningService.updateLesson(lesson.id, { order: index });
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
    loadLessons();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Уроки курса
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)',
          }}
        >
          Добавить урок
        </Button>
      </Box>

      {lessons.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Article sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Уроки еще не созданы
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Создать первый урок
          </Button>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <List>
            {lessons.map((lesson, index) => (
              <React.Fragment key={lesson.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    py: 2,
                    '&:hover': {
                      bgcolor: '#1E88E505',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveLesson(lesson.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUpward fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveLesson(lesson.id, 'down')}
                        disabled={index === lessons.length - 1}
                      >
                        <ArrowDownward fontSize="small" />
                      </IconButton>
                    </Box>

                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1" fontWeight={600}>
                            {index + 1}. {lesson.title}
                          </Typography>
                          <Chip
                            icon={lesson.type === 'video' ? <PlayCircleOutline /> : <Article />}
                            label={lesson.type === 'video' ? 'Видео' : 'Статья'}
                            size="small"
                            variant="outlined"
                          />
                          {lesson.duration && (
                            <Chip label={lesson.duration} size="small" variant="outlined" />
                          )}
                        </Stack>
                      }
                      secondary={
                        lesson.content ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {lesson.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                          </Typography>
                        ) : null
                      }
                    />

                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          edge="end"
                          onClick={() => handleOpenDialog(lesson)}
                          sx={{ color: bauhaus.blue }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteLesson(lesson.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingLesson ? 'Редактировать урок' : 'Создать урок'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Название урока"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
            />
            <TextField
              fullWidth
              select
              label="Тип урока"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {lessonTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {type.icon}
                    <span>{type.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            {formData.type === 'video' && (
              <TextField
                fullWidth
                label="URL видео (YouTube, Rutube, Vimeo и т.д.)"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/embed/... или https://rutube.ru/play/embed/..."
                helperText="Используйте embed URL для правильного отображения. YouTube: youtube.com/embed/ID, Rutube: rutube.ru/play/embed/ID"
              />
            )}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Содержание урока
              </Typography>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Введите текст урока, инструкции или описание. Вы можете форматировать текст и вставлять изображения..."
              />
            </Box>
            <TextField
              fullWidth
              label="Длительность (например: 15 мин, 1 час)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="15 мин"
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Прикрепленные файлы
              </Typography>
              <FileUpload
                folder="lessons"
                multiple={true}
                maxSize={50}
                onUpload={handleFileUpload}
                variant="button"
              />

              {formData.attachments.length > 0 && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {formData.attachments.map((attachment, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{
                        p: 1,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                        {attachment.name}
                      </Typography>
                      <IconButton size="small" onClick={() => handleRemoveAttachment(index)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleSaveLesson}
            variant="contained"
            startIcon={<Save />}
          >
            {editingLesson ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LessonsTab;
