// src/components/Common/MentionInput.jsx
// Универсальный input с поддержкой @mentions пользователей

import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Chip,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

/**
 * Компонент input с поддержкой @mentions
 * @param {Object} props
 * @param {string} props.value - Текст
 * @param {Function} props.onChange - Callback изменения текста
 * @param {Array} props.users - Список пользователей для mentions
 * @param {Array} props.mentions - Текущие упоминания (массив userId)
 * @param {Function} props.onMentionsChange - Callback изменения mentions
 * @param {string} props.placeholder - Placeholder
 * @param {boolean} props.multiline - Многострочный ввод
 * @param {number} props.maxRows - Макс. кол-во строк
 * @param {boolean} props.disabled - Отключен
 * @param {string} props.size - Размер (small/medium)
 */
function MentionInput({
  value,
  onChange,
  users = [],
  mentions = [],
  onMentionsChange,
  placeholder = 'Написать комментарий...',
  multiline = true,
  maxRows = 4,
  disabled = false,
  size = 'small',
  ...textFieldProps
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  const inputRef = useRef(null);
  const anchorRef = useRef(null);

  // Обработка изменения текста
  const handleChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);
    setCursorPosition(cursorPos);

    // Проверяем, начал ли пользователь вводить @mention
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const afterAt = textBeforeCursor.substring(lastAtIndex + 1);

      // Проверяем что после @ нет пробелов (упоминание ещё вводится)
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionQuery(afterAt.toLowerCase());

        // Фильтруем пользователей
        const filtered = users.filter(user => {
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
          return fullName.includes(afterAt.toLowerCase());
        });

        setFilteredUsers(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(0);
        return;
      }
    }

    setShowSuggestions(false);
  };

  // Вставка упоминания
  const insertMention = (user) => {
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);

    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const beforeMention = value.substring(0, lastAtIndex);
    const mentionText = `@${user.firstName} ${user.lastName}`;
    const newText = beforeMention + mentionText + ' ' + textAfterCursor;

    onChange(newText);

    // Добавляем userId в массив mentions
    if (!mentions.includes(user.id)) {
      onMentionsChange([...mentions, user.id]);
    }

    setShowSuggestions(false);

    // Возвращаем фокус на input
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = beforeMention.length + mentionText.length + 1;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Обработка клавиш
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        if (filteredUsers[selectedIndex]) {
          e.preventDefault();
          insertMention(filteredUsers[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  // Удаление упоминания из списка, если оно удалено из текста
  useEffect(() => {
    if (!onMentionsChange) return;

    const currentMentions = mentions.filter(userId => {
      const user = users.find(u => u.id === userId);
      if (!user) return false;

      const mentionText = `@${user.firstName} ${user.lastName}`;
      return value.includes(mentionText);
    });

    if (currentMentions.length !== mentions.length) {
      onMentionsChange(currentMentions);
    }
  }, [value]);

  return (
    <Box sx={{ position: 'relative' }} ref={anchorRef}>
      <TextField
        inputRef={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        multiline={multiline}
        maxRows={maxRows}
        disabled={disabled}
        size={size}
        fullWidth
        {...textFieldProps}
      />

      {/* Поповер с предложениями пользователей */}
      <Popper
        open={showSuggestions}
        anchorEl={anchorRef.current}
        placement="top-start"
        style={{ zIndex: 1300 }}
      >
        <Paper elevation={8} sx={{ maxHeight: 200, overflow: 'auto', minWidth: 250 }}>
          <List dense>
            {filteredUsers.map((user, index) => (
              <ListItem
                key={user.id}
                button
                selected={index === selectedIndex}
                onClick={() => insertMention(user)}
                sx={{
                  bgcolor: index === selectedIndex ? 'action.selected' : 'transparent',
                }}
              >
                <ListItemAvatar>
                  <Avatar src={user.avatar} sx={{ width: 32, height: 32 }}>
                    {user.firstName?.[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${user.firstName} ${user.lastName}`}
                  secondary={user.email}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Popper>

      {/* Показываем упомянутых пользователей */}
      {mentions.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {mentions.map(userId => {
            const user = users.find(u => u.id === userId);
            if (!user) return null;

            return (
              <Chip
                key={userId}
                size="small"
                avatar={<Avatar src={user.avatar}>{user.firstName?.[0]}</Avatar>}
                label={`${user.firstName} ${user.lastName}`}
                icon={<PersonAdd fontSize="small" />}
                variant="outlined"
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default MentionInput;
