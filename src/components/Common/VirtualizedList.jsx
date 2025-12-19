// src/components/Common/VirtualizedList.jsx
// Универсальный виртуализированный список
import React from 'react';
import { FixedSizeList, VariableSizeList } from 'react-window';
import { Box } from '@mui/material';

/**
 * Универсальный виртуализированный список для больших коллекций
 *
 * @param {Array} items - Массив элементов для отображения
 * @param {Function} renderItem - Функция рендера элемента: (item, index) => ReactNode
 * @param {number} height - Высота контейнера списка (px)
 * @param {number} itemHeight - Высота одного элемента (px) или функция (index) => height
 * @param {ReactNode} emptyMessage - Сообщение при пустом списке
 * @param {boolean} variableSize - Использовать переменную высоту элементов
 * @param {Object} listProps - Дополнительные props для react-window List
 */
function VirtualizedList({
  items = [],
  renderItem,
  height = 600,
  itemHeight = 80,
  emptyMessage = 'Нет элементов',
  variableSize = false,
  listProps = {},
}) {
  const Row = ({ index, style }) => {
    const item = items[index];
    if (!item) return null;

    return (
      <div style={style}>
        {renderItem(item, index)}
      </div>
    );
  };

  if (items.length === 0) {
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
        {emptyMessage}
      </Box>
    );
  }

  const ListComponent = variableSize ? VariableSizeList : FixedSizeList;

  const getItemSize = typeof itemHeight === 'function'
    ? itemHeight
    : () => itemHeight;

  return (
    <ListComponent
      height={height}
      itemCount={items.length}
      itemSize={getItemSize}
      width="100%"
      style={{
        overflowX: 'hidden',
      }}
      {...listProps}
    >
      {Row}
    </ListComponent>
  );
}

export default VirtualizedList;
