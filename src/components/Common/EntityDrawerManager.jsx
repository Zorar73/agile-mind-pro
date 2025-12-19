// src/components/Common/EntityDrawerManager.jsx
// Глобальный менеджер для открытия drawer'ов сущностей

import React, { useState, useEffect } from 'react';
import { useDrawerStack } from '../../contexts/DrawerStackContext';
import TaskDrawer from '../Task/TaskDrawer';
import SketchDrawer from '../Sketch/SketchDrawer';
import TeamDrawer from '../Team/TeamDrawer';
import UserProfileDrawer from '../User/UserProfileDrawer';

/**
 * Глобальный менеджер drawer'ов
 * Слушает события openEntityDrawer и открывает соответствующие drawer'ы
 */
function EntityDrawerManager() {
  const { openDrawer, closeDrawer, drawerStack } = useDrawerStack();
  const [activeDrawers, setActiveDrawers] = useState({});

  useEffect(() => {
    // Обработчик события открытия drawer
    const handleOpenDrawer = (event) => {
      const { type, id } = event.detail;
      const drawerId = `${type}-${id}`;

      openDrawer({
        id: drawerId,
        type,
        entityId: id,
      });

      setActiveDrawers(prev => ({
        ...prev,
        [drawerId]: { type, id, open: true },
      }));
    };

    // Обработчик переоткрытия drawer (для перемещения в стеке)
    const handleReopenDrawer = (event) => {
      const drawer = event.detail;
      openDrawer(drawer);
    };

    window.addEventListener('openEntityDrawer', handleOpenDrawer);
    window.addEventListener('reopenDrawer', handleReopenDrawer);

    return () => {
      window.removeEventListener('openEntityDrawer', handleOpenDrawer);
      window.removeEventListener('reopenDrawer', handleReopenDrawer);
    };
  }, [openDrawer]);

  // Синхронизация activeDrawers со стеком
  useEffect(() => {
    const stackIds = new Set(drawerStack.map(d => d.id));
    const currentIds = new Set(Object.keys(activeDrawers));

    // Закрываем drawer'ы, которых нет в стеке
    currentIds.forEach(id => {
      if (!stackIds.has(id)) {
        setActiveDrawers(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    });
  }, [drawerStack]);

  const handleCloseDrawer = (drawerId) => {
    closeDrawer(drawerId);
    setActiveDrawers(prev => {
      const next = { ...prev };
      delete next[drawerId];
      return next;
    });
  };

  return (
    <>
      {Object.entries(activeDrawers).map(([drawerId, drawer]) => {
        const { type, id } = drawer;

        switch (type) {
          case 'task':
            return (
              <TaskDrawer
                key={drawerId}
                taskId={id}
                open={true}
                onClose={() => handleCloseDrawer(drawerId)}
                drawerId={drawerId}
              />
            );

          case 'sketch':
            return (
              <SketchDrawer
                key={drawerId}
                sketchId={id}
                open={true}
                onClose={() => handleCloseDrawer(drawerId)}
                drawerId={drawerId}
              />
            );

          case 'team':
            return (
              <TeamDrawer
                key={drawerId}
                teamId={id}
                open={true}
                onClose={() => handleCloseDrawer(drawerId)}
                drawerId={drawerId}
              />
            );

          case 'user':
            return (
              <UserProfileDrawer
                key={drawerId}
                userId={id}
                open={true}
                onClose={() => handleCloseDrawer(drawerId)}
                drawerId={drawerId}
              />
            );

          case 'board':
            // Board обычно открывается как страница, но можно добавить BoardDrawer
            return null;

          default:
            return null;
        }
      })}
    </>
  );
}

export default EntityDrawerManager;
