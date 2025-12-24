// src/pages/LearningAnalyticsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  People,
  School,
  EmojiEvents,
  TrendingUp,
  Download,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';
import { useToast } from '../contexts/ToastContext';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
  purple: '#7E57C2',
  orange: '#FF9800',
  red: '#E53935',
};

const COLORS = [bauhaus.blue, bauhaus.teal, bauhaus.purple, bauhaus.orange, bauhaus.red];

function LearningAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    const result = await learningService.getLMSAnalytics();
    if (result.success) {
      setAnalytics(result.analytics);
    } else {
      toast.error('Ошибка загрузки аналитики');
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (!analytics) return;

    // Формируем CSV
    const headers = ['Курс', 'Записано', 'Завершено', '% завершения', 'Ср. прогресс', 'Ср. балл'];
    const rows = analytics.courseStats.map(course => [
      course.title,
      course.enrolled,
      course.completed,
      `${course.completionRate}%`,
      `${course.avgProgress}%`,
      course.avgExamScore !== null ? `${course.avgExamScore}%` : '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Скачиваем
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lms_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Отчёт экспортирован');
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

  if (!analytics) {
    return (
      <MainLayout>
        <Container>
          <Typography color="text.secondary">Данные недоступны</Typography>
        </Container>
      </MainLayout>
    );
  }

  // Данные для круговой диаграммы статусов
  const statusData = [
    { name: 'Не начато', value: analytics.statusDistribution.notStarted, color: '#9E9E9E' },
    { name: 'В процессе', value: analytics.statusDistribution.inProgress, color: bauhaus.orange },
    { name: 'Завершено', value: analytics.statusDistribution.completed, color: bauhaus.teal },
  ].filter(d => d.value > 0);

  // Данные для барчарта топ курсов
  const topCoursesData = analytics.courseStats.slice(0, 10).map(c => ({
    name: c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
    enrolled: c.enrolled,
    completed: c.completed,
  }));

  return (
    <MainLayout>
      <Container maxWidth="xl">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/learning/admin')}
          sx={{ mb: 3 }}
        >
          Назад к курсам
        </Button>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              📊 Аналитика обучения
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Статистика и метрики LMS
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportCSV}
          >
            Экспорт в CSV
          </Button>
        </Box>

        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: `${bauhaus.blue}15`,
                    color: bauhaus.blue,
                  }}>
                    <People />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={800}>
                      {analytics.overview.uniqueStudents}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Студентов
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: `${bauhaus.teal}15`,
                    color: bauhaus.teal,
                  }}>
                    <School />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={800}>
                      {analytics.overview.activeCourses}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Активных курсов
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: `${bauhaus.purple}15`,
                    color: bauhaus.purple,
                  }}>
                    <TrendingUp />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={800}>
                      {analytics.overview.completedEnrollments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Завершённых курсов
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: `${bauhaus.orange}15`,
                    color: bauhaus.orange,
                  }}>
                    <EmojiEvents />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={800}>
                      {analytics.overview.totalCertificates}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Сертификатов
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Status Distribution Pie Chart */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Распределение по статусам
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Courses Bar Chart */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Популярность курсов
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCoursesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="enrolled" name="Записано" fill={bauhaus.blue} />
                      <Bar dataKey="completed" name="Завершено" fill={bauhaus.teal} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Course Stats Table */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Статистика по курсам
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>Курс</TableCell>
                    <TableCell align="center">Записано</TableCell>
                    <TableCell align="center">Завершено</TableCell>
                    <TableCell align="center">% завершения</TableCell>
                    <TableCell align="center">Ср. прогресс</TableCell>
                    <TableCell align="center">Ср. балл экзамена</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.courseStats.map((course) => (
                    <TableRow key={course.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {course.title}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{course.enrolled}</TableCell>
                      <TableCell align="center">{course.completed}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={course.completionRate}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="body2">{course.completionRate}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={course.avgProgress}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                            color="secondary"
                          />
                          <Typography variant="body2">{course.avgProgress}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {course.avgExamScore !== null ? (
                          <Typography 
                            variant="body2" 
                            fontWeight={600}
                            color={course.avgExamScore >= 80 ? 'success.main' : course.avgExamScore >= 60 ? 'warning.main' : 'error.main'}
                          >
                            {course.avgExamScore}%
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </MainLayout>
  );
}

export default LearningAnalyticsPage;
