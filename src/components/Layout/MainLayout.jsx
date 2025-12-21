// src/components/Layout/MainLayout.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Fab,
  Breadcrumbs,
  Link,
  Skeleton,
  useTheme,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  BugReport,
  NavigateNext,
  Home,
  Dashboard,
  ViewKanban,
  Assignment,
  CalendarToday,
  Group,
  Settings,
  Person,
  Lightbulb,
  Notifications,
  People,
  School,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { UserContext } from '../../App';
import boardService from '../../services/board.service';
import NotificationCenter from '../Notifications/NotificationCenter';
import ThemeToggle from '../Common/ThemeToggle';
import DebugConsole from '../DebugConsole';

const DRAWER_WIDTH = 260;

// Bauhaus цвета
const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

// Конфигурация роутов для хлебных крошек
const ROUTE_CONFIG = {
  '/': { label: 'Главная', icon: Dashboard, color: bauhaus.blue },
  '/boards': { label: 'Доски', icon: ViewKanban, color: bauhaus.blue },
  '/board': { label: 'Доска', icon: ViewKanban, color: bauhaus.blue, dynamic: true },
  '/calendar': { label: 'Календарь', icon: CalendarToday, color: bauhaus.teal },
  '/my-tasks': { label: 'Мои задачи', icon: Assignment, color: bauhaus.purple },
  '/team': { label: 'Команды', icon: Group, color: bauhaus.red, dynamic: true },
  '/sketches': { label: 'Наброски', icon: Lightbulb, color: bauhaus.yellow },
  '/learning': { label: 'Обучение', icon: School, color: bauhaus.teal },
  '/admin': { label: 'Администрирование', icon: Settings, color: bauhaus.purple },
  '/course': { label: 'Курс', icon: School, color: bauhaus.teal, dynamic: true },
  '/lesson': { label: 'Урок', icon: School, color: bauhaus.teal, dynamic: true },
  '/exam': { label: 'Экзамен', icon: School, color: bauhaus.teal, dynamic: true },
  '/categories': { label: 'Категории', icon: School, color: bauhaus.teal },
  '/notifications': { label: 'Уведомления', icon: Notifications, color: bauhaus.blue },
  '/users': { label: 'Пользователи', icon: People, color: bauhaus.purple },
  '/settings': { label: 'Настройки', icon: Settings, color: bauhaus.teal },
  '/profile': { label: 'Профиль', icon: Person, color: bauhaus.blue },
};

