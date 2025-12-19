// src/components/Board/KanbanColumn.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import { Add, MoreVert, Delete, Edit } from '@mui/icons-material';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

function KanbanColumn({ column, tasks, onCreateTask, onTaskClick, onDeleteColumn }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [anchorEl, setAnchorEl] = useState(null);

  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const handleTitleSave = () => {
    if (title.trim() && title !== column.title) {
      // Здесь вызов boardService.updateColumnTitle
      // boardService.updateColumnTitle(boardId, column.id, title);
    }
    setIsEditingTitle(false);
  };

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minWidth: 300,
        maxWidth: 300,
        bgcolor: 'grey.100',
        borderRadius: 2,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
      }}
    >
      {/* Header колонки */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {isEditingTitle ? (
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleTitleSave();
            }}
          />
        ) : (
          <>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              onDoubleClick={() => setIsEditingTitle(true)}
            >
              {column.title}
            </Typography>
            
            <Chip
              label={tasks.length}
              size="small"
              sx={{ mr: 1 }}
            />

            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert fontSize="small" />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setIsEditingTitle(true);
                  setAnchorEl(null);
                }}
              >
                <Edit sx={{ mr: 1, fontSize: 18 }} /> Переименовать
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onDeleteColumn();
                  setAnchorEl(null);
                }}
              >
                <Delete sx={{ mr: 1, fontSize: 18 }} /> Удалить
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {/* Список задач */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          minHeight: 100,
        }}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>
      </Box>

      {/* Кнопка добавления задачи */}
      <Button
        fullWidth
        startIcon={<Add />}
        onClick={onCreateTask}
        sx={{ mt: 2 }}
      >
        Добавить задачу
      </Button>
    </Box>
  );
}

// Мемоизация для предотвращения лишних ререндеров
export default React.memo(KanbanColumn, (prevProps, nextProps) => {
  // Возвращаем true если props не изменились (пропускаем ререндер)
  return (
    prevProps.column.id === nextProps.column.id &&
    prevProps.column.title === nextProps.column.title &&
    prevProps.column.color === nextProps.column.color &&
    prevProps.tasks.length === nextProps.tasks.length &&
    prevProps.tasks.every((task, index) => task.id === nextProps.tasks[index]?.id)
  );
});
