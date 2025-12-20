// src/pages/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Stack,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Fade,
  useTheme,
  useMediaQuery,
  Paper,
  alpha,
} from '@mui/material';
import {
  AutoAwesome,
  Group,
  Lightbulb,
  TrendingUp,
  SmartToy,
  Chat,
  Dashboard,
  Psychology,
  Timeline,
  ViewKanban,
  ArrowForward,
  CheckCircle,
  Bolt,
  InsertComment,
  Analytics,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const colors = {
  primary: '#1E88E5',
  secondary: '#26A69A',
  accent: '#7E57C2',
  warning: '#FF9800',
  success: '#4CAF50',
  dark: '#1A1A1A',
};

// Живой AI-ассистент демо
const AIAssistantDemo = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { 
      input: 'Создать страницу авторизации',
      output: '✓ Разбито на 5 подзадач\n✓ Оценка: 12 часов\n✓ Теги: frontend, auth, urgent'
    },
    {
      input: 'Встреча: Иван делает API, Мария - дизайн',
      output: '✓ 2 задачи созданы\n✓ Назначены исполнители\n✓ Добавлены в спринт'
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        borderRadius: 3,
        border: '2px solid',
        borderColor: colors.primary,
        bgcolor: alpha(colors.primary, 0.02),
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ 
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(colors.primary, 0.1)} 0%, transparent 70%)`,
      }} />
      
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy sx={{ color: colors.primary, fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>
            AI Ассистент
          </Typography>
          <Chip 
            label="Gemini" 
            size="small" 
            sx={{ 
              bgcolor: colors.primary, 
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
            }} 
          />
        </Box>

        <Box 
          sx={{ 
            bgcolor: 'background.paper', 
            p: 2, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Вы пишете:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {steps[step].input}
          </Typography>
        </Box>

        <Box 
          sx={{ 
            bgcolor: alpha(colors.success, 0.05), 
            p: 2, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: colors.success,
          }}
        >
          <Typography variant="caption" color={colors.success} gutterBottom display="block" fontWeight={600}>
            AI обработал:
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              whiteSpace: 'pre-line',
              fontFamily: 'monospace',
              color: colors.success,
            }}
          >
            {steps[step].output}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

// Живой дашборд с виджетами
const DashboardDemo = () => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2.5, 
        borderRadius: 3,
        border: '2px solid',
        borderColor: colors.secondary,
        bgcolor: alpha(colors.secondary, 0.02),
      }}
    >
      <Grid container spacing={2}>
        {/* Виджет статистики */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: alpha(colors.primary, 0.05), border: '1px solid', borderColor: colors.primary }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>Прогресс спринта</Typography>
              <Typography variant="h5" fontWeight={800} color={colors.primary}>78%</Typography>
            </Box>
            <Box sx={{ 
              height: 6, 
              bgcolor: 'rgba(0,0,0,0.1)', 
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              <Box sx={{ 
                width: '78%', 
                height: '100%', 
                bgcolor: colors.primary,
                transition: 'width 1s ease',
              }} />
            </Box>
          </Paper>
        </Grid>

        {/* Мини виджеты */}
        <Grid item xs={6}>
          <Paper sx={{ p: 2, bgcolor: alpha(colors.success, 0.05), textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={800} color={colors.success}>24</Typography>
            <Typography variant="caption" color="text.secondary">Завершено</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, bgcolor: alpha(colors.warning, 0.05), textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={800} color={colors.warning}>3</Typography>
            <Typography variant="caption" color="text.secondary">Просрочено</Typography>
          </Paper>
        </Grid>

        {/* График velocity */}
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Velocity команды
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', height: 50 }}>
            {[45, 62, 58, 75, 68, 82, 78].map((val, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  height: `${val}%`,
                  bgcolor: i === 6 ? colors.secondary : alpha(colors.secondary, 0.3),
                  borderRadius: 1,
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

// Команды с чатом
const TeamChatDemo = () => {
  const messages = [
    { user: 'А', text: 'API готово, можно тестить', color: colors.primary },
    { user: 'М', text: 'Отлично! Дизайн тоже готов', color: colors.accent },
  ];

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2.5, 
        borderRadius: 3,
        border: '2px solid',
        borderColor: colors.accent,
        bgcolor: alpha(colors.accent, 0.02),
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Group sx={{ color: colors.accent, fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Frontend Team
            </Typography>
            <Typography variant="caption" color="text.secondary">
              5 участников
            </Typography>
          </Box>
          <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.875rem' } }}>
            {['А', 'Б', 'В', 'Г', 'Д'].map((letter, i) => (
              <Avatar key={i} sx={{ bgcolor: colors.accent }}>
                {letter}
              </Avatar>
            ))}
          </AvatarGroup>
        </Box>

        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 2, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          maxHeight: 140,
          overflowY: 'auto',
        }}>
          <Stack spacing={1.5}>
            {messages.map((msg, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: msg.color, fontSize: '0.75rem' }}>
                  {msg.user}
                </Avatar>
                <Box 
                  sx={{ 
                    bgcolor: alpha(msg.color, 0.08),
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    flex: 1,
                  }}
                >
                  <Typography variant="body2">
                    {msg.text}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          p: 1.5,
          bgcolor: alpha(colors.accent, 0.05),
          borderRadius: 2,
        }}>
          <Box sx={{ 
            flex: 1, 
            px: 1.5, 
            py: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}>
            <Typography variant="caption" color="text.secondary">
              Написать сообщение...
            </Typography>
          </Box>
          <IconButton size="small" sx={{ bgcolor: colors.accent, color: 'white', '&:hover': { bgcolor: colors.accent } }}>
            <Chat sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Stack>
    </Paper>
  );
};

// Наброски с AI
const SketchesDemo = () => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2.5, 
        borderRadius: 3,
        border: '2px solid',
        borderColor: colors.warning,
        bgcolor: alpha(colors.warning, 0.02),
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Lightbulb sx={{ color: colors.warning, fontSize: 28 }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Быстрые идеи
          </Typography>
          <Chip 
            label="AI" 
            size="small" 
            icon={<AutoAwesome sx={{ fontSize: 14 }} />}
            sx={{ 
              ml: 'auto',
              bgcolor: colors.warning, 
              color: 'white',
              fontWeight: 600,
              '& .MuiChip-icon': { color: 'white' },
            }} 
          />
        </Box>

        <Stack spacing={1.5}>
          {[
            { title: 'Редизайн профиля', tags: ['design', 'ui'], hasAI: true },
            { title: 'Оптимизация БД', tags: ['backend', 'perf'], hasAI: false },
          ].map((sketch, i) => (
            <Paper 
              key={i}
              sx={{ 
                p: 2, 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: colors.warning,
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Typography variant="body2" fontWeight={600} gutterBottom>
                {sketch.title}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                {sketch.tags.map(tag => (
                  <Chip 
                    key={tag}
                    label={tag} 
                    size="small" 
                    sx={{ 
                      fontSize: '0.65rem',
                      height: 18,
                      bgcolor: alpha(colors.warning, 0.1),
                      color: colors.warning,
                    }} 
                  />
                ))}
                {sketch.hasAI && (
                  <Chip 
                    icon={<AutoAwesome sx={{ fontSize: 12 }} />}
                    label="→ задачи" 
                    size="small" 
                    sx={{ 
                      fontSize: '0.65rem',
                      height: 18,
                      bgcolor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      '& .MuiChip-icon': { color: colors.primary },
                    }} 
                  />
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <SmartToy />,
      title: 'AI-Ассистент везде',
      description: 'Google Gemini помогает в каждом действии',
      details: [
        'Разбивает задачи на подзадачи автоматически',
        'Создаёт задачи из протоколов встреч',
        'Оценивает время выполнения',
        'Предлагает теги и приоритеты',
        'Конвертирует наброски в задачи',
      ],
      demo: <AIAssistantDemo />,
      color: colors.primary,
    },
    {
      icon: <Dashboard />,
      title: 'Умный Dashboard',
      description: 'Настраиваемые виджеты и real-time аналитика',
      details: [
        'Конструктор из виджетов',
        'Прогресс спринтов в реальном времени',
        'Velocity и burndown charts',
        'Просроченные задачи',
        'Быстрый доступ к доскам и командам',
      ],
      demo: <DashboardDemo />,
      color: colors.secondary,
    },
    {
      icon: <Group />,
      title: 'Команды с чатами',
      description: 'Real-time общение прямо в задачах',
      details: [
        'Чат команды с упоминаниями',
        'Комментарии в задачах',
        'Файлы и вложения',
        'Уведомления в реальном времени',
        'Совместная работа над задачами',
      ],
      demo: <TeamChatDemo />,
      color: colors.accent,
    },
    {
      icon: <Lightbulb />,
      title: 'Наброски идей',
      description: 'Canvas для зарисовок с AI-конвертацией',
      details: [
        'Рисуйте и делайте заметки',
        'AI превращает в задачи одним кликом',
        'Комментарии и аналитика',
        'Делитесь с командой',
        'История версий',
      ],
      demo: <SketchesDemo />,
      color: colors.warning,
    },
  ];

  const capabilities = [
    {
      icon: <ViewKanban />,
      title: 'Kanban & Scrum',
      items: ['Drag & drop', '4 режима отображения', 'Группировка', 'Gantt chart'],
    },
    {
      icon: <Timeline />,
      title: 'Спринты',
      items: ['Планирование', 'Burndown', 'Velocity', 'История'],
    },
    {
      icon: <Analytics />,
      title: 'Аналитика',
      items: ['Метрики команды', 'Отчёты', 'Экспорт', 'AI-инсайты'],
    },
    {
      icon: <Psychology />,
      title: 'AI Features',
      items: ['Умный поиск', 'Авто-теги', 'Оценка времени', 'Разбивка задач'],
    },
  ];

  return (
    <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          bgcolor: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid' : 'none',
          borderColor: 'divider',
          transition: 'all 0.3s',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Typography 
              variant="h6" 
              fontWeight={800}
              sx={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              Agile Mind Pro
            </Typography>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ 
                  borderRadius: 2,
                  borderWidth: 2,
                  fontWeight: 600,
                  '&:hover': { borderWidth: 2 },
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              >
                Войти
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                endIcon={<ArrowForward />}
                sx={{
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  fontWeight: 700,
                  px: { xs: 2, sm: 3 },
                  boxShadow: `0 4px 14px ${alpha(colors.primary, 0.4)}`,
                }}
              >
                Начать
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero */}
      <Box sx={{ 
        pt: { xs: 6, md: 10 }, 
        pb: { xs: 4, md: 8 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Декор */}
        <Box sx={{
          position: 'absolute',
          width: { xs: 300, md: 600 },
          height: { xs: 300, md: 600 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(colors.primary, 0.08)} 0%, transparent 70%)`,
          top: { xs: -100, md: -200 },
          right: { xs: -100, md: -200 },
          animation: 'pulse 8s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
          },
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={800}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Chip
                      icon={<AutoAwesome />}
                      label="AI-powered"
                      sx={{
                        bgcolor: colors.primary,
                        color: 'white',
                        fontWeight: 700,
                        '& .MuiChip-icon': { color: 'white' },
                      }}
                    />
                    <Chip
                      label="Gemini 2.5"
                      size="small"
                      sx={{
                        bgcolor: alpha(colors.primary, 0.1),
                        color: colors.primary,
                        fontWeight: 600,
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="h1"
                    fontWeight={900}
                    sx={{
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                      lineHeight: 1.1,
                      mb: 3,
                      letterSpacing: '-2px',
                    }}
                  >
                    Управление проектами
                    <br />
                    <Box 
                      component="span" 
                      sx={{ 
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      с AI-ассистентом
                    </Box>
                  </Typography>

                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 4, lineHeight: 1.7, fontWeight: 400 }}
                  >
                    Kanban, Scrum, команды с чатами, AI-помощник, дашборды, 
                    наброски идей и полная аналитика. Всё в одном месте.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<Bolt />}
                      onClick={() => navigate('/register')}
                      sx={{
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 3, sm: 4 },
                        fontSize: { xs: '1rem', sm: '1.2rem' },
                        fontWeight: 700,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                        boxShadow: `0 8px 32px ${alpha(colors.primary, 0.4)}`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 12px 40px ${alpha(colors.primary, 0.5)}`,
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      Попробовать бесплатно
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 3, sm: 4 },
                        fontSize: { xs: '1rem', sm: '1.2rem' },
                        fontWeight: 600,
                        borderRadius: 2,
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 },
                      }}
                    >
                      Войти
                    </Button>
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    Без кредитной карты • Настройка за 2 минуты
                  </Typography>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} md={6}>
              <Fade in timeout={1200}>
                <Box>
                  <AIAssistantDemo />
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Features */}
      <Box sx={{ py: { xs: 6, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
            <Typography
              variant="h2"
              fontWeight={800}
              gutterBottom
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                mb: 2,
                letterSpacing: '-1px',
              }}
            >
              Всё что нужно для{' '}
              <Box 
                component="span" 
                sx={{ 
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                продуктивной работы
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Не просто Kanban. Полноценная экосистема для Agile-команд.
            </Typography>
          </Box>

          <Stack spacing={{ xs: 8, md: 12 }}>
            {features.map((feature, index) => (
              <Grid 
                key={index}
                container 
                spacing={{ xs: 4, md: 6 }}
                alignItems="center"
                direction={index % 2 === 0 ? 'row' : 'row-reverse'}
              >
                <Grid item xs={12} md={6}>
                  <Box sx={{ pr: { md: index % 2 === 0 ? 4 : 0 }, pl: { md: index % 2 === 1 ? 4 : 0 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${feature.color} 0%, ${alpha(feature.color, 0.7)} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        {React.cloneElement(feature.icon, { sx: { fontSize: 36 } })}
                      </Box>
                      <Box>
                        <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack spacing={1.5}>
                      {feature.details.map((detail, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <CheckCircle sx={{ color: feature.color, fontSize: 22, mt: 0.2, flexShrink: 0 }} />
                          <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                            {detail}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box 
                    sx={{ 
                      transform: { md: index % 2 === 0 ? 'perspective(1000px) rotateY(-3deg)' : 'perspective(1000px) rotateY(3deg)' },
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'perspective(1000px) rotateY(0deg) scale(1.02)',
                      },
                    }}
                  >
                    {feature.demo}
                  </Box>
                </Grid>
              </Grid>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Capabilities Grid */}
      <Box sx={{ py: { xs: 6, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="h2"
              fontWeight={800}
              gutterBottom
              sx={{ fontSize: { xs: '2rem', md: '3rem' }, letterSpacing: '-1px' }}
            >
              И это ещё не всё
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {capabilities.map((cap, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: colors.primary,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 32px ${alpha(colors.primary, 0.15)}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.1)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.primary,
                      mb: 2,
                    }}
                  >
                    {React.cloneElement(cap.icon, { sx: { fontSize: 32 } })}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {cap.title}
                  </Typography>
                  <Stack spacing={0.5}>
                    {cap.items.map((item, i) => (
                      <Typography key={i} variant="body2" color="text.secondary">
                        • {item}
                      </Typography>
                    ))}
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: { xs: 250, md: 500 },
            height: { xs: 250, md: 500 },
            borderRadius: '50%',
            bgcolor: 'white',
            opacity: 0.05,
            top: { xs: -100, md: -200 },
            right: { xs: -100, md: -200 },
          }}
        />
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative' }}>
          <AutoAwesome sx={{ fontSize: { xs: 48, md: 64 }, mb: 3 }} />
          <Typography 
            variant="h2" 
            fontWeight={900} 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '2rem', md: '3.5rem' },
              letterSpacing: '-1px',
            }}
          >
            Готовы начать?
          </Typography>
          <Typography variant="h6" sx={{ mb: 5, opacity: 0.95, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Присоединяйтесь к командам, которые работают умнее, а не дольше
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/register')}
            sx={{
              py: { xs: 2, sm: 2.5 },
              px: { xs: 4, sm: 6 },
              fontSize: { xs: '1.1rem', sm: '1.4rem' },
              fontWeight: 800,
              borderRadius: 2,
              bgcolor: 'white',
              color: colors.primary,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: 'white',
                transform: 'translateY(-4px) scale(1.02)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
              },
              transition: 'all 0.3s',
            }}
          >
            Начать бесплатно
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: colors.dark, color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Agile Mind Pro
            </Typography>
            <Typography variant="body2" color="grey.400">
              AI-powered система управления проектами
            </Typography>
            <Typography variant="caption" color="grey.600" sx={{ mt: 2, display: 'block' }}>
              © 2024 Agile Mind Pro. Все права защищены.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
