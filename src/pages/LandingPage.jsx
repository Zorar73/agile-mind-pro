// src/pages/LandingPage.jsx
// Premium Landing Page - Inspired by Monday.com, Jira, Trello
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
  Paper,
  alpha,
  Divider,
  IconButton,
  Fade,
  Collapse,
  LinearProgress,
  Modal,
  TextField,
  MenuItem,
  Rating,
} from '@mui/material';
import {
  AutoAwesome,
  SmartToy,
  Chat,
  ViewKanban,
  ArrowForward,
  CheckCircle,
  PlayArrow,
  Timeline,
  CalendarMonth,
  School,
  Groups,
  Draw,
  Rocket,
  Menu,
  Check,
  Remove,
  Analytics,
  VideoLibrary,
  FormatQuote,
  MouseOutlined,
  Image,
  Close,
  Send,
  Email,
  Phone,
  Star,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';

// Анимации
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Цвета
const colors = {
  primary: '#1E88E5',
  primaryDark: '#1565C0',
  primaryLight: '#64B5F6',
  secondary: '#7E57C2',
  secondaryDark: '#5E35B1',
  accent: '#26A69A',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#E53935',
  dark: '#0A0A0F',
  darkGray: '#1A1A2E',
  gray: '#2D2D44',
  lightGray: '#F5F7FA',
  white: '#FFFFFF',
};

// =====================================================
// NAVBAR
// =====================================================
const Navbar = ({ navigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        transition: 'all 0.3s ease',
        bgcolor: scrolled ? alpha(colors.dark, 0.95) : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? `1px solid ${alpha(colors.white, 0.1)}` : 'none',
      }}
    >
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" py={2}>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer',
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Agile Mind Pro
          </Typography>

          <Stack direction="row" spacing={4} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
            {['Возможности', 'AI', 'Цены', 'Отзывы'].map((item) => (
              <Typography
                key={item}
                variant="body1"
                sx={{ color: alpha(colors.white, 0.8), cursor: 'pointer', fontWeight: 500, '&:hover': { color: colors.primary } }}
              >
                {item}
              </Typography>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button variant="text" onClick={() => navigate('/login')} sx={{ color: colors.white, fontWeight: 600 }}>
              Войти
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                fontWeight: 600,
              }}
            >
              Начать бесплатно
            </Button>
          </Stack>

          <IconButton sx={{ display: { xs: 'flex', md: 'none' }, color: colors.white }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu />
          </IconButton>
        </Stack>

        <Collapse in={mobileMenuOpen}>
          <Stack spacing={2} pb={3} sx={{ display: { md: 'none' } }}>
            {['Возможности', 'AI', 'Цены', 'Отзывы'].map((item) => (
              <Typography key={item} variant="body1" sx={{ color: alpha(colors.white, 0.8), cursor: 'pointer' }}>
                {item}
              </Typography>
            ))}
            <Divider sx={{ borderColor: alpha(colors.white, 0.1) }} />
            <Button variant="text" onClick={() => navigate('/login')} sx={{ color: colors.white }}>Войти</Button>
            <Button variant="contained" onClick={() => navigate('/register')} sx={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}>
              Начать бесплатно
            </Button>
          </Stack>
        </Collapse>
      </Container>
    </Box>
  );
};

// =====================================================
// INTERACTIVE DASHBOARD DEMO
// =====================================================
const InteractiveDashboardDemo = () => {
  const [activeTab, setActiveTab] = useState('kanban');
  const [progress, setProgress] = useState(72);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => prev < 100 ? prev + Math.random() * 2 : 72);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'kanban', icon: <ViewKanban />, label: 'Kanban' },
    { id: 'calendar', icon: <CalendarMonth />, label: 'Календарь' },
    { id: 'analytics', icon: <Analytics />, label: 'Аналитика' },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={1} mb={3}>
        {tabs.map((tab) => (
          <Chip
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            onClick={() => setActiveTab(tab.id)}
            sx={{
              bgcolor: activeTab === tab.id ? colors.primary : alpha(colors.white, 0.1),
              color: colors.white,
              '&:hover': { bgcolor: activeTab === tab.id ? colors.primary : alpha(colors.white, 0.2) },
              '& .MuiChip-icon': { color: colors.white },
            }}
          />
        ))}
      </Stack>

      {activeTab === 'kanban' && (
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, width: '100%' }}>
          {[
            { title: 'To Do', color: '#9E9E9E', tasks: ['Дизайн макета', 'Документация'] },
            { title: 'In Progress', color: colors.primary, tasks: ['API разработка'] },
            { title: 'Review', color: colors.warning, tasks: ['Тестирование'] },
            { title: 'Done', color: colors.success, tasks: ['Аутентификация', 'База данных'] },
          ].map((col, i) => (
            <Box key={i} sx={{ flex: '1 1 0', minWidth: 120 }}>
              <Box sx={{ bgcolor: alpha(colors.white, 0.05), borderRadius: 2, p: 1.5, borderTop: `3px solid ${col.color}`, height: '100%' }}>
                <Typography variant="caption" color={alpha(colors.white, 0.7)} fontWeight={600}>{col.title}</Typography>
                <Stack spacing={1} mt={1}>
                  {col.tasks.map((task, j) => (
                    <Paper key={j} sx={{ p: 1, bgcolor: alpha(colors.white, 0.08), borderRadius: 1, cursor: 'pointer', '&:hover': { bgcolor: alpha(colors.white, 0.12), transform: 'translateX(4px)' }, transition: 'all 0.2s' }}>
                      <Typography variant="caption" color={colors.white}>{task}</Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {activeTab === 'calendar' && (
        <Box sx={{ bgcolor: alpha(colors.white, 0.05), borderRadius: 2, p: 2, width: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <Typography key={day} variant="caption" color={alpha(colors.white, 0.5)} align="center" display="block">{day}</Typography>
            ))}
            {[...Array(35)].map((_, i) => (
              <Box key={i} sx={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                bgcolor: [8, 15, 22].includes(i) ? alpha(colors.primary, 0.3) : 'transparent',
                border: i === 15 ? `2px solid ${colors.primary}` : 'none',
              }}>
                <Typography variant="caption" color={alpha(colors.white, 0.7)}>{i + 1 <= 31 ? i + 1 : ''}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {activeTab === 'analytics' && (
        <Box sx={{ width: '100%' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
            <Paper sx={{ flex: 1, p: 2, bgcolor: alpha(colors.primary, 0.2), borderRadius: 2 }}>
              <Typography variant="caption" color={alpha(colors.white, 0.7)}>Прогресс спринта</Typography>
              <Typography variant="h4" color={colors.white} fontWeight={700}>{Math.round(progress)}%</Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, bgcolor: alpha(colors.white, 0.1), '& .MuiLinearProgress-bar': { bgcolor: colors.primary } }} />
            </Paper>
            <Paper sx={{ flex: 1, p: 2, bgcolor: alpha(colors.success, 0.2), borderRadius: 2 }}>
              <Typography variant="caption" color={alpha(colors.white, 0.7)}>Завершено</Typography>
              <Typography variant="h4" color={colors.white} fontWeight={700}>24</Typography>
              <Typography variant="caption" color={colors.success}>+8 за неделю</Typography>
            </Paper>
          </Stack>
          <Box sx={{ bgcolor: alpha(colors.white, 0.05), borderRadius: 2, p: 2, height: 80, width: '100%' }}>
            <Stack direction="row" spacing={0.5} alignItems="flex-end" height="100%" width="100%">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <Box key={i} sx={{ flex: 1, height: `${h}%`, bgcolor: i === 6 ? colors.primary : alpha(colors.primary, 0.5), borderRadius: 1 }} />
              ))}
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// =====================================================
// HERO SECTION
// =====================================================
const HeroSection = ({ navigate }) => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['продуктивности', 'эффективности', 'командной работы', 'AI-автоматизации'];
  
  useEffect(() => {
    const interval = setInterval(() => setCurrentWord((prev) => (prev + 1) % words.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.darkGray} 50%, ${colors.gray} 100%)`,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
    }}>
      {/* Background Elements */}
      <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', opacity: 0.1 }}>
        {[...Array(15)].map((_, i) => (
          <Box key={i} sx={{
            position: 'absolute',
            width: { xs: 100, md: 200 },
            height: { xs: 100, md: 200 },
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `${float} ${5 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            filter: 'blur(40px)',
          }} />
        ))}
      </Box>

      {/* Grid Pattern */}
      <Box sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: `linear-gradient(${alpha(colors.primary, 0.03)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(colors.primary, 0.03)} 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} lg={6}>
            <Fade in timeout={1000}>
              <Box>
                <Chip
                  icon={<AutoAwesome sx={{ color: colors.warning + ' !important' }} />}
                  label="AI-Powered Project Management"
                  sx={{
                    mb: 4,
                    bgcolor: alpha(colors.primary, 0.1),
                    border: `1px solid ${alpha(colors.primary, 0.3)}`,
                    color: colors.primaryLight,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    py: 2.5,
                    px: 1,
                  }}
                />
                
                <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' }, fontWeight: 900, color: colors.white, lineHeight: 1.1, mb: 2 }}>
                  Новый уровень
                </Typography>
                
                <Typography variant="h1" sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                  fontWeight: 900,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
                  backgroundSize: '200% 200%',
                  animation: `${gradientShift} 5s ease infinite`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                  mb: 4,
                  minHeight: { xs: '3rem', md: '5.5rem' },
                }}>
                  {words[currentWord]}
                </Typography>

                <Typography variant="h5" sx={{ color: alpha(colors.white, 0.7), mb: 5, lineHeight: 1.6, maxWidth: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  Agile Mind Pro объединяет умное управление задачами, AI-ассистента, командную работу и корпоративное обучение в одной платформе.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={6}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/register')}
                    sx={{
                      py: 2,
                      px: 5,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                      boxShadow: `0 8px 32px ${alpha(colors.primary, 0.4)}`,
                      '&:hover': { background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.secondaryDark} 100%)`, transform: 'translateY(-2px)', boxShadow: `0 12px 40px ${alpha(colors.primary, 0.5)}` },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Начать бесплатно
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrow />}
                    sx={{ py: 2, px: 5, fontSize: '1.1rem', fontWeight: 600, borderRadius: 2, borderColor: alpha(colors.white, 0.3), color: colors.white, '&:hover': { borderColor: colors.primary, bgcolor: alpha(colors.primary, 0.1) } }}
                  >
                    Смотреть демо
                  </Button>
                </Stack>

                <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
                  <Box>
                    <Typography variant="h4" fontWeight={800} color={colors.white}>10K+</Typography>
                    <Typography variant="body2" color={alpha(colors.white, 0.6)}>Пользователей</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ bgcolor: alpha(colors.white, 0.2) }} />
                  <Box>
                    <Typography variant="h4" fontWeight={800} color={colors.white}>50K+</Typography>
                    <Typography variant="body2" color={alpha(colors.white, 0.6)}>Задач</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ bgcolor: alpha(colors.white, 0.2), display: { xs: 'none', sm: 'block' } }} />
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="h4" fontWeight={800} color={colors.white}>99.9%</Typography>
                    <Typography variant="body2" color={alpha(colors.white, 0.6)}>Uptime</Typography>
                  </Box>
                </Stack>
              </Box>
            </Fade>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Fade in timeout={1500}>
              <Box sx={{ position: 'relative' }}>
                <Paper
                  elevation={24}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: colors.darkGray,
                    border: `1px solid ${alpha(colors.white, 0.1)}`,
                    animation: `${float} 6s ease-in-out infinite`,
                  }}
                >
                  <Box sx={{ p: 1.5, bgcolor: alpha(colors.white, 0.05), display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F57' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FEBC2E' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#28C840' }} />
                    <Box sx={{ ml: 2, flex: 1, bgcolor: alpha(colors.white, 0.1), borderRadius: 1, py: 0.5, px: 2 }}>
                      <Typography variant="caption" color={alpha(colors.white, 0.5)}>app.agilemindpro.com</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <InteractiveDashboardDemo />
                  </Box>
                </Paper>

                {/* Floating notification */}
                <Paper sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: colors.white,
                  boxShadow: `0 8px 32px ${alpha(colors.dark, 0.3)}`,
                  animation: `${float} 4s ease-in-out infinite`,
                  animationDelay: '1s',
                  display: { xs: 'none', md: 'block' },
                }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ bgcolor: colors.success, width: 32, height: 32 }}><Check sx={{ fontSize: 18 }} /></Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Задача завершена</Typography>
                      <Typography variant="body2" fontWeight={600}>API интеграция</Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Paper sx={{
                  position: 'absolute',
                  bottom: 40,
                  left: -30,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: colors.white,
                  boxShadow: `0 8px 32px ${alpha(colors.dark, 0.3)}`,
                  animation: `${float} 5s ease-in-out infinite`,
                  animationDelay: '2s',
                  display: { xs: 'none', md: 'block' },
                }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <SmartToy sx={{ color: colors.secondary, fontSize: 28 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">AI создал</Typography>
                      <Typography variant="body2" fontWeight={600}>5 подзадач</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </Fade>
          </Grid>
        </Grid>

        <Box sx={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', animation: `${pulse} 2s ease-in-out infinite` }}>
          <MouseOutlined sx={{ color: alpha(colors.white, 0.5), fontSize: 32 }} />
          <Typography variant="caption" display="block" color={alpha(colors.white, 0.5)}>Прокрутите вниз</Typography>
        </Box>
      </Container>
    </Box>
  );
};



// =====================================================
// FEATURES SECTION - Bento Grid Style
// =====================================================
const FeaturesSection = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 14 }, bgcolor: colors.lightGray }}>
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center" textAlign="center" mb={8}>
          <Chip label="Возможности" sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary, fontWeight: 600 }} />
          <Typography variant="h2" fontWeight={900} sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
            Всё для управления проектами
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            Один инструмент вместо десяти. От простых задач до корпоративной системы.
          </Typography>
        </Stack>

        {/* Bento Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gridTemplateRows: { xs: 'auto', md: 'repeat(2, 280px)' },
          gap: 3,
        }}>
          {/* Kanban - Large */}
          <Paper sx={{ 
            gridColumn: { xs: '1', md: '1 / 3' }, 
            p: 4, 
            borderRadius: 4,
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <Box sx={{ position: 'absolute', right: -50, bottom: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha('#fff', 0.1) }} />
            <ViewKanban sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
            <Typography variant="h4" fontWeight={800} mb={1}>Умный Kanban</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, maxWidth: 400 }}>
              Drag-and-drop доски с настраиваемыми колонками, WIP-лимитами и автоматизацией workflow.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
              {['To Do', 'In Progress', 'Review', 'Done'].map((col, i) => (
                <Box key={i} sx={{ flex: 1, bgcolor: alpha('#fff', 0.15), borderRadius: 2, p: 1.5, backdropFilter: 'blur(10px)' }}>
                  <Typography variant="caption" fontWeight={600}>{col}</Typography>
                  <Stack spacing={0.5} mt={1}>
                    {[...Array(i === 0 ? 3 : i === 3 ? 4 : 2)].map((_, j) => (
                      <Box key={j} sx={{ height: 8, bgcolor: alpha('#fff', 0.3), borderRadius: 1 }} />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* AI Assistant */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: 4,
            background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryDark} 100%)`,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <SmartToy sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h5" fontWeight={800} mb={1}>AI Ассистент</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
              Gemini 2.5 создаёт задачи, генерирует описания и анализирует встречи.
            </Typography>
            <Box sx={{ mt: 'auto', p: 2, bgcolor: alpha('#fff', 0.1), borderRadius: 2 }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>AI создал:</Typography>
              <Typography variant="body2" fontWeight={600}>7 подзадач за 2 сек</Typography>
            </Box>
          </Paper>

          {/* Teams */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: 4,
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Groups sx={{ fontSize: 40, mb: 2, color: colors.accent }} />
            <Typography variant="h5" fontWeight={800} mb={1}>Команды</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Роли, real-time чат, упоминания и совместная работа.
            </Typography>
            <Stack direction="row" spacing={-1.5} mt="auto">
              {['#E53935', '#1E88E5', '#4CAF50', '#FF9800', '#7E57C2'].map((c, i) => (
                <Avatar key={i} sx={{ bgcolor: c, width: 40, height: 40, border: '3px solid white', fontSize: 14, fontWeight: 700 }}>
                  {String.fromCharCode(65 + i)}
                </Avatar>
              ))}
              <Avatar sx={{ bgcolor: colors.lightGray, width: 40, height: 40, border: '3px solid white', fontSize: 12, color: 'text.secondary' }}>+12</Avatar>
            </Stack>
          </Paper>

          {/* Sketches */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: 4,
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Draw sx={{ fontSize: 40, mb: 2, color: colors.warning }} />
            <Typography variant="h5" fontWeight={800} mb={1}>Наброски → Задачи</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Рисуйте идеи, AI превратит их в структурированные задачи.
            </Typography>
            <Box sx={{ mt: 'auto', p: 2, bgcolor: alpha(colors.warning, 0.1), borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 40, height: 40, bgcolor: alpha(colors.warning, 0.2), borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Draw sx={{ color: colors.warning, fontSize: 20 }} />
              </Box>
              <ArrowForward sx={{ color: colors.warning, fontSize: 16 }} />
              <Box sx={{ flex: 1, height: 8, bgcolor: colors.warning, borderRadius: 1 }} />
            </Box>
          </Paper>

          {/* LMS - Wide */}
          <Paper sx={{ 
            gridColumn: { xs: '1', md: '2 / 4' }, 
            p: 4, 
            borderRadius: 4,
            background: `linear-gradient(135deg, ${colors.error} 0%, #C62828 100%)`,
            color: 'white',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 4,
            alignItems: 'center',
          }}>
            <Box sx={{ flex: 1 }}>
              <School sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h4" fontWeight={800} mb={1}>Обучение команды</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Встроенная LMS: курсы, уроки, тесты, сертификаты и автоматический onboarding новых сотрудников.
              </Typography>
            </Box>
            <Stack spacing={1.5} sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              {['Основы Agile', 'Продуктовое мышление', 'Безопасность'].map((course, i) => (
                <Box key={i} sx={{ p: 2, bgcolor: alpha('#fff', 0.15), borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                  <Typography variant="body2" fontWeight={600}>{course}</Typography>
                  <LinearProgress variant="determinate" value={[85, 62, 100][i]} sx={{ mt: 1, height: 4, borderRadius: 2, bgcolor: alpha('#fff', 0.2), '& .MuiLinearProgress-bar': { bgcolor: '#fff' } }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>

        {/* Additional Features Row */}
        <Grid container spacing={3} mt={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'white', height: '100%', textAlign: 'center' }}>
              <Timeline sx={{ fontSize: 36, color: colors.success, mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700}>Спринты</Typography>
              <Typography variant="body2" color="text.secondary">Burndown charts</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'white', height: '100%', textAlign: 'center' }}>
              <CalendarMonth sx={{ fontSize: 36, color: colors.primary, mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700}>Календарь</Typography>
              <Typography variant="body2" color="text.secondary">Дедлайны и события</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'white', height: '100%', textAlign: 'center' }}>
              <Analytics sx={{ fontSize: 36, color: colors.secondary, mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700}>Аналитика</Typography>
              <Typography variant="body2" color="text.secondary">Метрики команды</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'white', height: '100%', textAlign: 'center' }}>
              <Image sx={{ fontSize: 36, color: colors.warning, mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700}>AI Генерация</Typography>
              <Typography variant="body2" color="text.secondary">Изображения для рефов</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// =====================================================
// AI SECTION
// =====================================================
const AISection = () => {
  const [activeDemo, setActiveDemo] = useState(0);

  const aiFeatures = [
    { icon: <AutoAwesome />, title: 'Создание задач из текста', description: 'Опишите задачу — AI создаст структуру.' },
    { icon: <Groups />, title: 'Рекап встречи → Задачи', description: 'Кидаете рекап — AI создаёт задачи всем участникам.' },
    { icon: <Image />, title: 'Генерация изображений', description: 'Референсы и визуализации прямо в задаче.' },
    { icon: <SmartToy />, title: 'Умные подсказки', description: 'Анализ нагрузки и рекомендации.' },
  ];

  const demos = [
    { input: 'Создать систему авторизации с OAuth', output: '✓ Создано 7 подзадач\n✓ Оценка: 18 часов\n✓ Теги: auth, security', type: 'text' },
    { input: 'Рекап: Андрей делает API к пятнице, Мария — макеты к среде, Олег тестирует в четверг', output: '✓ Андрей: "API интеграция" → дедлайн пт\n✓ Мария: "Дизайн макеты" → дедлайн ср\n✓ Олег: "Тестирование" → дедлайн чт\n\n📩 Уведомления отправлены', type: 'text' },
    { input: 'Минималистичный интерфейс дашборда', output: 'image', type: 'image' },
    { input: 'Проанализируй загрузку команды', output: '⚠️ Андрей: +40% нагрузки\n✓ Мария: оптимально\n✓ Совет: перенести 2 задачи', type: 'text' },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 12 }, background: `linear-gradient(180deg, ${colors.dark} 0%, ${colors.darkGray} 100%)`, position: 'relative', overflow: 'hidden' }}>
      {/* Background decorations */}
      <Box sx={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(colors.secondary, 0.1)} 0%, transparent 60%)`, top: -200, right: -100 }} />
      <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(colors.primary, 0.08)} 0%, transparent 60%)`, bottom: -100, left: -100 }} />

      <Container maxWidth="xl">
        {/* Header - только на мобильных */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4, textAlign: 'center' }}>
          <Chip 
            icon={<SmartToy sx={{ color: `${colors.secondary} !important` }} />} 
            label="Powered by Gemini 2.5" 
            sx={{ mb: 2, bgcolor: alpha(colors.secondary, 0.15), border: `1px solid ${alpha(colors.secondary, 0.3)}`, color: colors.secondary, fontWeight: 600 }} 
          />
          <Typography variant="h4" fontWeight={900} color={colors.white} sx={{ mb: 1 }}>
            AI, который понимает
          </Typography>
          <Typography variant="h4" fontWeight={900} sx={{ background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 2 }}>
            ваш рабочий процесс
          </Typography>
        </Box>

        {/* Main content - горизонтальный на десктопе */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 3, md: 6 },
          alignItems: { xs: 'stretch', md: 'center' },
        }}>
          {/* Left side - Features */}
          <Box sx={{ flex: { xs: '1', md: '0 0 380px' } }}>
            {/* Header - только на десктопе */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, mb: 4 }}>
              <Chip 
                icon={<SmartToy sx={{ color: `${colors.secondary} !important` }} />} 
                label="Powered by Gemini 2.5" 
                sx={{ mb: 2, bgcolor: alpha(colors.secondary, 0.15), border: `1px solid ${alpha(colors.secondary, 0.3)}`, color: colors.secondary, fontWeight: 600 }} 
              />
              <Typography variant="h3" fontWeight={900} color={colors.white} sx={{ mb: 1, lineHeight: 1.2 }}>
                AI, который понимает
              </Typography>
              <Typography variant="h3" fontWeight={900} sx={{ background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2, mb: 2 }}>
                ваш рабочий процесс
              </Typography>
              <Typography variant="body1" sx={{ color: alpha(colors.white, 0.6), lineHeight: 1.7 }}>
                Интеллектуальный помощник для создания задач, анализа встреч и генерации изображений.
              </Typography>
            </Box>

            {/* Feature buttons */}
            <Stack spacing={1}>
              {aiFeatures.map((feature, i) => (
                <Paper
                  key={i}
                  onClick={() => setActiveDemo(i)}
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    cursor: 'pointer',
                    bgcolor: activeDemo === i ? alpha(colors.secondary, 0.2) : alpha(colors.white, 0.03),
                    border: '1px solid',
                    borderColor: activeDemo === i ? colors.secondary : alpha(colors.white, 0.08),
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: alpha(colors.secondary, 0.1), borderColor: alpha(colors.secondary, 0.3) },
                    // Убираем pointer-events проблему
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 1.5, 
                      bgcolor: activeDemo === i ? colors.secondary : alpha(colors.white, 0.1), 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: activeDemo === i ? 'white' : alpha(colors.white, 0.6),
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}>
                      {feature.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} color={colors.white} noWrap>{feature.title}</Typography>
                      <Typography variant="caption" color={alpha(colors.white, 0.5)} sx={{ display: { xs: 'none', sm: 'block' } }}>{feature.description}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>

          {/* Right side - Demo visualization */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ 
              p: { xs: 2.5, md: 4 }, 
              borderRadius: 3, 
              bgcolor: alpha(colors.white, 0.03), 
              border: `1px solid ${alpha(colors.white, 0.1)}`,
              backdropFilter: 'blur(20px)',
              height: '100%',
              minHeight: { xs: 300, md: 400 },
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Header */}
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Avatar sx={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`, width: 40, height: 40 }}>
                  <SmartToy sx={{ fontSize: 22 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color={colors.white}>AI Ассистент</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.success }} />
                    <Typography variant="caption" color={alpha(colors.white, 0.5)}>Online</Typography>
                  </Stack>
                </Box>
              </Stack>

              {/* User input */}
              <Box sx={{ p: 2, mb: 2, bgcolor: alpha(colors.white, 0.05), borderRadius: 2, borderLeft: `3px solid ${alpha(colors.white, 0.2)}` }}>
                <Typography variant="caption" color={alpha(colors.white, 0.4)} mb={0.5} display="block">Запрос</Typography>
                <Typography variant="body2" color={colors.white}>{demos[activeDemo].input}</Typography>
              </Box>

              {/* AI Response */}
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha(colors.secondary, 0.1), 
                border: `1px solid ${alpha(colors.secondary, 0.2)}`, 
                borderRadius: 2,
                borderLeft: `3px solid ${colors.secondary}`,
                flex: 1,
              }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <AutoAwesome sx={{ color: colors.secondary, fontSize: 16 }} />
                  <Typography variant="caption" color={colors.secondary} fontWeight={600}>Результат</Typography>
                </Stack>
                
                {demos[activeDemo].type === 'image' ? (
                  <Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: { xs: 140, md: 180 }, 
                      borderRadius: 2, 
                      background: `linear-gradient(135deg, ${alpha(colors.primary, 0.3)}, ${alpha(colors.secondary, 0.3)})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {/* Fake dashboard preview */}
                      <Box sx={{ position: 'absolute', inset: { xs: 12, md: 20 }, bgcolor: alpha(colors.dark, 0.85), borderRadius: 2, p: { xs: 1.5, md: 2 } }}>
                        <Box sx={{ height: 6, width: '40%', bgcolor: alpha(colors.white, 0.2), borderRadius: 1, mb: 1 }} />
                        <Stack direction="row" spacing={1}>
                          {[1,2,3].map(i => (
                            <Box key={i} sx={{ flex: 1, height: { xs: 40, md: 50 }, bgcolor: alpha(colors.white, 0.1), borderRadius: 1 }} />
                          ))}
                        </Stack>
                        <Box sx={{ height: { xs: 25, md: 35 }, bgcolor: alpha(colors.primary, 0.3), borderRadius: 1, mt: 1 }} />
                      </Box>
                    </Box>
                    <Typography variant="body2" color={alpha(colors.white, 0.7)}>
                      ✓ Сгенерировано 1024×1024<br/>
                      ✓ Прикреплено как референс
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: colors.white, whiteSpace: 'pre-line', fontFamily: 'monospace', fontSize: { xs: '0.8rem', md: '0.9rem' }, lineHeight: 1.8 }}>
                    {demos[activeDemo].output}
                  </Typography>
                )}
              </Box>

              {/* Action buttons */}
              <Stack direction="row" spacing={2} mt={2}>
                <Button 
                  variant="contained" 
                  size="small"
                  sx={{ 
                    bgcolor: colors.secondary, 
                    '&:hover': { bgcolor: colors.secondaryDark },
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  Применить
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    borderColor: alpha(colors.white, 0.2), 
                    color: colors.white,
                    fontSize: '0.8rem',
                    '&:hover': { borderColor: alpha(colors.white, 0.4), bgcolor: alpha(colors.white, 0.05) },
                  }}
                >
                  Изменить
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

