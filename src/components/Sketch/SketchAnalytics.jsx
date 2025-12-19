// src/components/Sketch/SketchAnalytics.jsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  useTheme,
} from '@mui/material';

// Bauhaus цвета
const bauhaus = {
  blue: '#1E88E5',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

function SketchAnalytics({ sketches = [], sharedSketches = [] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const totalSketches = sketches.length;
  const sharedCount = sharedSketches.length;
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const recentSketches = sketches.filter(s => {
    const date = s.createdAt?.toDate?.() || new Date(s.createdAt);
    return date > weekAgo;
  });

  const tagCount = {};
  [...sketches, ...sharedSketches].forEach(sketch => {
    (sketch.tags || []).forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const uniqueTagsCount = Object.keys(tagCount).length;

  const StatCard = ({ value, label, color }) => (
    <Card 
      sx={{ 
        bgcolor: color,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 50,
          height: 50,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.2)',
          top: -15,
          right: -15,
        }}
      />
      <CardContent sx={{ position: 'relative', zIndex: 1, py: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="h4" fontWeight="700" color="white">
          {value}
        </Typography>
        <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
        gap: 2, 
        mb: 2 
      }}>
        <StatCard value={totalSketches} label="Всего набросков" color={bauhaus.yellow} />
        <StatCard value={sharedCount} label="Поделились со мной" color={bauhaus.purple} />
        <StatCard value={recentSketches.length} label="За неделю" color={bauhaus.teal} />
        <StatCard value={uniqueTagsCount} label="Уникальных тегов" color={bauhaus.blue} />
      </Box>

      {topTags.length > 0 && (
        <Card sx={{ 
          bgcolor: isDark ? 'background.paper' : 'white',
          borderRadius: 2,
          boxShadow: isDark ? 'none' : 1,
          border: isDark ? '1px solid' : 'none',
          borderColor: 'divider',
        }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Популярные теги
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {topTags.map(([tag, count]) => (
                <Chip
                  key={tag}
                  label={`${tag} (${count})`}
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'grey.100',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default SketchAnalytics;
