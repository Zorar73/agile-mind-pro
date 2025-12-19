// src/components/Task/TaskDescriptionGenerator.jsx
// AI-генератор описаний задач на основе названия
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  AutoAwesome,
  Refresh,
  Check,
  Close,
} from '@mui/icons-material';
import aiService from '../../services/ai.service';

function TaskDescriptionGenerator({ title, currentDescription, onApply }) {
  const [loading, setLoading] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [error, setError] = useState(null);
  const [showGenerated, setShowGenerated] = useState(false);

  const generateDescription = async () => {
    if (!title || !title.trim()) {
      setError('Введите название задачи');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const prompt = `Создай подробное описание для задачи на основе её названия.

Название задачи: "${title}"
${currentDescription ? `Текущее описание: ${currentDescription}` : ''}

Требования:
- Описание должно быть структурированным и подробным
- Укажи цель задачи
- Перечисли основные шаги выполнения
- Добавь критерии приемки (что должно быть сделано)
- Используй markdown для форматирования
- Описание на русском языке
- Максимум 500 слов

Формат ответа - только текст описания без дополнительных комментариев.`;

      const result = await aiService.model.generateContent(prompt);
      const response = await result.response;
      const description = response.text().trim();

      setGeneratedDescription(description);
      setShowGenerated(true);
    } catch (err) {
      setError(err.message || 'Ошибка генерации описания');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(generatedDescription);
    }
    setShowGenerated(false);
    setGeneratedDescription('');
  };

  const handleRegenerate = () => {
    generateDescription();
  };

  if (!aiService.isInitialized()) {
    return null;
  }

  return (
    <Box>
      {!showGenerated && (
        <Button
          size="small"
          startIcon={loading ? <CircularProgress size={16} /> : <AutoAwesome />}
          onClick={generateDescription}
          disabled={loading || !title}
          sx={{ mb: 1 }}
        >
          {loading ? 'Генерация...' : 'Сгенерировать описание с AI'}
        </Button>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Collapse in={showGenerated}>
        <Box
          sx={{
            p: 2,
            mb: 2,
            border: 1,
            borderColor: 'primary.main',
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(30, 136, 229, 0.1)'
                : 'rgba(30, 136, 229, 0.05)',
          }}
        >
          <TextField
            fullWidth
            multiline
            rows={8}
            value={generatedDescription}
            onChange={(e) => setGeneratedDescription(e.target.value)}
            placeholder="Сгенерированное описание..."
            sx={{ mb: 1 }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<Check />}
              onClick={handleApply}
            >
              Применить
            </Button>

            <Button
              size="small"
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRegenerate}
              disabled={loading}
            >
              Перегенерировать
            </Button>

            <Button
              size="small"
              startIcon={<Close />}
              onClick={() => {
                setShowGenerated(false);
                setGeneratedDescription('');
              }}
            >
              Отмена
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

export default TaskDescriptionGenerator;
