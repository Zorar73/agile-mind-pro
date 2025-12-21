import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Avatar,
  Button,
} from '@mui/material';
import {
  School,
  CheckCircle,
  TrendingUp,
  People,
  EmojiEvents,
  Quiz,
  Timer,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import learningService from '../../services/learning.service';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
  red: '#E53935',
  yellow: '#FDD835',
  purple: '#7E57C2',
};

function StatsTab({ courseId, course }) {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadStatistics();
    }
  }, [courseId]);

  const loadStatistics = async () => {
    setLoading(true);
    const statsResult = await learningService.getCourseStatistics(courseId);
    if (statsResult.success) {
      setStatistics(statsResult.statistics);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Card sx={{ p: 6, textAlign: 'center' }}>
        <School sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Статистика недоступна
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Статистика курса
      </Typography>

      {/* Overall Statistics */}
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

      {/* Top Students */}
      {statistics.userProgressList.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
            Лидеры курса
          </Typography>

          <Card sx={{ mb: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <TableContainer>
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
                                  bgcolor: '#1E88E520',
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
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
            Статистика по экзаменам
          </Typography>

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
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#1E88E510' }}>
                          <Typography variant="h4" fontWeight={700} color={bauhaus.blue}>
                            {examStat.totalAttempts}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Попыток
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#7E57C210' }}>
                          <Typography variant="h4" fontWeight={700} color={bauhaus.purple}>
                            {examStat.averageScore}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Средний балл
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#26A69A10' }}>
                          <Typography variant="h5" fontWeight={700} color={bauhaus.teal}>
                            {examStat.passed}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Сдали
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#E5393510' }}>
                          <Typography variant="h5" fontWeight={700} color={bauhaus.red}>
                            {examStat.failed}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Не сдали
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#FDD83510' }}>
                          <Typography variant="h5" fontWeight={700} color={bauhaus.yellow}>
                            {examStat.pending}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            На проверке
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
    </Box>
  );
}

export default StatsTab;
