// src/components/Sprint/SprintStats.jsx
// Замена BurndownChart на статистику спринта
import React from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, useTheme } from '@mui/material';
import { CheckCircle, Schedule, TrendingUp, Assignment } from '@mui/icons-material';

const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

function SprintStats({ sprint, tasks = [] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Задачи спринта
  const sprintTasks = tasks.filter(t => t.sprintId === sprint?.id);
  const totalTasks = sprintTasks.length;
  const doneTasks = sprintTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = sprintTasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = totalTasks - doneTasks - inProgressTasks;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Дни до конца
  const daysLeft = sprint?.endDate
    ? Math.max(0, Math.ceil((new Date(sprint.endDate.toDate ? sprint.endDate.toDate() : sprint.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  const StatCard = ({ icon: Icon, value, label, color }) => (
    <Card sx={{ bgcolor: isDark ? 'background.paper' : 'white', borderRadius: 2, border: isDark ? '1px solid' : 'none', borderColor: 'divider', boxShadow: isDark ? 'none' : 1 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon sx={{ color, fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color={color}>{value}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Статистика спринта</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 2 }}>
        <StatCard icon={Assignment} value={totalTasks} label="Всего" color={bauhaus.blue} />
        <StatCard icon={CheckCircle} value={doneTasks} label="Готово" color={bauhaus.teal} />
        <StatCard icon={TrendingUp} value={inProgressTasks} label="В работе" color={bauhaus.purple} />
        <StatCard icon={Schedule} value={daysLeft} label="Дней" color={daysLeft <= 2 ? bauhaus.red : bauhaus.yellow} />
      </Box>

      <Card sx={{ bgcolor: isDark ? 'background.paper' : 'white', borderRadius: 2, border: isDark ? '1px solid' : 'none', borderColor: 'divider', boxShadow: isDark ? 'none' : 1 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>Прогресс</Typography>
            <Typography variant="body2" fontWeight={700} color="primary">{completionRate}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{ height: 8, borderRadius: 4, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'grey.200', '& .MuiLinearProgress-bar': { borderRadius: 4, background: `linear-gradient(90deg, ${bauhaus.teal}, ${bauhaus.blue})` } }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">К выполнению: {todoTasks}</Typography>
            <Typography variant="caption" color="text.secondary">В работе: {inProgressTasks}</Typography>
            <Typography variant="caption" color="text.secondary">Готово: {doneTasks}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SprintStats;
