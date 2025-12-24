// src/components/Team/TeamDrawer.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import StackedDrawer from '../Common/StackedDrawer';
import {
  Box, Typography, Avatar, IconButton, Divider, Chip, Button, Stack, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, TextField, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, CircularProgress, Alert, Tabs, Tab, Card, CardContent, LinearProgress, useTheme, InputAdornment,
} from '@mui/material';
import {
  Close, Delete, PersonAdd, MoreVert, ExitToApp, AdminPanelSettings, Person, Group, Save, Assignment, CheckCircle, Lightbulb, ViewKanban, Chat, Settings, Send, Add,
} from '@mui/icons-material';
import { UserContext } from '../../App';
import teamService from '../../services/team.service';
import userService from '../../services/user.service';
import taskService from '../../services/task.service';
import boardService from '../../services/board.service';
import sketchService from '../../services/sketch.service';
import TaskDrawer from '../Task/TaskDrawer';
import SketchDrawer from '../Sketch/SketchDrawer';
import { gradients, statusColors } from '../../theme';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { usePermissions } from '../../hooks/usePermissions';
import { MODULES } from '../../constants';

const ROLE_CONFIG = {
  owner: { label: 'Владелец', color: '#7E57C2' },
  leader: { label: 'Лидер', color: '#7E57C2' },
  admin: { label: 'Админ', color: '#1E88E5' },
  member: { label: 'Участник', color: '#26A69A' },
};

