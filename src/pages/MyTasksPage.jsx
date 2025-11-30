// src/pages/MyTasksPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, Assignment } from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import { UserContext } from '../App';
import taskService from '../services/task.service';
import boardService from '../services/board.service';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function MyTasksPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const unsubscribeBoards = boardService.subscribeToUserBoards(user.uid, async (userBoards) => {
      setBoards(userBoards);

      const tasksPromises = userBoards.map(board => taskService.getTasks(board.id));
      const tasksResults = await Promise.all(tasksPromises);
      
      const tasks = tasksResults
        .filter(result => result.success)
        .flatMap((result, index) =>
          result.tasks.map(task => ({
            ...task,
            boardId: userBoards[index].id,
            boardTitle: userBoards[index].title,
          }))
        );

      setAllTasks(tasks);
      filterTasks(tasks, activeTab, searchQuery);
    });

    return () => unsubscribeBoards();
  }, [user]);

  useEffect(() => {
    filterTasks(allTasks, activeTab, searchQuery);
  }, [activeTab, searchQuery, allTasks]);

  const filterTasks = (tasks, tab, search) => {
    let filtered = tasks;

    if (tab === 1) {
      filtered = filtered.filter(t => t.assigneeId === user.uid);
    } else if (tab === 2) {
      filtered = filtered.filter(t => t.creatorId === user.uid);
    }

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(filtered);
  };

  const getPriorityChip = (priority) => {
    const colors = {
      urgent: 'error',
      recurring: 'info',
      normal: 'default',
    };

    const labels = {
      urgent: 'Срочно',
      recurring: 'Постоянная',
      normal: 'Нормально',
    };

    return <Chip label={labels[priority] || 'Нормально'} color={colors[priority] || 'default'} size="small" />;
  };

  const handleTaskClick = (task) => {
    navigate(`/board/${task.boardId}`);
  };

  return (
    <MainLayout title="Мои задачи">
      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label={`Все задачи (${allTasks.length})`} />
          <Tab label="Назначенные мне" />
          <Tab label="Созданные мной" />
        </Tabs>

        <TextField
          fullWidth
          size="small"
          placeholder="Поиск по названию или описанию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Задача</TableCell>
              <TableCell>Доска</TableCell>
              <TableCell>Приоритет</TableCell>
              <TableCell>Дедлайн</TableCell>
              <TableCell>Теги</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 4 }}>
                    <Assignment sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'Задачи не найдены' : 'Нет задач'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow
                  key={task.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleTaskClick(task)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {task.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={task.boardTitle} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{getPriorityChip(task.priority)}</TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      format(new Date(task.dueDate), 'dd.MM.yyyy')
                    ) : (
                      <Typography variant="caption" color="text.secondary">Нет</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {task.tags?.slice(0, 2).map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                      {task.tags?.length > 2 && (
                        <Chip label={`+${task.tags.length - 2}`} size="small" />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainLayout>
  );
}

export default MyTasksPage;