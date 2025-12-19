// src/components/Task/TaskDrawer.jsx
// Updated design: like SketchDrawer, 2-column fields, author in header
import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  IconButton, Avatar, Divider, List, ListItem, ListItemText, ListItemAvatar, Alert,
  CircularProgress, Checkbox, LinearProgress, Chip, Collapse, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, Menu, ListItemIcon, useTheme, Stack,
} from "@mui/material";
import StackedDrawer from "../Common/StackedDrawer";
import {
  Delete, Add, CheckCircle, RadioButtonUnchecked, AttachFile, Schedule, Flag, ExpandMore,
  ExpandLess, PlaylistAddCheck, Send, Close, AutoAwesome, MoreVert,
} from "@mui/icons-material";
import { UserContext } from "../../App";
import taskService from "../../services/task.service";
import userService from "../../services/user.service";
import boardService from "../../services/board.service";
import aiService from "../../services/ai.service";
import TaskAIAssistant from "./TaskAIAssistant";
import CommentInput from "../Common/CommentInput";
import ThreadedComment from "../Common/ThreadedComment";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { gradients } from "../../theme";

const bauhaus = {
  blue: "#1E88E5",
  red: "#E53935",
  yellow: "#FDD835",
  teal: "#26A69A",
  purple: "#7E57C2",
};

const PRIORITY_CONFIG = {
  low: { label: "Низкий", color: "#9E9E9E" },
  normal: { label: "Нормальный", color: bauhaus.blue },
  high: { label: "Высокий", color: bauhaus.yellow },
  urgent: { label: "Срочный", color: bauhaus.red },
};

const EXISTING_TAGS = ["frontend", "backend", "urgent", "bug", "feature", "refactor", "design", "testing"];

