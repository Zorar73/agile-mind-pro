// src/components/Sketch/SketchModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Avatar,
  AvatarGroup,
  Divider,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
  Tab,
  Tabs,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Close,
  Edit,
  Save,
  Cancel,
  Psychology,
  LocalOffer,
  Send,
  Person,
  CalendarToday,
  Share,
  Groups,
  PersonAdd,
  Delete,
  Lock,
  Public,
} from '@mui/icons-material';
import { UserContext } from '../../App';
import sketchService from '../../services/sketch.service';
import userService from '../../services/user.service';
import teamService from '../../services/team.service';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { gradients } from '../../theme';

function SketchModal({ sketch, onClose }) {
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: sketch.title || '',
    description: sketch.description || '',
    tags: sketch.tags || [],
  });
  
  // Комментарии
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  // Пользователи и команды
  const [users, setUsers] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [allTags, setAllTags] = useState([]);
  
  // Шаринг
  const [sharedUsers, setSharedUsers] = useState([]);
  const [sharedTeams, setSharedTeams] = useState([]);
  const [selectedUserToShare, setSelectedUserToShare] = useState(null);
  const [selectedTeamToShare, setSelectedTeamToShare] = useState(null);

  useEffect(() => {
    loadComments();
    loadUsers();
    loadTeams();
    loadAllTags();
    loadSharedEntities();
  }, [sketch.id]);

  const loadComments = () => {
    const unsubscribe = sketchService.subscribeToComments(sketch.id, (updatedComments) => {
      setComments(updatedComments);
    });
    return unsubscribe;
  };

  const loadUsers = async () => {
    const result = await userService.getAllUsers();
    if (result.success) {
      const usersMap = {};
      const usersList = [];
      result.users.forEach(u => {
        usersMap[u.id] = u;
        if (u.status === 'approved' && u.id !== user.uid && u.id !== sketch.authorId) {
          usersList.push(u);
        }
      });
      setUsers(usersMap);
      setAllUsers(usersList);
    }
  };

  const loadTeams = async () => {
    const result = await teamService.getUserTeams(user.uid);
    if (result.success) {
      setAllTeams(result.teams);
    }
  };

  const loadAllTags = async () => {
    const result = await sketchService.getUserSketches(user.uid);
    if (result.success) {
      const tags = new Set();
      result.sketches.forEach(s => {
        if (s.tags) {
          s.tags.forEach(tag => tags.add(tag));
        }
      });
      setAllTags(Array.from(tags));
    }
  };

  const loadSharedEntities = () => {
    // Загружаем данные о расшаренных пользователях и командах
    setSharedUsers(sketch.sharedWith?.users || []);
    setSharedTeams(sketch.sharedWith?.teams || []);
  };

  const handleSave = async () => {
    await sketchService.updateSketch(sketch.id, editData);
    setIsEditing(false);
    onClose();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    // Ищем @mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(newComment)) !== null) {
      const mentionedUser = allUsers.find(u => 
        `${u.firstName}${u.lastName}`.toLowerCase().includes(match[1].toLowerCase())
      );
      if (mentionedUser) {
        mentions.push(mentionedUser.id);
      }
    }

    await sketchService.addComment(sketch.id, user.uid, newComment, mentions);
    setNewComment('');
  };

  // Шаринг
  const handleShareWithUser = async () => {
    if (!selectedUserToShare) return;

    await sketchService.shareWithUser(sketch.id, selectedUserToShare.id, user.uid);
    setSharedUsers([...sharedUsers, selectedUserToShare.id]);
    setSelectedUserToShare(null);
  };

  const handleUnshareWithUser = async (userId) => {
    await sketchService.unshareWithUser(sketch.id, userId);
    setSharedUsers(sharedUsers.filter(id => id !== userId));
  };

  const handleShareWithTeam = async () => {
    if (!selectedTeamToShare) return;

    await sketchService.shareWithTeam(sketch.id, selectedTeamToShare.id, user.uid);
    setSharedTeams([...sharedTeams, selectedTeamToShare.id]);
    setSelectedTeamToShare(null);
  };

  const handleUnshareWithTeam = async (teamId) => {
    await sketchService.unshareWithTeam(sketch.id, teamId);
    setSharedTeams(sharedTeams.filter(id => id !== teamId));
  };

  const handleAIConvert = async () => {
    alert('AI анализ наброска и создание задач - в разработке');
  };

  const author = users[sketch.authorId];
  const isOwner = sketch.authorId === user.uid;
  
  // Фильтруем пользователей, которых ещё нет в sharedUsers
  const availableUsersToShare = allUsers.filter(u => !sharedUsers.includes(u.id));
  const availableTeamsToShare = allTeams.filter(t => !sharedTeams.includes(t.id));

  return (
    <Dialog 
      open 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Градиентный хедер */}
      <Box sx={{ background: gradients.bluePurple, px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            {isEditing ? (
              <TextField
                fullWidth
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                variant="standard"
                sx={{ 
                  '& input': { 
                    color: 'white', 
                    fontSize: '1.5rem', 
                    fontWeight: 600 
                  },
                  '& .MuiInput-underline:before': { borderColor: 'rgba(255,255,255,0.3)' },
                  '& .MuiInput-underline:after': { borderColor: 'white' },
                }}
              />
            ) : (
              <Typography variant="h5" fontWeight={600} color="white">
                {sketch.title}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Person fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {author ? `${author.firstName} ${author.lastName}` : 'Неизвестно'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {sketch.createdAt && format(
                    sketch.createdAt.toDate ? sketch.createdAt.toDate() : new Date(sketch.createdAt), 
                    'dd MMMM yyyy, HH:mm', 
                    { locale: ru }
                  )}
                </Typography>
              </Box>
              
              {/* Индикатор доступа */}
              <Chip
                size="small"
                icon={sharedUsers.length > 0 || sharedTeams.length > 0 ? <Public /> : <Lock />}
                label={sharedUsers.length > 0 || sharedTeams.length > 0 ? 'Общий доступ' : 'Личный'}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {isOwner && (
              <>
                {isEditing ? (
                  <>
                    <IconButton onClick={() => setIsEditing(false)} sx={{ color: 'white' }}>
                      <Cancel />
                    </IconButton>
                    <IconButton onClick={handleSave} sx={{ color: 'white' }}>
                      <Save />
                    </IconButton>
                  </>
                ) : (
                  <IconButton onClick={() => setIsEditing(true)} sx={{ color: 'white' }}>
                    <Edit />
                  </IconButton>
                )}
              </>
            )}
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Табы */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Содержимое" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Доступ
                {(sharedUsers.length > 0 || sharedTeams.length > 0) && (
                  <Chip 
                    size="small" 
                    label={sharedUsers.length + sharedTeams.length} 
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Комментарии
                {comments.length > 0 && (
                  <Chip 
                    size="small" 
                    label={comments.length} 
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            } 
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 400 }}>
        {/* Таб: Содержимое */}
        {activeTab === 0 && (
          <Stack spacing={3}>
            {/* Теги */}
            {isEditing ? (
              <Autocomplete
                multiple
                freeSolo
                options={allTags}
                value={editData.tags}
                onChange={(e, newValue) => setEditData({ ...editData, tags: newValue })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Теги"
                    placeholder="Добавьте теги..."
                    size="small"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option}
                        {...tagProps}
                        size="small"
                        icon={<LocalOffer />}
                      />
                    );
                  })
                }
              />
            ) : (
              sketch.tags && sketch.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {sketch.tags.map(tag => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small"
                      icon={<LocalOffer />}
                      sx={{ bgcolor: isDark ? 'grey.800' : 'grey.100' }}
                    />
                  ))}
                </Box>
              )
            )}

            {/* Описание */}
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={12}
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Описание наброска..."
              />
            ) : (
              <Box
                sx={{
                  p: 2,
                  bgcolor: isDark ? 'background.subtle' : 'grey.50',
                  borderRadius: 2,
                  minHeight: 250,
                  whiteSpace: 'pre-wrap',
                }}
              >
                <Typography variant="body1">
                  {sketch.description || 'Нет описания'}
                </Typography>
              </Box>
            )}
          </Stack>
        )}

        {/* Таб: Доступ */}
        {activeTab === 1 && (
          <Stack spacing={3}>
            {/* Добавить пользователя */}
            {isOwner && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  <PersonAdd sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  Поделиться с пользователем
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Autocomplete
                    size="small"
                    options={availableUsersToShare}
                    value={selectedUserToShare}
                    onChange={(e, v) => setSelectedUserToShare(v)}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props;
                      return (
                        <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {option.firstName?.charAt(0)}
                          </Avatar>
                          {option.firstName} {option.lastName}
                        </Box>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Выберите пользователя..." />
                    )}
                    sx={{ flex: 1 }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleShareWithUser}
                    disabled={!selectedUserToShare}
                    sx={{ borderRadius: 50 }}
                  >
                    Добавить
                  </Button>
                </Box>
              </Box>
            )}

            {/* Список расшаренных пользователей */}
            {sharedUsers.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  <Person sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  Пользователи с доступом ({sharedUsers.length})
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {sharedUsers.map(userId => {
                    const sharedUser = users[userId];
                    return (
                      <ListItem 
                        key={userId}
                        sx={{ 
                          bgcolor: isDark ? 'background.subtle' : 'grey.50', 
                          borderRadius: 2, 
                          mb: 1 
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {sharedUser?.firstName?.charAt(0) || '?'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={sharedUser ? `${sharedUser.firstName} ${sharedUser.lastName}` : 'Неизвестно'}
                          secondary={sharedUser?.email}
                        />
                        {isOwner && (
                          <ListItemSecondaryAction>
                            <IconButton 
                              size="small" 
                              onClick={() => handleUnshareWithUser(userId)}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}

            <Divider />

            {/* Добавить команду */}
            {isOwner && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  <Groups sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  Поделиться с командой
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Autocomplete
                    size="small"
                    options={availableTeamsToShare}
                    value={selectedTeamToShare}
                    onChange={(e, v) => setSelectedTeamToShare(v)}
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props;
                      return (
                        <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                            <Groups sx={{ fontSize: 14 }} />
                          </Avatar>
                          {option.name}
                        </Box>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Выберите команду..." />
                    )}
                    sx={{ flex: 1 }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleShareWithTeam}
                    disabled={!selectedTeamToShare}
                    sx={{ borderRadius: 50 }}
                  >
                    Добавить
                  </Button>
                </Box>
              </Box>
            )}

            {/* Список расшаренных команд */}
            {sharedTeams.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  <Groups sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  Команды с доступом ({sharedTeams.length})
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {sharedTeams.map(teamId => {
                    const team = allTeams.find(t => t.id === teamId);
                    return (
                      <ListItem 
                        key={teamId}
                        sx={{ 
                          bgcolor: isDark ? 'background.subtle' : 'grey.50', 
                          borderRadius: 2, 
                          mb: 1 
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <Groups sx={{ fontSize: 18 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={team?.name || 'Неизвестная команда'}
                          secondary={`${Object.keys(team?.members || {}).length} участников`}
                        />
                        {isOwner && (
                          <ListItemSecondaryAction>
                            <IconButton 
                              size="small" 
                              onClick={() => handleUnshareWithTeam(teamId)}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}

            {sharedUsers.length === 0 && sharedTeams.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Lock sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">
                  Набросок доступен только вам
                </Typography>
                {isOwner && (
                  <Typography variant="caption" color="text.secondary">
                    Добавьте пользователей или команды для совместного доступа
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        )}

        {/* Таб: Комментарии */}
        {activeTab === 2 && (
          <Box>
            {comments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Пока нет комментариев
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {comments.map((comment, index) => {
                  const commentUser = users[comment.userId];
                  return (
                    <React.Fragment key={comment.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {commentUser?.firstName?.charAt(0) || '?'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {commentUser ? `${commentUser.firstName} ${commentUser.lastName}` : 'Неизвестно'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {comment.createdAt && format(
                                  comment.createdAt.toDate ? comment.createdAt.toDate() : new Date(comment.createdAt), 
                                  'dd.MM.yyyy HH:mm'
                                )}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {comment.text}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}

            {/* Добавить комментарий */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                {user?.firstName?.charAt(0)}
              </Avatar>
              <TextField
                fullWidth
                size="small"
                placeholder="Добавить комментарий... (@ для упоминания)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                multiline
                maxRows={3}
              />
              <IconButton 
                color="primary" 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button
          startIcon={<Psychology />}
          onClick={handleAIConvert}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          }}
        >
          Преобразовать в задачи AI
        </Button>
        <Button onClick={onClose} sx={{ borderRadius: 50 }}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SketchModal;
