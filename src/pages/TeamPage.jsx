// src/pages/TeamPage.jsx
// Исправлено: клик на команду открывает TeamDrawer вместо чата
import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Button, Card, CardContent, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Chip, List, ListItem, ListItemAvatar, ListItemText, ListItemButton, Stack, Tabs, Tab, useTheme,
} from '@mui/material';
import { Add, Group } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import TeamDrawer from '../components/Team/TeamDrawer';
import UserProfileDrawer from '../components/User/UserProfileDrawer';
import teamService from '../services/team.service';
import userService from '../services/user.service';

function TeamPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { teamId } = useParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [userProfileDrawerOpen, setUserProfileDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  const [newTeamData, setNewTeamData] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = teamService.subscribeToUserTeams(user.uid, setTeams);
    loadAllUsers();
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (teamId && teams.length > 0) {
      const team = teams.find(t => t.id === teamId);
      if (team) {
        setSelectedTeamId(teamId);
        setTeamDrawerOpen(true);
      }
    }
  }, [teamId, teams]);

  const loadAllUsers = async () => {
    const result = await userService.getApprovedUsers();
    if (result.success) setAllUsers(result.users);
  };

  const handleCreateTeam = async () => {
    if (!newTeamData.name.trim()) return;
    const result = await teamService.createTeam(newTeamData.name, newTeamData.description, user.uid);
    if (result.success) {
      setCreateDialogOpen(false);
      setNewTeamData({ name: '', description: '' });
    }
  };

  const handleSelectTeam = (team) => {
    setSelectedTeamId(team.id);
    setTeamDrawerOpen(true);
    navigate(`/team/${team.id}`);
  };

  const handleMemberClick = (memberId) => {
    setSelectedUserId(memberId);
    setUserProfileDrawerOpen(true);
  };

  const handleCloseTeamDrawer = () => {
    setTeamDrawerOpen(false);
    setSelectedTeamId(null);
    navigate('/team');
  };

  const isLeader = (team) => {
    const role = team?.members?.[user.uid];
    return role === 'leader' || role === 'owner' || role === 'admin';
  };

  return (
    <MainLayout title="Команды">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Команды</Typography>
            <Typography variant="body2" color="text.secondary">Совместная работа и общение</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)} sx={{ borderRadius: 50 }}>
            Создать
          </Button>
        </Box>

        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
          <Tab label={`Мои команды (${teams.length})`} />
          <Tab label="Коллеги" />
        </Tabs>

        {currentTab === 0 && (
          <Box>
            {teams.length === 0 ? (
              <Card sx={{ textAlign: 'center', py: 6 }}>
                <Group sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>Вы не состоите в командах</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Создайте команду для совместной работы</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)} sx={{ borderRadius: 50 }}>
                  Создать команду
                </Button>
              </Card>
            ) : (
              <Stack spacing={1.5}>
                {teams.map((team) => (
                  <Card
                    key={team.id}
                    sx={{
                      bgcolor: selectedTeamId === team.id ? isDark ? 'rgba(100, 181, 246, 0.12)' : 'rgba(30, 136, 229, 0.08)' : 'background.paper',
                      border: selectedTeamId === team.id ? '2px solid' : '1px solid',
                      borderColor: selectedTeamId === team.id ? 'primary.main' : 'divider',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                    }}
                    onClick={() => handleSelectTeam(team)}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontSize: '1.2rem', fontWeight: 600 }}>
                          {team.name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={600} noWrap>{team.name}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {Object.keys(team.members || {}).length} участников
                          </Typography>
                        </Box>
                        <Chip size="small" label={isLeader(team) ? 'Лидер' : 'Участник'} color={isLeader(team) ? 'primary' : 'default'} variant="outlined" />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {currentTab === 1 && (
          <Box>
            <List sx={{ p: 0 }}>
              {allUsers.filter(u => u.id !== user.uid).map((u) => (
                <ListItem key={u.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton onClick={() => handleMemberClick(u.id)} sx={{ borderRadius: 2 }}>
                    <ListItemAvatar>
                      <Avatar src={u.avatar} sx={{ bgcolor: 'primary.main' }}>{u.firstName?.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`${u.firstName} ${u.lastName}`} secondary={u.position || 'Нет должности'} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать команду</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Название команды" value={newTeamData.name}
            onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth multiline rows={3} label="Описание (опционально)" value={newTeamData.description}
            onChange={(e) => setNewTeamData({ ...newTeamData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleCreateTeam} variant="contained" disabled={!newTeamData.name.trim()}>Создать</Button>
        </DialogActions>
      </Dialog>

      <TeamDrawer
        open={teamDrawerOpen}
        onClose={handleCloseTeamDrawer}
        teamId={selectedTeamId}
        onUpdate={() => {}}
        onMemberClick={handleMemberClick}
      />

      <UserProfileDrawer
        open={userProfileDrawerOpen}
        onClose={() => setUserProfileDrawerOpen(false)}
        userId={selectedUserId}
      />
    </MainLayout>
  );
}

export default TeamPage;
