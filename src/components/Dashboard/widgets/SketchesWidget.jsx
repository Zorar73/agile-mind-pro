// src/components/Dashboard/widgets/SketchesWidget.jsx
import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, IconButton, Chip } from '@mui/material';
import { Lightbulb, ArrowForward, Add, Note } from '@mui/icons-material';
import WidgetWrapper from './WidgetWrapper';

const bauhaus = { yellow: '#FDD835' };

function SketchesWidget({ widget, sketches, isEditMode, onRemove, onOpenConfig, onResize, onSketchClick, onNavigate, onCreateSketch }) {
  const { width, height } = widget;
  const cells = width * height;
  
  const isMini = cells === 1;
  const isCompact = cells <= 2;
  const maxSketches = isMini ? 0 : isCompact ? 2 : Math.min(cells * 2, 6);
  const displaySketches = sketches.slice(0, maxSketches);

  // Мини режим
  if (isMini) {
    return (
      <WidgetWrapper widget={widget} isEditMode={isEditMode} onRemove={onRemove} onOpenConfig={onOpenConfig} onResize={onResize}>
        <Box
          onClick={() => onNavigate?.('/sketches')}
          sx={{
            bgcolor: bauhaus.yellow,
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
          <Typography variant="h3" fontWeight={700} color="rgba(0,0,0,0.8)">{sketches.length}</Typography>
          <Typography variant="body2" color="rgba(0,0,0,0.7)">Набросков</Typography>
        </Box>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper
      widget={widget}
      title="Наброски"
      icon={<Box sx={{ width: 8, height: 8, bgcolor: bauhaus.yellow, transform: 'rotate(45deg)' }} />}
      isEditMode={isEditMode}
      onRemove={onRemove}
      onOpenConfig={onOpenConfig}
      onResize={onResize}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mb: 1, mt: -1 }}>
        <IconButton size="small" onClick={onCreateSketch} sx={{ bgcolor: `${bauhaus.yellow}30` }}>
          <Add fontSize="small" />
        </IconButton>
        <Button size="small" endIcon={<ArrowForward />} onClick={() => onNavigate?.('/sketches')}>Все</Button>
      </Box>

      {sketches.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Lightbulb sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" gutterBottom>Нет набросков</Typography>
          <Button variant="contained" size="small" startIcon={<Add />} onClick={onCreateSketch} sx={{ borderRadius: 50, bgcolor: bauhaus.yellow, color: 'rgba(0,0,0,0.8)', '&:hover': { bgcolor: '#E6C200' } }}>
            Создать
          </Button>
        </Box>
      ) : (
        <Grid container spacing={1}>
          {displaySketches.map(sketch => (
            <Grid item xs={width >= 3 ? 4 : 6} key={sketch.id}>
              <Card
                onClick={() => onSketchClick?.(sketch.id)}
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
              >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body2" fontWeight={600} noWrap>{sketch.title || 'Без названия'}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    {sketch.type === 'idea' ? (
                      <Chip icon={<Lightbulb sx={{ fontSize: 14 }} />} label="Идея" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    ) : (
                      <Chip icon={<Note sx={{ fontSize: 14 }} />} label="Заметка" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </WidgetWrapper>
  );
}

export default SketchesWidget;
