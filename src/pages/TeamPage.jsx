import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Fab,
  Badge,
} from '@mui/material';
import {
  Add,
  Group,
  People,
  Phone,
  Email,
  WhatsApp,
  Telegram,
} from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import { UserContext } from '../App';
import userService from '../services/user.service';
import teamService from '../services/team.service';
import boardService from '../services/board.service';
import UserProfileModal from '../components/Team/UserProfileModal';
import CreateTeamDialog from '../components/Team/CreateTeamDialog';
import TeamCard from '../components/Team/TeamCard';
import { generateLetterAvatar } from '../utils/avatarGenerator';

function TeamPage() {
  const { user } = useContext(UserContext);
  
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    // Загрузка пользователей
    const usersResult = await userService.getAllUsers();
    if (usersResult.success) {
      setUsers(usersResult.users.filter(u => u.role !== 'pending'));
    }

    // Загрузка команд
    const teamsResult = await teamService.getUserTeams(user.uid);
    if (teamsResult.success) {
      setTeams(teamsResult.teams);
    }
  };

  const handleUserClick = (clickedUser) => {
    setSelectedUser(clickedUser);
    setProfileModalOpen(true);
  };

  const getAvatarSrc = (userData) => {
    if (userData.avatar === 'generated' || !userData.avatar) {
      return generateLetterAvatar(userData.firstName, userData.lastName);
    }
    if (userData.avatar?.startsWith('default-')) {
      const num = userData.avatar.replace('default-', '');
      return `/avatars/avatar-${num}.svg`;
    }
    return userData.avatar;
  };

  const filteredUsers = users.filter(u =>
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout title="Команда">
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<People />} label="Все пользователи" />
        <Tab icon={<Group />} label={`Мои команды (${teams.length})`} />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <TextField
            fullWidth
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Grid container spacing={2}>
            {filteredUsers.map((u) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={u.id}>
                <Card
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                  onClick={() => handleUserClick(u)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={getAvatarSrc(u)}
                        sx={{ width: 80, height: 80 }}
                      />
                      <Typography variant="h6" textAlign="center">
                        {u.firstName} {u.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        {u.position}
                      </Typography>
                      <Chip
                        label={u.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        color={u.role === 'admin' ? 'error' : 'success'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Grid container spacing={2}>
            {teams.map((team) => (
              <Grid item xs={12} sm={6} md={4} key={team.id}>
                <TeamCard team={team} onUpdate={loadData} />
              </Grid>
            ))}
          </Grid>

          {teams.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Group sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                У вас пока нет команд
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateTeamOpen(true)}
                sx={{ mt: 2 }}
              >
                Создать команду
              </Button>
            </Box>
          )}
        </Box>
      )}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => activeTab === 1 ? setCreateTeamOpen(true) : null}
      >
        <Add />
      </Fab>

      {selectedUser && (
        <UserProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={selectedUser}
          currentUser={user}
        />
      )}

      <CreateTeamDialog
        open={createTeamOpen}
        onClose={() => setCreateTeamOpen(false)}
        onCreated={loadData}
      />
    </MainLayout>
  );
}

export default TeamPage;