// src/components/Task/TaskDrawer.jsx
// Обновлённый дизайн: как у SketchDrawer, 2 колонки полей, автор в хедере
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Drawer, Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  IconButton, Avatar, Divider, List, ListItem, ListItemText, ListItemAvatar, Alert,
  CircularProgress, Checkbox, LinearProgress, Chip, Collapse, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, Menu, ListItemIcon, useTheme,
} from '@mui/material';
import {
  Delete, Add, CheckCircle, RadioButtonUnchecked, AttachFile, Schedule, Flag, ExpandMore,
  ExpandLess, PlaylistAddCheck, Send, Close, AutoAwesome, MoreVert,
} from '@mui/icons-material';
import { UserContext } from '../../App';
import taskService from '../../services/task.service';
import userService from '../../services/user.service';
import boardService from '../../services/board.service';
import aiService from '../../services/ai.service';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { gradients } from '../../theme';

const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};

const PRIORITY_CONFIG = {
  low: { label: 'Низкий', color: '#9E9E9E' },
  normal: { label: 'Нормальный', color: bauhaus.blue },
  high: { label: 'Высокий', color: bauhaus.yellow },
  urgent: { label: 'Срочный', color: bauhaus.red },
};

const EXISTING_TAGS = ['frontend', 'backend', 'urgent', 'bug', 'feature', 'refactor', 'design', 'testing'];

