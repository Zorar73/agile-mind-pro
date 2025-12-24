// src/pages/ProfilePage.jsx
import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  Button,
  TextField,
  IconButton,
  Grid,
  Chip,
  LinearProgress,
  Stack,
  Tooltip,
  useTheme,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Email,
  Work,
  Badge,
  EmojiEvents,
  TrendingUp,
  CheckCircle,
  Schedule,
  Warning,
  Groups,
  Assignment,
  Star,
  Whatshot,
  WorkspacePremium,
  MilitaryTech,
  Verified,
  AutoAwesome,
  School,
  MenuBook,
  Bolt,
  LocalLibrary,
  GradeOutlined,
} from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import { UserContext } from '../App';
import userService from '../services/user.service';
import taskService from '../services/task.service';
import boardService from '../services/board.service';
import teamService from '../services/team.service';
import learningService from '../services/learning.service';
import AvatarSelector from '../components/Profile/AvatarSelector';
import CertificatesSection from '../components/Learning/CertificatesSection';
import { gradients, statusColors } from '../theme';

// Конфигурация достижений
const TASK_ACHIEVEMENTS = [
  {
    id: 'first_task',
    title: 'Первые шаги',
    description: 'Выполните первую задачу',
    icon: Star,
    color: '#FFD700',
    condition: (stats) => stats.completedTasks >= 1,
  },
  {
    id: 'task_master_10',
    title: 'Исполнитель',
    description: 'Выполните 10 задач',
    icon: CheckCircle,
    color: '#4CAF50',
    condition: (stats) => stats.completedTasks >= 10,
  },
  {
    id: 'task_master_50',
    title: 'Профессионал',
    description: 'Выполните 50 задач',
    icon: WorkspacePremium,
    color: '#7E57C2',
    condition: (stats) => stats.completedTasks >= 50,
  },
  {
    id: 'task_master_100',
    title: 'Мастер задач',
    description: 'Выполните 100 задач',
    icon: MilitaryTech,
    color: '#FF9800',
    condition: (stats) => stats.completedTasks >= 100,
  },
  {
    id: 'no_overdue',
    title: 'Пунктуальность',
    description: 'Нет просроченных задач',
    icon: Schedule,
    color: '#26A69A',
    condition: (stats) => stats.overdueTasks === 0 && stats.totalTasks > 0,
  },
  {
    id: 'team_player',
    title: 'Командный игрок',
    description: 'Состоите в 3+ командах',
    icon: Groups,
    color: '#1E88E5',
    condition: (stats) => stats.teamsCount >= 3,
  },
  {
    id: 'hot_streak',
    title: 'В ударе',
    description: '5 задач за неделю',
    icon: Whatshot,
    color: '#E53935',
    condition: (stats) => stats.weeklyCompleted >= 5,
  },
  {
    id: 'perfectionist',
    title: 'Перфекционист',
    description: '100% выполнение задач',
    icon: Verified,
    color: '#00BCD4',
    condition: (stats) => stats.completionRate === 100 && stats.totalTasks >= 10,
  },
];

const LEARNING_ACHIEVEMENTS = [
  {
    id: 'first_course',
    title: 'Студент',
    description: 'Завершите первый курс',
    icon: School,
    color: '#1E88E5',
    condition: (stats) => stats.completedCourses >= 1,
  },
  {
    id: 'course_master_3',
    title: 'Ученик',
    description: 'Завершите 3 курса',
    icon: MenuBook,
    color: '#26A69A',
    condition: (stats) => stats.completedCourses >= 3,
  },
  {
    id: 'course_master_5',
    title: 'Знаток',
    description: 'Завершите 5 курсов',
    icon: LocalLibrary,
    color: '#7E57C2',
    condition: (stats) => stats.completedCourses >= 5,
  },
  {
    id: 'course_master_10',
    title: 'Эксперт',
    description: 'Завершите 10 курсов',
    icon: WorkspacePremium,
    color: '#FF9800',
    condition: (stats) => stats.completedCourses >= 10,
  },
  {
    id: 'perfect_exam',
    title: 'Отличник',
    description: 'Получите 100% на экзамене',
    icon: GradeOutlined,
    color: '#FFD700',
    condition: (stats) => stats.perfectExams >= 1,
  },
  {
    id: 'quick_learner',
    title: 'Быстрый ученик',
    description: 'Завершите курс за 1 день',
    icon: Bolt,
    color: '#FF5722',
    condition: (stats) => stats.quickCourses >= 1,
  },
  {
    id: 'no_missed_deadlines',
    title: 'Дисциплина',
    description: 'Завершите все курсы до дедлайна',
    icon: Schedule,
    color: '#00BCD4',
    condition: (stats) => stats.completedCourses >= 1 && stats.overdueCoursesCompleted === 0,
  },
];

