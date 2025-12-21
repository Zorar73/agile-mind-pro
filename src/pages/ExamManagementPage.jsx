// src/pages/ExamManagementPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Stack,
  Chip,
  MenuItem,
  Divider,
  Paper,
  Checkbox,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  Save,
  Quiz,
  Close,
  Image as ImageIcon,
  DeleteOutline,
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

const examTypes = [
  { value: 'auto', label: 'Тест с автопроверкой' },
  { value: 'manual', label: 'Открытые вопросы' },
  { value: 'combined', label: 'Комбинированный' },
];

const questionTypes = [
  { value: 'single', label: 'Один правильный ответ' },
  { value: 'multiple', label: 'Несколько правильных' },
  { value: 'text', label: 'Текстовый ответ' },
];

function ExamManagementPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'auto',
    passingScore: 70,
    timeLimit: null,
    questions: [],
    requiredLessonId: null,
    isBlocking: false,
    isGlobal: false,
  });
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'single',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    questionImage: null,
    optionImages: [null, null, null, null],
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const loadData = async () => {
    setLoading(true);

    const courseResult = await learningService.getCourse(courseId);
    if (courseResult.success) {
      setCourse(courseResult.course);
    }

    const examsResult = await learningService.getCourseExams(courseId);
    if (examsResult.success) {
      setExams(examsResult.exams);
    }

    const lessonsResult = await learningService.getCourseLessons(courseId);
    if (lessonsResult.success) {
      setLessons(lessonsResult.lessons);
    }

    setLoading(false);
  };

  const handleOpenDialog = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        title: exam.title,
        description: exam.description || '',
        type: exam.type || 'auto',
        passingScore: exam.passingScore || 70,
        timeLimit: exam.timeLimit || null,
        questions: exam.questions || [],
        requiredLessonId: exam.requiredLessonId || null,
        isBlocking: exam.isBlocking || false,
        isGlobal: exam.isGlobal || false,
      });
    } else {
      setEditingExam(null);
      setFormData({
        title: '',
        description: '',
        type: 'auto',
        passingScore: 70,
        timeLimit: null,
        questions: [],
        requiredLessonId: null,
        isBlocking: false,
        isGlobal: false,
      });
    }
    setDialogOpen(true);
  };

  const handleSaveExam = async () => {
    if (!formData.title.trim()) {
      toast.error('Введите название экзамена');
      return;
    }

    if (formData.questions.length === 0) {
      toast.error('Добавьте хотя бы один вопрос');
      return;
    }

    const examData = {
      ...formData,
      courseId,
    };

    if (editingExam) {
      const result = await learningService.updateExam(editingExam.id, examData);
      if (result.success) {
        toast.success('Экзамен обновлен');
        loadData();
        setDialogOpen(false);
      } else {
        toast.error('Ошибка обновления экзамена');
      }
    } else {
      const result = await learningService.createExam(examData, user.uid);
      if (result.success) {
        toast.success('Экзамен создан');
        loadData();
        setDialogOpen(false);
      } else {
        toast.error('Ошибка создания экзамена');
      }
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Удалить экзамен? Это действие нельзя отменить.')) {
      return;
    }

    const result = await learningService.deleteExam(examId);
    if (result.success) {
      toast.success('Экзамен удален');
      loadData();
    } else {
      toast.error('Ошибка удаления экзамена');
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    formData.append('folder', 'exams/questions');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleQuestionImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        const url = await uploadToCloudinary(file);
        setCurrentQuestion({ ...currentQuestion, questionImage: url });
        toast.success('Изображение загружено');
      } catch (error) {
        toast.error('Ошибка загрузки изображения');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleOptionImageUpload = async (event, optionIndex) => {
    const file = event.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        const url = await uploadToCloudinary(file);
        const newOptionImages = [...currentQuestion.optionImages];
        newOptionImages[optionIndex] = url;
        setCurrentQuestion({ ...currentQuestion, optionImages: newOptionImages });
        toast.success('Изображение загружено');
      } catch (error) {
        toast.error('Ошибка загрузки изображения');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleAddQuestion = () => {
    setCurrentQuestion({
      question: '',
      type: 'single',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      questionImage: null,
      optionImages: [null, null, null, null],
    });
    setQuestionDialogOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error('Введите текст вопроса');
      return;
    }

    if (currentQuestion.type !== 'text') {
      const validOptions = currentQuestion.options.filter(o => o.trim());
      if (validOptions.length < 2) {
        toast.error('Добавьте минимум 2 варианта ответа');
        return;
      }
      if (!currentQuestion.correctAnswer) {
        toast.error('Укажите правильный ответ');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion, id: Date.now() }],
    }));
    setQuestionDialogOpen(false);
  };

  const handleRemoveQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
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

  if (!course) {
    return (
      <MainLayout>
        <Container>
          <Typography variant="h6" color="text.secondary">
            Курс не найден
          </Typography>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/learning/admin/course/${courseId}`)}
            sx={{ mb: 2 }}
          >
            Вернуться к урокам
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Экзамены курса
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {course.title}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 2,
                background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
              }}
            >
              Создать экзамен
            </Button>
          </Box>
        </Box>

        {exams.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <Quiz sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Экзамены еще не созданы
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Создать первый экзамен
            </Button>
          </Card>
        ) : (
          <Card sx={{ borderRadius: 3 }}>
            <List>
              {exams.map((exam, index) => (
                <React.Fragment key={exam.id}>
                  {index > 0 && <Divider />}
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1" fontWeight={600}>
                            {exam.title}
                          </Typography>
                          <Chip
                            label={examTypes.find(t => t.value === exam.type)?.label || exam.type}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`${exam.questions?.length || 0} вопросов`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {exam.description || 'Нет описания'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Проходной балл: {exam.passingScore}% |
                            {exam.timeLimit ? ` Ограничение: ${exam.timeLimit} мин` : ' Без ограничения времени'}
                          </Typography>
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/learning/admin/exam/${exam.id}/results`)}
                        >
                          Результаты
                        </Button>
                        <IconButton
                          edge="end"
                          onClick={() => handleOpenDialog(exam)}
                          sx={{ color: bauhaus.blue }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteExam(exam.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Card>
        )}

        {/* Exam Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingExam ? 'Редактировать экзамен' : 'Создать экзамен'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Название экзамена"
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
                rows={2}
              />
              <TextField
                fullWidth
                select
                label="Тип экзамена"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {examTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Проходной балл (%)"
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 70 })}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
                <TextField
                  fullWidth
                  label="Ограничение времени (мин)"
                  type="number"
                  value={formData.timeLimit || ''}
                  onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Без ограничения"
                />
              </Stack>

              <Divider />

              {/* Exam Settings */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Настройки доступа к экзамену
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isGlobal}
                        onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked, requiredLessonId: e.target.checked ? null : formData.requiredLessonId })}
                      />
                    }
                    label="Экзамен доступен для всех (без привязки к уроку)"
                  />
                  {!formData.isGlobal && (
                    <TextField
                      fullWidth
                      select
                      label="Доступен после урока"
                      value={formData.requiredLessonId || ''}
                      onChange={(e) => setFormData({ ...formData, requiredLessonId: e.target.value || null })}
                      helperText="Экзамен станет доступен после прохождения выбранного урока"
                    >
                      <MenuItem value="">Без ограничений</MenuItem>
                      {lessons.map((lesson) => (
                        <MenuItem key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isBlocking}
                        onChange={(e) => setFormData({ ...formData, isBlocking: e.target.checked })}
                      />
                    }
                    label="Блокирующий экзамен (необходимо сдать для продолжения обучения)"
                  />
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">
                    Вопросы ({formData.questions.length})
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={handleAddQuestion}
                    size="small"
                  >
                    Добавить вопрос
                  </Button>
                </Stack>

                {formData.questions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Вопросы еще не добавлены
                  </Typography>
                ) : (
                  <List dense>
                    {formData.questions.map((q, index) => (
                      <ListItem key={index} sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 1 }}>
                        <ListItemText
                          primary={`${index + 1}. ${q.question}`}
                          secondary={`${questionTypes.find(t => t.value === q.type)?.label} | ${q.points} балл(ов)`}
                        />
                        <IconButton size="small" onClick={() => handleRemoveQuestion(index)}>
                          <Close fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button
              onClick={handleSaveExam}
              variant="contained"
              startIcon={<Save />}
            >
              {editingExam ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Question Dialog */}
        <Dialog open={questionDialogOpen} onClose={() => setQuestionDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Добавить вопрос</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Текст вопроса"
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                multiline
                rows={2}
                autoFocus
              />

              {/* Question Image */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Изображение к вопросу (необязательно)
                </Typography>
                {currentQuestion.questionImage ? (
                  <Paper sx={{ p: 1, position: 'relative' }}>
                    <img
                      src={currentQuestion.questionImage}
                      alt="Question"
                      style={{ maxWidth: '100%', maxHeight: 200, display: 'block', borderRadius: 4 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setCurrentQuestion({ ...currentQuestion, questionImage: null })}
                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Paper>
                ) : (
                  <Button
                    component="label"
                    startIcon={<ImageIcon />}
                    variant="outlined"
                    disabled={uploadingImage}
                  >
                    Загрузить изображение
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleQuestionImageUpload}
                    />
                  </Button>
                )}
              </Box>

              <TextField
                fullWidth
                select
                label="Тип вопроса"
                value={currentQuestion.type}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
              >
                {questionTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              {currentQuestion.type !== 'text' && (
                <>
                  <Typography variant="subtitle2">Варианты ответов:</Typography>
                  {currentQuestion.options.map((option, index) => (
                    <Box key={index}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <TextField
                          fullWidth
                          label={`Вариант ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion({ ...currentQuestion, options: newOptions });
                          }}
                        />
                        <Button
                          component="label"
                          startIcon={<ImageIcon />}
                          variant="outlined"
                          size="small"
                          disabled={uploadingImage}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleOptionImageUpload(e, index)}
                          />
                        </Button>
                      </Stack>
                      {currentQuestion.optionImages[index] && (
                        <Paper sx={{ p: 1, mt: 1, position: 'relative' }}>
                          <img
                            src={currentQuestion.optionImages[index]}
                            alt={`Option ${index + 1}`}
                            style={{ maxWidth: '100%', maxHeight: 100, display: 'block', borderRadius: 4 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newOptionImages = [...currentQuestion.optionImages];
                              newOptionImages[index] = null;
                              setCurrentQuestion({ ...currentQuestion, optionImages: newOptionImages });
                            }}
                            sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'background.paper' }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Paper>
                      )}
                    </Box>
                  ))}
                  <TextField
                    fullWidth
                    label="Правильный ответ"
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                    helperText="Введите номер правильного ответа (1, 2, 3 или 4)"
                  />
                </>
              )}

              <TextField
                fullWidth
                label="Баллы за вопрос"
                type="number"
                value={currentQuestion.points}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQuestionDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSaveQuestion} variant="contained" startIcon={<Save />} disabled={uploadingImage}>
              Добавить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}

export default ExamManagementPage;
