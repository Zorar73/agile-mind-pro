// src/components/Board/BoardFilters.jsx
import React, { useState, useMemo } from 'react';
import { debounce } from '../../utils/debounce';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  AvatarGroup,
  Tooltip,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Typography,
} from '@mui/material';
import {
  Search,
  Close,
  FilterList,
  Person,
  Label,
} from '@mui/icons-material';

function BoardFilters({
  users,
  allTags,
  filters,
  onFiltersChange,
  currentUserId,
}) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  // Debounced версия onFiltersChange для поиска (задержка 300ms)
  // Это предотвращает лишние вычисления фильтрации при каждом нажатии клавиши
  const debouncedFilterChange = useMemo(
    () => debounce((newFilters) => {
      onFiltersChange(newFilters);
    }, 300),
    [onFiltersChange]
  );

  const handleSearchChange = (value) => {
    // Обновляем локальное состояние сразу (для моментального отклика UI)
    setSearchValue(value);
    // Но фактическую фильтрацию откладываем на 300ms
    debouncedFilterChange({ ...filters, search: value });
  };

  const handleClearSearch = () => {
    setSearchValue('');
    onFiltersChange({ ...filters, search: '' });
  };

  const toggleAssignee = (userId) => {
    const current = filters.assignees || [];
    const updated = current.includes(userId)
      ? current.filter(id => id !== userId)
      : [...current, userId];
    
    onFiltersChange({ ...filters, assignees: updated });
  };

  const toggleTag = (tag) => {
    const current = filters.tags || [];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    
    onFiltersChange({ ...filters, tags: updated });
  };

  const toggleMyTasks = () => {
    onFiltersChange({ ...filters, myTasks: !filters.myTasks });
  };

  const clearAllFilters = () => {
    setSearchValue('');
    onFiltersChange({
      search: '',
      assignees: [],
      tags: [],
      myTasks: false,
    });
  };

  const hasActiveFilters = 
    searchValue || 
    (filters.assignees?.length > 0) || 
    (filters.tags?.length > 0) || 
    filters.myTasks;

  const usersArray = Object.values(users);
  const selectedUsers = usersArray.filter(u => filters.assignees?.includes(u.id));

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* Поиск */}
      <TextField
        size="small"
        placeholder="Поиск задач..."
        value={searchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ minWidth: 200 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClearSearch}>
                <Close fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Фильтр по исполнителям */}
      {selectedUsers.length > 0 && (
        <AvatarGroup max={3} sx={{ ml: 1 }}>
          {selectedUsers.map(user => (
            <Tooltip key={user.id} title={`${user.firstName} ${user.lastName}`}>
              <Avatar sx={{ width: 32, height: 32, cursor: 'pointer' }}>
                {user.firstName?.charAt(0)}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
      )}

      {/* Активные теги */}
      {filters.tags?.map(tag => (
        <Chip
          key={tag}
          label={tag}
          size="small"
          onDelete={() => toggleTag(tag)}
          color="primary"
          variant="outlined"
        />
      ))}

      {/* Мои задачи */}
      {filters.myTasks && (
        <Chip
          label="Мои задачи"
          size="small"
          onDelete={toggleMyTasks}
          color="primary"
        />
      )}

      {/* Кнопка фильтров */}
      <Button
        size="small"
        startIcon={<FilterList />}
        onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
        variant={hasActiveFilters ? 'contained' : 'outlined'}
      >
        Фильтры
      </Button>

      {/* Очистить всё */}
      {hasActiveFilters && (
        <Button
          size="small"
          onClick={clearAllFilters}
          color="error"
          variant="text"
        >
          Очистить
        </Button>
      )}

      {/* Меню фильтров */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{
          sx: { minWidth: 300, maxHeight: 500 }
        }}
      >
        {/* Мои задачи */}
        <MenuItem>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.myTasks || false}
                onChange={toggleMyTasks}
              />
            }
            label="Только мои задачи"
          />
        </MenuItem>

        <Divider />

        {/* Исполнители */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            <Person fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
            Исполнители
          </Typography>
          {usersArray.map(user => (
            <MenuItem key={user.id} dense onClick={() => toggleAssignee(user.id)}>
              <Checkbox
                checked={filters.assignees?.includes(user.id) || false}
                size="small"
              />
              <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                {user.firstName?.charAt(0)}
              </Avatar>
              <Typography variant="body2">
                {user.firstName} {user.lastName}
              </Typography>
            </MenuItem>
          ))}
        </Box>

        {allTags.length > 0 && (
          <>
            <Divider />
            
            {/* Теги */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Label fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                Теги
              </Typography>
              {allTags.map(tag => (
                <MenuItem key={tag} dense onClick={() => toggleTag(tag)}>
                  <Checkbox
                    checked={filters.tags?.includes(tag) || false}
                    size="small"
                  />
                  <Chip label={tag} size="small" variant="outlined" />
                </MenuItem>
              ))}
            </Box>
          </>
        )}
      </Menu>
    </Box>
  );
}

export default BoardFilters;
