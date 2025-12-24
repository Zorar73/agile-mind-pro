// src/components/Common/VirtualList.jsx
// Виртуализированный список для больших данных
// Использует react-window для производительности

import React, { memo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList, VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Виртуализированный список с фиксированной высотой элементов
 */
export const VirtualFixedList = memo(function VirtualFixedList({
  items,
  itemHeight = 60,
  renderItem,
  loading = false,
  emptyMessage = 'Нет данных',
  overscanCount = 5,
  ...props
}) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!items?.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  const Row = useCallback(({ index, style }) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  ), [items, renderItem]);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeList
          height={height}
          width={width}
          itemCount={items.length}
          itemSize={itemHeight}
          overscanCount={overscanCount}
          {...props}
        >
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
});

/**
 * Виртуализированный список с переменной высотой элементов
 */
export const VirtualVariableList = memo(function VirtualVariableList({
  items,
  getItemHeight,
  renderItem,
  loading = false,
  emptyMessage = 'Нет данных',
  overscanCount = 5,
  ...props
}) {
  const listRef = useRef(null);
  const sizeMap = useRef({});

  // Сброс кэша высот при изменении items
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [items]);

  const getSize = useCallback((index) => {
    if (sizeMap.current[index] !== undefined) {
      return sizeMap.current[index];
    }
    const size = getItemHeight ? getItemHeight(items[index], index) : 60;
    sizeMap.current[index] = size;
    return size;
  }, [items, getItemHeight]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!items?.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  const Row = useCallback(({ index, style }) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  ), [items, renderItem]);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <VariableSizeList
          ref={listRef}
          height={height}
          width={width}
          itemCount={items.length}
          itemSize={getSize}
          overscanCount={overscanCount}
          {...props}
        >
          {Row}
        </VariableSizeList>
      )}
    </AutoSizer>
  );
});

/**
 * Infinite scroll list с виртуализацией
 */
export const VirtualInfiniteList = memo(function VirtualInfiniteList({
  items,
  itemHeight = 60,
  renderItem,
  hasMore = false,
  loadMore,
  loading = false,
  loadingMore = false,
  emptyMessage = 'Нет данных',
  threshold = 5,
  ...props
}) {
  const listRef = useRef(null);

  const handleItemsRendered = useCallback(({ visibleStopIndex }) => {
    if (
      hasMore &&
      !loadingMore &&
      loadMore &&
      visibleStopIndex >= items.length - threshold
    ) {
      loadMore();
    }
  }, [hasMore, loadingMore, loadMore, items.length, threshold]);

  if (loading && !items?.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!items?.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  // +1 для loader row
  const itemCount = hasMore ? items.length + 1 : items.length;

  const Row = useCallback(({ index, style }) => {
    // Loader row
    if (index >= items.length) {
      return (
        <div style={{ ...style, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={24} />
        </div>
      );
    }
    return (
      <div style={style}>
        {renderItem(items[index], index)}
      </div>
    );
  }, [items, renderItem]);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeList
          ref={listRef}
          height={height}
          width={width}
          itemCount={itemCount}
          itemSize={itemHeight}
          onItemsRendered={handleItemsRendered}
          {...props}
        >
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
});

export default VirtualFixedList;
