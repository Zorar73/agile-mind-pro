// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

// Bauhaus цвета
const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
};

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    position: '',
    responsibility: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Имя обязательно';
    if (!formData.middleName.trim()) newErrors.middleName = 'Отчество обязательно';
    if (!formData.lastName.trim()) newErrors.lastName = 'Фамилия обязательна';

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (!formData.position.trim()) newErrors.position = 'Должность обязательна';
    if (!formData.responsibility.trim()) newErrors.responsibility = 'Поле обязательно';

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Минимум 6 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await authService.register(formData);
    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setErrors({ submit: result.message });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
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
          opacity: 0.08,
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
          opacity: 0.1,
          bottom: -80,
          left: -80,
          transform: 'rotate(45deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: bauhaus.red,
          opacity: 0.1,
          top: '40%',
          left: '10%',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Логотип */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 2,
                mb: 1,
              }}>
                <Box sx={{ position: 'relative', width: 40, height: 40 }}>
                  <Box sx={{ 
                    position: 'absolute', width: 20, height: 20, 
                    bgcolor: bauhaus.blue, borderRadius: '50%', top: 0, left: 0,
                  }} />
                  <Box sx={{ 
                    position: 'absolute', width: 15, height: 15, 
                    bgcolor: bauhaus.red, top: 12, right: 0,
                  }} />
                  <Box sx={{ 
                    position: 'absolute', width: 12, height: 12, 
                    bgcolor: bauhaus.yellow, borderRadius: '50%', bottom: 0, left: 10,
                  }} />
                </Box>
                <Typography variant="h4" fontWeight="700">
                  Agile Mind
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Регистрация нового пользователя
              </Typography>
            </Box>

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {successMessage}
              </Alert>
            )}

            {errors.submit && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {errors.submit}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Имя"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    disabled={loading}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Отчество"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    error={!!errors.middleName}
                    helperText={errors.middleName}
                    disabled={loading}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Фамилия"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    disabled={loading}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Должность"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    error={!!errors.position}
                    helperText={errors.position}
                    disabled={loading}
                    placeholder="Frontend Developer"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="За что отвечаете"
                    name="responsibility"
                    value={formData.responsibility}
                    onChange={handleChange}
                    error={!!errors.responsibility}
                    helperText={errors.responsibility}
                    disabled={loading}
                    placeholder="Разработка UI компонентов"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Пароль"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={loading}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Подтверждение пароля"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    disabled={loading}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, borderRadius: 50, py: 1.5, fontWeight: 600 }}
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Уже есть аккаунт?{' '}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => navigate('/login')}
                    sx={{ cursor: 'pointer', fontWeight: 600, color: bauhaus.blue }}
                  >
                    Войти
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default RegisterPage;
