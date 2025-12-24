// src/components/Common/withMemo.jsx
// Higher-Order Components для оптимизации

import React, { memo } from 'react';

/**
 * HOC для глубокого сравнения props
 * Использовать осторожно — глубокое сравнение может быть дороже ре-рендера
 */
export function withDeepMemo(Component, propsAreEqual) {
  return memo(Component, propsAreEqual || deepEqual);
}

/**
 * Глубокое сравнение объектов
 */
function deepEqual(prevProps, nextProps) {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);
  
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }
  
  for (const key of prevKeys) {
    const prevValue = prevProps[key];
    const nextValue = nextProps[key];
    
    // Функции сравниваем по ссылке
    if (typeof prevValue === 'function' && typeof nextValue === 'function') {
      continue; // Пропускаем функции
    }
    
    // Объекты сравниваем глубоко
    if (typeof prevValue === 'object' && typeof nextValue === 'object') {
      if (prevValue === null && nextValue === null) continue;
      if (prevValue === null || nextValue === null) return false;
      
      if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
        if (prevValue.length !== nextValue.length) return false;
        for (let i = 0; i < prevValue.length; i++) {
          if (prevValue[i] !== nextValue[i]) return false;
        }
        continue;
      }
      
      if (!deepEqual(prevValue, nextValue)) return false;
      continue;
    }
    
    // Примитивы
    if (prevValue !== nextValue) {
      return false;
    }
  }
  
  return true;
}

/**
 * HOC для пропуска определённых props при сравнении
 * @param {string[]} skipProps - Props которые игнорировать
 */
export function withSkipMemo(Component, skipProps = []) {
  return memo(Component, (prevProps, nextProps) => {
    const prevKeys = Object.keys(prevProps).filter(k => !skipProps.includes(k));
    const nextKeys = Object.keys(nextProps).filter(k => !skipProps.includes(k));
    
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }
    
    for (const key of prevKeys) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * HOC для сравнения только определённых props
 * @param {string[]} compareProps - Props для сравнения
 */
export function withSelectiveMemo(Component, compareProps = []) {
  return memo(Component, (prevProps, nextProps) => {
    for (const key of compareProps) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    return true;
  });
}

export default withDeepMemo;
