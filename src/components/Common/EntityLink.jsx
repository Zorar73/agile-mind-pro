// src/components/Common/EntityLink.jsx
// Компонент для отображения ссылки на сущность (задача, доска, набросок, команда, пользователь)

import React, { useState, useEffect } from 'react';
import { Chip, Avatar } from '@mui/material';
import {
  CheckBox,
  Dashboard,
  Lightbulb,
  Group,
  Person,
} from '@mui/icons-material';
import taskService from '../../services/task.service';
import boardService from '../../services/board.service';
import sketchService from '../../services/sketch.service';
import teamService from '../../services/team.service';
import userService from '../../services/user.service';

const ENTITY_ICONS = {
  task: CheckBox,
  board: Dashboard,
  sketch: Lightbulb,
  team: Group,
  user: Person,
};

const ENTITY_COLORS = {
  task: 'primary',
  board: 'secondary',
  sketch: 'warning',
  team: 'success',
  user: 'info',
};

/**
 * Компонент ссылки на сущность
 * @param {Object} props
 * @param {string} props.type - Тип сущности (task/board/sketch/team/user)
 * @param {string} props.id - ID сущности
 * @param {Function} props.onClick - Callback клика (если не указан, откроет drawer)
 * @param {string} props.size - Размер (small/medium)
 */
function EntityLink({ type, id, onClick, size = 'small' }) {
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);

  const Icon = ENTITY_ICONS[type] || CheckBox;

  // Загружаем данные сущности
  useEffect(() => {
    const loadEntity = async () => {
      setLoading(true);
      let result;

      switch (type) {
        case 'task':
          result = await taskService.getTask(id);
          if (result.success) {
            setEntity({ title: result.task.title });
          }
          break;

        case 'board':
          result = await boardService.getBoard(id);
          if (result.success) {
            setEntity({ title: result.board.title });
          }
          break;

        case 'sketch':
          result = await sketchService.getSketch(id);
          if (result.success) {
            setEntity({ title: result.sketch.title });
          }
          break;

        case 'team':
          result = await teamService.getTeam(id);
          if (result.success) {
            setEntity({ title: result.team.name });
          }
          break;

        case 'user':
          result = await userService.getUser(id);
          if (result.success) {
            setEntity({
              title: `${result.user.firstName} ${result.user.lastName}`,
              avatar: result.user.avatar,
            });
          }
          break;

        default:
          break;
      }

      setLoading(false);
    };

    if (id) {
      loadEntity();
    }
  }, [type, id]);

  const handleClick = (e) => {
    e.preventDefault();

    if (onClick) {
      onClick(type, id);
    } else {
      // По умолчанию открываем drawer через событие
      window.dispatchEvent(
        new CustomEvent('openEntityDrawer', {
          detail: { type, id },
        })
      );
    }
  };

  if (loading) {
    return (
      <Chip
        size={size}
        label="Загрузка..."
        variant="outlined"
        sx={{ cursor: 'pointer' }}
      />
    );
  }

  if (!entity) {
    return (
      <Chip
        size={size}
        label="Не найдено"
        variant="outlined"
        color="error"
        sx={{ cursor: 'not-allowed' }}
      />
    );
  }

  return (
    <Chip
      size={size}
      icon={type === 'user' ? undefined : <Icon fontSize="small" />}
      avatar={
        type === 'user' ? (
          <Avatar src={entity.avatar} sx={{ width: 20, height: 20 }}>
            {entity.title?.[0]}
          </Avatar>
        ) : undefined
      }
      label={entity.title}
      onClick={handleClick}
      color={ENTITY_COLORS[type]}
      variant="outlined"
      sx={{
        cursor: 'pointer',
        '&:hover': {
          bgcolor: `${ENTITY_COLORS[type]}.light`,
          opacity: 0.8,
        },
      }}
    />
  );
}

export default EntityLink;
