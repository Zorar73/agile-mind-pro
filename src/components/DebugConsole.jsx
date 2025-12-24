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
  Divider,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { Close, BugReport, Download, Delete, SmartToy, Send, Reply } from '@mui/icons-material';
import { format } from 'date-fns';

// Глобальное хранилище логов
if (!window.appLogs) window.appLogs = [];
if (!window.aiLogs) window.aiLogs = [];

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
  const [aiLogs, setAiLogs] = useState([]);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...window.appLogs]);
      setAiLogs([...window.aiLogs]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDownload = () => {
    const data = tab === 0 ? logs : aiLogs;
    const filename = tab === 0 ? 'agile-mind-logs' : 'agile-mind-ai-logs';
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${Date.now()}.json`;
    a.click();
  };

  const handleClear = () => {
    if (tab === 0) {
      window.appLogs = [];
      setLogs([]);
    } else {
      window.aiLogs = [];
      setAiLogs([]);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'request': return 'primary';
      case 'response': return 'success';
      default: return 'default';
    }
  };

  const getAITypeIcon = (type) => {
    switch (type) {
      case 'request': return <Send fontSize="small" />;
      case 'response': return <Reply fontSize="small" />;
      case 'error': return <BugReport fontSize="small" />;
      default: return <SmartToy fontSize="small" />;
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 500, height: '100%', display: 'flex', flexDirection: 'column' }}>
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

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 42 }}>
          <Tab 
            sx={{ minHeight: 42, py: 1 }}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BugReport fontSize="small" />
                <span>Логи ({logs.length})</span>
              </Box>
            } 
          />
          <Tab 
            sx={{ minHeight: 42, py: 1 }}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SmartToy fontSize="small" />
                <span>AI ({aiLogs.length})</span>
              </Box>
            } 
          />
        </Tabs>

        {/* Stats */}
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          {tab === 0 ? (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`Всего: ${logs.length}`} size="small" />
              <Chip label={`Ошибок: ${logs.filter(l => l.type === 'error').length}`} size="small" color="error" />
              <Chip label={`Предупреждений: ${logs.filter(l => l.type === 'warning').length}`} size="small" color="warning" />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`Запросов: ${aiLogs.filter(l => l.type === 'request').length}`} size="small" color="primary" />
              <Chip label={`Ответов: ${aiLogs.filter(l => l.type === 'response').length}`} size="small" color="success" />
              <Chip label={`Ошибок: ${aiLogs.filter(l => l.type === 'error').length}`} size="small" color="error" />
            </Box>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ p: 1.5, display: 'flex', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Button size="small" variant="outlined" startIcon={<Download />} onClick={handleDownload} fullWidth>
            Скачать
          </Button>
          <Button size="small" variant="outlined" startIcon={<Delete />} onClick={handleClear} fullWidth>
            Очистить
          </Button>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {tab === 0 ? (
            // App Logs
            <List dense>
              {logs.length === 0 ? (
                <ListItem>
                  <ListItemText primary="Нет логов" secondary="Ошибки и предупреждения будут здесь" />
                </ListItem>
              ) : (
                logs.slice().reverse().map((log, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Chip label={log.type} size="small" color={getTypeColor(log.type)} />
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(log.timestamp), 'HH:mm:ss')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-word' }}>
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
          ) : (
            // AI Logs
            <Box sx={{ p: 1 }}>
              {aiLogs.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <SmartToy sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">Нет AI логов</Typography>
                  <Typography variant="caption" color="text.disabled">
                    Запросы и ответы GigaChat появятся здесь
                  </Typography>
                </Box>
              ) : (
                aiLogs.slice().reverse().map((log, index) => (
                  <Paper 
                    key={index} 
                    elevation={0} 
                    sx={{ 
                      mb: 1.5, 
                      p: 1.5,
                      border: 1,
                      borderColor: log.type === 'request' ? 'primary.main' : log.type === 'response' ? 'success.main' : 'error.main',
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getAITypeIcon(log.type)}
                      <Chip 
                        label={log.type === 'request' ? 'ЗАПРОС' : log.type === 'response' ? 'ОТВЕТ' : 'ОШИБКА'} 
                        size="small" 
                        color={getTypeColor(log.type)} 
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </Typography>
                    </Box>
                    
                    {log.type === 'request' && log.data?.messages && (
                      <Box>
                        {log.data.messages.map((msg, i) => (
                          <Box key={i} sx={{ mb: 1 }}>
                            <Chip 
                              label={msg.role.toUpperCase()} 
                              size="small" 
                              variant="filled"
                              sx={{ mb: 0.5, fontSize: '0.65rem', height: 20 }}
                            />
                            <Box 
                              sx={{ 
                                fontFamily: 'monospace', 
                                fontSize: '0.7rem', 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                bgcolor: 'grey.100',
                                p: 1,
                                borderRadius: 1,
                                maxHeight: 200,
                                overflow: 'auto',
                              }}
                            >
                              {msg.content}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                    
                    {log.type === 'response' && log.data?.content && (
                      <Box 
                        sx={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.7rem', 
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          bgcolor: 'success.50',
                          p: 1,
                          borderRadius: 1,
                          maxHeight: 300,
                          overflow: 'auto',
                        }}
                      >
                        {log.data.content}
                      </Box>
                    )}
                    
                    {log.type === 'error' && (
                      <Box 
                        sx={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.7rem',
                          color: 'error.main',
                          bgcolor: 'error.50',
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        {JSON.stringify(log.data, null, 2)}
                      </Box>
                    )}
                  </Paper>
                ))
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}

// Экспортируем функции для логирования
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
