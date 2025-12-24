import React, { useState, useEffect, createContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { DrawerStackProvider } from './contexts/DrawerStackContext';
import NotificationProvider from './contexts/NotificationProvider';
import EntityDrawerManager from './components/Common/EntityDrawerManager';
import ImportantNewsModal from './components/News/ImportantNewsModal';
import authService from './services/auth.service';
import learningService from './services/learning.service';
import newsService from './services/news.service';
import { useUserStore } from './stores';

// Lazy-loaded Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BoardsPage = lazy(() => import('./pages/BoardsPage'));
const BoardPage = lazy(() => import('./pages/BoardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const MyTasksPage = lazy(() => import('./pages/MyTasksPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const SketchesPage = lazy(() => import('./pages/SketchesPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BacklogPage = lazy(() => import('./pages/BacklogPage'));
const PendingApprovalPage = lazy(() => import('./pages/PendingApprovalPage'));
const CloudinaryTestPage = lazy(() => import('./pages/CloudinaryTestPage'));
const SprintsPage = lazy(() => import('./pages/SprintsPage'));
const LearningPortalPage = lazy(() => import('./pages/LearningPortalPage'));
const LearningAdminPage = lazy(() => import('./pages/LearningAdminPage'));
const CoursePage = lazy(() => import('./pages/CoursePage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const LessonManagementPage = lazy(() => import('./pages/LessonManagementPage'));
const CourseCategoriesPage = lazy(() => import('./pages/CourseCategoriesPage'));
const MyLearningStatsPage = lazy(() => import('./pages/MyLearningStatsPage'));
const ExamManagementPage = lazy(() => import('./pages/ExamManagementPage'));
const ExamTakingPage = lazy(() => import('./pages/ExamTakingPage'));
const ExamResultPage = lazy(() => import('./pages/ExamResultPage'));
const ExamResultsReviewPage = lazy(() => import('./pages/ExamResultsReviewPage'));
const CourseStatsPage = lazy(() => import('./pages/CourseStatsPage'));
const CourseAccessPage = lazy(() => import('./pages/CourseAccessPage'));
const CourseManagementPage = lazy(() => import('./pages/CourseManagementPage'));
const RolesPage = lazy(() => import('./pages/admin/RolesPage'));
const RolesMigrationPage = lazy(() => import('./pages/admin/RolesMigrationPage'));
const AssignmentReviewsPage = lazy(() => import('./pages/AssignmentReviewsPage'));
const LearningAnalyticsPage = lazy(() => import('./pages/LearningAnalyticsPage'));
const FeedbackAdminPage = lazy(() => import('./pages/admin/FeedbackAdminPage'));
const MyFeedbackPage = lazy(() => import('./pages/MyFeedbackPage'));

const UserContext = createContext();

function HomeRoute() {
  const { user, loading } = React.useContext(UserContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Если пользователь залогинен
  if (user) {
    // Если pending - на pending страницу
    if (user.role === 'pending') {
      return <Navigate to="/pending" replace />;
    }
    // Иначе на dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Если не залогинен - показываем landing
  return <LandingPage />;
}

function ProtectedRoute({ children }) {
  const { user, loading } = React.useContext(UserContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImportantNews, setShowImportantNews] = useState(false);
  
  // Zustand store — синхронизация
  const setUserStore = useUserStore((state) => state.setUser);
  const clearUserStore = useUserStore((state) => state.clearUser);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Синхронизация с Zustand store
      if (currentUser) {
        setUserStore(currentUser);
      } else {
        clearUserStore();
      }
    });

    return () => unsubscribe();
  }, [setUserStore, clearUserStore]);

  // Проверка важных непрочитанных новостей при входе пользователя
  useEffect(() => {
    if (user && user.uid && user.role !== 'pending') {
      checkImportantNews();
    }
  }, [user?.uid, user?.role]);

  const checkImportantNews = async () => {
    try {
      const result = await newsService.getUnreadImportantNews(user.uid);
      if (result.success && result.news.length > 0) {
        setShowImportantNews(true);
      }
    } catch (error) {
      console.error('Ошибка при проверке важных новостей:', error);
    }
  };

  // Проверка дедлайнов курсов при входе пользователя
  useEffect(() => {
    if (user && user.uid && user.role !== 'pending') {
      // Проверяем, не выполняли ли мы уже проверку в последние 5 минут
      const lastCheckKey = `deadline_check_${user.uid}`;
      const lastCheck = sessionStorage.getItem(lastCheckKey);
      const now = Date.now();

      if (lastCheck && (now - parseInt(lastCheck)) < 5 * 60 * 1000) {
        console.log('⏭️ Проверка дедлайнов пропущена (недавно выполнена)');
        return;
      }

      console.log('🔔 Проверка дедлайнов курсов для пользователя:', user.uid);
      sessionStorage.setItem(lastCheckKey, now.toString());

      // Проверяем дедлайны асинхронно, не блокируя UI
      learningService.checkAndNotifyDeadlines(user.uid)
        .then(result => {
          if (result.success) {
            console.log('✅ Проверка дедлайнов завершена. Отправлено уведомлений:', result.notificationsSent);
          } else {
            console.error('❌ Ошибка при проверке дедлайнов:', result.error);
          }
        })
        .catch(error => {
          console.error('❌ Критическая ошибка при проверке дедлайнов:', error);
        });
    }
  }, [user?.uid, user?.role]);

  return (
    <ThemeProvider>
      <ToastProvider>
        <DrawerStackProvider>
          <UserContext.Provider value={{ user, setUser, loading }}>
            <Router>
              <NotificationProvider>
                <Suspense fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                  </Box>
                }>
                  <Routes>
              {/* Публичные роуты */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/pending" element={<PendingApprovalPage />} />

              {/* Главная страница - Landing для незалогиненных, Dashboard для залогиненных */}
              <Route path="/" element={<HomeRoute />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

              {/* Страница досок - отдельная страница со списком всех досок */}
              <Route path="/boards" element={<ProtectedRoute><BoardsPage /></ProtectedRoute>} />

              {/* Конкретная доска */}
              <Route path="/board/:boardId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />

              {/* Бэклог доски */}
              <Route path="/board/:boardId/backlog" element={<ProtectedRoute><BacklogPage /></ProtectedRoute>} />

              {/* Спринты доски */}
              <Route path="/board/:boardId/sprints" element={<ProtectedRoute><SprintsPage /></ProtectedRoute>} />

              {/* Остальные роуты */}
              <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/my-tasks" element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
              <Route path="/team/:teamId" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
              <Route path="/team/:teamId/chat" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
              <Route path="/sketches" element={<ProtectedRoute><SketchesPage /></ProtectedRoute>} />
              <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
              <Route path="/admin/migrate" element={<ProtectedRoute><RolesMigrationPage /></ProtectedRoute>} />
              <Route path="/admin/roles" element={<ProtectedRoute><RolesPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/learning" element={<ProtectedRoute><LearningPortalPage /></ProtectedRoute>} />
              <Route path="/learning/stats" element={<ProtectedRoute><MyLearningStatsPage /></ProtectedRoute>} />
              <Route path="/learning/admin" element={<ProtectedRoute><LearningAdminPage /></ProtectedRoute>} />
              <Route path="/learning/admin/categories" element={<ProtectedRoute><CourseCategoriesPage /></ProtectedRoute>} />
              <Route path="/learning/admin/course/:courseId" element={<ProtectedRoute><CourseManagementPage /></ProtectedRoute>} />
              <Route path="/learning/admin/course/:courseId/exams" element={<ProtectedRoute><ExamManagementPage /></ProtectedRoute>} />
              <Route path="/learning/admin/course/:courseId/stats" element={<ProtectedRoute><CourseStatsPage /></ProtectedRoute>} />
              <Route path="/learning/admin/course/:courseId/access" element={<ProtectedRoute><CourseAccessPage /></ProtectedRoute>} />
              <Route path="/learning/course/:courseId" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
              <Route path="/learning/lesson/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
              <Route path="/learning/exam/:examId" element={<ProtectedRoute><ExamTakingPage /></ProtectedRoute>} />
              <Route path="/learning/exam/:examId/result" element={<ProtectedRoute><ExamResultPage /></ProtectedRoute>} />
              <Route path="/learning/admin/exam/:examId/results" element={<ProtectedRoute><ExamResultsReviewPage /></ProtectedRoute>} />
              <Route path="/learning/admin/reviews" element={<ProtectedRoute><AssignmentReviewsPage /></ProtectedRoute>} />
              <Route path="/learning/admin/analytics" element={<ProtectedRoute><LearningAnalyticsPage /></ProtectedRoute>} />
              <Route path="/admin/feedback" element={<ProtectedRoute><FeedbackAdminPage /></ProtectedRoute>} />
              <Route path="/my-feedback" element={<ProtectedRoute><MyFeedbackPage /></ProtectedRoute>} />
              <Route path="/cloudinary-test" element={<ProtectedRoute><CloudinaryTestPage /></ProtectedRoute>} />
                  </Routes>
                </Suspense>
                <EntityDrawerManager />

                {/* Important News Modal */}
                {user && (
                  <ImportantNewsModal
                    userId={user.uid}
                    open={showImportantNews}
                    onClose={() => setShowImportantNews(false)}
                  />
                )}
              </NotificationProvider>
            </Router>
        </UserContext.Provider>
        </DrawerStackProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export { UserContext };
export default App;
