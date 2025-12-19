// src/components/Dashboard/widgets/WidgetWrapper.jsx
import React, { useState } from 'react';
import { Paper, Box, IconButton, Typography, Menu, MenuItem, Divider } from '@mui/material';
import { DragIndicator, Settings, Close, MoreVert } from '@mui/icons-material';

function WidgetWrapper({ 
  widget, 
  title, 
  icon,
  isEditMode, 
  onRemove, 
  onOpenConfig,
  onResize,
  children 
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleResize = (newWidth, newHeight) => {
    if (onResize) onResize(widget.id, newWidth, newHeight);
    setMenuAnchor(null);
  };

  return (
    <Paper
      sx={{
        gridColumn: `span ${widget.width}`,
        p: 2,
        borderRadius: 3,
        position: 'relative',
        minHeight: widget.height * 140,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': isEditMode ? { boxShadow: 6, transform: 'scale(1.01)' } : {},
        overflow: 'hidden',
      }}
    >
      {/* Edit mode controls */}
      {isEditMode && (
        <>
          <Box sx={{ position: 'absolute', top: 8, left: 8, cursor: 'grab', bgcolor: 'background.paper', borderRadius: 1, p: 0.5, boxShadow: 1, zIndex: 10 }}>
            <DragIndicator fontSize="small" color="action" />
          </Box>
          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5, zIndex: 10 }}>
            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <MoreVert fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onRemove(widget.id)} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </>
      )}

      {/* Header */}
      {title && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, mt: isEditMode ? 3 : 0 }}>
          {icon}
          <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
        </Box>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {children}
      </Box>

      {/* Size menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem disabled><Typography variant="caption" color="text.secondary">Размер</Typography></MenuItem>
        <MenuItem onClick={() => handleResize(1, 1)}>1×1 (Мини)</MenuItem>
        <MenuItem onClick={() => handleResize(2, 1)}>2×1 (Широкий)</MenuItem>
        <MenuItem onClick={() => handleResize(2, 2)}>2×2 (Средний)</MenuItem>
        <MenuItem onClick={() => handleResize(3, 2)}>3×2 (Большой)</MenuItem>
        <MenuItem onClick={() => handleResize(4, 1)}>4×1 (Полная ширина)</MenuItem>
        <MenuItem onClick={() => handleResize(4, 2)}>4×2 (Полный)</MenuItem>
        <Divider />
        <MenuItem onClick={() => { onOpenConfig(widget); setMenuAnchor(null); }}>
          <Settings fontSize="small" sx={{ mr: 1 }} /> Настройки
        </MenuItem>
      </Menu>
    </Paper>
  );
}

export default WidgetWrapper;
