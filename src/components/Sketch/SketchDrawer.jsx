// src/components/Sketch/SketchDrawer.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import StackedDrawer from '../Common/StackedDrawer';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Autocomplete,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  Close,
  Edit,
  Save,
  Share,
  Lock,
  Public,
  Person,
  Group,
  Send,
  MoreVert,
  Delete,
  AutoAwesome,
  TaskAlt,
  ContentCopy,
  AttachFile,
  Image as ImageIcon,
  ChecklistRtl,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { UserContext } from '../../App';
import sketchService from '../../services/sketch.service';
import userService from '../../services/user.service';
import teamService from '../../services/team.service';
import aiService from '../../services/ai.service';
import CommentInput from '../Common/CommentInput';
import ThreadedComment from '../Common/ThreadedComment';
import { gradients } from "../../theme";
import AITaskCreator from "../AI/AITaskCreator";
import AIProcessingOverlay from "../Common/AIProcessingOverlay";
import { useToast } from "../../contexts/ToastContext";

function SketchDrawer({ open, onClose, sketchId, drawerId }) {
  const { user } = useContext(UserContext);
  const toast = useToast();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [sketch, setSketch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Форма редактирования
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState([]);

  // Доступ
  const [allUsers, setAllUsers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [sharedTeams, setSharedTeams] = useState([]);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);

  // Комментарии
  const [comments, setComments] = useState([]);
  const [commentUsers, setCommentUsers] = useState({});

  // AI конвертация в задачи
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTasks, setAiTasks] = useState([]);
  const [aiError, setAiError] = useState('');
  
  // Автор
  const [author, setAuthor] = useState(null);
  
  // Меню действий
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Стили для полей в dark mode
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f6f8',
      '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#e6e9ef' },
      '&.Mui-focused': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#fff' },
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { 
      border: `1px solid ${theme.palette.primary.main}` 
    },
  };

  useEffect(() => {
    if (open && sketchId) {
      loadSketch();
      loadUsers();
      loadTeams();
    }
  }, [open, sketchId]);

  // Подписка на комментарии
  useEffect(() => {
    if (!open || !sketchId) return;

    const unsubscribe = sketchService.subscribeToComments(sketchId, (updatedComments) => {
      setComments(updatedComments);
      // Загружаем данные пользователей
      updatedComments.forEach(comment => {
        if (comment.userId && !commentUsers[comment.userId]) {
          userService.getUserById(comment.userId).then(result => {
            if (result.success) {
              setCommentUsers(prev => ({ ...prev, [comment.userId]: result.user }));
            }
          });
        }
      });
    });

    return () => unsubscribe();
  }, [open, sketchId]);

  // Построить дерево комментариев из плоского массива
  const buildCommentTree = (flatComments) => {
    const commentMap = {};
    const rootComments = [];

    // Создаем мапу всех комментариев
    flatComments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Строим дерево
    Object.values(commentMap).forEach(comment => {
      if (comment.parentId && commentMap[comment.parentId]) {
        // Это ответ на другой комментарий
        commentMap[comment.parentId].replies.push(comment);
      } else {
        // Это комментарий верхнего уровня
        rootComments.push(comment);
      }
    });

    return rootComments;
  };

  const loadSketch = async () => {
    setLoading(true);
    try {
      const result = await sketchService.getSketch(sketchId);
      if (result.success) {
        setSketch(result.sketch);
        setEditTitle(result.sketch.title);
        setEditContent(result.sketch.content || '');
        setEditTags(result.sketch.tags || []);
        setSharedUsers(result.sketch.sharedWith?.users || []);
        setSharedTeams(result.sketch.sharedWith?.teams || []);
        
        // Загружаем автора
        const authorId = result.sketch.authorId || result.sketch.createdBy;
        if (authorId) {
          const authorResult = await userService.getUserById(authorId);
          if (authorResult.success) {
            setAuthor(authorResult.user);
          }
        }
      }
    } catch (error) {
      console.error('Error loading sketch:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const result = await userService.getApprovedUsers();
    if (result.success) {
      setAllUsers(result.users.filter(u => u.id !== user.uid));
    }
  };

  const loadTeams = async () => {
    const result = await teamService.getUserTeams(user.uid);
    if (result.success) {
      setAllTeams(result.teams);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await sketchService.updateSketch(sketchId, {
        title: editTitle,
        content: editContent,
        tags: editTags,
      });
      setSketch(prev => ({
        ...prev,
        title: editTitle,
        content: editContent,
        tags: editTags,
      }));
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error saving sketch:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleShareWithUser = async (userId) => {
    try {
      await sketchService.shareWithUser(sketchId, userId, user.uid);
      setSharedUsers(prev => [...prev, userId]);
    } catch (error) {
      console.error('Error sharing with user:', error);
    }
  };

  const handleShareWithTeam = async (teamId) => {
    try {
      await sketchService.shareWithTeam(sketchId, teamId, user.uid);
      setSharedTeams(prev => [...prev, teamId]);
    } catch (error) {
      console.error('Error sharing with team:', error);
    }
  };

  // Конвертация в задачи AI
  const handleConvertToTasks = async () => {
    setAiDialogOpen(true);
    setAiGenerating(true);
    setAiError('');
    setAiTasks([]);

    try {
      // Собираем контекст: заголовок, контент и комментарии
      const commentsText = comments.map(c => {
        const u = commentUsers[c.userId];
        return `${u?.firstName || 'Пользователь'}: ${c.text}`;
      }).join('\n');

      const fullContext = `${sketch.title}\n\n${sketch.content || ''}\n\nКомментарии:\n${commentsText}`;

      const result = await aiService.sketchToTasks(sketch.title, fullContext);

      if (result.success && result.tasks) {
        setAiTasks(result.tasks);
        toast.success(`AI сгенерировал ${result.tasks.length} задач из наброска!`, { title: 'Успешно' });
      } else {
        const errorMsg = result.error || 'Не удалось сгенерировать задачи';
        setAiError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = error.message || 'Ошибка AI';
      setAiError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить набросок?')) return;
    
    try {
      await sketchService.deleteSketch(sketchId);
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error deleting sketch:', error);
    }
  };

  const isOwner = sketch?.authorId === user?.uid || sketch?.createdBy === user?.uid;

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return format(d, 'dd MMM yyyy, HH:mm', { locale: ru });
    } catch {
      return '';
    }
  };

  return (
    <StackedDrawer
      open={open}
      onClose={onClose}
      title={sketch?.title || 'Набросок'}
      id={drawerId}
      entityType="sketch"
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : !sketch ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Набросок не найден</Alert>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Контент */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {/* Title and Meta */}
            <Box sx={{ mb: 2 }}>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  sx={{
                    ...fieldSx,
                    '& .MuiOutlinedInput-root': {
                      ...fieldSx['& .MuiOutlinedInput-root'],
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }
                  }}
                />
              ) : (
                <Typography variant="h6" fontWeight={600}>
                  {sketch.title}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                {author && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={author.avatar} sx={{ width: 24, height: 24 }}>
                      {author.firstName?.charAt(0)}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {author.firstName} {author.lastName}
                    </Typography>
                  </Box>
                )}

                {isOwner && !isEditing && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => setIsEditing(true)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                      <MoreVert />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
            {/* Кнопка конвертации в задачи */}
            {!isEditing && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TaskAlt />}
                onClick={handleConvertToTasks}
                sx={{ mb: 2, borderRadius: 50 }}
              >
                Конвертировать в задачи AI
              </Button>
            )}

            {/* Контент наброска */}
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                minRows={6}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Содержимое наброска..."
                sx={{ ...fieldSx, mb: 2 }}
              />
            ) : (
              <Box sx={{ 
                p: 2, 
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.50', 
                borderRadius: 2, 
                mb: 2,
                whiteSpace: 'pre-wrap',
              }}>
                <Typography variant="body2">
                  {sketch.content || 'Нет содержимого'}
                </Typography>
              </Box>
            )}

            {/* Теги */}
            {isEditing ? (
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={editTags}
                onChange={(e, newValue) => setEditTags(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option} label={option} size="small" />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} placeholder="Добавить теги..." size="small" sx={fieldSx} />
                )}
                sx={{ mb: 2 }}
              />
            ) : sketch.tags?.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {sketch.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>
            )}

            {/* Кнопки редактирования */}
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ borderRadius: 50 }}
                >
                  Сохранить
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(sketch.title);
                    setEditContent(sketch.content || '');
                    setEditTags(sketch.tags || []);
                  }}
                  sx={{ borderRadius: 50 }}
                >
                  Отмена
                </Button>
              </Box>
            )}

            {/* Доступ */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Доступ
              </Typography>
              <Button
                size="small"
                startIcon={<Share />}
                onClick={(e) => setShareMenuAnchor(e.currentTarget)}
                sx={{ borderRadius: 50 }}
              >
                Поделиться
              </Button>
              
              {(sharedUsers.length > 0 || sharedTeams.length > 0) && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {sharedUsers.map((userId) => {
                    const u = allUsers.find(u => u.id === userId);
                    return (
                      <Chip
                        key={userId}
                        avatar={<Avatar src={u?.avatar}>{u?.firstName?.charAt(0)}</Avatar>}
                        label={u?.firstName || 'Пользователь'}
                        size="small"
                        onDelete={isOwner ? () => sketchService.unshareWithUser(sketchId, userId).then(() => setSharedUsers(prev => prev.filter(id => id !== userId))) : undefined}
                      />
                    );
                  })}
                  {sharedTeams.map((teamId) => {
                    const t = allTeams.find(t => t.id === teamId);
                    return (
                      <Chip
                        key={teamId}
                        icon={<Group />}
                        label={t?.name || 'Команда'}
                        size="small"
                        onDelete={isOwner ? () => sketchService.unshareWithTeam(sketchId, teamId).then(() => setSharedTeams(prev => prev.filter(id => id !== teamId))) : undefined}
                      />
                    );
                  })}
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Комментарии */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
              Комментарии ({comments.length})
            </Typography>

            <Stack spacing={2} sx={{ mb: 2 }}>
              {buildCommentTree(comments).map((comment) => (
                <ThreadedComment
                  key={comment.id}
                  comment={comment}
                  author={commentUsers[comment.userId]}
                  users={Object.values(commentUsers)}
                  replies={comment.replies || []}
                  currentUserId={user?.uid}
                  onReply={async (parentId, data) => {
                    const result = await sketchService.addComment(
                      sketchId,
                      user.uid,
                      data.text,
                      data.attachments,
                      data.mentions,
                      data.entityLinks,
                      parentId
                    );
                    if (!result.success) {
                      console.error('Error adding reply:', result.message);
                    }
                  }}
                  onEdit={async (commentId, text) => {
                    const result = await sketchService.updateComment(sketchId, commentId, { text });
                    if (!result.success) {
                      console.error('Error updating comment:', result.message);
                    }
                  }}
                  onDelete={async (commentId) => {
                    const result = await sketchService.deleteComment(sketchId, commentId);
                    if (!result.success) {
                      console.error('Error deleting comment:', result.message);
                    }
                  }}
                  entityType="sketch"
                  entityId={sketchId}
                />
              ))}
            </Stack>
          </Box>

          {/* Поле ввода комментария */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <CommentInput
              users={Object.values(commentUsers)}
              onSubmit={async (data) => {
                const result = await sketchService.addComment(
                  sketchId,
                  user.uid,
                  data.text,
                  data.attachments,
                  data.mentions,
                  data.entityLinks
                );
                if (!result.success) {
                  console.error('Error adding comment:', result.message);
                }
              }}
              placeholder="Написать комментарий..."
            />
          </Box>
        </Box>
      )}

      {/* Меню действий */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { navigator.clipboard.writeText(sketch?.content || ''); setMenuAnchor(null); }}>
          <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
          Копировать текст
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleDelete(); setMenuAnchor(null); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          Удалить
        </MenuItem>
      </Menu>

      {/* Меню шаринга */}
      <Menu anchorEl={shareMenuAnchor} open={Boolean(shareMenuAnchor)} onClose={() => setShareMenuAnchor(null)}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Пользователи</Typography>
          {allUsers.slice(0, 5).map((u) => (
            <MenuItem
              key={u.id}
              onClick={() => { handleShareWithUser(u.id); setShareMenuAnchor(null); }}
              disabled={sharedUsers.includes(u.id)}
            >
              <Avatar src={u.avatar} sx={{ width: 24, height: 24, mr: 1 }}>
                {u.firstName?.charAt(0)}
              </Avatar>
              {u.firstName} {u.lastName}
            </MenuItem>
          ))}
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" gutterBottom>Команды</Typography>
          {allTeams.map((t) => (
            <MenuItem
              key={t.id}
              onClick={() => { handleShareWithTeam(t.id); setShareMenuAnchor(null); }}
              disabled={sharedTeams.includes(t.id)}
            >
              <Group sx={{ mr: 1 }} fontSize="small" />
              {t.name}
            </MenuItem>
          ))}
        </Box>
      </Menu>

      {/* Диалог AI задач */}
      <AITaskCreator
        open={aiDialogOpen}
        onClose={() => {
          setAiDialogOpen(false);
          setAiTasks([]);
          setAiError('');
        }}
        aiTasks={aiTasks}
        generating={aiGenerating}
        error={aiError}
        onTasksCreated={(createdTasks) => {
          toast.success(
            `Создано ${createdTasks.length} ${createdTasks.length === 1 ? 'задача' : createdTasks.length < 5 ? 'задачи' : 'задач'} из наброска!`,
            { title: 'Отлично!' }
          );
          setAiDialogOpen(false);
          setAiTasks([]);
          onUpdate?.();
        }}
      />
    </StackedDrawer>
  );
}

export default SketchDrawer;
