// src/components/Board/SmartSearch.jsx
// Умный поиск задач с использованием AI
import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Chip,
  Paper,
  Typography,
  InputAdornment,
  Alert,
} from '@mui/material';
import { Psychology, Search, Close } from '@mui/icons-material';
import aiService from '../../services/ai.service';

function SmartSearch({ tasks = [], onSelectTasks }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim() || !tasks.length) return;

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.smartSearch(query, tasks);
      if (result.success && result.taskIds) {
        const foundTasks = tasks.filter((task) => result.taskIds.includes(task.id));
        setResults(foundTasks);

        if (onSelectTasks) {
          onSelectTasks(foundTasks);
        }
      } else {
        setError('Задачи не найдены');
      }
    } catch (err) {
      setError(err.message || 'Ошибка поиска');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setError(null);
    if (onSelectTasks) {
      onSelectTasks([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!aiService.isInitialized()) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Умный поиск задач с AI (например: 'все срочные задачи по фронтенду')"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Psychology color="primary" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading ? (
                <CircularProgress size={20} />
              ) : query ? (
                <IconButton size="small" onClick={handleClear}>
                  <Close fontSize="small" />
                </IconButton>
              ) : (
                <IconButton size="small" onClick={handleSearch} disabled={!query.trim()}>
                  <Search fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(126, 87, 194, 0.1)'
                : 'rgba(126, 87, 194, 0.05)',
          },
        }}
      />

      {error && (
        <Alert severity="info" sx={{ mt: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {results.length > 0 && (
        <Paper sx={{ mt: 1, p: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Найдено задач: {results.length}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {results.map((task) => (
              <Chip
                key={task.id}
                label={task.title}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default SmartSearch;
