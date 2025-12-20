// src/pages/LandingPage.jsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import {
  ViewKanban,
  Group,
  Lightbulb,
  CalendarToday,
  TrendingUp,
  Speed,
  Security,
  Cloud,
  Notifications,
  Assignment,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
};

const features = [
  {
    icon: <ViewKanban sx={{ fontSize: 48 }} />,
    title: 'Kanban доски',
    description: 'Визуализируйте рабочий процесс с гибкими досками в стиле Kanban, Gantt и группировок',
    color: bauhaus.blue,
  },
  {
    icon: <Speed sx={{ fontSize: 48 }} />,
    title: 'Спринты',
    description: 'Планируйте спринты, отслеживайте velocity и анализируйте burndown charts',
    color: bauhaus.red,
  },
  {
    icon: <Group sx={{ fontSize: 48 }} />,
    title: 'Командная работа',
    description: 'Создавайте команды, общайтесь в чате, делитесь файлами и работайте вместе',
    color: bauhaus.teal,
  },
  {
    icon: <Lightbulb sx={{ fontSize: 48 }} />,
    title: 'Наброски идей',
    description: 'Фиксируйте идеи, заметки и вопросы в одном месте для быстрого доступа',
    color: bauhaus.yellow,
  },
  {
    icon: <CalendarToday sx={{ fontSize: 48 }} />,
    title: 'Календарь',
    description: 'Планируйте задачи и дедлайны в удобном календаре с разными видами',
    color: bauhaus.blue,
  },
  {
    icon: <TrendingUp sx={{ fontSize: 48 }} />,
    title: 'Аналитика',
    description: 'Отслеживайте прогресс, метрики команды и эффективность спринтов',
    color: bauhaus.teal,
  },
];

const benefits = [
  { icon: <Cloud />, text: 'Облачное хранилище' },
  { icon: <Security />, text: 'Защита данных' },
  { icon: <Notifications />, text: 'Уведомления в реальном времени' },
  { icon: <Assignment />, text: 'Гибкие настройки задач' },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(10px)',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
            }}
          >
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative', width: 40, height: 40 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    width: 20,
                    height: 20,
                    bgcolor: bauhaus.blue,
                    borderRadius: '50%',
                    top: 0,
                    left: 0,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    width: 15,
                    height: 15,
                    bgcolor: bauhaus.red,
                    top: 12,
                    right: 0,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    width: 12,
                    height: 12,
                    bgcolor: bauhaus.yellow,
                    borderRadius: '50%',
                    bottom: 0,
                    left: 10,
                  }}
                />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                Agile Mind
              </Typography>
            </Box>

            {/* Navigation */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ borderRadius: 50 }}
              >
                Войти
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  borderRadius: 50,
                  background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                }}
              >
                Регистрация
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, rgba(30, 136, 229, 0.05) 0%, rgba(38, 166, 154, 0.05) 100%)`,
        }}
      >
        {/* Bauhaus декор */}
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: bauhaus.blue,
            opacity: 0.05,
            top: -150,
            right: -100,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 250,
            height: 250,
            bgcolor: bauhaus.yellow,
            opacity: 0.08,
            bottom: -80,
            left: -80,
            transform: 'rotate(45deg)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="Современное управление проектами"
                sx={{
                  mb: 3,
                  bgcolor: `${bauhaus.blue}15`,
                  color: bauhaus.blue,
                  fontWeight: 600,
                }}
              />
              <Typography
                variant="h2"
                fontWeight={800}
                gutterBottom
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Управляйте проектами эффективно
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4, lineHeight: 1.6 }}
              >
                Agile Mind — современная платформа для управления проектами с
                поддержкой Agile методологии. Канбан доски, спринты, команды и
                аналитика в одном месте.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/register')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 50,
                    background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                    boxShadow: 4,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Начать бесплатно
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 50,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                >
                  Демо
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 300, md: 400 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Декоративные карточки */}
                <Card
                  sx={{
                    position: 'absolute',
                    width: 250,
                    top: 20,
                    left: 20,
                    transform: 'rotate(-5deg)',
                    boxShadow: 8,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ViewKanban color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Kanban доска
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Визуализация задач и прогресса
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    position: 'absolute',
                    width: 250,
                    bottom: 20,
                    right: 20,
                    transform: 'rotate(5deg)',
                    boxShadow: 8,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TrendingUp sx={{ color: bauhaus.teal }} />
                      <Typography variant="h6" fontWeight={600}>
                        Аналитика
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Метрики и статистика команды
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            gutterBottom
            sx={{
              background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Возможности платформы
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Все инструменты для эффективной работы команды
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  borderLeft: 4,
                  borderColor: feature.color,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ color: feature.color, mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              fontWeight={800}
              gutterBottom
              sx={{
                background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Почему Agile Mind?
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: `${bauhaus.blue}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      color: bauhaus.blue,
                    }}
                  >
                    {React.cloneElement(benefit.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    {benefit.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Готовы начать?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Присоединяйтесь к команде и начните управлять проектами эффективно
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<CheckCircle />}
              onClick={() => navigate('/register')}
              sx={{
                py: 1.5,
                px: 5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 50,
                background: `linear-gradient(135deg, ${bauhaus.blue} 0%, ${bauhaus.teal} 100%)`,
                boxShadow: 4,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Создать аккаунт
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Agile Mind
            </Typography>
            <Typography variant="body2" color="grey.400">
              Современное управление проектами для эффективных команд
            </Typography>
            <Typography variant="caption" color="grey.500" sx={{ mt: 2, display: 'block' }}>
              © 2024 Agile Mind. Все права защищены.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
