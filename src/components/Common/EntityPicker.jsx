// src/components/Common/EntityPicker.jsx
// Компонент для выбора сущности (задача, доска, команда, набросок, пользователь)

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  CheckBox,
  Dashboard,
  Lightbulb,
  Group,
  Person,
  Search,
} from '@mui/icons-material';
import taskService from '../../services/task.service';
import boardService from '../../services/board.service';
import sketchService from '../../services/sketch.service';
import teamService from '../../services/team.service';
import userService from '../../services/user.service';

const ENTITY_TABS = [
  { type: 'task', label: 'Задачи', icon: CheckBox },
  { type: 'board', label: 'Доски', icon: Dashboard },
  { type: 'sketch', label: 'Наброски', icon: Lightbulb },
  { type: 'team', label: 'Команды', icon: Group },
  { type: 'user', label: 'Пользователи', icon: Person },
];

/**
 * Компонент выбора сущности
 * @param {Object} props
 * @param {boolean} props.open - Открыт ли диалог
 * @param {Function} props.onClose - Callback закрытия
 * @param {Function} props.onSelect - Callback выбора (type, entity)
 * @param {string} props.userId - ID текущего пользователя
 */
function EntityPicker({ open, onClose, onSelect, userId }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentType = ENTITY_TABS[selectedTab].type;

  // Загружаем сущности при смене таба
  useEffect(() => {
    if (!open) return;

    const loadEntities = async () => {
      setLoading(true);
      setSearchQuery('');
      let result;

      switch (currentType) {
        case 'task':
          result = await taskService.getUserTasks(userId);
          if (result.success) {
            setEntities(result.tasks);
          }
          break;

        case 'board':
          result = await boardService.getUserBoards(userId);
          if (result.success) {
            setEntities(result.boards);
          }
          break;

        case 'sketch':
          result = await sketchService.getUserSketches(userId);
          if (result.success) {
            setEntities(result.sketches);
          }
          break;

        case 'team':
          result = await teamService.getUserTeams(userId);
          if (result.success) {
            setEntities(result.teams);
          }
          break;

        case 'user':
          result = await userService.getAllUsers();
          if (result.success) {
            setEntities(result.users.filter(u => u.id !== userId));
          }
          break;

        default:
          break;
      }

      setLoading(false);
    };

    loadEntities();
  }, [open, selectedTab, userId]);

  const handleSelect = (entity) => {
    onSelect(currentType, entity);
    onClose();
  };

  // Фильтрация сущностей по поисковому запросу
  const filteredEntities = entities.filter(entity => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();

    switch (currentType) {
      case 'task':
        return entity.title?.toLowerCase().includes(query);
      case 'board':
        return entity.title?.toLowerCase().includes(query);
      case 'sketch':
        return entity.title?.toLowerCase().includes(query);
      case 'team':
        return entity.name?.toLowerCase().includes(query);
      case 'user':
        return (
          `${entity.firstName} ${entity.lastName}`.toLowerCase().includes(query) ||
          entity.email?.toLowerCase().includes(query)
        );
      default:
        return true;
    }
  });

  // Получение отображаемого имени
  const getEntityName = (entity) => {
    switch (currentType) {
      case 'user':
        return `${entity.firstName} ${entity.lastName}`;
      case 'team':
        return entity.name;
      default:
        return entity.title;
    }
  };

  // Получение дополнительной информации
  const getEntitySecondary = (entity) => {
    switch (currentType) {
      case 'user':
        return entity.email;
      case 'team':
        return `${Object.keys(entity.members || {}).length} участников`;
      case 'task':
        return entity.description?.substring(0, 50) || 'Нет описания';
      default:
        return entity.description?.substring(0, 50) || '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Выберите сущность для вставки</DialogTitle>

      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {ENTITY_TABS.map((tab, index) => {
          const TabIcon = tab.icon;
          return (
            <Tab
              key={tab.type}
              label={tab.label}
              icon={<TabIcon fontSize="small" />}
              iconPosition="start"
            />
          );
        })}
      </Tabs>

      <DialogContent>
        {/* Поиск */}
        <TextField
          fullWidth
          size="small"
          placeholder={`Поиск ${ENTITY_TABS[selectedTab].label.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Список */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredEntities.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            {searchQuery ? 'Ничего не найдено' : 'Нет доступных элементов'}
          </Typography>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredEntities.map((entity) => (
              <ListItem key={entity.id} disablePadding>
                <ListItemButton onClick={() => handleSelect(entity)}>
                  <ListItemAvatar>
                    <Avatar
                      src={currentType === 'user' ? entity.avatar : undefined}
                      sx={{ bgcolor: 'primary.main' }}
                    >
                      {currentType === 'user'
                        ? entity.firstName?.[0]
                        : getEntityName(entity)?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={getEntityName(entity)}
                    secondary={getEntitySecondary(entity)}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EntityPicker;
