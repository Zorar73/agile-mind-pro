// src/components/Dashboard/widgets/TeamsWidget.jsx
import React from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, Chip, Avatar, AvatarGroup } from '@mui/material';
import { Group, ArrowForward } from '@mui/icons-material';
import WidgetWrapper from './WidgetWrapper';

const bauhaus = { purple: '#7E57C2' };

function TeamsWidget({ widget, teams, isEditMode, onRemove, onOpenConfig, onResize, onTeamClick, onNavigate }) {
  const { width, height } = widget;
  const cells = width * height;
  
  const isMini = cells === 1;
  const isCompact = cells <= 2;
  const maxTeams = isMini ? 0 : isCompact ? 2 : Math.min(cells * 2, 6);
  const displayTeams = teams.slice(0, maxTeams);

  // Мини режим
  if (isMini) {
    return (
      <WidgetWrapper widget={widget} isEditMode={isEditMode} onRemove={onRemove} onOpenConfig={onOpenConfig} onResize={onResize}>
        <Box
          onClick={() => onNavigate?.('/team')}
          sx={{
            bgcolor: bauhaus.purple,
            borderRadius: 2,
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { transform: 'scale(1.02)' },
          }}
        >
          <Typography variant="h3" fontWeight={700} color="white">{teams.length}</Typography>
          <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>Команд</Typography>
        </Box>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper
      widget={widget}
      title="Команды"
      icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: bauhaus.purple }} />}
      isEditMode={isEditMode}
      onRemove={onRemove}
      onOpenConfig={onOpenConfig}
      onResize={onResize}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, mt: -1 }}>
        <Button size="small" endIcon={<ArrowForward />} onClick={() => onNavigate?.('/team')}>Все</Button>
      </Box>

      {teams.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Group sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">Вы не состоите в командах</Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {displayTeams.map(team => {
            const memberCount = Object.keys(team.members || {}).length;
            return (
              <Card
                key={team.id}
                onClick={() => onTeamClick?.(team.id)}
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
              >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: bauhaus.purple, width: 36, height: 36 }}>
                        {team.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{team.name}</Typography>
                        {!isCompact && team.description && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                            {team.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Chip
                      label={`${memberCount} уч.`}
                      size="small"
                      sx={{ bgcolor: `${bauhaus.purple}15`, color: bauhaus.purple }}
                    />
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </WidgetWrapper>
  );
}

export default TeamsWidget;
