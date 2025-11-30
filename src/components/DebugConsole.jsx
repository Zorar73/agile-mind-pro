import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Divider
} from '@mui/material';
import { Close, BugReport, Download, Delete } from '@mui/icons-material';
import { format } from 'date-fns';

// Глобальное хранилище логов
window.appLogs = window.appLogs || [];

// Перехватываем console.error
const originalError = console.error;
console.error = (...args) => {
  originalError(...args);
  window.appLogs.push({
    type: 'error',
    message: args.join(' '),
    timestamp: new Date(),
    stack: new Error().stack
  });
};

// Перехватываем console.warn
const originalWarn = console.warn;
console.warn = (...args) => {
  originalWarn(...args);
  window.appLogs.push({
    type: 'warning',
    message: args.join(' '),
    timestamp: new Date()
  });
};

function DebugConsole({ open, onClose }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...window.appLogs]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agile-mind-logs-${Date.now()}.json`;
    a.click();
  };

  const handleClear = () => {
    window.appLogs = [];
    setLogs([]);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReport color="primary" />
            <Typography variant="h6">Консоль отладки</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Stats */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`Всего: ${logs.length}`} 
              size="small" 
            />
            <Chip 
              label={`Ошибок: ${logs.filter(l => l.type === 'error').length}`} 
              size="small" 
              color="error"
            />
            <Chip 
              label={`Предупреждений: ${logs.filter(l => l.type === 'warning').length}`} 
              size="small" 
              color="warning"
            />
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ p: 2, display: 'flex', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<Download />}
            onClick={handleDownload}
            fullWidth
          >
            Скачать
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<Delete />}
            onClick={handleClear}
            fullWidth
          >
            Очистить
          </Button>
        </Box>

        {/* Logs List */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <List dense>
            {logs.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="Нет логов"
                  secondary="Все ошибки будут отображаться здесь"
                />
              </ListItem>
            ) : (
              logs.slice().reverse().map((log, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip 
                            label={log.type} 
                            size="small" 
                            color={getTypeColor(log.type)}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(log.timestamp), 'HH:mm:ss')}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.75rem',
                            wordBreak: 'break-word'
                          }}
                        >
                          {log.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        </Box>
      </Box>
    </Drawer>
  );
}

// Экспортируем функцию для логирования
export const logError = (message, data) => {
  console.error(`[APP ERROR] ${message}`, data);
  window.appLogs.push({
    type: 'error',
    message: `${message} | ${JSON.stringify(data)}`,
    timestamp: new Date(),
    data
  });
};

export const logInfo = (message, data) => {
  console.log(`[APP INFO] ${message}`, data);
  window.appLogs.push({
    type: 'info',
    message: `${message} | ${JSON.stringify(data)}`,
    timestamp: new Date(),
    data
  });
};

export default DebugConsole;