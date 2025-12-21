// src/pages/CourseStatsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider,
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  BarChart,
  School,
  CheckCircle,
  TrendingUp,
  People,
  EmojiEvents,
  Quiz,
  Timer,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
  red: '#E53935',
  yellow: '#FDD835',
  purple: '#7E57C2',
};

function CourseStatsPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useContext(UserContext);
  const [course, setCourse] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const loadData = async () => {
    setLoading(true);

    // Load course
    const courseResult = await learningService.getCourse(courseId);
    if (courseResult.success) {
      setCourse(courseResult.course);
    }

    // Load statistics
    const statsResult = await learningService.getCourseStatistics(courseId);
    if (statsResult.success) {
      setStatistics(statsResult.statistics);
    }

    setLoading(false);
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

  if (!course || !statistics) {
    return (
      <MainLayout>
        <Container>
          <Typography variant="h6" color="text.secondary">
            Статистика не найдена
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
            Вернуться к управлению курсом
          </Button>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <BarChart sx={{ fontSize: 40, color: bauhaus.blue }} />
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Статистика курса
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {course.title}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Overall Statistics */}
        <Box sx={{ overflow: 'hidden', width: '100%' }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: bauhaus.blue, mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color={bauhaus.blue}>
                  {statistics.totalStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего студентов
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: bauhaus.teal, mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color={bauhaus.teal}>
                  {statistics.completedStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Завершили курс
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: bauhaus.yellow, mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color={bauhaus.yellow}>
                  {statistics.inProgressStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  В процессе
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Timer sx={{ fontSize: 40, color: bauhaus.purple, mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color={bauhaus.purple}>
                  {statistics.averageProgress}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Средний прогресс
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </Box>

        {/* Top Students */}
        {statistics.userProgressList.length > 0 && (
          <>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Лидеры курса
            </Typography>

            <Card sx={{ mb: 4, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><Typography variant="subtitle2" fontWeight={700}>#</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight={700}>Студент</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight={700}>Прогресс</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight={700}>Статус</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight={700}>Дата начала</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight={700}>Дата завершения</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statistics.userProgressList.map((student, index) => {
                        const isCompleted = student.progress === 100;
                        const isStarted = student.progress > 0;

                        return (
                          <TableRow key={student.userId}>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body1" fontWeight={600}>
                                  {index + 1}
                                </Typography>
                                {index === 0 && student.progress > 0 && (
                                  <EmojiEvents sx={{ color: bauhaus.yellow, fontSize: 20 }} />
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ width: 32, height: 32, bgcolor: bauhaus.blue }}>
                                  {student.userName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="body2">{student.userName}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 200 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={student.progress}
                                  sx={{
                                    flex: 1,
                                    height: 8,
                                    borderRadius: 1,
                                    bgcolor: `${bauhaus.blue}20`,
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: isCompleted ? bauhaus.teal : bauhaus.blue,
                                    },
                                  }}
                                />
                                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 40 }}>
                                  {student.progress}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {isCompleted ? (
                                <Chip
                                  icon={<CheckCircle />}
                                  label="Завершен"
                                  size="small"
                                  sx={{
                                    bgcolor: bauhaus.teal,
                                    color: 'white',
                                    '& .MuiChip-icon': { color: 'white' },
                                  }}
                                />
                              ) : isStarted ? (
                                <Chip
                                  label="В процессе"
                                  size="small"
                                  sx={{
                                    bgcolor: bauhaus.blue,
                                    color: 'white',
                                  }}
                                />
                              ) : (
                                <Chip
                                  label="Не начат"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {student.startedAt
                                  ? new Date(student.startedAt).toLocaleDateString('ru-RU')
                                  : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {student.completedAt
                                  ? new Date(student.completedAt).toLocaleDateString('ru-RU')
                                  : '-'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        )}

        {/* Exam Statistics */}
        {statistics.examStats.length > 0 && (
          <>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Статистика по экзаменам
            </Typography>

            <Box sx={{ overflow: 'hidden', width: '100%' }}>
              <Grid container spacing={3}>
              {statistics.examStats.map((examStat) => (
                <Grid item xs={12} md={6} key={examStat.examId}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Quiz sx={{ color: bauhaus.blue }} />
                        <Typography variant="h6" fontWeight={700}>
                          {examStat.examTitle}
                        </Typography>
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${bauhaus.blue}10` }}>
                            <Typography variant="h4" fontWeight={700} color={bauhaus.blue}>
                              {examStat.totalAttempts}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Попыток
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${bauhaus.purple}10` }}>
                            <Typography variant="h4" fontWeight={700} color={bauhaus.purple}>
                              {examStat.averageScore}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Средний балл
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={4}>
                          <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: `${bauhaus.teal}10` }}>
                            <Typography variant="h5" fontWeight={700} color={bauhaus.teal}>
                              {examStat.passed}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Сдали
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={4}>
                          <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: `${bauhaus.red}10` }}>
                            <Typography variant="h5" fontWeight={700} color={bauhaus.red}>
                              {examStat.failed}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Не сдали
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={4}>
                          <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: `${bauhaus.yellow}10` }}>
                            <Typography variant="h5" fontWeight={700} color={bauhaus.yellow}>
                              {examStat.pending}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              На проверке
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/learning/admin/course/${courseId}/exams`)}
                        sx={{ mt: 2, borderRadius: 2 }}
                      >
                        Управление экзаменом
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            </Box>
          </>
        )}

        {/* Empty State */}
        {statistics.totalStudents === 0 && (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <School sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Пока нет студентов на этом курсе
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Студенты появятся здесь, когда начнут проходить курс
            </Typography>
          </Card>
        )}
      </Container>
    </MainLayout>
  );
}

export default CourseStatsPage;
