import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Share,
  Description,
} from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import { UserContext } from '../App';
import sketchService from '../services/sketch.service';
import teamService from '../services/team.service';
import SketchModal from '../components/Sketch/SketchModal';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

function SketchesPage() {
  const { user } = useContext(UserContext);
  
  const [sketches, setSketches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSketch, setSelectedSketch] = useState(null);
  const [newSketchData, setNewSketchData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    
    const teamsResult = await teamService.getUserTeams(user.uid);
    const userTeams = teamsResult.success ? teamsResult.teams.map(t => t.id) : [];
    setTeams(teamsResult.teams || []);

    const sketchesResult = await sketchService.getAccessibleSketches(user.uid, userTeams);
    if (sketchesResult.success) {
      setSketches(sketchesResult.sketches);
    }
    
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newSketchData.title.trim()) {
      alert('Введите название');
      return;
    }

    setCreating(true);
    const result = await sketchService.createSketch(newSketchData, user.uid);
    
    if (result.success) {
      setNewSketchData({ title: '', description: '' });
      setCreateDialogOpen(false);
      await loadData();
    } else {
      alert(result.message || 'Ошибка при создании наброска');
    }
    setCreating(false);
  };

  const handleDelete = async (sketchId) => {
    if (window.confirm('Удалить набросок?')) {
      await sketchService.deleteSketch(sketchId);
      loadData();
    }
  };

  if (loading) {
    return (
      <MainLayout title="Наброски">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Наброски">
      <Grid container spacing={2}>
        {sketches.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Description sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                У вас пока нет набросков
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Создать набросок
              </Button>
            </Box>
          </Grid>
        ) : (
          sketches.map((sketch) => (
            <Grid item xs={12} sm={6} md={4} key={sketch.id}>
              <Card
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {sketch.title}
                    </Typography>
                    {sketch.authorId === user.uid && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sketch.id);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                    onClick={() => setSelectedSketch(sketch)}
                  >
                    {sketch.description?.substring(0, 100)}
                    {sketch.description?.length > 100 && '...'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {sketch.authorId === user.uid ? (
                      <Chip label="Мой" color="primary" size="small" />
                    ) : (
                      <Chip label="Общий" size="small" />
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {sketch.createdAt && format(sketch.createdAt.toDate(), 'd MMMM yyyy', { locale: ru })}
                  </Typography>
                </CardContent>

                <Box sx={{ px: 2, pb: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedSketch(sketch)}
                  >
                    Открыть
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать набросок</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Название"
              value={newSketchData.title}
              onChange={(e) => setNewSketchData({ ...newSketchData, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Описание"
              multiline
              rows={4}
              value={newSketchData.description}
              onChange={(e) => setNewSketchData({ ...newSketchData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={creating}>
            Отмена
          </Button>
          <Button 
            onClick={handleCreate} 
            variant="contained" 
            startIcon={<Add />}
            disabled={creating}
          >
            {creating ? 'Создание...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {selectedSketch && (
        <SketchModal
          open={Boolean(selectedSketch)}
          onClose={() => {
            setSelectedSketch(null);
            loadData();
          }}
          sketch={selectedSketch}
          teams={teams}
        />
      )}
    </MainLayout>
  );
}

export default SketchesPage;
