// src/components/Dashboard/widgets/StatsWidget.jsx
import React from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import WidgetWrapper from './WidgetWrapper';

const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
  coral: '#FF6B6B',
};

const STAT_ITEMS = [
  { key: 'boards', label: 'Досок', color: bauhaus.blue, icon: '📋' },
  { key: 'completed', label: 'Выполнено', color: bauhaus.teal, icon: '✅' },
  { key: 'overdue', label: 'Просрочено', color: bauhaus.red, icon: '⚠️' },
  { key: 'progress', label: 'Прогресс', color: bauhaus.purple, icon: '📈', isPercent: true },
];

function StatsWidget({ widget, stats, isEditMode, onRemove, onOpenConfig, onResize, onNavigate }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const { width, height, config = {} } = widget;
  const cells = width * height;
  
  // Определяем режим отображения
  const isMini = cells === 1;
  const isCompact = cells <= 2;
  const showGraph = height >= 2 && width >= 2;
  
  // Какие показатели показывать
  const visibleStats = config.visibleStats || ['boards', 'completed', 'overdue', 'progress'];
  const filteredItems = STAT_ITEMS.filter(item => visibleStats.includes(item.key));
  
  // Сколько показателей влезает
  const maxItems = isMini ? 1 : isCompact ? Math.min(width, 2) : Math.min(width, 4);
  const displayItems = filteredItems.slice(0, maxItems);

  const getValue = (key) => {
    switch (key) {
      case 'boards': return stats.boards || 0;
      case 'completed': return stats.completed || 0;
      case 'overdue': return stats.overdue || 0;
      case 'progress': return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      default: return 0;
    }
  };

  // Мини-карточка
  const MiniStat = ({ item }) => (
    <Box
      onClick={() => onNavigate?.('/my-tasks')}
      sx={{
        bgcolor: item.color,
        borderRadius: 2,
        p: 2,
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        '&:hover': { transform: 'scale(1.02)' },
        transition: 'transform 0.2s',
      }}
    >
      <Typography variant="h3" fontWeight={700} color="white">
        {getValue(item.key)}{item.isPercent ? '%' : ''}
      </Typography>
      <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
        {item.label}
      </Typography>
    </Box>
  );

  // Компактная карточка
  const CompactStat = ({ item }) => (
    <Card
      onClick={() => onNavigate?.('/my-tasks')}
      sx={{
        bgcolor: item.color,
        flex: { xs: '1 1 100%', sm: 1 },
        minWidth: { xs: 0, sm: 100 },
        cursor: 'pointer',
        '&:hover': { transform: 'translateY(-2px)' },
        transition: 'transform 0.2s',
      }}
    >
      <CardContent sx={{ py: { xs: 1, sm: 1.5 }, px: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
        <Typography variant="h4" fontWeight={700} color="white" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {getValue(item.key)}{item.isPercent ? '%' : ''}
        </Typography>
        <Typography variant="caption" color="white" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
          {item.label}
        </Typography>
      </CardContent>
    </Card>
  );

  // График прогресса (для больших виджетов)
  const ProgressGraph = () => {
    const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const weekData = stats.weekProgress || [20, 35, 45, 40, 55, 60, progress]; // Моковые данные или реальные
    
    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'grey.50', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" fontWeight={600}>Прогресс за неделю</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {progress > 50 ? <TrendingUp color="success" fontSize="small" /> : progress < 30 ? <TrendingDown color="error" fontSize="small" /> : <Remove color="action" fontSize="small" />}
            <Typography variant="body2" fontWeight={700} color={progress > 50 ? 'success.main' : progress < 30 ? 'error.main' : 'text.secondary'}>
              {progress}%
            </Typography>
          </Box>
        </Box>
        
        {/* Простой бар-график */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 60 }}>
          {weekData.map((value, idx) => (
            <Box
              key={idx}
              sx={{
                flex: 1,
                height: `${value}%`,
                bgcolor: idx === weekData.length - 1 ? bauhaus.blue : isDark ? 'rgba(255,255,255,0.1)' : 'grey.300',
                borderRadius: 1,
                transition: 'height 0.3s',
              }}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, idx) => (
            <Typography key={idx} variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'center' }}>
              {day}
            </Typography>
          ))}
        </Box>
        
        {/* Итоговый прогресс-бар */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Всего задач: {stats.total || 0}</Typography>
            <Typography variant="caption" color="text.secondary">Выполнено: {stats.completed || 0}</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${bauhaus.teal}, ${bauhaus.blue})`,
              },
            }}
          />
        </Box>
      </Box>
    );
  };

  return (
    <WidgetWrapper
      widget={widget}
      title={!isMini ? "Статистика" : null}
      icon={!isMini ? <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: bauhaus.blue }} /> : null}
      isEditMode={isEditMode}
      onRemove={onRemove}
      onOpenConfig={onOpenConfig}
      onResize={onResize}
    >
      {isMini ? (
        <MiniStat item={displayItems[0] || STAT_ITEMS[0]} />
      ) : (
        <Box>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            flexWrap: 'wrap',
          }}>
            {displayItems.map(item => (
              <CompactStat key={item.key} item={item} />
            ))}
          </Box>
          {showGraph && <ProgressGraph />}
        </Box>
      )}
    </WidgetWrapper>
  );
}

export default StatsWidget;
