import { Drawer, Box, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * @param {object} props
 * @param {boolean} props.open - Состояние открытия Drawer.
 * @param {function} props.onClose - Функция закрытия Drawer.
 * @param {string} props.title - Заголовок Drawer.
 * @param {string} [props.width='600px'] - Ширина Drawer.
 * @param {React.ReactNode} [props.headerActions] - Дополнительные кнопки в хедере.
 * @param {React.ReactNode} [props.footer] - Контент для футера (например, кнопки действий).
 * @param {React.ReactNode} props.children - Основной контент.
 */
export default function UnifiedDrawer({
  open,
  onClose,
  title,
  width = '600px',
  headerActions,
  footer,
  children,
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          // Устанавливаем ширину и ограничиваем максимальную для адаптивности
          sx: { width, maxWidth: '100%' }, 
        },
      }}
    >
      {/* HEADER */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" fontWeight={600}>{title}</Typography>
        <Box>
          {headerActions}
          <IconButton onClick={onClose} size="small" sx={{ ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      <Divider />

      {/* CONTENT */}
      {/* Используем p: 3 для большего отступа и flexGrow для заполнения доступного пространства */}
      <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}> 
        {children}
      </Box>

      {/* FOOTER */}
      {footer && (
        <>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {footer}
          </Box>
        </>
      )}
    </Drawer>
  );
}