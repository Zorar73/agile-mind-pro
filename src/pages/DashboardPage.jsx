// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { Add, ViewKanban } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import boardService from '../services/board.service';

function DashboardPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  useEffect(() => {
    if (!user) return;

    const unsubscribe = boardService.subscribeToUserBoards(user.uid, (updatedBoards) => {
      setBoards(updatedBoards);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;

    const result = await boardService.createBoard(newBoardTitle, user.uid);
    
    if (result.success) {
      setCreateDialogOpen(false);
      setNewBoardTitle('');
      navigate(`/board/${result.boardId}`);
    }
  };

  return (
    <MainLayout title="Главная">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Мои доски
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Управляйте проектами и задачами в едином пространстве
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            size="large"
          >
            Создать доску
          </Button>
        </Box>

        {boards.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <ViewKanban sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                У вас пока нет досок
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Создайте первую доску для управления задачами
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Создать первую доску
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {boards.map((board) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={board.id}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/board/${board.id}`)}
                    sx={{ height: '100%', p: 2 }}
                  >
                    <Box sx={{ height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6" fontWeight="600" gutterBottom noWrap>
                          {board.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Object.keys(board.members || {}).length} участник(ов)
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {board.members?.[user.uid] === 'owner' && (
                          <Chip label="Владелец" size="small" color="primary" />
                        )}
                        {board.members?.[user.uid] === 'editor' && (
                          <Chip label="Редактор" size="small" color="secondary" />
                        )}
                      </Box>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Диалог создания доски */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новую доску</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Название доски"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleCreateBoard();
            }}
            sx={{ mt: 2 }}
            placeholder="Например: Разработка продукта Q1 2025"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleCreateBoard} variant="contained" disabled={!newBoardTitle.trim()}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

export default DashboardPage;