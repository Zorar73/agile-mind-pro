// src/components/Sprint/BurndownChart.jsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { eachDayOfInterval, format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';

// Универсальная функция для безопасного преобразования даты
const toSafeDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date.toDate === 'function') return date.toDate();
  if (typeof date === 'string' || typeof date === 'number') return new Date(date);
  return null;
};

function BurndownChart({ sprint, tasks }) {
  if (!sprint || !tasks) return null;

  const startDate = toSafeDate(sprint.startDate);
  const endDate = toSafeDate(sprint.endDate);

  // Защита от null дат
  if (!startDate || !endDate) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">Ошибка: даты спринта не заданы</Typography>
        </CardContent>
      </Card>
    );
  }

  const sprintTasks = tasks.filter(t => sprint.tasks?.includes(t.id));
  const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 1), 0);

  // Генерируем даты спринта
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Идеальная линия выгорания
  const totalDays = days.length;
  const idealBurnPerDay = totalDays > 1 ? totalPoints / (totalDays - 1) : totalPoints;

  // Генерируем данные для графика
  const chartData = days.map((day, index) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);

    // Идеальное значение
    const idealRemaining = Math.max(0, totalPoints - (idealBurnPerDay * index));

    // Фактическое значение (задачи, завершенные до этого дня)
    const completedByDay = sprintTasks.filter(task => {
      if (!task.completedAt || task.status !== 'done') return false;
      const completedDate = toSafeDate(task.completedAt);
      if (!completedDate) return false;
      completedDate.setHours(0, 0, 0, 0);
      return completedDate <= dayStart;
    });

    const completedPoints = completedByDay.reduce((sum, t) => sum + (t.storyPoints || 1), 0);
    const actualRemaining = Math.max(0, totalPoints - completedPoints);

    return {
      date: format(day, 'dd MMM', { locale: ru }),
      ideal: Math.round(idealRemaining * 10) / 10,
      actual: Math.round(actualRemaining * 10) / 10,
    };
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="600">
          Burndown Chart
        </Typography>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          График выгорания Story Points
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: 4,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="#90caf9"
              strokeWidth={2}
              name="Идеальное выгорание"
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#1976d2"
              strokeWidth={3}
              name="Фактическое выгорание"
              dot={{ fill: '#1976d2', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 3, bgcolor: '#90caf9', borderRadius: 1 }} />
            <Typography variant="caption">Идеальное</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 3, bgcolor: '#1976d2', borderRadius: 1 }} />
            <Typography variant="caption">Фактическое</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default BurndownChart;
