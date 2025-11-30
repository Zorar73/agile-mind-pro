import React from 'react';
import { Container, Box, Card, CardContent, Typography, Button } from '@mui/material';
import { HourglassEmpty } from '@mui/icons-material';
import authService from '../services/auth.service';

function PendingApprovalPage() {
  const handleLogout = async () => {
    await authService.logout();
    window.location.reload();
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <HourglassEmpty sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Ожидание модерации
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ваш аккаунт еще не одобрен администратором.
              <br />
              Пожалуйста, подождите, пока администратор проверит вашу заявку.
            </Typography>

            <Button variant="outlined" onClick={handleLogout}>
              Выйти
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default PendingApprovalPage;