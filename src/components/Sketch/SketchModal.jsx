import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Chip,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Close,
  Edit,
  Save,
  Share,
  Send,
  MoreVert,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { UserContext } from '../../App';
import sketchService from '../../services/sketch.service';
import userService from '../../services/user.service';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { generateLetterAvatar } from '../../utils/avatarGenerator';

function SketchModal({ open, onClose, sketch, teams }) {
  const { user } = useContext(UserContext);
  
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState([]);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [shareType, setShareType] = useState('user');
  const [shareTarget, setShareTarget] = useState('');

  const isAuthor = sketch.authorId === user.uid;

  useEffect(() => {
    if (open && sketch) {
      loadData();
      setEditData({
        title: sketch.title,
        description: sketch.description,
      });
    }
  }, [open, sketch]);

  const loadData = async () => {
    const unsubscribe = sketchService.subscribeToComments(sketch.id, (commentsData) => {
      setComments(commentsData);
    });

    const usersResult = await userService.getAllUsers();
    if (usersResult.success) {
      setUsers(usersResult.users);
    }

    return () => unsubscribe();
  };

  const handleSave = async () => {
    await sketchService.updateSketch(sketch.id, editData);
    setIsEditing(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const mentions = extractMentions(newComment);
    await sketchService.addComment(sketch.id, user.uid, newComment, mentions);
    setNewComment('');
  };

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      const mentionedUser = users.find(u =>
        u.firstName?.toLowerCase() === username.toLowerCase() ||
        u.lastName?.toLowerCase() === username.toLowerCase()
      );
      if (mentionedUser) {
        mentions.push(mentionedUser.id);
      }
    }
    
    return mentions;
  };

  const handleShare = async () => {
    if (!shareTarget) return;

    if (shareType === 'user') {
      await sketchService.shareWithUser(sketch.id, shareTarget);
    } else {
      await sketchService.shareWithTeam(sketch.id, shareTarget);
    }

    setShareMenuAnchor(null);
    setShareTarget('');
  };

  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
  };

  const getAvatarSrc = (userData) => {
    if (!userData) return '';
    if (userData.avatar === 'generated' || !userData.avatar) {
      return generateLetterAvatar(userData.firstName, userData.lastName);
    }
    if (userData.avatar?.startsWith('default-')) {
      const num = userData.avatar.replace('default-', '');
      return `/avatars/avatar-${num}.svg`;
    }
    return userData.avatar;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isEditing ? (
            <TextField
              fullWidth
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              sx={{ mr: 2 }}
            />
          ) : (
            <Typography variant="h6">{sketch.title}</Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isAuthor && (
              <>
                {isEditing ? (
                  <IconButton onClick={handleSave}>
                    <Save />
                  </IconButton>
                ) : (
                  <IconButton onClick={() => setIsEditing(true)}>
                    <Edit />
                  </IconButton>
                )}
                <IconButton onClick={(e) => setShareMenuAnchor(e.currentTarget)}>
                  <Share />
                </IconButton>
              </>
            )}
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label="Описание" />
          <Tab label={`Комментарии (${comments.length})`} />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={10}
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
            ) : (
              <>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                  {sketch.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="caption" color="text.secondary">
                  Создано: {sketch.createdAt && format(sketch.createdAt.toDate(), 'd MMMM yyyy HH:mm', { locale: ru })}
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
                  Автор: {getUserById(sketch.authorId)?.firstName} {getUserById(sketch.authorId)?.lastName}
                </Typography>
              </>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <List>
              {comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  Нет комментариев
                </Typography>
              ) : (
                comments.map((comment) => {
                  const commentUser = getUserById(comment.userId);
                  return (
                    <ListItem key={comment.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={getAvatarSrc(commentUser)} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">
                              {commentUser?.firstName} {commentUser?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {comment.createdAt && format(comment.createdAt.toDate(), 'HH:mm', { locale: ru })}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {comment.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                  );
                })
              )}
            </List>

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <TextField
                fullWidth
                placeholder="Написать комментарий... (используйте @ для упоминаний)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                multiline
                maxRows={4}
              />
              <IconButton color="primary" onClick={handleAddComment}>
                <Send />
              </IconButton>
            </Box>
          </Box>
        )}
      </DialogContent>

      <Menu
        anchorEl={shareMenuAnchor}
        open={Boolean(shareMenuAnchor)}
        onClose={() => setShareMenuAnchor(null)}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Поделиться наброском
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Тип</InputLabel>
            <Select
              value={shareType}
              label="Тип"
              onChange={(e) => setShareType(e.target.value)}
            >
              <MenuItem value="user">Пользователь</MenuItem>
              <MenuItem value="team">Команда</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{shareType === 'user' ? 'Пользователь' : 'Команда'}</InputLabel>
            <Select
              value={shareTarget}
              label={shareType === 'user' ? 'Пользователь' : 'Команда'}
              onChange={(e) => setShareTarget(e.target.value)}
            >
              {shareType === 'user' ? (
                users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </MenuItem>
                ))
              ) : (
                teams.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Button fullWidth variant="contained" onClick={handleShare}>
            Поделиться
          </Button>
        </Box>
      </Menu>
    </Dialog>
  );
}

export default SketchModal;