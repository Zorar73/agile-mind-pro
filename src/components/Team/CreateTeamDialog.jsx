import React, { useState, useContext, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Avatar,
  Grid,
  Typography,
} from '@mui/material';
import { Add, Image } from '@mui/icons-material';
import { UserContext } from '../../App';
import teamService from '../../services/team.service';
import userService from '../../services/user.service';

const TEAM_AVATARS = [
  '🚀', '⭐', '🎯', '💡', '🔥', '⚡', '🌟', '🎨',
  '🏆', '💪', '🎪', '🌈', '🎭', '🎬', '🎮', '🎲'
];

function CreateTeamDialog({ open, onClose, onCreated }) {
  const { user } = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '🚀',
    members: [],
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    const result = await userService.getAllUsers();
    if (result.success) {
      // Фильтруем текущего пользователя
      setUsers(result.users.filter(u => u.id !== user.uid && u.role !== 'pending'));
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError('Введите название команды');
      return;
    }

    setLoading(true);
    setError('');

    const result = await teamService.createTeam(formData, user.uid);
    
    if (result.success) {
      // Отправить приглашения выбранным пользователям
      for (const userId of formData.members) {
        await teamService.inviteUser(result.id, userId, user.uid);
      }

      setFormData({ name: '', description: '', image: '🚀', members: [] });
      setLoading(false);
      onCreated();
      onClose();
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создать команду</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          
          {/* Выбор аватарки */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Аватар команды
            </Typography>
            <Grid container spacing={1}>
              {TEAM_AVATARS.map((emoji) => (
                <Grid item key={emoji}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      cursor: 'pointer',
                      border: formData.image === emoji ? '2px solid' : 'none',
                      borderColor: 'primary.main',
                      bgcolor: formData.image === emoji ? 'action.selected' : 'background.paper',
                      fontSize: '1.5rem',
                    }}
                    onClick={() => setFormData({ ...formData, image: emoji })}
                  >
                    {emoji}
                  </Avatar>
                </Grid>
              ))}
            </Grid>
          </Box>

          <TextField
            autoFocus
            fullWidth
            label="Название команды"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <TextField
            fullWidth
            label="Описание"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Выбор участников */}
          <FormControl fullWidth>
            <InputLabel>Пригласить участников</InputLabel>
            <Select
              multiple
              value={formData.members}
              onChange={(e) => setFormData({ ...formData, members: e.target.value })}
              input={<OutlinedInput label="Пригласить участников" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((userId) => {
                    const selectedUser = users.find(u => u.id === userId);
                    return (
                      <Chip
                        key={userId}
                        label={`${selectedUser?.firstName} ${selectedUser?.lastName}`}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.position})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button 
          onClick={handleCreate} 
          variant="contained" 
          startIcon={<Add />}
          disabled={loading}
        >
          {loading ? 'Создание...' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateTeamDialog;
