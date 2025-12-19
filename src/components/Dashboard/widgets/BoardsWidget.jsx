// src/components/Dashboard/widgets/BoardsWidget.jsx
import React from 'react';
import { Box, Typography, Card, CardContent, Button, Avatar, Chip, Grid } from '@mui/material';
import { ViewKanban, ArrowForward, Add } from '@mui/icons-material';
import WidgetWrapper from './WidgetWrapper';

const bauhaus = { blue: '#1E88E5' };

function BoardsWidget({ widget, boards, isEditMode, onRemove, onOpenConfig, onResize, onNavigate, onCreateBoard }) {
  const { width, height } = widget;
  const cells = width * height;
  
  const isMini = cells === 1;
  const isCompact = cells <= 2;
  const maxBoards = isMini ? 0 : isCompact ? 2 : Math.min(cells * 2, 8);
  const displayBoards = boards.slice(0, maxBoards);

  // Мини режим
  if (isMini) {
    return (
      <WidgetWrapper widget={widget} isEditMode={isEditMode} onRemove={onRemove} onOpenConfig={onOpenConfig} onResize={onResize}>
        <Box
          onClick={() => onNavigate?.('/boards')}
          sx={{
            bgcolor: bauhaus.blue,
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
          <Typography variant="h3" fontWeight={700} color="white">{boards.length}</Typography>
          <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>Досок</Typography>
        </Box>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper
      widget={widget}
      title="Мои доски"
      icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: bauhaus.blue }} />}
      isEditMode={isEditMode}
      onRemove={onRemove}
      onOpenConfig={onOpenConfig}
      onResize={onResize}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, mt: -1 }}>
        <Button size="small" endIcon={<ArrowForward />} onClick={() => onNavigate?.('/boards')}>Все</Button>
      </Box>

      {boards.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <ViewKanban sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" gutterBottom>Нет досок</Typography>
          <Button variant="contained" size="small" startIcon={<Add />} onClick={onCreateBoard} sx={{ borderRadius: 50 }}>
            Создать
          </Button>
        </Box>
      ) : (
        <Grid container spacing={1}>
          {displayBoards.map(board => (
            <Grid item xs={width >= 3 ? 4 : 6} key={board.id}>
              <Card
                onClick={() => onNavigate?.(`/board/${board.id}`)}
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
              >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: board.color || bauhaus.blue, flexShrink: 0 }} />
                    <Typography variant="body2" fontWeight={600} noWrap>{board.title}</Typography>
                  </Box>
                  {!isCompact && (
                    <Typography variant="caption" color="text.secondary">
                      {board.taskCount || 0} задач
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </WidgetWrapper>
  );
}

export default BoardsWidget;