const ALL_ACHIEVEMENTS = [...TASK_ACHIEVEMENTS, ...LEARNING_ACHIEVEMENTS];

function ProfilePage() {
  const { user, setUser } = useContext(UserContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [isEditing, setIsEditing] = useState(false);
  const [avatarSelectorOpen, setAvatarSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [achievementsTab, setAchievementsTab] = useState('tasks');
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    overdueTasks: 0,
    teamsCount: 0,
    boardsCount: 0,
    weeklyCompleted: 0,
    completionRate: 0,
    // Learning stats
    completedCourses: 0,
    inProgressCourses: 0,
    perfectExams: 0,
    quickCourses: 0,
    overdueCoursesCompleted: 0,
  });
  
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    middleName: user?.middleName || '',
    lastName: user?.lastName || '',
    position: user?.position || '',
    responsibility: user?.responsibility || '',
    contacts: user?.contacts || { whatsapp: '', telegram: '', phone: '' },
  });

  useEffect(() => {
    if (user?.uid) {
      loadStats();
    }
  }, [user?.uid]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Загружаем доски пользователя
      const boardsResult = await boardService.getUserBoards(user.uid);
      const boards = boardsResult.success ? boardsResult.boards : [];

      let totalTasks = 0;
      let completedTasks = 0;
      let activeTasks = 0;
      let overdueTasks = 0;
      let weeklyCompleted = 0;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Собираем статистику по задачам
      for (const board of boards) {
        const tasksResult = await taskService.getTasksByBoard(board.id);
        if (tasksResult.success) {
          tasksResult.tasks.forEach(task => {
            if (task.members && task.members[user.uid]) {
              totalTasks++;

              if (task.status === 'done') {
                completedTasks++;

                // Проверяем выполнено ли за эту неделю
                if (task.completedAt) {
                  const completedDate = task.completedAt instanceof Date
                    ? task.completedAt
                    : task.completedAt.toDate?.() || new Date(task.completedAt);
                  if (completedDate > oneWeekAgo) {
                    weeklyCompleted++;
                  }
                }
              } else {
                activeTasks++;

                // Проверяем просрочку
                if (task.dueDate) {
                  const dueDate = task.dueDate instanceof Date
                    ? task.dueDate
                    : task.dueDate.toDate?.() || new Date(task.dueDate);
                  if (dueDate < new Date()) {
                    overdueTasks++;
                  }
                }
              }
            }
          });
        }
      }

      // Загружаем команды
      const teamsResult = await teamService.getUserTeams(user.uid);
      const teamsCount = teamsResult.success ? teamsResult.teams.length : 0;
      const userTeams = teamsResult.success ? teamsResult.teams : [];

      const completionRate = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

      // Загружаем статистику по курсам
      let completedCourses = 0;
      let inProgressCourses = 0;
      let perfectExams = 0;
      let quickCourses = 0;
      let overdueCoursesCompleted = 0;

      const coursesResult = await learningService.getUserCoursesWithProgress(user.uid, userTeams, user.roleId);
      if (coursesResult.success) {
        coursesResult.courses.forEach(course => {
          const progress = course.userProgress?.progress || 0;

          if (progress === 100) {
            completedCourses++;

            // Проверяем, был ли курс завершен за 1 день
            if (course.userProgress?.startedAt && course.userProgress?.completedAt) {
              const startDate = course.userProgress.startedAt?.toDate?.() || new Date(course.userProgress.startedAt);
              const endDate = course.userProgress.completedAt?.toDate?.() || new Date(course.userProgress.completedAt);
              const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
              if (daysDiff <= 1) {
                quickCourses++;
              }
            }

            // Проверяем, был ли курс завершен после дедлайна
            if (course.isRequired && course.deadline && course.userProgress?.completedAt) {
              let deadlineDate = null;
              if (course.deadline.type === 'fixed_date') {
                deadlineDate = course.deadline.value?.toDate?.() || new Date(course.deadline.value);
              } else if (course.deadline.type === 'days_after_assign' && course.userProgress.startedAt) {
                const startDate = course.userProgress.startedAt?.toDate?.() || new Date(course.userProgress.startedAt);
                deadlineDate = new Date(startDate);
                deadlineDate.setDate(deadlineDate.getDate() + course.deadline.value);
              }

              if (deadlineDate) {
                const completedDate = course.userProgress.completedAt?.toDate?.() || new Date(course.userProgress.completedAt);
                if (completedDate > deadlineDate) {
                  overdueCoursesCompleted++;
                }
              }
            }
          } else if (progress > 0 && progress < 100) {
            inProgressCourses++;
          }
        });
      }

      // Загружаем статистику по экзаменам
      const examsResult = await learningService.getUserExamResults(user.uid);
      if (examsResult.success && examsResult.results) {
        examsResult.results.forEach(result => {
          if (result.score === 100 || result.percentage === 100) {
            perfectExams++;
          }
        });
      }

      setStats({
        totalTasks,
        completedTasks,
        activeTasks,
        overdueTasks,
        teamsCount,
        boardsCount: boards.length,
        weeklyCompleted,
        completionRate,
        completedCourses,
        inProgressCourses,
        perfectExams,
        quickCourses,
        overdueCoursesCompleted,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    setLoading(false);
  };

  const getAvatarProps = () => {
    if (!user) return { children: '?' };
    
    if (user.avatar && user.avatar !== 'generated') {
      if (user.avatar.startsWith('default-')) {
        const num = user.avatar.replace('default-', '');
        return { src: `/avatars/avatar-${num}.svg` };
      }
      if (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) {
        return { src: user.avatar };
      }
    }
    
    const colors = ['#1E88E5', '#7E57C2', '#26A69A', '#E53935'];
    const colorIndex = (user.firstName?.charCodeAt(0) || 0) % colors.length;
    return { 
      children: `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`,
      sx: { bgcolor: colors[colorIndex] }
    };
  };

  const handleSave = async () => {
    await userService.updateUserData(user.uid, editData);
    setUser({ ...user, ...editData });
    setIsEditing(false);
  };

  const handleAvatarSelect = async (avatar) => {
    await userService.updateAvatar(user.uid, avatar);
    setUser({ ...user, avatar });
  };

  // Получаем достижения в зависимости от выбранного таба
  const currentAchievements = achievementsTab === 'tasks' ? TASK_ACHIEVEMENTS : LEARNING_ACHIEVEMENTS;
  const unlockedAchievements = currentAchievements.filter(a => a.condition(stats));
  const lockedAchievements = currentAchievements.filter(a => !a.condition(stats));

  // Общее количество достижений
  const totalUnlocked = ALL_ACHIEVEMENTS.filter(a => a.condition(stats)).length;

  const avatarProps = getAvatarProps();

  return (
    <MainLayout>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Профиль
      </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Личные данные, статистика и достижения
        </Typography>

        <Grid container spacing={3}>
          {/* Левая колонка - Профиль */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ position: 'relative', overflow: 'visible' }}>
              {/* Градиентный хедер */}
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: 100, 
                background: gradients.bluePurple,
                borderRadius: '16px 16px 0 0',
              }} />
              
              <CardContent sx={{ pt: 8, position: 'relative' }}>
                {/* Аватар */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar 
                      {...avatarProps}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        fontSize: '2.5rem',
                        fontWeight: 600,
                        border: '4px solid',
                        borderColor: 'background.paper',
                        boxShadow: 3,
                        ...avatarProps.sx,
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        width: 36,
                        height: 36,
                      }}
                      onClick={() => setAvatarSelectorOpen(true)}
                    >
                      <PhotoCamera sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Имя и должность */}
                {!isEditing && (
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight={700}>
                      {user?.firstName} {user?.middleName} {user?.lastName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {user?.position || 'Должность не указана'}
                    </Typography>
                    <Chip 
                      label={user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      size="small"
                      color={user?.role === 'admin' ? 'error' : 'primary'}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                )}

                {/* Кнопка редактирования */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  {isEditing ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        startIcon={<Cancel />}
                        onClick={() => {
                          setIsEditing(false);
                          setEditData({
                            firstName: user?.firstName || '',
                            middleName: user?.middleName || '',
                            lastName: user?.lastName || '',
                            position: user?.position || '',
                            responsibility: user?.responsibility || '',
                            contacts: user?.contacts || { whatsapp: '', telegram: '', phone: '' },
                          });
                        }}
                        sx={{ borderRadius: 50 }}
                      >
                        Отмена
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        sx={{ borderRadius: 50 }}
                      >
                        Сохранить
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => setIsEditing(true)}
                      sx={{ borderRadius: 50 }}
                    >
                      Редактировать
                    </Button>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Форма редактирования / Данные */}
                {isEditing ? (
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Имя"
                        value={editData.firstName}
                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Фамилия"
                        value={editData.lastName}
                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      size="small"
                      label="Отчество"
                      value={editData.middleName}
                      onChange={(e) => setEditData({ ...editData, middleName: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Должность"
                      value={editData.position}
                      onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Ответственность"
                      value={editData.responsibility}
                      onChange={(e) => setEditData({ ...editData, responsibility: e.target.value })}
                      multiline
                      rows={2}
                    />
                    
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1 }}>
                      Контакты
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      label="WhatsApp"
                      placeholder="+79991234567"
                      value={editData.contacts.whatsapp}
                      onChange={(e) => setEditData({
                        ...editData,
                        contacts: { ...editData.contacts, whatsapp: e.target.value }
                      })}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Telegram"
                      placeholder="@username"
                      value={editData.contacts.telegram}
                      onChange={(e) => setEditData({
                        ...editData,
                        contacts: { ...editData.contacts, telegram: e.target.value }
                      })}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Телефон"
                      placeholder="+79991234567"
                      value={editData.contacts.phone}
                      onChange={(e) => setEditData({
                        ...editData,
                        contacts: { ...editData.contacts, phone: e.target.value }
                      })}
                    />
                  </Stack>
                ) : (
                  <Stack spacing={1.5}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      p: 1.5, 
                      bgcolor: isDark ? 'background.subtle' : 'grey.50', 
                      borderRadius: 2 
                    }}>
                      <Email color="primary" />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body2" fontWeight={500} noWrap>{user?.email}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      p: 1.5, 
                      bgcolor: isDark ? 'background.subtle' : 'grey.50', 
                      borderRadius: 2 
                    }}>
                      <Work color="info" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Ответственность</Typography>
                        <Typography variant="body2" fontWeight={500}>{user?.responsibility || '—'}</Typography>
                      </Box>
                    </Box>

                    {user?.contacts && (user.contacts.whatsapp || user.contacts.telegram || user.contacts.phone) && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        bgcolor: isDark ? 'background.subtle' : 'grey.50',
                        borderRadius: 2
                      }}>
                        <Badge color="secondary" />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">Контакты</Typography>
                          <Typography variant="body2" fontWeight={500} sx={{
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                          }}>
                            {[user.contacts.whatsapp, user.contacts.telegram, user.contacts.phone].filter(Boolean).join(' • ') || '—'}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Правая колонка - Статистика и достижения */}
          <Grid size={{ xs: 12, md: 7 }}>
            {/* Статистика */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <TrendingUp />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Статистика
                  </Typography>
                </Box>

                {/* Карточки статистики */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <Paper sx={{
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      bgcolor: statusColors.done.bg,
                      border: 'none',
                    }}>
                      <Typography variant={{ xs: 'h4', sm: 'h3' }} fontWeight={700} color={statusColors.done.main}>
                        {stats.completedTasks}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Выполнено
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <Paper sx={{
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      bgcolor: statusColors.in_progress.bg,
                      border: 'none',
                    }}>
                      <Typography variant={{ xs: 'h4', sm: 'h3' }} fontWeight={700} color={statusColors.in_progress.main}>
                        {stats.activeTasks}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        В работе
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <Paper sx={{
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      bgcolor: statusColors.overdue.bg,
                      border: 'none',
                    }}>
                      <Typography variant={{ xs: 'h4', sm: 'h3' }} fontWeight={700} color={statusColors.overdue.main}>
                        {stats.overdueTasks}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Просрочено
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <Paper sx={{
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      bgcolor: isDark ? 'background.subtle' : 'grey.100',
                      border: 'none',
                    }}>
                      <Typography variant={{ xs: 'h4', sm: 'h3' }} fontWeight={700} color="text.primary">
                        {stats.teamsCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Команд
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Прогресс выполнения */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Общий прогресс выполнения
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {stats.completionRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.completionRate}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: isDark ? 'grey.800' : 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: stats.completionRate === 100 
                          ? statusColors.done.main 
                          : 'primary.main',
                        borderRadius: 5,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {stats.completedTasks} из {stats.totalTasks} задач выполнено
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Достижения */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#FFD700' }}>
                    <EmojiEvents />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Достижения
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {totalUnlocked} из {ALL_ACHIEVEMENTS.length} разблокировано
                    </Typography>
                  </Box>
                </Box>

                {/* Tabs */}
                <Tabs
                  value={achievementsTab}
                  onChange={(e, newValue) => setAchievementsTab(newValue)}
                  sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab
                    value="tasks"
                    label="Задачи"
                    icon={<Assignment />}
                    iconPosition="start"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab
                    value="learning"
                    label="Обучение"
                    icon={<School />}
                    iconPosition="start"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                </Tabs>

                {/* Разблокированные */}
                {unlockedAchievements.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: 'success.main' }}>
                      Получено
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {unlockedAchievements.map((achievement) => {
                        const Icon = achievement.icon;
                        return (
                          <Tooltip
                            key={achievement.id}
                            title={achievement.description}
                            arrow
                          >
                            <Chip
                              icon={<Icon sx={{ color: `${achievement.color} !important` }} />}
                              label={achievement.title}
                              sx={{
                                bgcolor: `${achievement.color}20`,
                                borderColor: achievement.color,
                                fontWeight: 600,
                              }}
                              variant="outlined"
                            />
                          </Tooltip>
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                {/* Заблокированные */}
                {lockedAchievements.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
                      Ещё не получено
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {lockedAchievements.map((achievement) => {
                        const Icon = achievement.icon;
                        return (
                          <Tooltip
                            key={achievement.id}
                            title={achievement.description}
                            arrow
                          >
                            <Chip
                              icon={<Icon sx={{ opacity: 0.3 }} />}
                              label={achievement.title}
                              sx={{
                                opacity: 0.5,
                                fontWeight: 500,
                              }}
                              variant="outlined"
                            />
                          </Tooltip>
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Сертификаты */}
            <CertificatesSection />
          </Grid>
        </Grid>

      <AvatarSelector
        open={avatarSelectorOpen}
        onClose={() => setAvatarSelectorOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={user?.avatar}
        firstName={user?.firstName}
        lastName={user?.lastName}
      />
    </MainLayout>
  );
}

export default ProfilePage;