function MainLayout({ children, title, showAppBar = true }) {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const params = useParams();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [boards, setBoards] = useState([]);
  const [debugOpen, setDebugOpen] = useState(false);
  
  const [dynamicNames, setDynamicNames] = useState({});
  const [loadingNames, setLoadingNames] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = boardService.subscribeToUserBoards(user.uid, (userBoards) => {
      setBoards(userBoards);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const loadDynamicNames = async () => {
      const path = location.pathname;
      const segments = path.split('/').filter(Boolean);

      if (segments[0] === 'board' && segments[1]) {
        const boardId = segments[1];
        const existingBoard = boards.find(b => b.id === boardId);
        if (existingBoard) {
          setDynamicNames(prev => ({ ...prev, [`board_${boardId}`]: existingBoard.title }));
        } else {
          setLoadingNames(true);
          try {
            const result = await boardService.getBoard(boardId);
            if (result.success) {
              setDynamicNames(prev => ({ ...prev, [`board_${boardId}`]: result.board.title }));
            }
          } catch (e) {
            console.error('Error loading board name:', e);
          }
          setLoadingNames(false);
        }
      }

      if (segments[0] === 'team' && segments[1]) {
        const teamId = segments[1];
        setLoadingNames(true);
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('../../config/firebase');
          const teamDoc = await getDoc(doc(db, 'teams', teamId));
          if (teamDoc.exists()) {
            setDynamicNames(prev => ({ ...prev, [`team_${teamId}`]: teamDoc.data().name }));
          } else {
            setDynamicNames(prev => ({ ...prev, [`team_${teamId}`]: 'Команда' }));
          }
        } catch (e) {
          console.error('Error loading team name:', e);
          setDynamicNames(prev => ({ ...prev, [`team_${teamId}`]: 'Команда' }));
        }
        setLoadingNames(false);
      }

      // Load course names for learning routes
      // Handles: /learning/course/:courseId and /learning/admin/course/:courseId
      const courseIndex = segments.indexOf('course');
      if (courseIndex !== -1 && segments[courseIndex + 1]) {
        const courseId = segments[courseIndex + 1];
        setLoadingNames(true);
        try {
          const { default: learningService } = await import('../../services/learning.service');
          const result = await learningService.getCourse(courseId);
          if (result.success) {
            setDynamicNames(prev => ({ ...prev, [`course_${courseId}`]: result.course.title }));
          } else {
            setDynamicNames(prev => ({ ...prev, [`course_${courseId}`]: 'Курс' }));
          }
        } catch (e) {
          console.error('Error loading course name:', e);
          setDynamicNames(prev => ({ ...prev, [`course_${courseId}`]: 'Курс' }));
        }
        setLoadingNames(false);
      }

      // Load lesson names for learning routes
      // Handles: /learning/lesson/:lessonId
      const lessonIndex = segments.indexOf('lesson');
      if (lessonIndex !== -1 && segments[lessonIndex + 1]) {
        const lessonId = segments[lessonIndex + 1];
        setLoadingNames(true);
        try {
          const { default: learningService } = await import('../../services/learning.service');
          const result = await learningService.getLesson(lessonId);
          if (result.success) {
            setDynamicNames(prev => ({ ...prev, [`lesson_${lessonId}`]: result.lesson.title }));
          } else {
            setDynamicNames(prev => ({ ...prev, [`lesson_${lessonId}`]: 'Урок' }));
          }
        } catch (e) {
          console.error('Error loading lesson name:', e);
          setDynamicNames(prev => ({ ...prev, [`lesson_${lessonId}`]: 'Урок' }));
        }
        setLoadingNames(false);
      }

      // Load exam names for learning routes
      // Handles: /learning/exam/:examId
      const examIndex = segments.indexOf('exam');
      if (examIndex !== -1 && segments[examIndex + 1]) {
        const examId = segments[examIndex + 1];
        setLoadingNames(true);
        try {
          const { default: learningService } = await import('../../services/learning.service');
          const result = await learningService.getExam(examId);
          if (result.success) {
            setDynamicNames(prev => ({ ...prev, [`exam_${examId}`]: result.exam.title }));
          } else {
            setDynamicNames(prev => ({ ...prev, [`exam_${examId}`]: 'Экзамен' }));
          }
        } catch (e) {
          console.error('Error loading exam name:', e);
          setDynamicNames(prev => ({ ...prev, [`exam_${examId}`]: 'Экзамен' }));
        }
        setLoadingNames(false);
      }
    };

    loadDynamicNames();
  }, [location.pathname, boards]);

  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    
    if (path === '/') return [];
    
    const segments = path.split('/').filter(Boolean);
    const crumbs = [];
    
    crumbs.push({
      label: 'Главная',
      path: '/',
      icon: Home,
      color: bauhaus.blue,
    });
    
    let currentPath = '';
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      
      const routeKey = `/${segment}`;
      const config = ROUTE_CONFIG[routeKey];
      
      if (config) {
        if (config.dynamic && segments[i + 1]) {
          if (segment === 'board') {
            crumbs.push({
              label: 'Доски',
              path: '/boards',
              icon: ViewKanban,
              color: bauhaus.blue,
            });
          }

          const dynamicId = segments[i + 1];
          const dynamicKey = `${segment}_${dynamicId}`;
          const dynamicLabel = dynamicNames[dynamicKey] || 'Загрузка...';

          // Update currentPath to include the dynamic ID
          currentPath += `/${dynamicId}`;

          crumbs.push({
            label: dynamicLabel,
            path: currentPath,
            icon: config.icon,
            color: config.color,
            isLast: i + 1 === segments.length - 1,
          });

          i++;
        } else {
          crumbs.push({
            label: config.label,
            path: currentPath,
            icon: config.icon,
            color: config.color,
            isLast: i === segments.length - 1,
          });
        }
      }
    }
    
    if (crumbs.length > 0) {
      crumbs[crumbs.length - 1].isLast = true;
    }
    
    return crumbs;
  }, [location.pathname, dynamicNames]);

  const pageTitle = useMemo(() => {
    if (title) return title;
    const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
    return lastCrumb?.label || 'Agile Mind Pro';
  }, [title, breadcrumbs]);

  useEffect(() => {
    document.title = pageTitle !== 'Главная' 
      ? `${pageTitle} | Agile Mind Pro` 
      : 'Agile Mind Pro';
  }, [pageTitle]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(!sidebarOpen)}
        boards={boards}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 64}px)` },
          transition: 'width 0.2s',
          minHeight: '100vh',
        }}
      >
        {showAppBar && (
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
              <IconButton
                edge="start"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              
              {/* Хлебные крошки */}
              <Box sx={{ flexGrow: 1 }}>
                {breadcrumbs.length > 0 ? (
                  <Breadcrumbs 
                    separator={<NavigateNext fontSize="small" sx={{ color: 'text.disabled' }} />}
                    sx={{
                      '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
                      '& .MuiBreadcrumbs-li': { whiteSpace: 'nowrap' },
                    }}
                  >
                    {breadcrumbs.map((crumb, index) => {
                      const IconComponent = crumb.icon;
                      
                      if (crumb.isLast) {
                        return (
                          <Box 
                            key={index}
                            sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            {IconComponent && (
                              <Box 
                                sx={{ 
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  bgcolor: `${crumb.color}15`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1,
                                }}
                              >
                                <IconComponent sx={{ fontSize: 16, color: crumb.color }} />
                              </Box>
                            )}
                            {loadingNames && crumb.label === 'Загрузка...' ? (
                              <Skeleton variant="text" width={100} />
                            ) : (
                              <Typography 
                                variant="subtitle1" 
                                fontWeight={600}
                                sx={{
                                  maxWidth: 300,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {crumb.label}
                              </Typography>
                            )}
                          </Box>
                        );
                      }
                      
                      return (
                        <Link
                          key={index}
                          component={RouterLink}
                          to={crumb.path}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.secondary',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            '&:hover': {
                              color: crumb.color,
                            },
                          }}
                        >
                          {IconComponent && (
                            <IconComponent sx={{ fontSize: 16, mr: 0.5 }} />
                          )}
                          {crumb.label}
                        </Link>
                      );
                    })}
                  </Breadcrumbs>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: `${bauhaus.blue}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1.5,
                      }}
                    >
                      <Dashboard sx={{ fontSize: 18, color: bauhaus.blue }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {pageTitle}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThemeToggle size="small" />
                <NotificationCenter />
              </Box>
            </Toolbar>
          </AppBar>
        )}

        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>

      {/* Debug Console FAB */}
      <Fab
        size="small"
        sx={{
          position: 'fixed',
          bottom: 88,
          right: 24,
          zIndex: 2000,
          boxShadow: 3,
          bgcolor: bauhaus.red,
          color: 'white',
          '&:hover': { bgcolor: '#C62828' },
        }}
        onClick={() => setDebugOpen(true)}
        title="Открыть консоль отладки"
      >
        <BugReport fontSize="small" />
      </Fab>

      <DebugConsole open={debugOpen} onClose={() => setDebugOpen(false)} />
    </Box>
  );
}

export default MainLayout;
