import { Card, CardContent, CardMedia, Typography, Box, IconButton, Menu, MenuItem, Chip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';

/**
 * @param {object} props
 * @param {string} props.title - Заголовок сущности.
 * @param {string} [props.subtitle] - Подзаголовок.
 * @param {string} [props.coverImageUrl] - URL обложки/изображения.
 * // ... (другие props)
 */
export default function UnifiedEntityCard({
  title,
  subtitle,
  coverImageUrl,
  icon,
  metadata,
  badgeCount,
  onClick,
  menuItems = [],
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  // ... (логика открытия/закрытия меню)

  return (
    <Card 
      onClick={onClick}
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        // Эффект при наведении, как в ТЗ
        transition: 'box-shadow 0.3s, transform 0.3s',
        '&:hover': {
          boxShadow: 6,
          transform: onClick ? 'translateY(-2px)' : 'none',
        },
      }}
    >
      {coverImageUrl && (
        <CardMedia
          component="img"
          height="140"
          image={coverImageUrl}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            {/* Заголовок и иконка */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {icon && <Typography variant="h5">{icon}</Typography>}
              <Typography variant="h6" component="div" noWrap title={title}>
                {title}
              </Typography>
              {badgeCount !== undefined && (
                <Chip label={badgeCount} size="small" color="primary" sx={{ ml: 1 }} />
              )}
            </Box>
            
            {subtitle && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Контекстное меню */}
          {menuItems.length > 0 && (
            <>
              <IconButton 
                aria-label="settings" 
                onClick={handleMenuClick} 
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
              {/* ... (Menu component) */}
            </>
          )}
        </Box>

        {metadata && (
          <Box sx={{ mt: 2 }}>
            {metadata}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}