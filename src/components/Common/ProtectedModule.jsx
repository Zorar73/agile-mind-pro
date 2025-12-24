// src/components/Common/ProtectedModule.jsx
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Card, CardContent, Button } from '@mui/material';
import { Lock, Home } from '@mui/icons-material';
import { usePermissions } from '../../hooks/usePermissions';
import { ACCESS_LEVELS } from '../../constants';
import { useToast } from '../../contexts/ToastContext';

/**
 * Компонент для защиты модулей на основе прав доступа
 *
 * @param {Object} props
 * @param {string} props.module - ID модуля из MODULES
 * @param {string} props.requiredLevel - Требуемый уровень доступа (по умолчанию VIEW)
 * @param {boolean} props.showForbidden - Показывать страницу "Нет доступа" вместо редиректа
 * @param {React.ReactNode} props.children - Дочерние элементы
 * @param {string} props.redirectTo - Куда редиректить при отсутствии доступа
 */
function ProtectedModule({
  module,
  requiredLevel = ACCESS_LEVELS.VIEW,
  showForbidden = false,
  children,
  redirectTo = '/',
}) {
  const { getModuleAccess, loading } = usePermissions();
  const navigate = useNavigate();
  const toast = useToast();

  const moduleAccess = getModuleAccess(module);
  const hasRequiredAccess = React.useMemo(() => {
    if (moduleAccess === ACCESS_LEVELS.NONE) {
      return false;
    }

    const levels = [ACCESS_LEVELS.NONE, ACCESS_LEVELS.VIEW, ACCESS_LEVELS.EDIT, ACCESS_LEVELS.ADMIN];
    const currentIndex = levels.indexOf(moduleAccess);
    const requiredIndex = levels.indexOf(requiredLevel);

    return currentIndex >= requiredIndex;
  }, [moduleAccess, requiredLevel]);

  // Показываем уведомление при отсутствии доступа
  useEffect(() => {
    if (!loading && !hasRequiredAccess) {
      toast.error('У вас нет доступа к этому разделу', {
        toastId: `no-access-${module}`,
        autoClose: 3000,
      });
    }
  }, [loading, hasRequiredAccess, module]);

  // Показываем загрузку
  if (loading) {
    return (
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
    );
  }

  // Нет доступа
  if (!hasRequiredAccess) {
    // Показать страницу "Нет доступа"
    if (showForbidden) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            p: 3,
          }}
        >
          <Card sx={{ maxWidth: 500, textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Lock sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />

              <Typography variant="h5" fontWeight={700} gutterBottom>
                Доступ запрещён
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                У вас нет прав для просмотра этого раздела.
                Обратитесь к администратору для получения доступа.
              </Typography>

              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={() => navigate('/')}
                sx={{ mt: 2 }}
              >
                На главную
              </Button>
            </CardContent>
          </Card>
        </Box>
      );
    }

    // Редирект
    return <Navigate to={redirectTo} replace />;
  }

  // Есть доступ - рендерим детей
  return <>{children}</>;
}

export default ProtectedModule;
