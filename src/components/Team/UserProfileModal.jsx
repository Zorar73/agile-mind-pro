import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Avatar,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
  Grid,
} from '@mui/material';
import {
  Close,
  Phone,
  Email,
  WhatsApp,
  Telegram,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import boardService from '../../services/board.service';
import userService from '../../services/user.service';
import { generateLetterAvatar } from '../../utils/avatarGenerator';

function UserProfileModal({ open, onClose, user: userData, currentUser }) {
  const [boards, setBoards] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const isAdmin = currentUser.role === 'admin';
  const canEdit = isAdmin || currentUser.uid === userData.id;

  useEffect(() => {
    if (open && userData) {
      loadUserBoards();
      setEditData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        middleName: userData.middleName || '',
        position: userData.position || '',
        responsibility: userData.responsibility || '',
        contacts: userData.contacts || { whatsapp: '', telegram: '', phone: '' }
      });
    }
  }, [open, userData]);

  const loadUserBoards = async () => {
    const result = await boardService.getUserBoards(userData.id);
    if (result.success) {
      // Фильтруем доски к которым есть доступ у текущего пользователя
      const accessibleBoards = result.boards.filter(board =>
        board.members && board.members[currentUser.uid]
      );
      setBoards(accessibleBoards);
    }
  };

  const handleSave = async () => {
    await userService.updateUserData(userData.id, editData);
    setIsEditing(false);
    onClose();
  };

  const getAvatarSrc = () => {
    if (userData.avatar === 'generated' || !userData.avatar) {
      return generateLetterAvatar(userData.firstName, userData.lastName);
    }
    if (userData.avatar?.startsWith('default-')) {
      const num = userData.avatar.replace('default-', '');
      return `/avatars/avatar-${num}.svg`;
    }
    return userData.avatar;
  };

  const openWhatsApp = () => {
    const phone = userData.contacts?.whatsapp || userData.contacts?.phone;
    if (phone) {
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  const openTelegram = () => {
    const telegram = userData.contacts?.telegram;
    if (telegram) {
      const username = telegram.startsWith('@') ? telegram.slice(1) : telegram;
      window.open(`https://t.me/${username}`, '_blank');
    }
  };

  const openEmail = () => {
    window.open(`mailto:${userData.email}`, '_blank');
  };

  if (!userData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Профиль пользователя</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Аватар и основная информация */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar src={getAvatarSrc()} sx={{ width: 120, height: 120 }} />
            
            {isEditing ? (
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Имя"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Отчество"
                    value={editData.middleName}
                    onChange={(e) => setEditData({ ...editData, middleName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Фамилия"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Должность"
                    value={editData.position}
                    onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ответственность"
                    value={editData.responsibility}
                    onChange={(e) => setEditData({ ...editData, responsibility: e.target.value })}
                  />
                </Grid>
              </Grid>
            ) : (
              <>
                <Typography variant="h5">
                  {userData.firstName} {userData.middleName} {userData.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {userData.position}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userData.responsibility}
                </Typography>
                <Chip
                  label={userData.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  color={userData.role === 'admin' ? 'error' : 'success'}
                />
              </>
            )}
          </Box>

          <Divider />

          {/* Контакты */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Контакты
            </Typography>
            
            {isEditing ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="WhatsApp"
                    value={editData.contacts.whatsapp}
                    onChange={(e) => setEditData({
                      ...editData,
                      contacts: { ...editData.contacts, whatsapp: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Telegram"
                    value={editData.contacts.telegram}
                    onChange={(e) => setEditData({
                      ...editData,
                      contacts: { ...editData.contacts, telegram: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Телефон"
                    value={editData.contacts.phone}
                    onChange={(e) => setEditData({
                      ...editData,
                      contacts: { ...editData.contacts, phone: e.target.value }
                    })}
                  />
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <IconButton
                  color="primary"
                  onClick={openEmail}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                >
                  <Email />
                  <Typography variant="caption">Email</Typography>
                </IconButton>

                {(userData.contacts?.whatsapp || userData.contacts?.phone) && (
                  <IconButton
                    color="success"
                    onClick={openWhatsApp}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                  >
                    <WhatsApp />
                    <Typography variant="caption">WhatsApp</Typography>
                  </IconButton>
                )}

                {userData.contacts?.telegram && (
                  <IconButton
                    color="info"
                    onClick={openTelegram}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                  >
                    <Telegram />
                    <Typography variant="caption">Telegram</Typography>
                  </IconButton>
                )}

                {userData.contacts?.phone && (
                  <IconButton
                    color="primary"
                    onClick={() => window.open(`tel:${userData.contacts.phone}`, '_blank')}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                  >
                    <Phone />
                    <Typography variant="caption">Телефон</Typography>
                  </IconButton>
                )}
              </Box>
            )}

            {!isEditing && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Email: {userData.email}
                </Typography>
                {userData.contacts?.phone && (
                  <Typography variant="body2" color="text.secondary">
                    Телефон: {userData.contacts.phone}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Divider />

          {/* Доски */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Доски ({boards.length})
            </Typography>
            <List>
              {boards.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Нет общих досок
                </Typography>
              ) : (
                boards.map((board) => (
                  <ListItem key={board.id}>
                    <ListItemText
                      primary={board.title}
                      secondary={
                        <Chip
                          label={
                            board.members[userData.id] === 'owner' ? 'Владелец' :
                            board.members[userData.id] === 'editor' ? 'Редактор' : 'Наблюдатель'
                          }
                          size="small"
                          color={
                            board.members[userData.id] === 'owner' ? 'primary' :
                            board.members[userData.id] === 'editor' ? 'secondary' : 'default'
                          }
                        />
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        {canEdit && (
          <>
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)} startIcon={<Cancel />}>
                  Отмена
                </Button>
                <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
                  Сохранить
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} startIcon={<Edit />}>
                Редактировать
              </Button>
            )}
          </>
        )}
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserProfileModal;