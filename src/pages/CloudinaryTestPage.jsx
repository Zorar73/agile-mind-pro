// Тестовая страница для проверки Cloudinary
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  LinearProgress,
  Stack,
  Chip,
} from '@mui/material';
import { CloudUpload, CheckCircle, Error, Info } from '@mui/icons-material';
import cloudinaryService from '../services/cloudinary.service';
import { cloudinaryConfig } from '../config/cloudinary';
import MainLayout from '../components/Layout/MainLayout';

function CloudinaryTestPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    const uploadResult = await cloudinaryService.upload(file, {
      folder: 'test',
      onProgress: (percent) => {
        setProgress(percent);
      },
    });

    setUploading(false);

    if (uploadResult.success) {
      setResult(uploadResult);
    } else {
      setError(uploadResult.error);
    }
  };

  const configStatus = {
    cloudName: cloudinaryConfig.cloudName,
    uploadPreset: cloudinaryConfig.uploadPreset,
    isConfigured: cloudinaryConfig.cloudName !== 'YOUR_CLOUD_NAME' &&
                   cloudinaryConfig.cloudName !== 'agile_mind_pro',
  };

  return (
    <MainLayout title="Тест Cloudinary">
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Проверка настройки Cloudinary
        </Typography>

        {/* Статус конфигурации */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Info color={configStatus.isConfigured ? 'success' : 'warning'} />
            <Typography variant="h6">
              Конфигурация
            </Typography>
          </Box>

          <Stack spacing={1}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Cloud Name:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {configStatus.cloudName}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Upload Preset:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {configStatus.uploadPreset}
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              {configStatus.isConfigured ? (
                <Chip
                  icon={<CheckCircle />}
                  label="Настроено"
                  color="success"
                  size="small"
                />
              ) : (
                <Chip
                  icon={<Error />}
                  label="Требуется настройка"
                  color="warning"
                  size="small"
                />
              )}
            </Box>
          </Stack>
        </Paper>

        {/* Инструкция, если не настроено */}
        {!configStatus.isConfigured && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Cloudinary не настроен
            </Typography>
            <Typography variant="body2" paragraph>
              Выполни следующие шаги:
            </Typography>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: '0.875rem' }}>
              <li>Зайди на <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer">cloudinary.com/console</a></li>
              <li>Скопируй <strong>Cloud Name</strong> из Dashboard (не Product Environment Name!)</li>
              <li>Settings → Upload → Upload presets → Add upload preset</li>
              <li>Настройки preset:
                <ul>
                  <li>Preset name: <code>agile_mind_pro</code></li>
                  <li>Signing Mode: <strong>Unsigned</strong></li>
                  <li>Folder: <code>agile-mind-pro</code></li>
                </ul>
              </li>
              <li>Открой <code>src/config/cloudinary.js</code></li>
              <li>Замени <code>cloudName: 'agile_mind_pro'</code> на твой настоящий Cloud Name</li>
              <li>Перезагрузи страницу</li>
            </ol>
          </Alert>
        )}

        {/* Загрузка */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Тест загрузки
          </Typography>

          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'block', marginBottom: 16 }}
            />

            {file && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Выбран: {file.name} ({cloudinaryService.formatFileSize(file.size)})
              </Alert>
            )}

            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={handleUpload}
              disabled={!file || uploading || !configStatus.isConfigured}
              fullWidth
            >
              {uploading ? 'Загрузка...' : 'Загрузить'}
            </Button>
          </Box>

          {uploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {progress}%
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Ошибка загрузки
              </Typography>
              <Typography variant="body2">
                {error}
              </Typography>
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Проверь:
              </Typography>
              <ul style={{ margin: '4px 0', paddingLeft: 20, fontSize: '0.75rem' }}>
                <li>Cloud Name правильный (не должен быть 'agile_mind_pro')</li>
                <li>Upload Preset создан и называется 'agile_mind_pro'</li>
                <li>Signing Mode установлен в 'Unsigned'</li>
                <li>Консоль браузера (F12) для подробностей</li>
              </ul>
            </Alert>
          )}

          {result && (
            <Alert severity="success">
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                ✅ Загрузка успешна!
              </Typography>

              <Box sx={{ mt: 2, mb: 1 }}>
                <img
                  src={result.url}
                  alt="Uploaded"
                  style={{
                    maxWidth: '100%',
                    borderRadius: 8,
                    border: '1px solid #ddd',
                  }}
                />
              </Box>

              <Typography variant="caption" sx={{ display: 'block', mt: 1, wordBreak: 'break-all' }}>
                URL: {result.url}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Public ID: {result.publicId}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Size: {cloudinaryService.formatFileSize(result.size)}
              </Typography>
            </Alert>
          )}
        </Paper>

        {/* API Test */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Прямая проверка API
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            URL для тестирования:
          </Typography>
          <Box
            component="code"
            sx={{
              display: 'block',
              p: 1,
              bgcolor: 'grey.100',
              borderRadius: 1,
              fontSize: '0.75rem',
              wordBreak: 'break-all',
            }}
          >
            https://api.cloudinary.com/v1_1/{configStatus.cloudName}/image/upload
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Если получаешь 404 - Cloud Name неправильный
          </Typography>
        </Paper>
      </Container>
    </MainLayout>
  );
}

export default CloudinaryTestPage;
