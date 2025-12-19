// src/pages/LoginPage.jsx
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

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    const result = await authService.login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Bauhaus декоративные элементы */}
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          bgcolor: bauhaus.blue,
          opacity: 0.1,
          top: -100,
          left: -100,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 200,
          height: 200,
          bgcolor: bauhaus.yellow,
          opacity: 0.15,
          bottom: 50,
          right: -50,
          transform: 'rotate(45deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 150,
          height: 150,
          borderRadius: '50%',
          bgcolor: bauhaus.red,
          opacity: 0.1,
          top: '50%',
          right: '20%',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: bauhaus.teal,
          opacity: 0.12,
          bottom: '20%',
          left: '15%',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 5 }}>
            {/* Bauhaus логотип */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 2,
                mb: 2,
              }}>
                <Box sx={{ position: 'relative', width: 48, height: 48 }}>
                  <Box sx={{ 
                    position: 'absolute', 
                    width: 24, 
                    height: 24, 
                    bgcolor: bauhaus.blue, 
                    borderRadius: '50%',
                    top: 0,
                    left: 0,
                  }} />
                  <Box sx={{ 
                    position: 'absolute', 
                    width: 18, 
                    height: 18, 
                    bgcolor: bauhaus.red, 
                    top: 14,
                    right: 0,
                  }} />
                  <Box sx={{ 
                    position: 'absolute', 
                    width: 16, 
                    height: 16, 
                    bgcolor: bauhaus.yellow, 
                    borderRadius: '50%',
                    bottom: 0,
                    left: 12,
                  }} />
                </Box>
                <Typography variant="h4" fontWeight="700">
                  Agile Mind
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Войдите в свой аккаунт
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Пароль"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  borderRadius: 50, 
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Нет аккаунта?{' '}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      cursor: 'pointer', 
                      fontWeight: 600,
                      color: bauhaus.blue,
                    }}
                  >
                    Зарегистрироваться
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

export default LoginPage;
