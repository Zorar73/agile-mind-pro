// src/pages/NewsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Fab,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { UserContext } from '../App.jsx';
import MainLayout from '../components/Layout/MainLayout';
import newsService from '../services/news.service';
import userService from '../services/user.service';
import NewsFeed from '../components/News/NewsFeed';
import NewsCreateDialog from '../components/News/NewsCreateDialog';
import { useToast } from '../contexts/ToastContext';

function NewsPage() {
  const { user } = useContext(UserContext);
  const toast = useToast();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [canCreateNews, setCanCreateNews] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [users, setUsers] = useState({});

  // Загружаем профиль пользователя для проверки прав
  useEffect(() => {
    if (!user) return;

    const loadUserProfile = async () => {
      const result = await userService.getUserById(user.uid);
      if (result.success) {
        setUserProfile(result.user);
        // Проверяем права на создание новостей
        const canCreate = result.user.role === 'admin' || result.user.canCreateNews === true;
        setCanCreateNews(canCreate);
      }
    };

    loadUserProfile();
  }, [user]);

  // Подписываемся на новости
  useEffect(() => {
    if (!user) return;

    const unsubscribe = newsService.subscribeToNews((updatedNews) => {
      setNews(updatedNews);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Загружаем всех пользователей один раз (оптимизация N+1)
  useEffect(() => {
    if (!user) return;

    const loadUsers = async () => {
      const result = await userService.getAllUsers();
      if (result.success) {
        // Преобразуем массив в объект для быстрого доступа по uid
        const usersMap = {};
        result.users.forEach(u => {
          usersMap[u.uid] = u;
        });
        setUsers(usersMap);
      }
    };

    loadUsers();
  }, [user]);

  const handleCreateNews = async (newsData) => {
    if (!canCreateNews) {
      toast.error('У вас нет прав для создания новостей');
      return;
    }

    const result = await newsService.createNews(newsData, user.uid);

    if (result.success) {
      toast.success('Новость успешно создана');
      setCreateDialogOpen(false);
    } else {
      toast.error('Ошибка создания новости: ' + result.error);
    }
  };

  const handleLike = async (newsId) => {
    const result = await newsService.toggleLike(newsId, user.uid);
    if (!result.success) {
      toast.error('Ошибка при лайке: ' + result.error);
    }
  };

  const handleDeleteNews = async (newsId) => {
    const result = await newsService.deleteNews(newsId);
    if (result.success) {
      toast.success('Новость удалена');
    } else {
      toast.error('Ошибка удаления новости: ' + result.error);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Новости">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Новости">
      <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 3,
          borderBottom: '3px solid',
          borderImage: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%) 1',
        }}
      >
        <Box>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 0.5,
            }}
          >
            Новости
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Будьте в курсе последних событий команды
          </Typography>
        </Box>
        {canCreateNews && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              borderRadius: 3,
              px: 3,
              py: 1.2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Создать новость
          </Button>
        )}
      </Box>

      {/* Лента новостей */}
      <NewsFeed
        news={news}
        currentUserId={user?.uid}
        userProfile={userProfile}
        users={users}
        onLike={handleLike}
        onDelete={handleDeleteNews}
      />

      {/* Пустое состояние */}
      {news.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            px: 4,
            borderRadius: 4,
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            📰 Пока нет новостей
          </Typography>
          {canCreateNews && (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                Создайте первую новость, чтобы поделиться важной информацией с командой
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Создать первую новость
              </Button>
            </>
          )}
        </Box>
      )}

      {/* FAB для мобильных */}
      {canCreateNews && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' },
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Диалог создания новости */}
      <NewsCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateNews}
      />
      </Container>
    </MainLayout>
  );
}

export default NewsPage;
