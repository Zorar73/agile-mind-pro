// src/pages/CourseAccessPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Switch,
  FormControlLabel,
  Autocomplete,
  TextField,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Lock,
  LockOpen,
  People,
  Person,
  Group,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import learningService from '../services/learning.service';
import { useToast } from '../contexts/ToastContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
};

function CourseAccessPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);

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

    // Load course access
    const accessResult = await learningService.getCourseAccess(courseId);
    if (accessResult.success) {
      setIsPublic(accessResult.access.isPublic);
      setAssignedUsers(accessResult.access.assignedUsers || []);
      setAssignedTeams(accessResult.access.assignedTeams || []);
    }

    // Load available users
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        label: doc.data().name || doc.data().email || 'Неизвестный пользователь',
        ...doc.data(),
      }));
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }

    // Load available teams
    try {
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const teams = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        label: doc.data().name || 'Команда без названия',
        ...doc.data(),
      }));
      setAvailableTeams(teams);
    } catch (error) {
      console.error('Error loading teams:', error);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const accessData = {
      isPublic,
      assignedUsers,
      assignedTeams,
    };

    const result = await learningService.updateCourseAccess(courseId, accessData);

    if (result.success) {
      toast.success('Настройки доступа сохранены');
    } else {
      toast.error('Ошибка сохранения настроек');
    }

    setSaving(false);
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

  const selectedUsers = availableUsers.filter(u => assignedUsers.includes(u.id));
  const selectedTeams = availableTeams.filter(t => assignedTeams.includes(t.id));

  return (
    <MainLayout>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/learning/admin/course/${courseId}`)}
            sx={{ mb: 2 }}
          >
            Вернуться к управлению курсом
          </Button>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Lock sx={{ fontSize: 40, color: bauhaus.blue }} />
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Управление доступом
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {course.title}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Public/Private Toggle */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {isPublic ? <LockOpen /> : <Lock />}
                      <Typography variant="subtitle1" fontWeight={600}>
                        {isPublic ? 'Публичный курс' : 'Приватный курс'}
                      </Typography>
                    </Stack>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                  {isPublic
                    ? 'Все пользователи системы могут просматривать и проходить этот курс'
                    : 'Только назначенные пользователи и команды имеют доступ к курсу'}
                </Typography>
              </Box>

              <Divider />

              {/* Assigned Users */}
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Person sx={{ color: bauhaus.blue }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Назначенные пользователи
                  </Typography>
                </Stack>

                {!isPublic && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Выберите пользователей, которые будут иметь доступ к курсу
                  </Alert>
                )}

                <Autocomplete
                  multiple
                  disabled={isPublic}
                  options={availableUsers}
                  value={selectedUsers}
                  onChange={(e, newValue) => {
                    setAssignedUsers(newValue.map(u => u.id));
                  }}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={isPublic ? 'Курс доступен всем' : 'Выберите пользователей'}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        icon={<Person />}
                        label={option.label}
                        {...getTagProps({ index })}
                        disabled={isPublic}
                      />
                    ))
                  }
                />

                {!isPublic && assignedUsers.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Выбрано пользователей: {assignedUsers.length}
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* Assigned Teams */}
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Group sx={{ color: bauhaus.teal }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Назначенные команды
                  </Typography>
                </Stack>

                {!isPublic && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Все участники выбранных команд получат доступ к курсу
                  </Alert>
                )}

                <Autocomplete
                  multiple
                  disabled={isPublic}
                  options={availableTeams}
                  value={selectedTeams}
                  onChange={(e, newValue) => {
                    setAssignedTeams(newValue.map(t => t.id));
                  }}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={isPublic ? 'Курс доступен всем' : 'Выберите команды'}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        icon={<Group />}
                        label={option.label}
                        {...getTagProps({ index })}
                        disabled={isPublic}
                      />
                    ))
                  }
                />

                {!isPublic && assignedTeams.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Выбрано команд: {assignedTeams.length}
                  </Typography>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Summary */}
        {!isPublic && (
          <Card sx={{ mb: 3, borderRadius: 3, bgcolor: `${bauhaus.blue}05` }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <People sx={{ color: bauhaus.blue }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Сводка по доступу
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                К курсу имеют доступ:
              </Typography>
              <Typography variant="body2">
                • {assignedUsers.length} {assignedUsers.length === 1 ? 'пользователь' : 'пользователей'}
              </Typography>
              <Typography variant="body2">
                • {assignedTeams.length} {assignedTeams.length === 1 ? 'команда' : 'команд'}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              py: 1.5,
              px: 6,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
            }}
          >
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </Button>
        </Box>
      </Container>
    </MainLayout>
  );
}

export default CourseAccessPage;
