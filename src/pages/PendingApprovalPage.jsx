// src/pages/PendingApprovalPage.jsx
import React from 'react';
import { Container, Box, Card, CardContent, Typography, Button } from '@mui/material';
import { HourglassEmpty } from '@mui/icons-material';
import authService from '../services/auth.service';

// Bauhaus цвета
const bauhaus = {
  blue: '#1E88E5',
  yellow: '#FDD835',
  teal: '#26A69A',
};

function PendingApprovalPage() {
  const handleLogout = async () => {
    await authService.logout();
    window.location.reload();
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
      {/* Bauhaus декор */}
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          bgcolor: bauhaus.blue,
          opacity: 0.1,
          top: -100,
          right: -100,
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
          left: -50,
          transform: 'rotate(45deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 150,
          height: 150,
          borderRadius: '50%',
          bgcolor: bauhaus.teal,
          opacity: 0.12,
          bottom: '30%',
          right: '20%',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ textAlign: 'center', p: 5 }}>
            {/* Анимированная иконка */}
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: `${bauhaus.yellow}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <HourglassEmpty sx={{ fontSize: 48, color: bauhaus.yellow }} />
            </Box>
            
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Ожидание модерации
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 360, mx: 'auto' }}>
              Ваш аккаунт ещё не одобрен администратором. Пожалуйста, подождите, пока администратор проверит вашу заявку.
            </Typography>

            <Button 
              variant="outlined" 
              onClick={handleLogout}
              sx={{ borderRadius: 50, px: 4 }}
            >
              Выйти
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default PendingApprovalPage;