// =====================================================
// CONTACT MODAL
// =====================================================
const ContactModal = ({ open, onClose, selectedPlan }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    participants: '',
    plan: selectedPlan || '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: отправка формы
    console.log('Form submitted:', formData);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: 480 },
        maxHeight: '90vh',
        overflow: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: 24,
        p: 4,
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={800}>Оставить заявку</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Имя"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Телефон"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              label="Компания"
              fullWidth
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <TextField
              label="Количество участников"
              type="number"
              fullWidth
              required
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
            />
            <TextField
              label="Тариф"
              select
              fullWidth
              required
              value={formData.plan || selectedPlan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            >
              <MenuItem value="team">Team (без AI)</MenuItem>
              <MenuItem value="team-ai">Team + AI</MenuItem>
              <MenuItem value="enterprise">Enterprise</MenuItem>
            </TextField>
            <TextField
              label="Комментарий"
              multiline
              rows={3}
              fullWidth
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              endIcon={<Send />}
              sx={{
                py: 1.5,
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              }}
            >
              Отправить заявку
            </Button>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

// =====================================================
// PRICING SECTION
// =====================================================
const PricingSection = ({ navigate }) => {
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  const handleContact = (plan) => {
    setSelectedPlan(plan);
    setContactOpen(true);
  };

  const plans = [
    { 
      name: 'Free', 
      price: 'Бесплатно', 
      description: 'Для небольших команд', 
      features: [
        'До 5 участников',
        'Безлимитные доски',
        'Безлимитные задачи',
        'Командный чат',
        'Календарь и дедлайны',
      ],
      limitations: ['Без AI функций', 'Без спринтов'],
      highlighted: false, 
      buttonText: 'Начать бесплатно', 
      action: () => navigate('/register'),
    },
    { 
      name: 'Team', 
      price: '700 ₽', 
      priceNote: 'за участника/мес свыше 5',
      description: 'Для растущих команд', 
      features: [
        'Всё из Free',
        'Неограниченно участников',
        'Спринты и Burndown',
        'Наброски → Задачи',
        'Приоритетная поддержка',
      ],
      limitations: ['Без AI функций'],
      highlighted: false, 
      buttonText: 'Связаться',
      action: () => handleContact('team'),
    },
    { 
      name: 'Team + AI', 
      price: '1 500 ₽', 
      priceNote: 'за участника/мес',
      description: 'Полный функционал AI', 
      features: [
        'Всё из Team',
        'AI создание задач',
        'AI анализ встреч',
        'AI генерация изображений',
        'Умные подсказки',
      ],
      limitations: [],
      highlighted: true, 
      buttonText: 'Связаться',
      badge: 'Рекомендуем',
      action: () => handleContact('team-ai'),
    },
    { 
      name: 'Enterprise', 
      price: 'По запросу', 
      description: 'Для крупных организаций', 
      features: [
        'Всё из Team + AI',
        'LMS платформа',
        'SSO / SAML',
        'SLA 99.99%',
        'Персональный менеджер',
        'Кастомизация',
      ],
      limitations: [],
      highlighted: false, 
      buttonText: 'Связаться',
      action: () => handleContact('enterprise'),
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 12 }, bgcolor: colors.lightGray }}>
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center" textAlign="center" mb={6}>
          <Chip label="Тарифы" sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary, fontWeight: 600 }} />
          <Typography variant="h2" fontWeight={900} sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
            Прозрачное ценообразование
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
            Начните бесплатно до 5 человек. Масштабируйтесь по мере роста.
          </Typography>
        </Stack>
      </Container>

      {/* Scrollable on mobile, grid on desktop */}
      <Box sx={{ 
        display: { xs: 'flex', md: 'none' },
        gap: 2,
        pl: { xs: 2, sm: 4 },
        pr: { xs: 2, sm: 4 },
        pb: 2,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        '&::-webkit-scrollbar': { display: 'none' },
      }}>
        {plans.map((plan, index) => (
          <Card key={index} sx={{
            minWidth: 260,
            maxWidth: 280,
            p: 2.5,
            borderRadius: 3,
            position: 'relative',
            border: '2px solid',
            borderColor: plan.highlighted ? colors.primary : 'transparent',
            bgcolor: 'white',
            boxShadow: plan.highlighted ? `0 8px 24px ${alpha(colors.primary, 0.15)}` : `0 2px 12px ${alpha(colors.dark, 0.05)}`,
            scrollSnapAlign: 'start',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {plan.badge && (
              <Chip 
                label={plan.badge} 
                size="small"
                sx={{ 
                  position: 'absolute', 
                  top: 12, 
                  right: 12, 
                  bgcolor: colors.primary, 
                  color: colors.white, 
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  height: 22,
                }} 
              />
            )}
            
            <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.65rem' }}>{plan.name}</Typography>
            
            <Typography variant="h5" fontWeight={900} color={plan.highlighted ? colors.primary : 'inherit'}>
              {plan.price}
            </Typography>
            
            {plan.priceNote && (
              <Typography variant="caption" color="text.secondary" display="block" mb={1.5} sx={{ fontSize: '0.7rem' }}>
                {plan.priceNote}
              </Typography>
            )}
            {!plan.priceNote && <Box mb={1.5} />}

            <Button
              variant={plan.highlighted ? 'contained' : 'outlined'}
              fullWidth
              size="small"
              onClick={plan.action}
              sx={{
                mb: 2,
                py: 1,
                fontWeight: 600,
                fontSize: '0.8rem',
                ...(plan.highlighted && {
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                }),
              }}
            >
              {plan.buttonText}
            </Button>

            <Divider sx={{ mb: 1.5 }} />

            <Stack spacing={1} flex={1}>
              {plan.features.slice(0, 4).map((feature, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                  <CheckCircle sx={{ color: colors.success, fontSize: 14, mt: 0.3 }} />
                  <Typography variant="caption">{feature}</Typography>
                </Stack>
              ))}
              {plan.features.length > 4 && (
                <Typography variant="caption" color="text.secondary">+{plan.features.length - 4} ещё</Typography>
              )}
            </Stack>
          </Card>
        ))}
        <Box sx={{ minWidth: 16, flexShrink: 0 }} />
      </Box>

      {/* Desktop grid */}
      <Container maxWidth="lg" sx={{ display: { xs: 'none', md: 'block' } }}>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 3,
          alignItems: 'stretch',
        }}>
          {plans.map((plan, index) => (
            <Card key={index} sx={{
              p: 3,
              borderRadius: 3,
              position: 'relative',
              border: '2px solid',
              borderColor: plan.highlighted ? colors.primary : 'transparent',
              bgcolor: 'white',
              boxShadow: plan.highlighted ? `0 16px 48px ${alpha(colors.primary, 0.15)}` : `0 4px 20px ${alpha(colors.dark, 0.05)}`,
              display: 'flex',
              flexDirection: 'column',
            }}>
              {plan.badge && (
                <Chip 
                  label={plan.badge} 
                  size="small"
                  sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    bgcolor: colors.primary, 
                    color: colors.white, 
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }} 
                />
              )}
              
              {/* Название тарифа */}
              <Typography variant="overline" color="text.secondary" fontWeight={600}>{plan.name}</Typography>
              
              {/* Цена - фиксированная высота блока */}
              <Box sx={{ minHeight: 70 }}>
                <Typography variant="h4" fontWeight={900} color={plan.highlighted ? colors.primary : 'inherit'}>
                  {plan.price}
                </Typography>
                {plan.priceNote && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {plan.priceNote}
                  </Typography>
                )}
              </Box>
              
              {/* Описание - фиксированная высота */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                {plan.description}
              </Typography>

              {/* Кнопка */}
              <Button
                variant={plan.highlighted ? 'contained' : 'outlined'}
                fullWidth
                onClick={plan.action}
                sx={{
                  mb: 3,
                  py: 1.25,
                  fontWeight: 600,
                  ...(plan.highlighted && {
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    '&:hover': { background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.secondaryDark} 100%)` },
                  }),
                }}
              >
                {plan.buttonText}
              </Button>

              <Divider sx={{ mb: 2 }} />

              {/* Фичи */}
              <Stack spacing={1.5} flex={1}>
                {plan.features.map((feature, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                    <CheckCircle sx={{ color: colors.success, fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                    <Typography variant="body2">{feature}</Typography>
                  </Stack>
                ))}
                {plan.limitations.map((limitation, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                    <Remove sx={{ color: 'text.disabled', fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                    <Typography variant="body2" color="text.disabled">{limitation}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
          ))}
        </Box>

        <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
          Все цены указаны без НДС. При оплате за год — скидка 20%.
        </Typography>
      </Container>

      <ContactModal 
        open={contactOpen} 
        onClose={() => setContactOpen(false)} 
        selectedPlan={selectedPlan}
      />
    </Box>
  );
};

// =====================================================
// TESTIMONIALS SECTION - Horizontal Scroll Style
// =====================================================
const TestimonialsSection = () => {
  const testimonials = [
    { 
      quote: 'Agile Mind Pro заменил нам Jira, Trello и Slack. AI реально экономит время команды.', 
      author: 'Алексей Петров', 
      role: 'CTO, TechStartup',
    },
    { 
      quote: 'Рекап встречи → задачи всем участникам за секунды. Это магия.', 
      author: 'Мария Иванова', 
      role: 'Product Manager',
    },
    { 
      quote: 'LMS-модуль решил проблему онбординга. Новички сразу в работе.', 
      author: 'Дмитрий Козлов', 
      role: 'HR Director',
    },
    { 
      quote: 'Генерация референсов через AI — killer feature для дизайнеров.', 
      author: 'Анна Смирнова', 
      role: 'Art Director',
    },
    { 
      quote: 'Наброски превращаются в задачи. Whiteboard теперь не бесполезен.', 
      author: 'Игорь Сидоров', 
      role: 'Team Lead',
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: colors.lightGray, overflow: 'hidden' }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} mb={4} spacing={2}>
          <Box>
            <Typography variant="overline" color="primary" fontWeight={600}>Отзывы</Typography>
            <Typography variant="h3" fontWeight={900} sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
              Что говорят команды
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Typography variant="body2" color="text.secondary">Листайте →</Typography>
          </Stack>
        </Stack>
      </Container>

      {/* Scrollable container */}
      <Box sx={{ 
        display: 'flex',
        gap: 2,
        pl: { xs: 2, sm: 4, md: 6, lg: 'calc((100vw - 1200px) / 2 + 24px)' },
        pr: { xs: 2, sm: 4 },
        pb: 2,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-track': { bgcolor: alpha(colors.primary, 0.1), borderRadius: 3 },
        '&::-webkit-scrollbar-thumb': { bgcolor: colors.primary, borderRadius: 3 },
      }}>
        {testimonials.map((t, i) => (
          <Paper 
            key={i}
            elevation={0}
            sx={{ 
              minWidth: { xs: 260, sm: 300 },
              maxWidth: 300,
              p: 3,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'divider',
              scrollSnapAlign: 'start',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: colors.primary,
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${alpha(colors.primary, 0.1)}`,
              },
            }}
          >
            {/* Quote icon */}
            <FormatQuote sx={{ fontSize: 28, color: alpha(colors.primary, 0.2), mb: 1, transform: 'rotate(180deg)' }} />
            
            <Typography variant="body2" sx={{ flex: 1, mb: 2, lineHeight: 1.7, color: colors.dark }}>
              {t.quote}
            </Typography>
            
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: colors.primary,
                fontSize: 14,
                fontWeight: 700,
              }}>
                {t.author.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={700}>{t.author}</Typography>
                <Typography variant="caption" color="text.secondary">{t.role}</Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
        
        {/* End spacer */}
        <Box sx={{ minWidth: 16, flexShrink: 0 }} />
      </Box>
    </Box>
  );
};

