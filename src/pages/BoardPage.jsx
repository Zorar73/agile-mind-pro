// src/pages/BoardPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Fab,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Psychology,
  Settings,
  MoreVert
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import boardService from '../services/board.service';
import taskService from '../services/task.service';
import KanbanColumn from '../components/Board/KanbanColumn';
import TaskCard from '../components/Board/TaskCard';
import TaskModal from '../components/Task/TaskModal';
import AIAnalyzer from '../components/AI/AIAnalyzer';

function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  // Горячие клавиши
useEffect(() => {
  const handleKeyPress = (e) => {
    // Ctrl + Enter = Новая задача
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      if (columns.length > 0) {
        handleCreateTask(columns[0].id);
      }
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (!boardId) return;

    // Подписка на доску
    const unsubscribeBoard = boardService.subscribeToBoard(boardId, (boardData) => {
      setBoard(boardData);
    });

    // Подписка на колонки
    const unsubscribeColumns = boardService.subscribeToColumns(boardId, (columnsData) => {
      setColumns(columnsData);
    });

    // Подписка на задачи
    const unsubscribeTasks = taskService.subscribeToTasks(boardId, (tasksData) => {
      setTasks(tasksData);
    });

    return () => {
      unsubscribeBoard();
      unsubscribeColumns();
      unsubscribeTasks();
    };
  }, [boardId]);

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeTask = tasks.find(t => t.id === active.id);
    const overColumn = columns.find(c => c.id === over.id) || 
                      columns.find(c => tasks.find(t => t.id === over.id)?.columnId === c.id);

    if (!overColumn || !activeTask) {
      setActiveTask(null);
      return;
    }

    // Проверка прав на перенос
    const canMove = board?.settings?.whoCanMoveToStatus?.[overColumn.id]?.includes(
      board.members[user.uid]
    ) || board.ownerId === user.uid;

    if (!canMove) {
      alert('У вас нет прав на перенос задач в этот статус');
      setActiveTask(null);
      return;
    }

    // Получаем задачи в целевой колонке
    const columnTasks = tasks
      .filter(t => t.columnId === overColumn.id)
      .sort((a, b) => a.order - b.order);

    let newOrder = columnTasks.length;

    // Если задача уже в этой колонке, изменяем порядок
    if (activeTask.columnId === overColumn.id) {
      const oldIndex = columnTasks.findIndex(t => t.id === activeTask.id);
      const newIndex = columnTasks.findIndex(t => t.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex);
        
        // Обновляем order для всех задач
        for (let i = 0; i < reorderedTasks.length; i++) {
          await taskService.updateTask(boardId, reorderedTasks[i].id, { order: i }, user.uid);
        }
      }
    } else {
      // Перемещаем в другую колонку
      await taskService.moveTask(boardId, activeTask.id, overColumn.id, newOrder, user.uid);
    }

    setActiveTask(null);
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;

    await boardService.addColumn(boardId, newColumnTitle);
    setAddColumnDialogOpen(false);
    setNewColumnTitle('');
  };

  const handleDeleteColumn = async (columnId) => {
    if (window.confirm('Удалить колонку? Все задачи в ней будут удалены.')) {
      await boardService.deleteColumn(boardId, columnId);
    }
  };

  const handleCreateTask = async (columnId) => {
    const result = await taskService.createTask(boardId, {
      title: 'Новая задача',
      description: '',
      columnId,
      creatorId: user.uid,
      priority: 'normal',
      tags: []
    });

    if (result.success) {
      // Открываем модальное окно для редактирования
      const task = await taskService.getTask(boardId, result.taskId);
      if (task.success) {
        setSelectedTask(task.task);
      }
    }
  };

  const getTasksByColumn = (columnId) => {
    return tasks
      .filter(t => t.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  };

  if (!board) {
    return <Box sx={{ p: 3 }}>Загрузка...</Box>;
  }

  return (
     <MainLayout showAppBar={false}>
    {/* Custom Header для доски */}
    <Box sx={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 10, 
      bgcolor: 'background.paper',
      borderBottom: 1,
      borderColor: 'divider',
      mb: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
        <TextField
          value={board?.title || ''}
          onChange={(e) => boardService.updateBoardTitle(boardId, e.target.value)}
          variant="standard"
          sx={{
            flexGrow: 1,
            '& .MuiInputBase-input': {
              fontSize: '1.25rem',
              fontWeight: 'bold',
            },
          }}
        />

        <Button
          variant="contained"
          startIcon={<Psychology />}
          onClick={() => setAiDialogOpen(true)}
        >
          AI Анализ
        </Button>

        <IconButton onClick={(e) => setSettingsAnchor(e.currentTarget)}>
          <MoreVert />
        </IconButton>

        <Menu
          anchorEl={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={() => setSettingsAnchor(null)}
        >
          <MenuItem onClick={() => setAddColumnDialogOpen(true)}>
            <Add sx={{ mr: 1 }} /> Добавить колонку
          </MenuItem>
          <MenuItem onClick={() => alert('Настройки доски (в разработке)')}>
            <Settings sx={{ mr: 1 }} /> Настройки доски
          </MenuItem>
        </Menu>
      </Box>
    </Box>

    {/* Kanban Board */}
    <Box sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ display: 'flex', gap: 2, minHeight: '100%' }}>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksByColumn(column.id)}
              onCreateTask={() => handleCreateTask(column.id)}
              onTaskClick={(task) => setSelectedTask(task)}
              onDeleteColumn={() => handleDeleteColumn(column.id)}
            />
          ))}

          {/* Кнопка добавления колонки */}
          <Box
            sx={{
              minWidth: 300,
              height: 'fit-content',
              bgcolor: 'transparent',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider',
              p: 2,
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
            onClick={() => setAddColumnDialogOpen(true)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Add sx={{ mr: 1 }} />
              <Typography>Добавить колонку</Typography>
            </Box>
          </Box>
        </Box>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </Box>

    {/* Модальное окно задачи */}
    {selectedTask && (
      <TaskModal
        boardId={boardId}
        task={selectedTask}
        columns={columns}
        onClose={() => setSelectedTask(null)}
      />
    )}

    {/* AI Analyzer */}
    {aiDialogOpen && (
      <AIAnalyzer
        boardId={boardId}
        board={board}
        columns={columns}
        onClose={() => setAiDialogOpen(false)}
      />
    )}

    {/* Диалог добавления колонки */}
    <Dialog open={addColumnDialogOpen} onClose={() => setAddColumnDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить новую колонку</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Название колонки"
          value={newColumnTitle}
          onChange={(e) => setNewColumnTitle(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleAddColumn();
          }}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAddColumnDialogOpen(false)}>Отмена</Button>
        <Button onClick={handleAddColumn} variant="contained">Добавить</Button>
      </DialogActions>
{/* Плавающая кнопка "Новая задача" */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
        onClick={() => {
          // Создаем задачу в первой колонке
          if (columns.length > 0) {
            handleCreateTask(columns[0].id);
          }
        }}
      >
        <Add />
      </Fab>
    </Dialog>
  </MainLayout>
  );
}

export default BoardPage;