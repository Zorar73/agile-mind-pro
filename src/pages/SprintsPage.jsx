// src/pages/SprintsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import SprintHistory from '../components/Sprint/SprintHistory';
import SprintPlanning from '../components/Sprint/SprintPlanning';
import boardService from '../services/board.service';
import taskService from '../services/task.service';
import sprintService from '../services/sprint.service';
import userService from '../services/user.service';
import { useToast } from '../contexts/ToastContext';

function SprintsPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const toast = useToast();

  const [board, setBoard] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [planningDialogOpen, setPlanningDialogOpen] = useState(false);

  useEffect(() => {
    if (user && boardId) {
      loadData();
    }
  }, [user, boardId]);

  const loadData = async () => {
    setLoading(true);

    // Загружаем доску
    const boardResult = await boardService.getBoardById(boardId);
    if (!boardResult.success) {
      toast.error('Не удалось загрузить доску');
      setLoading(false);
      return;
    }
    setBoard(boardResult.board);

    // Загружаем спринты
    const sprintsResult = await sprintService.getBoardSprints(boardId);
    if (sprintsResult.success) {
      // Фильтруем только завершенные спринты
      const completedSprints = sprintsResult.sprints.filter(s => s.status === 'completed');
      setSprints(completedSprints);
    }

    // Загружаем задачи
    const tasksResult = await taskService.getTasksByBoard(boardId);
    if (tasksResult.success) {
      setTasks(tasksResult.tasks);
    }

    // Загружаем пользователей
    const usersResult = await userService.getAllUsers();
    if (usersResult.success) {
      const usersMap = {};
      usersResult.users.forEach(u => {
        usersMap[u.uid] = u;
      });
      setUsers(usersMap);
    }

    setLoading(false);
  };

  const handleCreateSprint = async (sprintData) => {
    const result = await sprintService.createSprint(
      boardId,
      sprintData,
      user.uid
    );

    if (result.success) {
      toast.success('Спринт создан');
      loadData();
    } else {
      toast.error('Ошибка создания спринта: ' + result.error);
    }
  };

  const handleDeleteSprint = async (sprintId) => {
    const result = await sprintService.deleteSprint(sprintId);
    if (result.success) {
      toast.success('Спринт удален');
      loadData();
    } else {
      toast.error('Ошибка удаления спринта: ' + result.error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!board) {
    return (
      <MainLayout>
        <Alert severity="error">Доска не найдена</Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Хлебные крошки */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/board/${boardId}`)}
          sx={{ mb: 2 }}
        >
          Вернуться к доске
        </Button>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Архив спринтов
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {board.title}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setPlanningDialogOpen(true)}
            sx={{
              borderRadius: 50,
              px: 3,
              alignSelf: { xs: 'stretch', sm: 'auto' },
            }}
          >
            Создать спринт
          </Button>
        </Box>
      </Box>

      {/* Список спринтов */}
      <SprintHistory
        sprints={sprints}
        allTasks={tasks}
        users={users}
        onDeleteSprint={handleDeleteSprint}
        onTaskClick={(task) => {
          // Можно открыть TaskDrawer если нужно
          // setSelectedTask(task);
        }}
      />

      {/* Диалог планирования спринта */}
      <SprintPlanning
        open={planningDialogOpen}
        onClose={() => setPlanningDialogOpen(false)}
        tasks={tasks.filter(t => !t.sprintId || t.sprintId === '')}
        onCreateSprint={handleCreateSprint}
      />
    </MainLayout>
  );
}

export default SprintsPage;
