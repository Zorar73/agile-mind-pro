// src/components/Common/UnifiedTagInput.jsx
import { TextField, Autocomplete, Chip, useTheme } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

/**
 * @param {object} props
 * @param {string[]} props.value - Массив выбранных тегов.
 * @param {(tags: string[]) => void} props.onChange - Обработчик изменения.
 * @param {string[]} props.existingTags - Все существующие теги в системе для подсказок.
 */
export default function UnifiedTagInput({
  value = [],
  onChange,
  existingTags = [],
  placeholder = 'Добавить тег',
  size = 'small',
  disabled = false,
  label = 'Теги',
}) {
  const theme = useTheme();

  // Генерация цвета из строки
  const stringToColor = (str) => {
    if (!str) return '#1976d2';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
      '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a',
      '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  // Определение цвета текста (контраст)
  const getTextColor = (bgColor) => {
    if (!bgColor) return '#fff';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000' : '#fff';
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      options={existingTags}
      size={size}
      disabled={disabled}
      filterSelectedOptions
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const color = stringToColor(option);
          const textColor = getTextColor(color);
          // Извлекаем key отдельно из props
          const { key, ...chipProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              {...chipProps}
              label={option}
              size={size}
              icon={<LocalOfferIcon sx={{ color: textColor + ' !important' }} fontSize="small" />}
              sx={{ 
                bgcolor: color, 
                color: textColor,
                '& .MuiChip-deleteIcon': {
                  color: textColor + ' !important',
                }
              }}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={value.length === 0 ? placeholder : ''}
          label={label}
          size={size}
          fullWidth
        />
      )}
    />
  );
}
