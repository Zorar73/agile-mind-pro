// src/components/Common/Breadcrumbs.jsx
import React from 'react';
import { 
  Breadcrumbs as MuiBreadcrumbs, 
  Link, 
  Typography, 
  Box,
  Skeleton,
} from '@mui/material';
import { 
  NavigateNext, 
  Home,
  Dashboard,
  ViewKanban,
  Assignment,
  CalendarToday,
  Group,
  Settings,
  Person,
  Lightbulb,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

// Иконки для разных типов страниц
const pageIcons = {
  home: Home,
  dashboard: Dashboard,
  boards: ViewKanban,
  board: ViewKanban,
  tasks: Assignment,
  'my-tasks': Assignment,
  calendar: CalendarToday,
  teams: Group,
  team: Group,
  settings: Settings,
  profile: Person,
  sketches: Lightbulb,
  sketch: Lightbulb,
};

/**
 * Компонент хлебных крошек
 * @param {Array} items - массив элементов [{ label, path, icon }]
 * @param {boolean} loading - показывать скелетон
 * 
 * ПРИМЕЧАНИЕ: Этот компонент теперь необязателен!
 * MainLayout автоматически генерирует хлебные крошки по URL.
 * Используйте этот компонент только если нужны кастомные крошки.
 */
function Breadcrumbs({ items = [], loading = false }) {
  // Если загрузка — показываем скелетон
  if (loading) {
    return (
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="text" width={200} height={24} />
      </Box>
    );
  }

  // Если нет элементов — не показываем
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs 
        separator={<NavigateNext fontSize="small" sx={{ color: 'text.disabled' }} />}
        sx={{
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'nowrap',
          },
          '& .MuiBreadcrumbs-li': {
            whiteSpace: 'nowrap',
          },
        }}
      >
        {/* Домой всегда первым */}
        <Link
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            textDecoration: 'none',
            fontSize: '0.875rem',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          <Home sx={{ fontSize: 18, mr: 0.5 }} />
          Главная
        </Link>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const IconComponent = item.icon ? pageIcons[item.icon] : null;

          if (isLast) {
            // Последний элемент — текст без ссылки
            return (
              <Typography
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {IconComponent && <IconComponent sx={{ fontSize: 18, mr: 0.5 }} />}
                {item.label}
              </Typography>
            );
          }

          // Промежуточные элементы — ссылки
          return (
            <Link
              key={index}
              component={RouterLink}
              to={item.path}
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              {IconComponent && <IconComponent sx={{ fontSize: 18, mr: 0.5 }} />}
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}

export default Breadcrumbs;