// =====================================================
// CTA SECTION
// =====================================================
const CTASection = ({ navigate }) => (
  <Box sx={{ py: { xs: 10, md: 16 }, bgcolor: colors.lightGray }}>
    <Container maxWidth="md">
      <Paper sx={{
        p: { xs: 4, md: 8 },
        borderRadius: 4,
        background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.darkGray} 100%)`,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, opacity: 0.1, top: -100, right: -100 }} />
        <Box sx={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.accent}, ${colors.success})`, opacity: 0.1, bottom: -50, left: -50 }} />

        <Box sx={{ position: 'relative' }}>
          <Rocket sx={{ fontSize: 64, color: colors.primary, mb: 3 }} />
          
          <Typography variant="h3" fontWeight={900} color={colors.white} gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
            Готовы начать?
          </Typography>
          
          <Typography variant="h6" sx={{ color: alpha(colors.white, 0.7), mb: 5, maxWidth: 500, mx: 'auto' }}>
            Присоединяйтесь к тысячам команд, которые уже работают эффективнее
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/register')}
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                boxShadow: `0 8px 32px ${alpha(colors.primary, 0.4)}`,
              }}
            >
              Создать аккаунт
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                borderColor: alpha(colors.white, 0.3),
                color: colors.white,
              }}
            >
              Войти
            </Button>
          </Stack>

          <Typography variant="body2" sx={{ color: alpha(colors.white, 0.5), mt: 3 }}>
            Бесплатно навсегда • Без кредитной карты • Настройка за 2 минуты
          </Typography>
        </Box>
      </Paper>
    </Container>
  </Box>
);

