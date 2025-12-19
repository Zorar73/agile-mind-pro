// src/components/Task/TaskAIAssistant.jsx
// AI-помощник для задач: разбиение на подзадачи, предложение тегов, оценка времени
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  Card,
  CardContent,
  Collapse,
  IconButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AutoAwesome,
  ExpandMore,
  ExpandLess,
  Schedule,
  Label,
  AccountTree,
  Close,
  Add,
  Psychology,
} from '@mui/icons-material';
import aiService from '../../services/ai.service';

function TaskAIAssistant({ task, onAddSubtask, onAddTags, onUpdateTime, existingTags = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState({ breakdown: false, tags: false, time: false });
  const [results, setResults] = useState({ subtasks: null, tags: null, timeEstimate: null });
  const [error, setError] = useState(null);

  const handleBreakdownTask = async () => {
    setLoading({ ...loading, breakdown: true });
    setError(null);

    try {
      const result = await aiService.breakdownTask(task);
      if (result.success) {
        setResults({ ...results, subtasks: result.subtasks });
      } else {
        setError(result.error || 'Ошибка разбиения задачи');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading({ ...loading, breakdown: false });
    }
  };

  const handleSuggestTags = async () => {
    setLoading({ ...loading, tags: true });
    setError(null);

    try {
      const result = await aiService.suggestTags(
        task.title || '',
        task.description || '',
        existingTags
      );
      if (result.success) {
        setResults({ ...results, tags: result.tags });
      } else {
        setError('Ошибка предложения тегов');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading({ ...loading, tags: false });
    }
  };

  const handleEstimateTime = async () => {
    setLoading({ ...loading, time: true });
    setError(null);

    try {
      const result = await aiService.estimateTaskTime(task);
      if (result.success) {
        setResults({ ...results, timeEstimate: result });
      } else {
        setError(result.error || 'Ошибка оценки времени');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading({ ...loading, time: false });
    }
  };

  const handleAddSubtask = (subtask) => {
    if (onAddSubtask) {
      onAddSubtask(subtask);
    }
    // Удаляем добавленную подзадачу из результатов
    setResults({
      ...results,
      subtasks: results.subtasks.filter((s) => s.title !== subtask.title),
    });
  };

  const handleAddTag = (tag) => {
    if (onAddTags) {
      onAddTags([tag]);
    }
    // Удаляем добавленный тег из результатов
    setResults({
      ...results,
      tags: results.tags.filter((t) => t !== tag),
    });
  };

  const handleApplyTimeEstimate = () => {
    if (onUpdateTime && results.timeEstimate) {
      onUpdateTime(results.timeEstimate.estimatedHours);
      setResults({ ...results, timeEstimate: null });
    }
  };

  if (!aiService.isInitialized()) {
    return null;
  }

  return (
    <Card
      sx={{
        mb: 2,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(126, 87, 194, 0.1) 0%, rgba(30, 136, 229, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(126, 87, 194, 0.05) 0%, rgba(30, 136, 229, 0.05) 100%)',
        borderLeft: 4,
        borderColor: 'primary.main',
      }}
    >
      <CardContent>
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setExpanded(!expanded)}
        >
          <Psychology sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
            AI-Помощник
          </Typography>
          <IconButton size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Действия AI */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={loading.breakdown ? <CircularProgress size={16} /> : <AccountTree />}
                onClick={handleBreakdownTask}
                disabled={loading.breakdown || !task.title}
              >
                Разбить на подзадачи
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={loading.tags ? <CircularProgress size={16} /> : <Label />}
                onClick={handleSuggestTags}
                disabled={loading.tags || !task.title}
              >
                Предложить теги
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={loading.time ? <CircularProgress size={16} /> : <Schedule />}
                onClick={handleEstimateTime}
                disabled={loading.time || !task.title}
              >
                Оценить время
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Результаты: Подзадачи */}
            {results.subtasks && results.subtasks.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Предложенные подзадачи:
                </Typography>
                <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                  {results.subtasks.map((subtask, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleAddSubtask(subtask)}
                          color="primary"
                        >
                          <Add />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={subtask.title}
                        secondary={
                          subtask.estimatedHours
                            ? `Оценка: ${subtask.estimatedHours}ч`
                            : null
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Результаты: Теги */}
            {results.tags && results.tags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Предложенные теги:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                  {results.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      icon={<Add />}
                      onClick={() => handleAddTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Результаты: Оценка времени */}
            {results.timeEstimate && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Оценка времени:
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setResults({ ...results, timeEstimate: null })}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>

                <Typography variant="h6" color="primary.main" gutterBottom>
                  {results.timeEstimate.estimatedHours} часов
                </Typography>

                <Chip
                  label={`Уверенность: ${results.timeEstimate.confidence || 'средняя'}`}
                  size="small"
                  sx={{ mb: 1 }}
                />

                {results.timeEstimate.reasoning && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {results.timeEstimate.reasoning}
                  </Typography>
                )}

                {onUpdateTime && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleApplyTimeEstimate}
                    fullWidth
                  >
                    Применить оценку
                  </Button>
                )}
              </Box>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
              💡 AI-помощник использует Gemini для анализа задач
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default TaskAIAssistant;
