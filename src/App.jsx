import React, { useState, useEffect, createContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { DrawerStackProvider } from './contexts/DrawerStackContext';
import NotificationProvider from './contexts/NotificationProvider';
import EntityDrawerManager from './components/Common/EntityDrawerManager';
import authService from './services/auth.service';

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

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/cloudinary-test" element={<ProtectedRoute><CloudinaryTestPage /></ProtectedRoute>} />
                  </Routes>
                </Suspense>
                <EntityDrawerManager />
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
