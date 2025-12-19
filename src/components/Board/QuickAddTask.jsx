// src/components/Board/QuickAddTask.jsx
import React, { useState, useContext } from 'react';
import { Box, TextField, Button, CircularProgress } from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { UserContext } from '../../App';
import taskService from '../../services/task.service';

function QuickAddTask({ boardId, columnId, onSuccess }) {
  const { user } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTitle('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || loading || !user?.uid) return;
    
    setLoading(true);
    try {
      const timestamp = Date.now();
      
      const result = await taskService.createTask({
        title: title.trim(),
        boardId,
        columnId,
        createdBy: user.uid,
        status: 'todo',
        order: timestamp,
      }, user.uid);

      if (result.success) {
        setTitle('');
        setIsOpen(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) {
    return (
      <Button
        fullWidth
        startIcon={<Add />}
        onClick={handleOpen}
        sx={{ 
          justifyContent: 'flex-start',
          color: 'text.secondary',
          '&:hover': {
            bgcolor: 'action.hover',
          }
        }}
      >
        Добавить задачу
      </Button>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 1,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      <TextField
        fullWidth
        autoFocus
        size="small"
        placeholder="Введите название задачи..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        sx={{ mb: 1 }}
      />
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={!title.trim() || loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Создание...' : 'Добавить'}
        </Button>
        <Button
          size="small"
          onClick={handleClose}
          disabled={loading}
        >
          <Close fontSize="small" />
        </Button>
      </Box>
    </Box>
  );
}

export default QuickAddTask;
