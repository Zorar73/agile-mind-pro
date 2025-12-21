// src/pages/CourseManagementPage.jsx
// Единая страница управления курсом с табами
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  MenuBook,
  Quiz,
  BarChart,
  People,
  AssignmentTurnedIn,
  Settings,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';
import { useToast } from '../contexts/ToastContext';

// Import tab components (we'll create these as sub-components)
import LessonsTab from '../components/CourseManagement/LessonsTab';
import ExamsTab from '../components/CourseManagement/ExamsTab';
import StatsTab from '../components/CourseManagement/StatsTab';
import AccessTab from '../components/CourseManagement/AccessTab';
import ExamResultsTab from '../components/CourseManagement/ExamResultsTab';
import SettingsTab from '../components/CourseManagement/SettingsTab';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
};

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 24 }}>
      {value === index && children}
    </div>
  );
}

function CourseManagementPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    setLoading(true);
    const result = await learningService.getCourse(courseId);
    if (result.success) {
      setCourse(result.course);
    } else {
      toast.error('Не удалось загрузить курс');
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
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/learning/admin')}
            sx={{ mb: 2 }}
          >
            Все курсы
          </Button>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                {course.title}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label={course.category} size="small" color="primary" variant="outlined" />
                {course.duration && <Chip label={`${course.duration} часов`} size="small" variant="outlined" />}
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Tabs */}
        <Card sx={{ borderRadius: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 2,
              '& .MuiTab-root': {
                minHeight: 64,
              },
            }}
          >
            <Tab icon={<Settings />} label="Настройки" iconPosition="start" />
            <Tab icon={<MenuBook />} label="Уроки" iconPosition="start" />
            <Tab icon={<Quiz />} label="Экзамены" iconPosition="start" />
            <Tab icon={<AssignmentTurnedIn />} label="Проверка экзаменов" iconPosition="start" />
            <Tab icon={<BarChart />} label="Статистика" iconPosition="start" />
            <Tab icon={<People />} label="Доступ" iconPosition="start" />
          </Tabs>

          {/* Tab Panels */}
          <Box sx={{ p: 3 }}>
            <TabPanel value={currentTab} index={0}>
              <SettingsTab courseId={courseId} course={course} onUpdate={loadCourse} />
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
              <LessonsTab courseId={courseId} course={course} />
            </TabPanel>
            <TabPanel value={currentTab} index={2}>
              <ExamsTab courseId={courseId} course={course} />
            </TabPanel>
            <TabPanel value={currentTab} index={3}>
              <ExamResultsTab courseId={courseId} course={course} />
            </TabPanel>
            <TabPanel value={currentTab} index={4}>
              <StatsTab courseId={courseId} course={course} />
            </TabPanel>
            <TabPanel value={currentTab} index={5}>
              <AccessTab courseId={courseId} course={course} />
            </TabPanel>
          </Box>
        </Card>
      </Container>
    </MainLayout>
  );
}

export default CourseManagementPage;
