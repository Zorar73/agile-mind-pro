// src/components/Learning/CertificatesSection.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
  Stack,
} from '@mui/material';
import {
  EmojiEvents,
  Download,
  Verified,
  School,
} from '@mui/icons-material';
import { UserContext } from '../../App';
import learningService from '../../services/learning.service';
import { downloadCertificatePDF } from '../../utils/certificateGenerator';
import { useToast } from '../../contexts/ToastContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
  gold: '#FFD700',
};

function CertificatesSection() {
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    loadCertificates();
  }, [user?.uid]);

  const loadCertificates = async () => {
    if (!user?.uid) return;

    setLoading(true);
    const result = await learningService.getUserCertificates(user.uid);
    if (result.success) {
      setCertificates(result.certificates);
    }
    setLoading(false);
  };

  const handleDownload = async (certificate) => {
    setDownloading(certificate.id);

    try {
      const userData = {
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const courseData = {
        title: certificate.courseName,
      };

      const result = await downloadCertificatePDF(userData, courseData, certificate);
      if (result.success) {
        toast.success('Сертификат скачан!');
      } else {
        toast.error('Ошибка скачивания сертификата');
      }
    } catch (error) {
      toast.error('Ошибка генерации PDF');
    }

    setDownloading(null);
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = date instanceof Date ? date : new Date(date);
      return format(d, 'd MMMM yyyy', { locale: ru });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar sx={{ bgcolor: bauhaus.gold }}>
              <EmojiEvents />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              Мои сертификаты
            </Typography>
          </Box>
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'action.hover',
              borderRadius: 2,
            }}
          >
            <School sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              У вас пока нет сертификатов
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Завершите курсы, чтобы получить сертификаты
            </Typography>
          </Paper>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Avatar sx={{ bgcolor: bauhaus.gold }}>
            <EmojiEvents />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Мои сертификаты
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {certificates.length} сертификат{certificates.length === 1 ? '' : certificates.length < 5 ? 'а' : 'ов'}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {certificates.map((cert) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cert.id}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${bauhaus.blue}10 0%, ${bauhaus.gold}10 100%)`,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: `${bauhaus.gold}20`,
                      color: bauhaus.gold,
                    }}
                  >
                    <Verified />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cert.courseName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(cert.completedAt)}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip
                    label={cert.certificateNumber}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Stack>

                <Button
                  size="small"
                  startIcon={
                    downloading === cert.id ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Download />
                    )
                  }
                  onClick={() => handleDownload(cert)}
                  disabled={downloading === cert.id}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  {downloading === cert.id ? 'Генерация...' : 'Скачать PDF'}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default CertificatesSection;