function TaskDrawer({ task, columns: propColumns, onClose, onUpdate }) {
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const fileInputRef = useRef(null);

  const [taskData, setTaskData] = useState(task);
  const [comments, setComments] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [users, setUsers] = useState([]);
  const [columns, setColumns] = useState(propColumns || []);
  const [author, setAuthor] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [commentText, setCommentText] = useState('');
  const [commentAttachments, setCommentAttachments] = useState([]);
  const [attachMenuAnchor, setAttachMenuAnchor] = useState(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [aiGeneratingImage, setAiGeneratingImage] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState(null);

  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [expandedChecklists, setExpandedChecklists] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa',
      '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f0f1f3' },
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0' },
  };

  useEffect(() => { loadData(); }, [task?.id]);

  const loadData = async () => {
    if (!task?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [taskRes, commentsRes, usersRes] = await Promise.all([
        taskService.getTask(task.id),
        taskService.getComments(task.id),
        userService.getApprovedUsers(),
      ]);
      if (!taskRes.success) throw new Error('Задача не найдена');
      setTaskData(taskRes.task);
      setComments(commentsRes.success ? commentsRes.comments : []);
      setUsers(usersRes.success ? usersRes.users : []);
      setChecklists(taskRes.task.checklists || []);
      
      const expanded = {};
      (taskRes.task.checklists || []).forEach(cl => { expanded[cl.id] = true; });
      setExpandedChecklists(expanded);

      // Автор
      const authorId = taskRes.task.createdBy || taskRes.task.authorId;
      if (authorId) {
        const authorRes = await userService.getUserById(authorId);
        if (authorRes.success) setAuthor(authorRes.user);
      }

      if (taskRes.task.boardId && (!propColumns || propColumns.length === 0)) {
        const boardRes = await boardService.getBoard(taskRes.task.boardId);
        if (boardRes.success) setColumns(boardRes.board.columns || []);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleUpdateField = (field, value) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await taskService.updateTask(task.id, { ...taskData, checklists });
      setHasUnsavedChanges(false);
      if (onUpdate) onUpdate();
    } catch (e) { console.error(e); }
    setIsSaving(false);
  };

  const handleAddChecklist = () => {
    if (!newChecklistName.trim()) return;
    const newChecklist = { id: `cl_${Date.now()}`, name: newChecklistName.trim(), items: [] };
    setChecklists(prev => [...prev, newChecklist]);
    setExpandedChecklists(prev => ({ ...prev, [newChecklist.id]: true }));
    setNewChecklistName('');
    setShowAddChecklist(false);
    setHasUnsavedChanges(true);
  };

  const handleAddChecklistItem = (checklistId, text) => {
    if (!text.trim()) return;
    setChecklists(prev => prev.map(cl =>
      cl.id === checklistId ? { ...cl, items: [...cl.items, { id: `item_${Date.now()}`, text: text.trim(), done: false }] } : cl
    ));
    setHasUnsavedChanges(true);
  };

  const handleToggleChecklistItem = (checklistId, itemId) => {
    setChecklists(prev => prev.map(cl =>
      cl.id === checklistId ? { ...cl, items: cl.items.map(it => it.id === itemId ? { ...it, done: !it.done } : it) } : cl
    ));
    setHasUnsavedChanges(true);
  };

  const handleDeleteChecklist = (checklistId) => {
    setChecklists(prev => prev.filter(cl => cl.id !== checklistId));
    setHasUnsavedChanges(true);
  };

  const getChecklistProgress = (items) => {
    if (!items || items.length === 0) return 0;
    return Math.round((items.filter(it => it.done).length / items.length) * 100);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCommentAttachments(prev => [...prev, { type: 'file', name: file.name, url: ev.target.result, mimeType: file.type }]);
    };
    reader.readAsDataURL(file);
    setAttachMenuAnchor(null);
  };

  const handleGenerateAiImage = async () => {
    if (!aiImagePrompt.trim()) return;
    setAiGeneratingImage(true);
    try {
      const result = await aiService.generateImage(aiImagePrompt);
      if (result.success && result.imageUrl) setAiGeneratedImage(result.imageUrl);
    } catch (error) { console.error(error); }
    finally { setAiGeneratingImage(false); }
  };

  const handleAcceptAiImage = () => {
    if (aiGeneratedImage) {
      setCommentAttachments(prev => [...prev, { type: 'ai_image', url: aiGeneratedImage, prompt: aiImagePrompt }]);
      setShowAiPanel(false);
      setAiGeneratedImage(null);
      setAiImagePrompt('');
    }
  };

  const handleSendComment = async () => {
    const userId = user?.uid;
    if (!userId || (!commentText.trim() && commentAttachments.length === 0)) return;
    const result = await taskService.addComment(task.id, commentText.trim(), userId, commentAttachments);
    if (result.success) {
      const commentsResult = await taskService.getComments(task.id);
      if (commentsResult.success) setComments(commentsResult.comments);
    }
    setCommentText('');
    setCommentAttachments([]);
    setShowAiPanel(false);
  };

  const handleDeleteTask = async () => {
    await taskService.deleteTask(task.id);
    if (onUpdate) onUpdate();
    onClose();
    setDeleteDialogOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
      return format(d, 'yyyy-MM-dd');
    } catch { return ''; }
  };

  const formatDateDisplay = (date) => {
    if (!date) return '—';
    try {
      const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
      return format(d, 'dd MMM yyyy', { locale: ru });
    } catch { return '—'; }
  };

  const getCommentUser = (userId) => users.find(u => u.id === userId);
  const getAssignee = () => users.find(u => u.id === taskData?.assigneeId);
  const getCurrentColumn = () => columns.find(c => c.id === taskData?.columnId);
  const priorityConfig = PRIORITY_CONFIG[taskData?.priority] || PRIORITY_CONFIG.normal;

  if (loading) {
    return (
      <Drawer anchor="right" open={true} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 560 }, borderRadius: '16px 0 0 16px' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>
      </Drawer>
    );
  }

  if (error) {
    return (
      <Drawer anchor="right" open={true} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 560 }, borderRadius: '16px 0 0 16px' } }}>
        <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>
      </Drawer>
    );
  }

  return (
    <>
      <Drawer anchor="right" open={true} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 560 }, borderRadius: '16px 0 0 16px' } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* HEADER - цветной как у SketchDrawer */}
          <Box sx={{ background: gradients.primary, p: 2.5, color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  variant="standard"
                  value={taskData.title || ''}
                  onChange={(e) => handleUpdateField('title', e.target.value)}
                  placeholder="Название задачи"
                  InputProps={{ disableUnderline: true, style: { color: 'white', fontSize: '1.25rem', fontWeight: 600 } }}
                  sx={{ '& input::placeholder': { color: 'rgba(255,255,255,0.7)' } }}
                />
                {/* Автор и дата */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Avatar src={author?.avatarUrl} sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                    {author?.firstName?.charAt(0) || '?'}
                  </Avatar>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {author ? `${author.firstName} ${author.lastName}` : 'Автор неизвестен'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    • {formatDateDisplay(taskData.createdAt)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" sx={{ color: 'white' }} onClick={(e) => setMenuAnchor(e.currentTarget)}><MoreVert /></IconButton>
                <IconButton size="small" sx={{ color: 'white' }} onClick={onClose}><Close /></IconButton>
              </Box>
            </Box>
          </Box>

          {/* CONTENT */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
            {/* ПОЛЯ В 2 КОЛОНКИ */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
              {/* Статус */}
              <FormControl fullWidth size="small">
                <InputLabel>Статус</InputLabel>
                <Select value={taskData.columnId || ''} onChange={(e) => handleUpdateField('columnId', e.target.value)} label="Статус" sx={fieldSx}>
                  {columns.map((col) => (
                    <MenuItem key={col.id} value={col.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: col.color || '#c4c4c4' }} />
                        {col.title}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Приоритет */}
              <FormControl fullWidth size="small">
                <InputLabel>Приоритет</InputLabel>
                <Select value={taskData.priority || 'normal'} onChange={(e) => handleUpdateField('priority', e.target.value)} label="Приоритет" sx={fieldSx}>
                  {Object.entries(PRIORITY_CONFIG).map(([key, { label, color }]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Flag sx={{ color, fontSize: 18 }} />
                        {label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Исполнитель */}
              <FormControl fullWidth size="small">
                <InputLabel>Исполнитель</InputLabel>
                <Select value={taskData.assigneeId || ''} onChange={(e) => handleUpdateField('assigneeId', e.target.value)} label="Исполнитель" sx={fieldSx}>
                  <MenuItem value="">Не назначен</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={u.avatarUrl} sx={{ width: 24, height: 24 }}>{u.firstName?.charAt(0)}</Avatar>
                        {u.firstName} {u.lastName}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Автор (только отображение) */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Автор:</Typography>
                <Avatar src={author?.avatarUrl} sx={{ width: 20, height: 20 }}>{author?.firstName?.charAt(0)}</Avatar>
                <Typography variant="body2">{author?.firstName || '—'}</Typography>
              </Box>

              {/* Дата старта */}
              <TextField fullWidth size="small" type="date" label="Дата старта" value={formatDate(taskData.startDate)} onChange={(e) => handleUpdateField('startDate', e.target.value)} sx={fieldSx} InputLabelProps={{ shrink: true }} />

              {/* Дедлайн */}
              <TextField fullWidth size="small" type="date" label="Дедлайн" value={formatDate(taskData.dueDate)} onChange={(e) => handleUpdateField('dueDate', e.target.value)} sx={fieldSx} InputLabelProps={{ shrink: true }} />
            </Box>

            {/* Теги */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Теги</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(taskData.tags || []).map((tag, i) => (
                  <Chip key={i} label={tag} size="small" onDelete={() => handleUpdateField('tags', taskData.tags.filter((_, idx) => idx !== i))} />
                ))}
                <Chip label="+ Добавить" size="small" variant="outlined" onClick={() => {
                  const newTag = prompt('Введите тег:');
                  if (newTag?.trim()) handleUpdateField('tags', [...(taskData.tags || []), newTag.trim()]);
                }} />
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Описание */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Описание</Typography>
              <TextField fullWidth multiline minRows={3} maxRows={6} placeholder="Добавить описание..." value={taskData.description || ''} onChange={(e) => handleUpdateField('description', e.target.value)} sx={fieldSx} />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Чеклисты */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PlaylistAddCheck fontSize="small" /> Чеклисты ({checklists.length})
                </Typography>
                <Button size="small" startIcon={<Add />} onClick={() => setShowAddChecklist(true)}>Добавить</Button>
              </Box>

              <Collapse in={showAddChecklist}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField fullWidth size="small" placeholder="Название чеклиста..." value={newChecklistName} onChange={(e) => setNewChecklistName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddChecklist()} sx={fieldSx} />
                  <Button size="small" variant="contained" onClick={handleAddChecklist}>OK</Button>
                  <IconButton size="small" onClick={() => setShowAddChecklist(false)}><Close fontSize="small" /></IconButton>
                </Box>
              </Collapse>

              {checklists.map((checklist) => {
                const progress = getChecklistProgress(checklist.items);
                const isExpanded = expandedChecklists[checklist.id];
                return (
                  <Box key={checklist.id} sx={{ mb: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa', borderRadius: 2, p: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedChecklists(prev => ({ ...prev, [checklist.id]: !isExpanded }))}>
                      {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                      <Typography variant="body2" fontWeight={600} sx={{ flex: 1, ml: 0.5 }}>{checklist.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>{progress}%</Typography>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteChecklist(checklist.id); }}><Delete fontSize="small" /></IconButton>
                    </Box>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 2, my: 1 }} />
                    <Collapse in={isExpanded}>
                      <List dense sx={{ p: 0 }}>
                        {checklist.items.map((item) => (
                          <ListItem key={item.id} sx={{ px: 0 }}>
                            <Checkbox size="small" checked={item.done} onChange={() => handleToggleChecklistItem(checklist.id, item.id)} icon={<RadioButtonUnchecked fontSize="small" />} checkedIcon={<CheckCircle fontSize="small" />} />
                            <ListItemText primary={item.text} sx={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'text.secondary' : 'text.primary' }} />
                          </ListItem>
                        ))}
                      </List>
                      <ChecklistItemAdder onAdd={(text) => handleAddChecklistItem(checklist.id, text)} fieldSx={fieldSx} />
                    </Collapse>
                  </Box>
                );
              })}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Комментарии */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Комментарии ({comments.length})</Typography>
              <List sx={{ p: 0 }}>
                {comments.map((comment) => {
                  const commentUser = getCommentUser(comment.userId);
                  return (
                    <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar><Avatar src={commentUser?.avatarUrl} sx={{ width: 32, height: 32 }}>{commentUser?.firstName?.charAt(0) || '?'}</Avatar></ListItemAvatar>
                      <ListItemText
                        primary={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><Typography variant="body2" fontWeight={600}>{commentUser?.firstName || 'Пользователь'}</Typography><Typography variant="caption" color="text.secondary">{formatDateDisplay(comment.createdAt)}</Typography></Box>}
                        secondary={<><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{comment.text}</Typography>{comment.attachments?.length > 0 && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>{comment.attachments.map((att, i) => att.type === 'ai_image' || att.mimeType?.startsWith('image/') ? <Box key={i} component="img" src={att.url} sx={{ maxWidth: 150, maxHeight: 100, borderRadius: 1 }} /> : <Chip key={i} label={att.name} size="small" icon={<AttachFile />} />)}</Box>}</>}
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  );
                })}
              </List>

              {/* AI панель */}
              <Collapse in={showAiPanel}>
                <Box sx={{ mb: 2, p: 2, border: 1, borderColor: 'primary.main', borderRadius: 2, bgcolor: isDark ? 'rgba(30,136,229,0.1)' : 'primary.50' }}>
                  <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block' }}>Генерация AI изображения</Typography>
                  <TextField fullWidth size="small" multiline rows={2} placeholder="Опишите изображение..." value={aiImagePrompt} onChange={(e) => setAiImagePrompt(e.target.value)} sx={{ ...fieldSx, mb: 1 }} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="contained" onClick={handleGenerateAiImage} disabled={aiGeneratingImage || !aiImagePrompt.trim()} startIcon={aiGeneratingImage ? <CircularProgress size={16} /> : <AutoAwesome />}>Сгенерировать</Button>
                    <Button size="small" onClick={() => { setShowAiPanel(false); setAiGeneratedImage(null); setAiImagePrompt(''); }}>Отмена</Button>
                  </Box>
                  {aiGeneratedImage && <Box sx={{ mt: 2 }}><Box component="img" src={aiGeneratedImage} sx={{ maxWidth: '100%', maxHeight: 150, borderRadius: 1, mb: 1 }} /><Button size="small" variant="outlined" onClick={handleAcceptAiImage}>Прикрепить</Button></Box>}
                </Box>
              </Collapse>

              {/* Превью аттачментов */}
              {commentAttachments.length > 0 && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>{commentAttachments.map((att, i) => <Chip key={i} label={att.name || (att.type === 'ai_image' ? 'AI изображение' : 'Файл')} size="small" onDelete={() => setCommentAttachments(prev => prev.filter((_, idx) => idx !== i))} icon={att.type === 'ai_image' ? <AutoAwesome /> : <AttachFile />} />)}</Box>}

              {/* Поле ввода */}
              <TextField fullWidth size="small" placeholder="Написать комментарий..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendComment()} sx={fieldSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><IconButton size="small" onClick={(e) => setAttachMenuAnchor(e.currentTarget)}><AttachFile fontSize="small" /></IconButton></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton onClick={handleSendComment} disabled={!commentText.trim() && commentAttachments.length === 0} color="primary"><Send /></IconButton></InputAdornment>,
                }}
              />
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
            </Box>
          </Box>

          {/* FOOTER */}
          {hasUnsavedChanges && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip label="Несохранённые изменения" size="small" color="warning" />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={onClose}>Отмена</Button>
                <Button size="small" variant="contained" onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? '...' : 'Сохранить'}</Button>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Меню */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { setDeleteDialogOpen(true); setMenuAnchor(null); }} sx={{ color: 'error.main' }}><ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>Удалить задачу</MenuItem>
      </Menu>

      <Menu anchorEl={attachMenuAnchor} open={Boolean(attachMenuAnchor)} onClose={() => setAttachMenuAnchor(null)}>
        <MenuItem onClick={() => { fileInputRef.current?.click(); setAttachMenuAnchor(null); }}><ListItemIcon><AttachFile fontSize="small" /></ListItemIcon>Загрузить файл</MenuItem>
        <MenuItem onClick={() => { setShowAiPanel(true); setAttachMenuAnchor(null); }}><ListItemIcon><AutoAwesome fontSize="small" /></ListItemIcon>AI изображение</MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удалить задачу?</DialogTitle>
        <DialogContent><DialogContentText>Это действие нельзя отменить.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteTask} color="error" variant="contained">Удалить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function ChecklistItemAdder({ onAdd, fieldSx }) {
  const [text, setText] = useState('');
  const handleAdd = () => { if (text.trim()) { onAdd(text.trim()); setText(''); } };
  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
      <TextField fullWidth size="small" placeholder="Добавить пункт..." value={text} onChange={(e) => setText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAdd()} sx={fieldSx} />
      <IconButton size="small" onClick={handleAdd} disabled={!text.trim()}><Add fontSize="small" /></IconButton>
    </Box>
  );
}

export default TaskDrawer;
