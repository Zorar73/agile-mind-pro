// src/components/Common/StackedDrawer.jsx
// Drawer с поддержкой стека (множественные drawer'ы)

import React, { useEffect } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Divider,
  Stack,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Close,
  ChevronLeft,
  ClearAll,
} from '@mui/icons-material';
import { useDrawerStack } from '../../contexts/DrawerStackContext';
import { gradients } from '../../theme';

const DRAWER_WIDTH = 600;
const DRAWER_OFFSET = 60; // На сколько сдвигать каждый следующий drawer (увеличено с 40 до 60)

// Мапинг типов сущностей к градиентам
const ENTITY_COLORS = {
  task: gradients.primary, // Синий
  sketch: gradients.warning, // Желтый
  team: gradients.success, // Зеленый
  user: gradients.info, // Фиолетовый
  board: gradients.secondary, // Серый
  default: gradients.primary,
};

/**
 * Stacked Drawer - drawer с поддержкой стека
 * @param {Object} props
 * @param {boolean} props.open - Открыт ли drawer
 * @param {Function} props.onClose - Callback закрытия
 * @param {string} props.title - Заголовок
 * @param {string} props.id - Уникальный ID drawer'а
 * @param {React.ReactNode} props.children - Контент
 * @param {string} props.width - Ширина drawer'а (по умолчанию 600px)
 * @param {boolean} props.showBreadcrumbs - Показывать ли breadcrumbs стека
 * @param {string} props.entityType - Тип сущности для цвета (task, sketch, team, user, board)
 */
function StackedDrawer({
  open,
  onClose,
  title,
  id,
  children,
  width = DRAWER_WIDTH,
  showBreadcrumbs = true,
  entityType = 'default',
}) {
  const {
    drawerStack,
    closeDrawer,
    closeAllDrawers,
    getDrawerPosition,
    getStackSize,
    isTopDrawer,
  } = useDrawerStack();

  const position = getDrawerPosition(id);
  const stackSize = getStackSize();
  const isTop = isTopDrawer(id);

  // Если drawer не в стеке (position === -1), считаем его top drawer
  const isInStack = position !== -1;
  const effectivePosition = isInStack ? position : 0;
  const effectiveIsTop = isInStack ? isTop : true;

  // Рассчитываем смещение drawer'а
  const calculateOffset = () => {
    if (!isInStack || effectivePosition === 0) return 0;

    // Второй drawer - смещается влево на DRAWER_OFFSET
    if (effectivePosition === 1) return -DRAWER_OFFSET;

    // Третий и далее - смещаются поверх второго, но чуть видны
    return -(DRAWER_OFFSET + (effectivePosition - 1) * 10);
  };

  const offset = calculateOffset();

  // Рассчитываем z-index (чем выше в стеке, тем больше z-index)
  const zIndex = 1200 + effectivePosition;

  // Затемнение для неактивных drawer'ов
  const opacity = effectiveIsTop ? 1 : 0.95;

  // Обработка нажатия на backdrop
  const handleBackdropClick = () => {
    if (effectiveIsTop) {
      onClose();
    } else {
      // Если кликнули на неактивный drawer, делаем его активным
      if (isInStack) {
        closeDrawer(id);
        setTimeout(() => {
          // Переоткрываем, чтобы он стал последним в стеке
          const currentDrawer = drawerStack.find(d => d.id === id);
          if (currentDrawer) {
            // Это делается через событие, чтобы не создавать циклических зависимостей
            window.dispatchEvent(
              new CustomEvent('reopenDrawer', { detail: currentDrawer })
            );
          }
        }, 0);
      }
    }
  };

  const headerGradient = ENTITY_COLORS[entityType] || ENTITY_COLORS.default;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleBackdropClick}
      sx={{
        zIndex,
        '& .MuiDrawer-paper': {
          width,
          transform: `translateX(${offset}px)`,
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, box-shadow 0.3s ease',
          opacity,
          boxShadow: effectivePosition > 0
            ? '-8px 0 24px rgba(0,0,0,0.12), -4px 0 8px rgba(0,0,0,0.06)'
            : '0 0 48px rgba(0,0,0,0.1)',
          borderRadius: '20px 0 0 20px',
          cursor: !effectiveIsTop ? 'pointer' : 'default',
          border: '1px solid',
          borderColor: 'divider',
          borderRight: 'none',
          overflow: 'hidden',
        },
      }}
      // Отключаем backdrop для всех кроме первого
      hideBackdrop={effectivePosition > 0}
      // Для первого drawer показываем backdrop
      ModalProps={{
        keepMounted: true,
        BackdropProps: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      }}
      PaperProps={{
        onClick: (e) => {
          // Если это не верхний drawer и клик был на сам paper (не на детей с обработчиками)
          if (!effectiveIsTop && e.target === e.currentTarget) {
            handleBackdropClick();
          }
        },
      }}
    >
      {/* Тонкая полоска слева для возврата к предыдущему drawer */}
      {!effectiveIsTop && (
        <Box
          onClick={handleBackdropClick}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 6,
            height: '100%',
            zIndex: 1,
            cursor: 'pointer',
            bgcolor: 'transparent',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRight: '1px solid transparent',
            '&:hover': {
              bgcolor: 'primary.main',
              width: 16,
              borderRight: '1px solid',
              borderColor: 'primary.light',
              boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            },
          }}
        />
      )}

      {/* Хэдер */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 2.5,
          background: headerGradient,
          color: 'white',
          opacity: effectiveIsTop ? 1 : 0.95,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          },
        }}
      >
        {/* Breadcrumbs стека */}
        {showBreadcrumbs && stackSize > 1 && (
          <Stack direction="row" spacing={0.5} sx={{ mr: 'auto', alignItems: 'center' }}>
            {drawerStack.map((drawer, index) => {
              const isCurrent = drawer.id === id;
              return (
                <React.Fragment key={drawer.id}>
                  {index > 0 && <ChevronLeft fontSize="small" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }} />}
                  <Chip
                    size="small"
                    label={`${index + 1}`}
                    variant={isCurrent ? 'filled' : 'outlined'}
                    onClick={() => {
                      if (!isCurrent) {
                        // Закрываем все drawer'ы после выбранного
                        const drawersToClose = drawerStack.slice(index + 1);
                        drawersToClose.forEach(d => closeDrawer(d.id));
                      }
                    }}
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      bgcolor: isCurrent ? 'rgba(255,255,255,0.25)' : 'transparent',
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.4)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.35)',
                        borderColor: 'rgba(255,255,255,0.6)',
                        transform: 'scale(1.05)',
                      }
                    }}
                  />
                </React.Fragment>
              );
            })}
          </Stack>
        )}

        {/* Заголовок */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: '1.1rem',
            letterSpacing: '-0.01em',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          {title}
        </Typography>

        {/* Кнопки */}
        {stackSize > 1 && (
          <Tooltip title="Закрыть все">
            <IconButton
              size="small"
              onClick={closeAllDrawers}
              sx={{
                color: 'white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                  transform: 'rotate(180deg)',
                }
              }}
            >
              <ClearAll />
            </IconButton>
          </Tooltip>
        )}

        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.15)',
              transform: 'rotate(90deg)',
            }
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Контент */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {children}
      </Box>
    </Drawer>
  );
}

export default StackedDrawer;