// =====================================================
// FOOTER - Minimal & Centered
// =====================================================
const Footer = ({ navigate }) => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ bgcolor: colors.dark, color: colors.white, py: 6 }}>
      <Container maxWidth="lg">
        {/* Logo and tagline */}
        <Stack alignItems="center" textAlign="center" mb={5}>
          <Typography 
            variant="h5" 
            fontWeight={900} 
            sx={{ 
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Agile Mind Pro
          </Typography>
          <Typography variant="body2" color={alpha(colors.white, 0.5)} sx={{ maxWidth: 400 }}>
            AI-powered платформа для управления проектами и командной работы
          </Typography>
        </Stack>

        {/* Navigation links - centered */}
        <Stack 
          direction="row" 
          spacing={{ xs: 2, sm: 4 }} 
          justifyContent="center" 
          flexWrap="wrap"
          mb={4}
          sx={{ gap: { xs: 2, sm: 0 } }}
        >
          {[
            { label: 'Возможности', action: () => scrollToSection('features') },
            { label: 'Тарифы', action: () => scrollToSection('pricing') },
            { label: 'Отзывы', action: () => scrollToSection('testimonials') },
            { label: 'Войти', action: () => navigate('/login') },
            { label: 'Регистрация', action: () => navigate('/register') },
          ].map((link) => (
            <Typography 
              key={link.label}
              variant="body2" 
              onClick={link.action}
              sx={{ 
                color: alpha(colors.white, 0.7), 
                cursor: 'pointer', 
                transition: 'color 0.2s',
                '&:hover': { color: colors.primary },
              }}
            >
              {link.label}
            </Typography>
          ))}
        </Stack>

        {/* Contact info */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={3} 
          justifyContent="center" 
          alignItems="center"
          mb={4}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Email sx={{ fontSize: 18, color: alpha(colors.white, 0.5) }} />
            <Typography variant="body2" color={alpha(colors.white, 0.7)}>
              hello@agilemindpro.com
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Phone sx={{ fontSize: 18, color: alpha(colors.white, 0.5) }} />
            <Typography variant="body2" color={alpha(colors.white, 0.7)}>
              +7 (800) 123-45-67
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ borderColor: alpha(colors.white, 0.1), mb: 4 }} />

        {/* Bottom row */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems="center" 
          spacing={2}
        >
          <Typography variant="caption" color={alpha(colors.white, 0.4)}>
            © 2024 Agile Mind Pro. Все права защищены.
          </Typography>
          <Stack direction="row" spacing={3}>
            {['Конфиденциальность', 'Условия'].map((item) => (
              <Typography 
                key={item} 
                variant="caption" 
                sx={{ 
                  color: alpha(colors.white, 0.4), 
                  cursor: 'pointer', 
                  '&:hover': { color: alpha(colors.white, 0.7) },
                }}
              >
                {item}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

// =====================================================
// MAIN LANDING PAGE
// =====================================================
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Navbar navigate={navigate} />
      <HeroSection navigate={navigate} />
      <Box id="features"><FeaturesSection /></Box>
      <AISection />
      <Box id="pricing"><PricingSection navigate={navigate} /></Box>
      <Box id="testimonials"><TestimonialsSection /></Box>
      <CTASection navigate={navigate} />
      <Footer navigate={navigate} />
    </Box>
  );
};

export default LandingPage;
