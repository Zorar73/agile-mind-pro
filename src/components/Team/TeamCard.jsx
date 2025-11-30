import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert,
  Group,
  Chat,
  ExitToApp,
  Delete,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import teamService from '../../services/team.service';

function TeamCard({ team, onUpdate }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const memberCount = Object.keys(team.members || {}).length;
  const isLeader = team.role === 'leader';

  const handleLeave = async () => {
    if (window.confirm('Вы уверены что хотите покинуть команду?')) {
      await teamService.leaveTeam(team.id, team.userId);
      onUpdate();
    }
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    if (window.confirm('Удалить команду? Это действие нельзя отменить.')) {
      await teamService.deleteTeam(team.id, team.userId);
      onUpdate();
    }
    setAnchorEl(null);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Typography variant="h6">{team.name}</Typography>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVert />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {team.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<Group />}
            label={`${memberCount} участников`}
            size="small"
          />
          <Chip
            label={isLeader ? 'Лидер' : 'Участник'}
            color={isLeader ? 'primary' : 'default'}
            size="small"
          />
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          startIcon={<Chat />}
          onClick={() => navigate(`/team/${team.id}/chat`)}
        >
          Чат
        </Button>
        <Button
          size="small"
          onClick={() => navigate(`/team/${team.id}`)}
        >
          Открыть
        </Button>
      </CardActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {isLeader && (
          <MenuItem onClick={() => { navigate(`/team/${team.id}/invite`); setAnchorEl(null); }}>
            <PersonAdd sx={{ mr: 1 }} /> Пригласить участника
          </MenuItem>
        )}
        
        {!isLeader && (
          <MenuItem onClick={handleLeave}>
            <ExitToApp sx={{ mr: 1 }} /> Покинуть команду
          </MenuItem>
        )}
        
        {isLeader && (
          <MenuItem onClick={handleDelete}>
            <Delete sx={{ mr: 1 }} /> Удалить команду
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}

export default TeamCard;