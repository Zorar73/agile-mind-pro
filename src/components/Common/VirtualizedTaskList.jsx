// src/components/Common/VirtualizedTaskList.jsx
// Виртуализированный список задач для повышения производительности
import React from 'react';
import { FixedSizeList } from 'react-window';
import { Box, useTheme } from '@mui/material';
import TaskCard from '../Board/TaskCard';

function VirtualizedTaskList({
  tasks = [],
  onTaskClick,
  onTaskUpdate,
  height = 600,
  itemHeight = 120,
  ...taskCardProps
}) {
  const theme = useTheme();

  const Row = ({ index, style }) => {
    const task = tasks[index];
    if (!task) return null;

    return (
      <div style={{ ...style, padding: '8px' }}>
        <TaskCard
          task={task}
          onClick={() => onTaskClick?.(task)}
          onUpdate={onTaskUpdate}
          {...taskCardProps}
        />
      </div>
    );
  };

  if (tasks.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 200,
          color: 'text.secondary',
        }}
      >
        Задач нет
      </Box>
    );
  }

  return (
    <FixedSizeList
      height={height}
      itemCount={tasks.length}
      itemSize={itemHeight}
      width="100%"
      style={{
        overflowX: 'hidden',
      }}
    >
      {Row}
    </FixedSizeList>
  );
}

export default VirtualizedTaskList;
