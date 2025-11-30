// src/components/Task/TaskModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Alert
} from '@mui/material';
import {
  Close,
  Delete,
  AttachFile,
  Send,
  Upload,
  Download,
  CalendarToday,
  Person,
  Label,
  Flag
} from '@mui/icons-material';
import { UserContext } from '../../App';
import taskService from '../../services/task.service';
import userService from '../../services/user.service';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

function TaskModal({ boardId, task, columns, onClose }) {
  const { user } = useContext(UserContext);
  
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [taskData, setTaskData] = useState(task);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribeTask = taskService.subscribeToTask(boardId, task.id, (updatedTask) => {
      setTaskData(updatedTask);
    });

    const unsubscribeComments = taskService.subscribeToComments(boardId, task.id, (commentsData) => {
      setComments(commentsData);
    });

    const unsubscribeActivity = taskService.subscribeToActivity(boardId, task.id, (activityData) => {
      setActivities(activityData);
    });

    loadUsers();

    return () => {
      unsubscribeTask();
      unsubscribeComments();
      unsubscribeActivity();
    };
  }, [boardId, task.id]);

  const loadUsers = async () => {
    const result = await userService.getAllUsers();
    if (result.success) {
      setUsers(result.users.filter(u => u.role !== 'pending'));
    }
  };

  const handleUpdateField = (field, value) => {
  // Логируем изменения
  console.log('Update field:', field, value);
  
  setTaskData(prev => ({ ...prev, [field]: value }));
  setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    const updates = {};
    
    if (taskData.title !== task.title) updates.title = taskData.title;
    if (taskData.description !== task.description) updates.description = taskData.description;
    if (taskData.columnId !== task.columnId) updates.columnId = taskData.columnId;
    if (taskData.assigneeId !== task.assigneeId) updates.assigneeId = taskData.assigneeId;
    if (taskData.priority !== task.priority) updates.priority = taskData.priority;
    if (taskData.dueDate !== task.dueDate) updates.dueDate = taskData.dueDate;
    if (JSON.stringify(taskData.tags) !== JSON.stringify(task.tags)) updates.tags = taskData.tags;
    
    if (Object.keys(updates).length > 0) {
      await taskService.updateTask(boardId, task.id, updates, user.uid);
    }
    
    setHasUnsavedChanges(false);
    setIsSaving(false);
  };

  const handleCancelChanges = () => {
    setTaskData(task);
    setHasUnsavedChanges(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const mentions = [];
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(newComment)) !== null) {
      const mentionedUser = users.find(u => 
        u.firstName.toLowerCase() === match[1].toLowerCase()
      );
      if (mentionedUser) {
        mentions.push(mentionedUser.id);
      }
    }

    await taskService.addComment(boardId, task.id, newComment, user.uid, mentions);
    setNewComment('');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 10MB');
      return;
    }

    setUploading(true);
    const result = await taskService.uploadFile(boardId, task.id, file, user.uid);
    setUploading(false);

    if (!result.success) {
      alert('Ошибка загрузки файла');
    }
  };

  const handleDeleteFile = async (index) => {
    if (window.confirm('Удалить файл?')) {
      await taskService.deleteFile(boardId, task.id, index, user.uid);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Удалить задачу?')) {
      await taskService.deleteTask(boardId, task.id, user.uid);
      onClose();
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Срочно';
      case 'recurring': return 'Постоянная';
      default: return 'Нормально';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'created': return '✨';
      case 'updated': return '✏️';
      case 'moved': return '➡️';
      case 'comment_added': return '💬';
      case 'file_added': return '📎';
      case 'file_deleted': return '🗑️';
      default: return '•';
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Задача</Typography>
        <Box>
          <Button
            color="error"
            startIcon={<Delete />}
            onClick={handleDeleteTask}
            sx={{ mr: 1 }}
          >
            Удалить
          </Button>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, pb: hasUnsavedChanges ? 10 : 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Название */}
          {editMode ? (
            <TextField
              fullWidth
              multiline
              value={taskData.title}
              onChange={(e) => handleUpdateField('title', e.target.value)}
              onBlur={() => setEditMode(false)}
              autoFocus
              sx={{ mb: 2 }}
            />
          ) : (
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ mb: 2, cursor: 'pointer' }}
              onClick={() => setEditMode(true)}
            >
              {taskData.title}
            </Typography>
          )}

          {/* Основные поля */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={taskData.columnId}
                label="Статус"
                onChange={(e) => handleUpdateField('columnId', e.target.value)}
              >
                {columns.map((column) => (
                  <MenuItem key={column.id} value={column.id}>
                    {column.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Исполнитель</InputLabel>
              <Select
                value={taskData.assigneeId || ''}
                label="Исполнитель"
                onChange={(e) => handleUpdateField('assigneeId', e.target.value)}
              >
                <MenuItem value="">Не назначен</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={taskData.priority}
                label="Приоритет"
                onChange={(e) => handleUpdateField('priority', e.target.value)}
              >
                <MenuItem value="normal">Нормально</MenuItem>
                <MenuItem value="urgent">Срочно</MenuItem>
                <MenuItem value="recurring">Постоянная задача</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              type="date"
              label="Срок выполнения"
              value={taskData.dueDate ? format(new Date(taskData.dueDate), 'yyyy-MM-dd') : ''}
              onChange={(e) => handleUpdateField('dueDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Теги */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Теги</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {taskData.tags && taskData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => {
                    const newTags = taskData.tags.filter((_, i) => i !== index);
                    handleUpdateField('tags', newTags);
                  }}
                  size="small"
                />
              ))}
              <Chip
                label="+ Добавить тег"
                size="small"
                variant="outlined"
                onClick={() => {
                  const tag = prompt('Введите тег:');
                  if (tag) {
                    handleUpdateField('tags', [...(taskData.tags || []), tag]);
                  }
                }}
              />
            </Box>
          </Box>

          {/* Табы */}
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label="Описание" />
            <Tab label={`Комментарии (${comments.length})`} />
            <Tab label="Файлы" />
            <Tab label="История" />
          </Tabs>

          <Divider sx={{ mb: 2 }} />

          {/* Контент табов */}
          {activeTab === 0 && (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={taskData.description}
                onChange={(e) => handleUpdateField('description', e.target.value)}
                placeholder="Добавьте описание задачи..."
                helperText="Поддерживается Markdown"
              />
              
              {taskData.description && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>Предпросмотр:</Typography>
                  <ReactMarkdown>{taskData.description}</ReactMarkdown>
                </Paper>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <List>
                {comments.map((comment) => {
                  const commentUser = users.find(u => u.id === comment.userId);
                  return (
                    <ListItem key={comment.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>
                          {commentUser?.firstName?.charAt(0) || '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">
                              {commentUser?.firstName} {commentUser?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {comment.createdAt && format(comment.createdAt.toDate(), 'dd.MM.yyyy HH:mm')}
                            </Typography>
                          </Box>
                        }
                        secondary={comment.text}
                      />
                    </ListItem>
                  );
                })}
              </List>

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Добавить комментарий..."
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

          {activeTab === 2 && (
            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<Upload />}
                disabled={uploading}
                sx={{ mb: 2 }}
              >
                {uploading ? 'Загрузка...' : 'Загрузить файл'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>

              <List>
                {taskData.attachments && taskData.attachments.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <Box>
                        <IconButton
                          edge="end"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Download />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteFile(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <AttachFile />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(2)} KB`}
                    />
                  </ListItem>
                ))}
              </List>

              {(!taskData.attachments || taskData.attachments.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Нет загруженных файлов
                </Typography>
              )}
            </Box>
          )}

          {activeTab === 3 && (
            <List>
              {activities.map((activity) => {
                const activityUser = users.find(u => u.id === activity.userId);
                return (
                  <ListItem key={activity.id}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{getActivityIcon(activity.type)}</span>
                          <Typography variant="body2">
                            <strong>{activityUser?.firstName}</strong> {activity.details}
                          </Typography>
                        </Box>
                      }
                      secondary={activity.timestamp && format(activity.timestamp.toDate(), 'dd.MM.yyyy HH:mm')}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        {/* Footer с кнопками сохранения */}
        {hasUnsavedChanges && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: '#FFF4E5',
              borderTop: 2,
              borderColor: 'warning.main',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              zIndex: 1300,
            }}
          >
            <Typography variant="body2" fontWeight="600" color="warning.dark">
              ⚠️ Есть несохраненные изменения
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleCancelChanges}
                disabled={isSaving}
              >
                Отменить
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TaskModal;