function TeamDrawer({ open, onClose, teamId, drawerId }) {
  const { user: currentUser } = useContext(UserContext);
  const { hasAccess } = usePermissions();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const chatEndRef = useRef(null);

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, inProgressTasks: 0, overdueTasks: 0, todayTasks: 0 });
  const [teamTasks, setTeamTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [teamSketches, setTeamSketches] = useState([]);
  const [loadingSketches, setLoadingSketches] = useState(false);
  const [teamBoards, setTeamBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatUsers, setChatUsers] = useState({});
  const [editData, setEditData] = useState({ name: '', description: '' });
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [createBoardDialogOpen, setCreateBoardDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [memberAnchor, setMemberAnchor] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedSketchId, setSelectedSketchId] = useState(null);
  const [error, setError] = useState(null);

  // Динамическая конфигурация табов на основе прав доступа
  const tabsConfig = React.useMemo(() => {
    const allTabs = [
      { id: 'info', label: 'Инфо', icon: <Group fontSize="small" />, alwaysShow: true },
      { id: 'chat', label: 'Чат', icon: <Chat fontSize="small" />, alwaysShow: true },
      { id: 'boards', label: 'Доски', icon: <ViewKanban fontSize="small" />, module: MODULES.BOARDS },
      { id: 'tasks', label: 'Задачи', icon: <Assignment fontSize="small" />, module: MODULES.TASKS },
      { id: 'sketches', label: 'Наброски', icon: <Lightbulb fontSize="small" />, module: MODULES.SKETCHES },
      { id: 'settings', label: 'Настройки', icon: <Settings fontSize="small" />, alwaysShow: true },
    ];

    return allTabs.filter(tab => tab.alwaysShow || (tab.module && hasAccess(tab.module)));
  }, [hasAccess]);

  // Мапим ID табов на индексы для обратной совместимости с activeTab
  const getTabIndex = (tabId) => tabsConfig.findIndex(t => t.id === tabId);
  const getTabId = (index) => tabsConfig[index]?.id;

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f6f8',
      '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#e6e9ef' },
      '&.Mui-focused': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#fff' },
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { border: `1px solid ${theme.palette.primary.main}` },
  };

  useEffect(() => {
    if (open && teamId) {
      loadTeamData();
      loadAllUsers();
    }
  }, [open, teamId]);

  useEffect(() => {
    if (!open || !teamId) return;
    const unsubscribe = teamService.subscribeToChat(teamId, (messages) => {
      setChatMessages(messages);
      messages.forEach(msg => {
        if (msg.userId && !chatUsers[msg.userId]) {
          userService.getUserById(msg.userId).then(result => {
            if (result.success) setChatUsers(prev => ({ ...prev, [msg.userId]: result.user }));
          });
        }
      });
    });
    return () => unsubscribe();
  }, [open, teamId]);

  useEffect(() => {
    const currentTabId = getTabId(activeTab);
    if (currentTabId === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  useEffect(() => {
    const currentTabId = getTabId(activeTab);
    if (currentTabId === 'boards' && team) loadTeamBoards();
    else if (currentTabId === 'tasks' && team) loadTeamTasks();
    else if (currentTabId === 'sketches' && team) loadTeamSketches();
  }, [activeTab, team]);

  const loadTeamData = async () => {
    setLoading(true);
    setError(null);
    try {
      const teamResult = await teamService.getTeam(teamId);
      if (teamResult.success) {
        setTeam(teamResult.team);
        setEditData({ name: teamResult.team.name || '', description: teamResult.team.description || '' });
        const memberIds = Object.keys(teamResult.team.members || {});
        const membersData = [];
        for (const memberId of memberIds) {
          const userResult = await userService.getUserById(memberId);
          if (userResult.success) membersData.push({ ...userResult.user, id: memberId, role: teamResult.team.members[memberId] });
        }
        setMembers(membersData);
        await loadTeamStats(membersData);
      } else {
        setError('Не удалось загрузить команду');
      }
    } catch (err) {
      console.error('Error loading team:', err);
      setError('Ошибка загрузки данных');
    }
    setLoading(false);
  };

  const loadTeamStats = async (membersData) => {
    try {
      const memberIds = membersData.map(m => m.id);
      const boardsResult = await boardService.getUserBoards(currentUser.uid);
      if (!boardsResult.success) return;
      let totalTasks = 0, completedTasks = 0, inProgressTasks = 0, overdueTasks = 0, todayTasks = 0;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      for (const board of boardsResult.boards) {
        const tasksResult = await taskService.getTasksByBoard(board.id);
        if (!tasksResult.success) continue;
        for (const task of tasksResult.tasks) {
          const taskMembers = Object.keys(task.members || {});
          const hasTeamMember = taskMembers.some(id => memberIds.includes(id));
          if (hasTeamMember) {
            totalTasks++;
            if (task.status === 'done') completedTasks++;
            else if (task.status === 'in_progress') inProgressTasks++;
            if (task.dueDate && task.status !== 'done') {
              const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
              if (dueDate < today) overdueTasks++;
              else if (dueDate >= today && dueDate < tomorrow) todayTasks++;
            }
          }
        }
      }
      setStats({ totalTasks, completedTasks, inProgressTasks, overdueTasks, todayTasks });
    } catch (err) { console.error('Error loading team stats:', err); }
  };

  const loadTeamBoards = async () => {
    setLoadingBoards(true);
    try {
      const result = await teamService.getTeamBoards(teamId);
      if (result.success && result.boardIds) {
        const boards = [];
        for (const boardId of result.boardIds) {
          const boardResult = await boardService.getBoard(boardId);
          if (boardResult.success) boards.push(boardResult.board);
        }
        setTeamBoards(boards);
      }
    } catch (err) { console.error('Error loading team boards:', err); }
    setLoadingBoards(false);
  };

  const loadTeamTasks = async () => {
    setLoadingTasks(true);
    try {
      const memberIds = members.map(m => m.id);
      const boardsResult = await boardService.getUserBoards(currentUser.uid);
      if (!boardsResult.success) { setLoadingTasks(false); return; }
      const tasks = [];
      for (const board of boardsResult.boards) {
        const tasksResult = await taskService.getTasksByBoard(board.id);
        if (!tasksResult.success) continue;
        for (const task of tasksResult.tasks) {
          const taskMembers = Object.keys(task.members || {});
          const hasTeamMember = taskMembers.some(id => memberIds.includes(id));
          if (hasTeamMember && task.status !== 'done') tasks.push({ ...task, boardTitle: board.title });
        }
      }
      tasks.sort((a, b) => { const p = { urgent: 0, high: 1, normal: 2, low: 3 }; return (p[a.priority] || 2) - (p[b.priority] || 2); });
      setTeamTasks(tasks.slice(0, 20));
    } catch (err) { console.error('Error loading team tasks:', err); }
    setLoadingTasks(false);
  };

  const loadTeamSketches = async () => {
    setLoadingSketches(true);
    try {
      const result = await sketchService.getSketchesSharedWithTeam(teamId);
      if (result.success) setTeamSketches(result.sketches || []);
    } catch (err) { console.error('Error loading team sketches:', err); }
    setLoadingSketches(false);
  };

  const loadAllUsers = async () => {
    const result = await userService.getAllUsers();
    if (result.success) setAllUsers(result.users.filter(u => u.role !== 'pending'));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || sendingMessage) return;
    setSendingMessage(true);
    try {
      await teamService.sendMessage(teamId, currentUser.uid, chatInput.trim());
      setChatInput('');
    } catch (err) { console.error('Error sending message:', err); }
    setSendingMessage(false);
  };

  const currentUserRole = team?.members?.[currentUser?.uid];
  const isOwner = currentUserRole === 'owner' || currentUserRole === 'leader';
  const isAdmin = currentUserRole === 'admin' || isOwner;
  const canEdit = isAdmin;
  const canManageMembers = isAdmin;
  const canDelete = isOwner;

  const handleSave = async () => {
    if (!editData.name.trim()) return;
    setSaving(true);
    try {
      await teamService.updateTeam(teamId, { name: editData.name, description: editData.description });
      setTeam({ ...team, ...editData });
      if (onUpdate) onUpdate();
    } catch (err) { console.error('Error saving team:', err); setError('Ошибка сохранения'); }
    setSaving(false);
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) return;
    setSaving(true);
    try {
      for (const u of selectedUsers) await teamService.addMember(teamId, u.id, 'member');
      setInviteDialogOpen(false);
      setSelectedUsers([]);
      loadTeamData();
      if (onUpdate) onUpdate();
    } catch (err) { console.error('Error inviting members:', err); setError('Ошибка приглашения'); }
    setSaving(false);
  };

  const handleChangeRole = async (memberId, newRole) => {
    try {
      await teamService.updateMemberRole(teamId, memberId, newRole);
      loadTeamData();
      if (onUpdate) onUpdate();
    } catch (err) { console.error('Error changing role:', err); }
    setMemberAnchor(null);
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await teamService.removeMember(teamId, memberId);
      loadTeamData();
      if (onUpdate) onUpdate();
    } catch (err) { console.error('Error removing member:', err); }
    setMemberAnchor(null);
  };

  const handleLeaveTeam = async () => {
    try {
      await teamService.removeMember(teamId, currentUser.uid);
      setLeaveDialogOpen(false);
      onClose();
      if (onUpdate) onUpdate();
    } catch (err) { console.error('Error leaving team:', err); }
  };

  const handleDeleteTeam = async () => {
    try {
      await teamService.deleteTeam(teamId);
      setDeleteDialogOpen(false);
      onClose();
      if (onUpdate) onUpdate();
    } catch (err) { console.error('Error deleting team:', err); }
  };

  const handleCreateTeamBoard = async () => {
    if (!newBoardName.trim()) return;
    setSaving(true);
    try {
      const result = await boardService.createBoard(newBoardName, currentUser.uid);
      if (result.success) {
        await teamService.addTeamBoard(teamId, result.boardId);
        setCreateBoardDialogOpen(false);
        setNewBoardName('');
        loadTeamBoards();
      }
    } catch (err) { console.error('Error creating team board:', err); }
    setSaving(false);
  };

  const availableUsers = allUsers.filter(u => !members.some(m => m.id === u.id));
  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <>
      <StackedDrawer open={open} onClose={onClose} title={team?.name || 'Команда'} id={drawerId} entityType="team">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>
        ) : !team ? (
          <Box sx={{ p: 3, textAlign: 'center' }}><Alert severity="error">{error || 'Команда не найдена'}</Alert></Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 48, '& .MuiTab-root': { minHeight: 48, py: 1, minWidth: 'auto', px: 2 } }}>
              {tabsConfig.map((tab, index) => (
                <Tab key={tab.id} label={tab.label} icon={tab.icon} iconPosition="start" />
              ))}
            </Tabs>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {/* TAB: Info */}
              {getTabId(activeTab) === 'info' && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Статистика команды</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 3 }}>
                    <Card sx={{ bgcolor: statusColors.in_progress.bg }}>
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="h5" fontWeight={700} color={statusColors.in_progress.text}>{stats.inProgressTasks}</Typography>
                        <Typography variant="caption" color="text.secondary">В работе</Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ bgcolor: statusColors.done.bg }}>
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="h5" fontWeight={700} color={statusColors.done.text}>{stats.completedTasks}</Typography>
                        <Typography variant="caption" color="text.secondary">Выполнено</Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ bgcolor: statusColors.overdue.bg }}>
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="h5" fontWeight={700} color={statusColors.overdue.text}>{stats.overdueTasks}</Typography>
                        <Typography variant="caption" color="text.secondary">Просрочено</Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ bgcolor: isDark ? 'background.subtle' : 'grey.100' }}>
                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="h5" fontWeight={700}>{stats.todayTasks}</Typography>
                        <Typography variant="caption" color="text.secondary">На сегодня</Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Общий прогресс</Typography>
                      <Typography variant="caption" fontWeight={600}>{completionRate}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={completionRate} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>Участники ({members.length})</Typography>
                    {canManageMembers && <Button size="small" startIcon={<PersonAdd />} onClick={() => setInviteDialogOpen(true)} sx={{ borderRadius: 50 }}>Пригласить</Button>}
                  </Box>
                  <List sx={{ p: 0 }}>
                    {members.map((member) => {
                      const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.member;
                      const isSelf = member.id === currentUser?.uid;
                      return (
                        <ListItem key={member.id} sx={{ px: 1, borderRadius: 2, mb: 0.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => onMemberClick?.(member.id)}>
                          <ListItemAvatar><Avatar src={member.avatar} sx={{ bgcolor: roleConfig.color }}>{member.firstName?.charAt(0)}</Avatar></ListItemAvatar>
                          <ListItemText
                            primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography variant="body2" fontWeight={600}>{member.firstName} {member.lastName}</Typography>{isSelf && <Chip label="Вы" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />}</Box>}
                            secondary={<Box component="span" sx={{ display: 'inline-block' }}><Chip label={roleConfig.label} size="small" sx={{ mt: 0.5, height: 22, bgcolor: `${roleConfig.color}15`, color: roleConfig.color }} /></Box>}
                            primaryTypographyProps={{ component: 'div' }}
                            secondaryTypographyProps={{ component: 'span' }}
                          />
                          {canManageMembers && !isSelf && member.role !== 'owner' && member.role !== 'leader' && (
                            <ListItemSecondaryAction>
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMemberAnchor(e.currentTarget); setSelectedMember(member); }}>
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              )}

              {/* TAB: Chat */}
              {getTabId(activeTab) === 'chat' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {chatMessages.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Chat sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">Нет сообщений. Начните общение!</Typography>
                      </Box>
                    ) : (
                      <Stack spacing={1.5}>
                        {chatMessages.map((msg) => {
                          const msgUser = chatUsers[msg.userId];
                          const isMine = msg.userId === currentUser?.uid;
                          return (
                            <Box key={msg.id} sx={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', gap: 1 }}>
                              {!isMine && <Avatar src={msgUser?.avatar} sx={{ width: 32, height: 32 }}>{msgUser?.firstName?.charAt(0) || '?'}</Avatar>}
                              <Box sx={{ maxWidth: '75%', bgcolor: isMine ? 'primary.main' : isDark ? 'rgba(255,255,255,0.08)' : 'grey.100', color: isMine ? 'white' : 'text.primary', borderRadius: 2, px: 2, py: 1 }}>
                                {!isMine && <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>{msgUser?.firstName || 'Пользователь'}</Typography>}
                                <Typography variant="body2">{msg.text}</Typography>
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7 }}>{msg.createdAt && format(new Date(msg.createdAt), 'HH:mm', { locale: ru })}</Typography>
                              </Box>
                            </Box>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </Stack>
                    )}
                  </Box>
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      placeholder="Написать сообщение..." 
                      value={chatInput} 
                      onChange={(e) => setChatInput(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()} 
                      sx={fieldSx} 
                      InputProps={{ 
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleSendMessage} disabled={!chatInput.trim() || sendingMessage} color="primary">
                              {sendingMessage ? <CircularProgress size={20} /> : <Send />}
                            </IconButton>
                          </InputAdornment>
                        ) 
                      }} 
                    />
                  </Box>
                </Box>
              )}

              {/* TAB: Boards */}
              {getTabId(activeTab) === 'boards' && (
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>Доски команды</Typography>
                    {canEdit && <Button size="small" startIcon={<Add />} onClick={() => setCreateBoardDialogOpen(true)} sx={{ borderRadius: 50 }}>Создать</Button>}
                  </Box>
                  {loadingBoards ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={32} /></Box>
                  ) : teamBoards.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <ViewKanban sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">Нет досок команды</Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {teamBoards.map((board) => (
                        <ListItem key={board.id} sx={{ px: 2, py: 1.5, mb: 1, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'grey.100' } }}>
                          <ListItemAvatar><Avatar sx={{ bgcolor: board.color || '#1E88E5' }}><ViewKanban /></Avatar></ListItemAvatar>
                          <ListItemText primary={board.title} secondary={`${Object.keys(board.members || {}).length} участников`} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {/* TAB: Tasks */}
              {getTabId(activeTab) === 'tasks' && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Активные задачи команды</Typography>
                  {loadingTasks ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={32} /></Box>
                  ) : teamTasks.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CheckCircle sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">Нет активных задач</Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {teamTasks.map((task) => (
                        <ListItem 
                          key={task.id} 
                          onClick={() => setSelectedTask(task)} 
                          sx={{ px: 2, py: 1.5, mb: 1, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2, borderLeft: 4, borderColor: task.priority === 'urgent' ? 'error.main' : task.priority === 'high' ? 'warning.main' : 'primary.main', cursor: 'pointer', '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'grey.100' } }}
                        >
                          <ListItemText 
                            primary={task.title} 
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip size="small" label={task.boardTitle} icon={<ViewKanban fontSize="small" />} sx={{ height: 20, fontSize: '0.7rem' }} />
                                <Chip size="small" label={task.status === 'in_progress' ? 'В работе' : 'К выполнению'} sx={{ height: 20, fontSize: '0.7rem' }} />
                              </Box>
                            } 
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {/* TAB: Sketches */}
              {getTabId(activeTab) === 'sketches' && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Наброски, расшаренные с командой</Typography>
                  {loadingSketches ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={32} /></Box>
                  ) : teamSketches.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Lightbulb sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">Нет набросков</Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {teamSketches.map((sketch) => (
                        <ListItem 
                          key={sketch.id} 
                          onClick={() => setSelectedSketchId(sketch.id)} 
                          sx={{ px: 2, py: 1.5, mb: 1, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'grey.100' } }}
                        >
                          <ListItemText primary={sketch.title} secondary={<Typography variant="caption" color="text.secondary" noWrap>{sketch.content?.substring(0, 100)}...</Typography>} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {/* TAB: Settings */}
              {getTabId(activeTab) === 'settings' && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Настройки команды</Typography>
                  {canEdit && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Название и описание</Typography>
                      <TextField fullWidth label="Название команды" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} sx={{ ...fieldSx, mb: 2 }} />
                      <TextField fullWidth multiline rows={3} label="Описание" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} sx={fieldSx} />
                      <Button variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <Save />} onClick={handleSave} disabled={saving || !editData.name.trim()} sx={{ mt: 2, borderRadius: 50 }}>Сохранить изменения</Button>
                    </Box>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" fontWeight={600} color="error" sx={{ mb: 2 }}>Опасная зона</Typography>
                  <Stack spacing={1}>
                    {!isOwner && <Button variant="outlined" color="error" startIcon={<ExitToApp />} onClick={() => setLeaveDialogOpen(true)} sx={{ borderRadius: 50 }}>Покинуть команду</Button>}
                    {canDelete && <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => setDeleteDialogOpen(true)} sx={{ borderRadius: 50 }}>Удалить команду</Button>}
                  </Stack>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </StackedDrawer>

      {/* Member Menu */}
      <Menu anchorEl={memberAnchor} open={Boolean(memberAnchor)} onClose={() => setMemberAnchor(null)}>
        <MenuItem onClick={() => handleChangeRole(selectedMember?.id, 'admin')}>
          <AdminPanelSettings sx={{ mr: 1 }} fontSize="small" />Сделать админом
        </MenuItem>
        <MenuItem onClick={() => handleChangeRole(selectedMember?.id, 'member')}>
          <Person sx={{ mr: 1 }} fontSize="small" />Сделать участником
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleRemoveMember(selectedMember?.id)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />Удалить из команды
        </MenuItem>
      </Menu>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Пригласить в команду</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={availableUsers}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            value={selectedUsers}
            onChange={(e, newValue) => setSelectedUsers(newValue)}
            renderInput={(params) => <TextField {...params} label="Выберите пользователей" sx={{ mt: 1 }} />}
            renderOption={(props, option) => (
              <li {...props}><Avatar src={option.avatar} sx={{ mr: 1, width: 32, height: 32 }}>{option.firstName?.charAt(0)}</Avatar>{option.firstName} {option.lastName}</li>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleInvite} variant="contained" disabled={saving || selectedUsers.length === 0}>{saving ? <CircularProgress size={20} /> : 'Пригласить'}</Button>
        </DialogActions>
      </Dialog>

      {/* Create Board Dialog */}
      <Dialog open={createBoardDialogOpen} onClose={() => setCreateBoardDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать доску команды</DialogTitle>
        <DialogContent>
          <TextField fullWidth autoFocus label="Название доски" value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleCreateTeamBoard()} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateBoardDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleCreateTeamBoard} variant="contained" disabled={saving || !newBoardName.trim()}>{saving ? <CircularProgress size={20} /> : 'Создать'}</Button>
        </DialogActions>
      </Dialog>

      {/* Leave Dialog */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)}>
        <DialogTitle>Покинуть команду?</DialogTitle>
        <DialogContent><Typography>Вы уверены, что хотите покинуть команду "{team?.name}"?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleLeaveTeam} color="error" variant="contained">Покинуть</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удалить команду?</DialogTitle>
        <DialogContent><Typography>Это действие нельзя отменить. Все данные команды будут удалены.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteTeam} color="error" variant="contained">Удалить</Button>
        </DialogActions>
      </Dialog>

      {/* Task Drawer */}
      {selectedTask && (
        <TaskDrawer
          taskId={selectedTask.id}
          open={true}
          onClose={() => setSelectedTask(null)}
          drawerId={`task-${selectedTask.id}`}
        />
      )}

      {/* Sketch Drawer */}
      {selectedSketchId && (
        <SketchDrawer
          open={Boolean(selectedSketchId)}
          onClose={() => setSelectedSketchId(null)}
          sketchId={selectedSketchId}
          drawerId={`sketch-${selectedSketchId}`}
          onUpdate={loadTeamSketches}
        />
      )}
    </>
  );
}

export default TeamDrawer;