function TaskDrawer({ taskId, open = true, onClose, drawerId }) {
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [taskData, setTaskData] = useState(null);
  const [comments, setComments] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [users, setUsers] = useState([]);
  const [columns, setColumns] = useState([]);
  const [author, setAuthor] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState("");
  const [expandedChecklists, setExpandedChecklists] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#f8f9fa",
      "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.08)" : "#f0f1f3" },
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e0e0e0" },
  };

  useEffect(() => { loadData(); }, [taskId]);

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

  const loadData = async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const [taskRes, commentsRes, usersRes] = await Promise.all([
        taskService.getTask(taskId),
        taskService.getComments(taskId),
        userService.getApprovedUsers(),
      ]);
      if (!taskRes.success) throw new Error("Задача не найдена");
      setTaskData(taskRes.task);
      setComments(commentsRes.success ? commentsRes.comments : []);
      setUsers(usersRes.success ? usersRes.users : []);
      setChecklists(taskRes.task.checklists || []);

      const expanded = {};
      (taskRes.task.checklists || []).forEach(cl => { expanded[cl.id] = true; });
      setExpandedChecklists(expanded);

      // Author
      const authorId = taskRes.task.createdBy || taskRes.task.authorId;
      if (authorId) {
        const authorRes = await userService.getUserById(authorId);
        if (authorRes.success) setAuthor(authorRes.user);
      }

      if (taskRes.task.boardId) {
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
      await taskService.updateTask(taskId, { ...taskData, checklists });
      setHasUnsavedChanges(false);
    } catch (e) { console.error(e); }
    setIsSaving(false);
  };

  const handleAddChecklist = () => {
    if (!newChecklistName.trim()) return;
    const newChecklist = { id: `cl_${Date.now()}`, name: newChecklistName.trim(), items: [] };
    setChecklists(prev => [...prev, newChecklist]);
    setExpandedChecklists(prev => ({ ...prev, [newChecklist.id]: true }));
    setNewChecklistName("");
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

  const handleDeleteTask = async () => {
    await taskService.deleteTask(taskId);
    onClose();
    setDeleteDialogOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return "";
    try {
      const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
      return format(d, "yyyy-MM-dd");
    } catch { return ""; }
  };

  const formatDateDisplay = (date) => {
    if (!date) return "—";
    try {
      const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
      return format(d, "dd MMM yyyy", { locale: ru });
    } catch { return "—"; }
  };

  const getAssignee = () => users.find(u => u.id === taskData?.assigneeId);
  // eslint-disable-next-line no-unused-vars
  const getCurrentColumn = () => columns.find(c => c.id === taskData?.columnId);
  // eslint-disable-next-line no-unused-vars
  const priorityConfig = PRIORITY_CONFIG[taskData?.priority] || PRIORITY_CONFIG.normal;

  if (loading) {
    return (
      <StackedDrawer open={open} onClose={onClose} title="Загрузка..." id={drawerId}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}><CircularProgress /></Box>
      </StackedDrawer>
    );
  }

  if (error) {
    return (
      <StackedDrawer open={open} onClose={onClose} title="Ошибка" id={drawerId}>
        <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>
      </StackedDrawer>
    );
  }

  return (
    <>
      <StackedDrawer open={open} onClose={onClose} title={taskData?.title || "Задача"} id={drawerId} entityType="task">
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* CONTENT */}
          <Box sx={{ flex: 1, overflow: "auto", p: 2.5 }}>
            {/* Title Edit + Meta Info */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                value={taskData.title || ""}
                onChange={(e) => handleUpdateField("title", e.target.value)}
                placeholder="Название задачи"
                sx={{
                  ...fieldSx,
                  "& .MuiOutlinedInput-root": {
                    ...fieldSx["& .MuiOutlinedInput-root"],
                    fontSize: "1.1rem",
                    fontWeight: 600,
                  }
                }}
              />
              {/* Author and date */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar src={author?.avatar} sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
                    {author?.firstName?.charAt(0) || "?"}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    {author ? `${author.firstName} ${author.lastName}` : "Автор неизвестен"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • {formatDateDisplay(taskData.createdAt)}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}><MoreVert /></IconButton>
              </Box>
            </Box>
            {/* FIELDS IN 2 COLUMNS */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
              {/* Status */}
              <FormControl fullWidth size="small">
                <InputLabel>Статус</InputLabel>
                <Select
                  value={columns.length > 0 && columns.some(c => c.id === taskData.columnId) ? taskData.columnId : ""}
                  onChange={(e) => handleUpdateField("columnId", e.target.value)}
                  label="Статус"
                  sx={fieldSx}
                >
                  {columns.map((col) => (
                    <MenuItem key={col.id} value={col.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: col.color || "#c4c4c4" }} />
                        {col.title}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Priority */}
              <FormControl fullWidth size="small">
                <InputLabel>Приоритет</InputLabel>
                <Select value={taskData.priority || "normal"} onChange={(e) => handleUpdateField("priority", e.target.value)} label="Приоритет" sx={fieldSx}>
                  {Object.entries(PRIORITY_CONFIG).map(([key, { label, color }]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Flag sx={{ color, fontSize: 18 }} />
                        {label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Assignee */}
              <FormControl fullWidth size="small">
                <InputLabel>Исполнитель</InputLabel>
                <Select
                  value={users.length > 0 && (taskData.assigneeId === "" || users.some(u => u.id === taskData.assigneeId)) ? (taskData.assigneeId || "") : ""}
                  onChange={(e) => handleUpdateField("assigneeId", e.target.value)}
                  label="Исполнитель"
                  sx={fieldSx}
                >
                  <MenuItem value="">Не назначен</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar src={u.avatar} sx={{ width: 24, height: 24 }}>{u.firstName?.charAt(0)}</Avatar>
                        {u.firstName} {u.lastName}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Author (display only) */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#f8f9fa", borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Автор:</Typography>
                <Avatar src={author?.avatar} sx={{ width: 20, height: 20 }}>{author?.firstName?.charAt(0)}</Avatar>
                <Typography variant="body2">{author?.firstName || "—"}</Typography>
              </Box>

              {/* Start date */}
              <TextField fullWidth size="small" type="date" label="Дата старта" value={formatDate(taskData.startDate)} onChange={(e) => handleUpdateField("startDate", e.target.value)} sx={fieldSx} InputLabelProps={{ shrink: true }} />

              {/* Deadline */}
              <TextField fullWidth size="small" type="date" label="Дедлайн" value={formatDate(taskData.dueDate)} onChange={(e) => handleUpdateField("dueDate", e.target.value)} sx={fieldSx} InputLabelProps={{ shrink: true }} />
            </Box>

            {/* Tags */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>Теги</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(taskData.tags || []).map((tag, i) => (
                  <Chip key={i} label={tag} size="small" onDelete={() => handleUpdateField("tags", taskData.tags.filter((_, idx) => idx !== i))} />
                ))}
                <Chip label="+ Добавить" size="small" variant="outlined" onClick={() => {
                  const newTag = prompt("Введите тег:");
                  if (newTag?.trim()) handleUpdateField("tags", [...(taskData.tags || []), newTag.trim()]);
                }} />
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Описание</Typography>
              <TextField fullWidth multiline minRows={3} maxRows={6} placeholder="Добавить описание..." value={taskData.description || ""} onChange={(e) => handleUpdateField("description", e.target.value)} sx={fieldSx} />
            </Box>

            {/* AI Assistant */}
            <TaskAIAssistant
              task={taskData}
              onAddSubtask={(subtask) => {
                const newChecklist = {
                  id: `cl_${Date.now()}`,
                  name: subtask.title,
                  items: [],
                };
                setChecklists((prev) => [...prev, newChecklist]);
                setHasUnsavedChanges(true);
              }}
              onAddTags={(newTags) => {
                handleUpdateField("tags", [...(taskData.tags || []), ...newTags]);
              }}
              onUpdateTime={(hours) => {
                handleUpdateField("estimatedHours", hours);
              }}
              existingTags={EXISTING_TAGS}
            />

            <Divider sx={{ mb: 2 }} />

            {/* Checklists */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PlaylistAddCheck fontSize="small" /> Чеклисты ({checklists.length})
                </Typography>
                <Button size="small" startIcon={<Add />} onClick={() => setShowAddChecklist(true)}>Добавить</Button>
              </Box>

              <Collapse in={showAddChecklist}>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField fullWidth size="small" placeholder="Название чеклиста..." value={newChecklistName} onChange={(e) => setNewChecklistName(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleAddChecklist()} sx={fieldSx} />
                  <Button size="small" variant="contained" onClick={handleAddChecklist}>OK</Button>
                  <IconButton size="small" onClick={() => setShowAddChecklist(false)}><Close fontSize="small" /></IconButton>
                </Box>
              </Collapse>

              {checklists.map((checklist) => {
                const progress = getChecklistProgress(checklist.items);
                const isExpanded = expandedChecklists[checklist.id];
                return (
                  <Box key={checklist.id} sx={{ mb: 1.5, bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#f8f9fa", borderRadius: 2, p: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => setExpandedChecklists(prev => ({ ...prev, [checklist.id]: !isExpanded }))}>
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
                            <ListItemText primary={item.text} sx={{ textDecoration: item.done ? "line-through" : "none", color: item.done ? "text.secondary" : "text.primary" }} />
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

            {/* Comments */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                Комментарии ({comments.length})
              </Typography>

              {/* Comment List */}
              <Stack spacing={2} sx={{ mb: 2 }}>
                {buildCommentTree(comments).map((comment) => (
                  <ThreadedComment
                    key={comment.id}
                    comment={comment}
                    author={users.find(u => u.id === comment.userId)}
                    users={users}
                    replies={comment.replies || []}
                    currentUserId={user?.uid}
                    onReply={async (parentId, data) => {
                      const result = await taskService.addComment(
                        taskId,
                        data.text,
                        user.uid,
                        data.attachments,
                        data.mentions,
                        data.entityLinks,
                        parentId
                      );
                      if (result.success) {
                        const commentsResult = await taskService.getComments(taskId);
                        if (commentsResult.success) setComments(commentsResult.comments);
                      }
                    }}
                    onEdit={async (commentId, text) => {
                      const result = await taskService.updateComment(taskId, commentId, { text });
                      if (result.success) {
                        const commentsResult = await taskService.getComments(taskId);
                        if (commentsResult.success) setComments(commentsResult.comments);
                      }
                    }}
                    onDelete={async (commentId) => {
                      const result = await taskService.deleteComment(taskId, commentId);
                      if (result.success) {
                        const commentsResult = await taskService.getComments(taskId);
                        if (commentsResult.success) setComments(commentsResult.comments);
                      }
                    }}
                    entityType="task"
                    entityId={taskId}
                  />
                ))}
              </Stack>

              {/* Comment Input */}
              <CommentInput
                users={users}
                onSubmit={async (data) => {
                  const result = await taskService.addComment(
                    taskId,
                    data.text,
                    user.uid,
                    data.attachments,
                    data.mentions,
                    data.entityLinks
                  );
                  if (result.success) {
                    const commentsResult = await taskService.getComments(taskId);
                    if (commentsResult.success) setComments(commentsResult.comments);
                  }
                }}
                placeholder="Написать комментарий..."
              />
            </Box>
          </Box>

          {/* FOOTER */}
          {hasUnsavedChanges && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Chip label="Несохранённые изменения" size="small" color="warning" />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button size="small" onClick={onClose}>Отмена</Button>
                <Button size="small" variant="contained" onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? "..." : "Сохранить"}</Button>
              </Box>
            </Box>
          )}
        </Box>
      </StackedDrawer>

      {/* Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { setDeleteDialogOpen(true); setMenuAnchor(null); }} sx={{ color: "error.main" }}><ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>Удалить задачу</MenuItem>
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
  const [text, setText] = useState("");
  const handleAdd = () => { if (text.trim()) { onAdd(text.trim()); setText(""); } };
  return (
    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
      <TextField fullWidth size="small" placeholder="Добавить пункт..." value={text} onChange={(e) => setText(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleAdd()} sx={fieldSx} />
      <IconButton size="small" onClick={handleAdd} disabled={!text.trim()}><Add fontSize="small" /></IconButton>
    </Box>
  );
}

export default TaskDrawer;
