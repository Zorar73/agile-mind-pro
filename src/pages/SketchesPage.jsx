// src/pages/SketchesPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Avatar,
  Stack,
  Autocomplete,
  Menu,
  MenuItem,
  Divider,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  LocalOffer,
  Lightbulb,
  Person,
  Group,
  Share,
  Lock,
  FilterList,
} from '@mui/icons-material';
import { UserContext } from '../App';
import MainLayout from '../components/Layout/MainLayout';
import sketchService from '../services/sketch.service';
import SketchDrawer from '../components/Sketch/SketchDrawer';
import SketchAnalytics from '../components/Sketch/SketchAnalytics';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Bauhaus цвета
const bauhaus = {
  blue: '#1E88E5',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

function SketchesPage() {
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [mySketches, setMySketches] = useState([]);
  const [sharedSketches, setSharedSketches] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [viewFilter, setViewFilter] = useState('all'); // 'all', 'my', 'shared'
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSketchId, setSelectedSketchId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuSketch, setMenuSketch] = useState(null);
  
  const [newSketchData, setNewSketchData] = useState({
    title: '',
    description: '',
    tags: [],
  });

  useEffect(() => {
    if (!user) return;
    loadSketches();
  }, [user]);

  const loadSketches = async () => {
    if (!user) return;
    
    // Загружаем мои наброски
    const myResult = await sketchService.getUserSketches(user.uid);
    if (myResult.success) {
      setMySketches(myResult.sketches);
    }
    
    // Загружаем наброски, которыми со мной поделились
    const sharedResult = await sketchService.getSketchesSharedWithUser(user.uid);
    if (sharedResult.success) {
      setSharedSketches(sharedResult.sketches);
    }
    
    // Собираем все теги
    const tags = new Set();
    [...(myResult.sketches || []), ...(sharedResult.sketches || [])].forEach(sketch => {
      if (sketch.tags) {
        sketch.tags.forEach(tag => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags));
  };

  const handleCreateSketch = async () => {
    if (!newSketchData.title.trim()) return;

    const result = await sketchService.createSketch({
      ...newSketchData,
      content: newSketchData.description,
      tags: newSketchData.tags || [],
    }, user.uid);
    
    if (result.success) {
      setCreateDialogOpen(false);
      setNewSketchData({ title: '', description: '', tags: [] });
      loadSketches();
    }
  };

  const handleDeleteSketch = async (sketchId) => {
    if (!window.confirm('Удалить набросок?')) return;
    
    await sketchService.deleteSketch(sketchId);
    loadSketches();
    handleMenuClose();
  };

  const handleMenuOpen = (event, sketch) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuSketch(sketch);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuSketch(null);
  };

  const handleSketchClick = (sketch) => {
    setSelectedSketchId(sketch.id);
    setDrawerOpen(true);
  };

  // Комбинируем наброски с пометкой isShared
  const allSketches = [
    ...mySketches.map(s => ({ ...s, isShared: false, isOwner: true })),
    ...sharedSketches.map(s => ({ ...s, isShared: true, isOwner: false })),
  ];

  // Фильтрация
  let filteredSketches = allSketches;
  
  if (viewFilter === 'my') {
    filteredSketches = filteredSketches.filter(s => !s.isShared);
  } else if (viewFilter === 'shared') {
    filteredSketches = filteredSketches.filter(s => s.isShared);
  }
  
  if (selectedTag) {
    filteredSketches = filteredSketches.filter(s => s.tags?.includes(selectedTag));
  }

  // Сортировка по дате (новые сверху)
  filteredSketches.sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
    return dateB - dateA;
  });

  const sharedCount = sharedSketches.length;

  return (
    <MainLayout>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            Наброски
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Быстрые заметки и идеи
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ borderRadius: 50, px: 3 }}
        >
          Создать набросок
        </Button>
      </Box>

      {/* Аналитика набросков */}
      <SketchAnalytics sketches={mySketches} sharedSketches={sharedSketches} />

      {/* Фильтры */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Фильтр по владельцу */}
        <ToggleButtonGroup
          value={viewFilter}
          exclusive
          onChange={(e, value) => value && setViewFilter(value)}
          size="small"
        >
          <ToggleButton value="all" sx={{ borderRadius: '50px 0 0 50px', px: 2 }}>
            Все ({allSketches.length})
          </ToggleButton>
          <ToggleButton value="my" sx={{ px: 2 }}>
            <Person sx={{ mr: 0.5, fontSize: 18 }} />
            Мои ({mySketches.length})
          </ToggleButton>
          <ToggleButton value="shared" sx={{ borderRadius: '0 50px 50px 0', px: 2 }}>
            <Share sx={{ mr: 0.5, fontSize: 18 }} />
            Со мной ({sharedCount})
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Фильтр по тегам */}
        {allTags.length > 0 && (
          <>
            <Divider orientation="vertical" flexItem />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label="Все теги"
                onClick={() => setSelectedTag(null)}
                size="small"
                sx={{ 
                  bgcolor: selectedTag === null ? bauhaus.blue : isDark ? 'background.subtle' : 'grey.100',
                  color: selectedTag === null ? 'white' : 'text.primary',
                  fontWeight: 500,
                }}
              />
              {allTags.slice(0, 5).map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => setSelectedTag(tag)}
                  icon={<LocalOffer sx={{ fontSize: 14 }} />}
                  size="small"
                  sx={{ 
                    bgcolor: selectedTag === tag ? bauhaus.yellow : isDark ? 'background.subtle' : 'grey.100',
                    color: 'text.primary',
                  }}
                />
              ))}
              {allTags.length > 5 && (
                <Chip
                  label={`+${allTags.length - 5}`}
                  size="small"
                  sx={{ bgcolor: isDark ? 'background.subtle' : 'grey.100' }}
                />
              )}
            </Stack>
          </>
        )}
      </Box>

      {/* Список набросков */}
      {filteredSketches.length === 0 ? (
        <Card 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <Lightbulb sx={{ fontSize: 64, color: bauhaus.yellow, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {viewFilter === 'shared' 
              ? 'С вами пока не поделились набросками' 
              : selectedTag 
                ? `Нет набросков с тегом "${selectedTag}"` 
                : 'У вас пока нет набросков'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {viewFilter === 'shared' 
              ? 'Когда кто-то поделится с вами наброском, он появится здесь'
              : 'Создайте набросок для быстрых заметок и идей'}
          </Typography>
          {viewFilter !== 'shared' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ borderRadius: 50 }}
            >
              Создать первый набросок
            </Button>
          )}
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredSketches.map((sketch) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sketch.id}>
              <Card
                onClick={() => handleSketchClick(sketch)}
                sx={{
                  height: 220,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderLeft: 4,
                  borderColor: sketch.isShared ? bauhaus.purple : bauhaus.yellow,
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                {/* Бейдж "Поделились" */}
                {sketch.isShared && (
                  <Chip
                    icon={<Share sx={{ fontSize: 14 }} />}
                    label="Поделились"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: bauhaus.purple,
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 24,
                      '& .MuiChip-icon': { color: 'white' },
                    }}
                  />
                )}

                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Заголовок */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flexGrow: 1, minWidth: 0, pr: sketch.isShared ? 8 : 0 }}>
                      <Typography variant="h6" fontWeight="600" noWrap>
                        {sketch.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem', bgcolor: sketch.isShared ? bauhaus.purple : bauhaus.blue }}>
                          {sketch.isShared ? '?' : user?.firstName?.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          {sketch.createdAt && format(
                            sketch.createdAt.toDate ? sketch.createdAt.toDate() : new Date(sketch.createdAt), 
                            'dd MMM yyyy', 
                            { locale: ru }
                          )}
                        </Typography>
                        
                        {/* Индикатор доступа для моих набросков */}
                        {!sketch.isShared && (
                          <Tooltip title={
                            (sketch.sharedWith?.users?.length > 0 || sketch.sharedWith?.teams?.length > 0) 
                              ? 'Есть общий доступ' 
                              : 'Личный'
                          }>
                            {(sketch.sharedWith?.users?.length > 0 || sketch.sharedWith?.teams?.length > 0) ? (
                              <Group sx={{ fontSize: 14, color: 'text.secondary' }} />
                            ) : (
                              <Lock sx={{ fontSize: 14, color: 'text.secondary' }} />
                            )}
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    
                    {sketch.isOwner && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, sketch);
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {/* Описание */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      flexGrow: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      mb: 2,
                    }}
                  >
                    {sketch.content || sketch.description || 'Нет описания'}
                  </Typography>

                  {/* Теги */}
                  {sketch.tags && sketch.tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {sketch.tags.slice(0, 3).map(tag => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          sx={{ fontSize: '0.7rem', height: 24 }}
                        />
                      ))}
                      {sketch.tags.length > 3 && (
                        <Chip 
                          label={`+${sketch.tags.length - 3}`} 
                          size="small" 
                          sx={{ fontSize: '0.7rem', height: 24 }}
                        />
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Диалог создания */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Создать набросок</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Название"
              value={newSketchData.title}
              onChange={(e) => setNewSketchData({ ...newSketchData, title: e.target.value })}
              placeholder="Краткое название наброска"
            />
            
            <TextField
              fullWidth
              label="Содержимое"
              value={newSketchData.description}
              onChange={(e) => setNewSketchData({ ...newSketchData, description: e.target.value })}
              multiline
              rows={4}
              placeholder="Ваша идея или заметка..."
            />

            <Autocomplete
              multiple
              freeSolo
              options={allTags}
              value={newSketchData.tags || []}
              onChange={(e, newValue) => setNewSketchData({ ...newSketchData, tags: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Теги"
                  placeholder="Добавьте теги..."
                  helperText="Введите тег и нажмите Enter"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return <Chip key={key} label={option} {...tagProps} size="small" />;
                })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ borderRadius: 50 }}>
            Отмена
          </Button>
          <Button 
            onClick={handleCreateSketch} 
            variant="contained" 
            disabled={!newSketchData.title.trim()}
            sx={{ borderRadius: 50 }}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Меню действий */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => {
          handleSketchClick(menuSketch);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} fontSize="small" /> Редактировать
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteSketch(menuSketch?.id)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" /> Удалить
        </MenuItem>
      </Menu>

      {/* Drawer наброска */}
      <SketchDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedSketchId(null);
        }}
        sketchId={selectedSketchId}
        onUpdate={loadSketches}
      />
    </MainLayout>
  );
}

export default SketchesPage;
