// src/contexts/BoardFiltersContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
/*
  Этот контекст хранит:
  - filters: { assignees: [], tags: [], status: [], search: '' }
  - sort: { field: 'priority', dir: 'desc' }
  - groupBy: string | null

  Контекст также синхронизирует состояние с URL-параметрами,
  если в проекте используется react-router-dom (useSearchParams).
  Если react-router отсутствует, закомментируйте блок useSearchParams и используйте localStorage (вариант ниже).
*/

let useSearchParamsHook = null;
try {
  // Попытка динамически подключить useSearchParams (react-router-dom v6)
  // Если в проекте нет react-router, это не сломает сборку — блок внутри try/catch.
  // eslint-disable-next-line import/no-extraneous-dependencies
  const rr = require('react-router-dom');
  useSearchParamsHook = rr.useSearchParams;
} catch (e) {
  useSearchParamsHook = null;
}

const BoardFiltersContext = createContext(null);

export function BoardFiltersProvider({ children, initial = {} }) {
  // начальное состояние (можно расширять)
  const [filters, setFilters] = useState(() => ({
    assignees: [],
    tags: [],
    status: [],
    dateFrom: null,
    dateTo: null,
    search: '',
    ...initial.filters
  }));

  const [sort, setSort] = useState(() => initial.sort || { field: 'priority', dir: 'desc' });
  const [groupBy, setGroupBy] = useState(() => initial.groupBy || null);

  // sync with URL if react-router is available
  const useSearchParams = useSearchParamsHook;
  const searchParamsAvailable = !!useSearchParams;

  useEffect(() => {
    if (!searchParamsAvailable) return;
    const [params, setParams] = useSearchParams();
    // read params on mount (only once)
    const pTags = params.get('tags');
    const pAssignees = params.get('assignees');
    const pGroup = params.get('groupBy');
    const pSort = params.get('sort');
    setFilters(prev => ({
      ...prev,
      tags: pTags ? pTags.split(',') : prev.tags,
      assignees: pAssignees ? pAssignees.split(',') : prev.assignees
    }));
    if (pGroup) setGroupBy(pGroup);
    if (pSort) {
      const [field, dir] = pSort.split(':');
      if (field) setSort({ field, dir: dir || 'desc' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // write to URL on change (debounced simple)
  useEffect(() => {
    if (!searchParamsAvailable) return;
    const [params, setParams] = useSearchParams();
    const newParams = {};
    if (filters.tags?.length) newParams.tags = filters.tags.join(',');
    if (filters.assignees?.length) newParams.assignees = filters.assignees.join(',');
    if (groupBy) newParams.groupBy = groupBy;
    if (sort?.field) newParams.sort = `${sort.field}:${sort.dir}`;
    setParams(newParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, groupBy]);

  // memoized value
  const value = useMemo(
    () => ({
      filters,
      setFilters,
      sort,
      setSort,
      groupBy,
      setGroupBy,
    }),
    [filters, sort, groupBy]
  );

  return <BoardFiltersContext.Provider value={value}>{children}</BoardFiltersContext.Provider>;
}

export function useBoardFilters() {
  const ctx = useContext(BoardFiltersContext);
  if (!ctx) {
    throw new Error('useBoardFilters must be used inside BoardFiltersProvider');
  }
  return ctx;
}
