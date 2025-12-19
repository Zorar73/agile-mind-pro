import { TextField, Autocomplete, Avatar, Box, Typography, Chip } from '@mui/material';

/**
 * @param {object} props
 * @param {string | string[]} props.value - Выбранный ID пользователя или массив ID.
 * @param {(value: string | string[]) => void} props.onChange - Обработчик изменения.
 * @param {User[]} props.users - Список всех пользователей.
 * @param {boolean} [props.multiple=false] - Режим множественного выбора.
 * @param {string} [props.placeholder] - Плейсхолдер.
 * @param {string} [props.label] - Лейбл поля.
 * @param {'small' | 'medium'} [props.size='small'] - Размер.
 * @param {boolean} [props.showAvatar=true] - Показывать аватары в списке.
 * @param {(userId: string) => void} [props.onUserClick] - Обработчик клика по аватару/пользователю.
 */
export default function UnifiedUserSelect({
  value,
  onChange,
  users,
  multiple = false,
  placeholder = 'Выберите исполнителя',
  label = 'Исполнитель',
  size = 'small',
  showAvatar = true,
  onUserClick,
}) {
  const options = users || [];
  
  // Функция для получения полного имени
  const getUserFullName = (user) => {
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Без имени';
  };

  // Преобразование value в объекты пользователей
  const getSelectedValue = () => {
    if (!value) return multiple ? [] : null;
    
    if (multiple) {
      const ids = Array.isArray(value) ? value : [value];
      return ids.map(id => options.find(u => u.id === id)).filter(Boolean);
    }
    
    return options.find(u => u.id === value) || null;
  };

  // Обработчик изменения
  const handleChange = (event, newValue) => {
    if (multiple) {
      onChange(newValue ? newValue.map(u => u.id) : []);
    } else {
      onChange(newValue ? newValue.id : null);
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      value={getSelectedValue()}
      onChange={handleChange}
      getOptionLabel={(option) => getUserFullName(option)}
      isOptionEqualToValue={(option, val) => option?.id === val?.id}
      size={size}
      renderOption={(props, option) => {
        const { key, ...restProps } = props;
        return (
          <Box
            component="li"
            key={key}
            {...restProps}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {showAvatar && (
              <Avatar src={option.avatar} sx={{ width: 24, height: 24 }}>
                {option.firstName?.charAt(0)}
              </Avatar>
            )}
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {getUserFullName(option)}
              </Typography>
              {option.position && (
                <Typography variant="caption" color="text.secondary">
                  {option.position}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...chipProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              avatar={
                <Avatar 
                  src={option.avatar} 
                  onClick={(e) => {
                    if (onUserClick) {
                      e.stopPropagation();
                      onUserClick(option.id);
                    }
                  }}
                >
                  {option.firstName?.charAt(0)}
                </Avatar>
              }
              label={getUserFullName(option)}
              {...chipProps}
              size={size}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          size={size}
          fullWidth
        />
      )}
    />
  );
}
