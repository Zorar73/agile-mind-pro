// src/pages/LessonPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  ArrowForward,
  PlayCircleOutline,
  AttachFile,
  Download,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';
import { useToast } from '../contexts/ToastContext';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
};

function LessonPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && lessonId) {
      loadData();
    }
  }, [user, lessonId]);

  const loadData = async () => {
    setLoading(true);

    // Загружаем урок
    const lessonResult = await learningService.getLesson(lessonId);
    if (lessonResult.success) {
      setLesson(lessonResult.lesson);

      // Загружаем курс
      const courseResult = await learningService.getCourse(lessonResult.lesson.courseId);
      if (courseResult.success) {
        setCourse(courseResult.course);
      }

      // Загружаем все уроки курса
      const lessonsResult = await learningService.getCourseLessons(lessonResult.lesson.courseId);
      if (lessonsResult.success) {
        setAllLessons(lessonsResult.lessons);
      }

      // Проверяем, пройден ли урок
      const progressResult = await learningService.getUserCourseProgress(
        user.uid,
        lessonResult.lesson.courseId
      );
      if (progressResult.success) {
        setIsCompleted(progressResult.progress.completedLessons?.includes(lessonId) || false);
      }
    }

    setLoading(false);
  };

  const handleMarkComplete = async () => {
    if (!lesson) return;

    const result = await learningService.markLessonCompleted(user.uid, lesson.courseId, lessonId);
    if (result.success) {
      setIsCompleted(true);
      toast.success('Урок отмечен как пройденный');

      // Если прогресс 100%, показываем поздравление
      if (result.progress === 100) {
        toast.success('🎉 Поздравляем! Вы завершили курс!');
      }
    } else {
      toast.error('Ошибка сохранения прогресса');
    }
  };

  const handleNextLesson = () => {
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    if (currentIndex < allLessons.length - 1) {
      navigate(`/learning/lesson/${allLessons[currentIndex + 1].id}`);
    } else {
      // Последний урок - возвращаемся к курсу
      navigate(`/learning/course/${lesson.courseId}`);
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

  if (!lesson) {
    return (
      <MainLayout>
        <Container>
          <Typography variant="h6" color="text.secondary">
            Урок не найден
          </Typography>
        </Container>
      </MainLayout>
    );
  }

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const isLastLesson = currentIndex === allLessons.length - 1;

  return (
    <MainLayout>
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/learning/course/${lesson.courseId}`)}
          sx={{ mb: 3 }}
        >
          Вернуться к курсу
        </Button>

        {/* Lesson Header */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              {course && (
                <Chip label={course.title} size="small" sx={{ bgcolor: `${bauhaus.blue}15`, color: bauhaus.blue }} />
              )}
              <Chip
                label={`Урок ${currentIndex + 1} из ${allLessons.length}`}
                size="small"
                variant="outlined"
              />
              {isCompleted && (
                <Chip
                  icon={<CheckCircle />}
                  label="Пройдено"
                  size="small"
                  sx={{ bgcolor: bauhaus.teal, color: 'white', '& .MuiChip-icon': { color: 'white' } }}
                />
              )}
            </Stack>

            <Typography variant="h4" fontWeight={800} gutterBottom>
              {lesson.title}
            </Typography>

            {lesson.duration && (
              <Typography variant="body2" color="text.secondary">
                Длительность: {lesson.duration}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Video */}
        {lesson.type === 'video' && lesson.videoUrl && (
          <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'relative',
                paddingTop: '56.25%', // 16:9 aspect ratio
                bgcolor: 'black',
              }}
            >
              <Box
                component="iframe"
                src={lesson.videoUrl}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </Card>
        )}

        {/* Content */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                padding: 0,
                '& p': { mb: 2, lineHeight: 1.8 },
                '& h1': { fontSize: '2rem', fontWeight: 700, mb: 2, mt: 3 },
                '& h2': { fontSize: '1.75rem', fontWeight: 700, mb: 2, mt: 2.5 },
                '& h3': { fontSize: '1.5rem', fontWeight: 600, mb: 1.5, mt: 2 },
                '& h4': { fontSize: '1.25rem', fontWeight: 600, mb: 1.5, mt: 2 },
                '& h5': { fontSize: '1.1rem', fontWeight: 600, mb: 1, mt: 1.5 },
                '& h6': { fontSize: '1rem', fontWeight: 600, mb: 1, mt: 1.5 },
                '& ul, & ol': { mb: 2, pl: 3 },
                '& li': { mb: 0.5 },
                '& blockquote': {
                  borderLeft: '4px solid #1E88E5',
                  pl: 2,
                  py: 1,
                  mb: 2,
                  fontStyle: 'italic',
                  bgcolor: 'action.hover',
                },
                '& pre': {
                  bgcolor: 'action.hover',
                  p: 2,
                  borderRadius: 1,
                  mb: 2,
                  overflow: 'auto',
                },
                '& code': {
                  bgcolor: 'action.hover',
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 0.5,
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  my: 2,
                  display: 'block',
                },
                '& a': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
                '& hr': {
                  my: 3,
                  border: 'none',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                },
              }}
              dangerouslySetInnerHTML={{
                __html: lesson.content || '<p>Содержимое урока еще не добавлено</p>',
              }}
            />
          </CardContent>
        </Card>

        {/* Attachments */}
        {lesson.attachments && lesson.attachments.length > 0 && (
          <Card sx={{ mb: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <AttachFile sx={{ color: bauhaus.blue }} />
                <Typography variant="h6" fontWeight={700}>
                  Прикрепленные файлы
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                {lesson.attachments.map((attachment, index) => (
                  <Button
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    startIcon={<Download />}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      borderRadius: 2,
                      py: 1.5,
                      px: 2,
                      textTransform: 'none',
                    }}
                  >
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {attachment.name}
                    </Typography>
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4
        }}>
          {!isCompleted && (
            <Button
              variant="contained"
              size="large"
              startIcon={<CheckCircle />}
              onClick={handleMarkComplete}
              fullWidth
              sx={{
                flex: { sm: 1 },
                borderRadius: 2,
                py: 1.5,
                background: `linear-gradient(135deg, ${bauhaus.teal} 0%, ${bauhaus.blue} 100%)`,
              }}
            >
              Отметить как пройденный
            </Button>
          )}

          <Button
            variant={isCompleted ? 'contained' : 'outlined'}
            size="large"
            endIcon={<ArrowForward />}
            onClick={handleNextLesson}
            fullWidth
            sx={{
              flex: { sm: 1 },
              borderRadius: 2,
              py: 1.5,
              ...(isCompleted && {
                background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
              }),
            }}
          >
            {isLastLesson ? 'Завершить курс' : 'Следующий урок'}
          </Button>
        </Box>
      </Container>
    </MainLayout>
  );
}

export default LessonPage;
