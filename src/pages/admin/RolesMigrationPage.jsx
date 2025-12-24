// src/pages/admin/RolesMigrationPage.jsx
import React, { useState, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  Check,
  Error,
  Info,
  Warning,
} from '@mui/icons-material';
import { useToast } from '../../contexts/ToastContext';
import { UserContext } from '../../App';
import roleService from '../../services/role.service';

/**
 * Страница миграции на новую систему ролей
 * Доступна только для старых админов (role === 'admin')
 */
function RolesMigrationPage() {
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    rolesInitialized: false,
    usersMigrated: 0,
    errors: [],
  });

  // Проверка, что пользователь - старый админ
  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Доступ запрещён. Эта страница доступна только администраторам.
        </Alert>
      </Container>
    );
  }

  // Шаг 1: Инициализация ролей
  const handleInitializeRoles = async () => {
    setLoading(true);
    try {
      const result = await roleService.initializeDefaultRoles(user.uid || user.id);

      if (result.success) {
        toast.success('Системные роли созданы');
        setResults(prev => ({ ...prev, rolesInitialized: true }));
        setActiveStep(1);
      } else {
        toast.error(result.error || 'Ошибка создания ролей');
        setResults(prev => ({
          ...prev,
          errors: [...prev.errors, result.error],
        }));
      }
    } catch (error) {
      toast.error('Ошибка инициализации: ' + error.message);
      setResults(prev => ({
        ...prev,
        errors: [...prev.errors, error.message],
      }));
    } finally {
      setLoading(false);
    }
  };

  // Шаг 2: Миграция пользователей
  const handleMigrateUsers = async () => {
    setLoading(true);
    try {
      const result = await roleService.migrateUsersToRoles();

      if (result.success) {
        toast.success(`Мигрировано пользователей: ${result.migratedCount}`);
        setResults(prev => ({ ...prev, usersMigrated: result.migratedCount }));
        setActiveStep(2);
      } else {
        toast.error(result.error || 'Ошибка миграции');
        setResults(prev => ({
          ...prev,
          errors: [...prev.errors, result.error],
        }));
      }
    } catch (error) {
      toast.error('Ошибка миграции: ' + error.message);
      setResults(prev => ({
        ...prev,
        errors: [...prev.errors, error.message],
      }));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      label: 'Инициализация системных ролей',
      description: 'Создание 5 системных ролей: Администратор, Офис, Менеджер магазина, Продавец, Стажёр',
      action: handleInitializeRoles,
      completed: results.rolesInitialized,
    },
    {
      label: 'Миграция существующих пользователей',
      description: 'Назначение новых ролей всем существующим пользователям на основе их текущего поля role',
      action: handleMigrateUsers,
      completed: results.usersMigrated > 0,
    },
    {
      label: 'Готово',
      description: 'Миграция завершена. Теперь вы можете управлять ролями через /admin/roles',
      action: null,
      completed: false,
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Миграция на модульную систему ролей
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Переход от простых ролей (admin, member, pending) к гибкой модульной системе
            </Typography>
          </Box>

          {/* Important Info */}
          <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Важно!
            </Typography>
            <List dense>
              <ListItem disablePadding>
                <ListItemText primary="• Эта операция выполняется один раз при первом запуске новой системы" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="• Старое поле role сохранится для совместимости" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="• Все текущие права доступа будут сохранены" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="• После миграции используйте /admin/roles для управления" />
              </ListItem>
            </List>
          </Alert>

          {/* Mapping Info */}
          <Alert severity="info" sx={{ mb: 3 }} icon={<Info />}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Соответствие ролей:
            </Typography>
            <List dense>
              <ListItem disablePadding>
                <ListItemText primary="admin / owner → Администратор (полный доступ)" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="member → Офис (офисные сотрудники)" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="pending → Стажёр (ограниченный доступ)" />
              </ListItem>
            </List>
          </Alert>

          <Divider sx={{ my: 3 }} />

          {/* Stepper */}
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label} completed={step.completed}>
                <StepLabel
                  optional={
                    step.completed && (
                      <Typography variant="caption" color="success.main">
                        Выполнено
                      </Typography>
                    )
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  {step.action && (
                    <Button
                      variant="contained"
                      onClick={step.action}
                      disabled={loading || step.completed}
                      startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                    >
                      {loading ? 'Выполняется...' : 'Выполнить'}
                    </Button>
                  )}
                  {index === steps.length - 1 && (
                    <Button
                      variant="contained"
                      color="success"
                      href="/admin/roles"
                    >
                      Перейти к управлению ролями
                    </Button>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {/* Results */}
          {results.usersMigrated > 0 && (
            <Alert severity="success" sx={{ mt: 3 }} icon={<Check />}>
              <Typography variant="subtitle2" fontWeight={600}>
                Миграция успешно завершена!
              </Typography>
              <Typography variant="body2">
                Мигрировано пользователей: {results.usersMigrated}
              </Typography>
            </Alert>
          )}

          {/* Errors */}
          {results.errors.length > 0 && (
            <Alert severity="error" sx={{ mt: 3 }} icon={<Error />}>
              <Typography variant="subtitle2" fontWeight={600}>
                Ошибки:
              </Typography>
              {results.errors.map((error, index) => (
                <Typography key={index} variant="body2">
                  • {error}
                </Typography>
              ))}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default RolesMigrationPage;
