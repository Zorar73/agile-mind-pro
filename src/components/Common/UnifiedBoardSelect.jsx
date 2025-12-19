import { TextField, Autocomplete, Chip } from '@mui/material';

/**
 * @typedef {object} Board
 * @property {string} id - ID доски.
 * @property {string} title - Название доски.
 */

/**
 * @param {object} props
 * @param {string | string[]} props.value - Выбранный ID доски или массив ID.
 * @param {(value: string | string[]) => void} props.onChange - Обработчик изменения.
 * @param {Board[]} props.boards - Список всех досок.
 * @param {boolean} [props.multiple=false] - Режим множественного выбора.
 * @param {string} [props.placeholder] - Плейсхолдер.
 * @param {string} [props.label='Доска'] - Лейбл поля.
 * @param {'small' | 'medium'} [props.size='small'] - Размер.
 */
export default function UnifiedBoardSelect({
  value,
  onChange,
  boards,
  multiple = false,
  placeholder = 'Выберите доску',
  label = 'Доска',
  size = 'small',
}) {
  const options = boards || [];

  const getOptionLabel = (option) => {
    // Если опция - это ID (при загрузке компонента), ищем название
    if (typeof option === 'string') {
        const board = options.find(b => b.id === option);
        return board ? board.title : '';
    }
    return option.title;
  };

  const selectedValue = multiple
    ? (Array.isArray(value) ? value.map(id => options.find(b => b.id === id) || id) : [])
    : options.find(b => b.id === value) || null;
    
  const handleChange = (event, newValue) => {
    if (multiple) {
      onChange(newValue.map(option => option.id));
    } else {
      onChange(newValue ? newValue.id : '');
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      value={selectedValue}
      onChange={handleChange}
      getOptionLabel={getOptionLabel}
      size={size}
      disableCloseOnSelect={multiple}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            key={option.id}
            label={option.title}
            {...getTagProps({ index })}
            size={size}
          />
        ))
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