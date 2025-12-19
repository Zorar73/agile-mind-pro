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
  Chip,
  TextField,
  Grid,
  Stack,
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
  Work,
  Badge,
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Профиль</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5}>
          {/* Аватар и основная информация */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={getAvatarSrc()} sx={{ width: 80, height: 80 }} />
            
            <Box sx={{ flexGrow: 1 }}>
              {isEditing ? (
                <Stack spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="ФИО"
                    value={`${editData.firstName} ${editData.middleName} ${editData.lastName}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(' ');
                      setEditData({
                        ...editData,
                        firstName: parts[0] || '',
                        middleName: parts[1] || '',
                        lastName: parts[2] || '',
                      });
                    }}
                  />
                </Stack>
              ) : (
                <>
                  <Typography variant="h6" fontWeight="600">
                    {userData.firstName} {userData.middleName} {userData.lastName}
                  </Typography>
                  <Chip
                    label={userData.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    color={userData.role === 'admin' ? 'error' : 'success'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Должность и обязанности */}
          {isEditing ? (
            <Stack spacing={1.5}>
              <TextField
                fullWidth
                size="small"
                label="Должность"
                value={editData.position}
                onChange={(e) => setEditData({ ...editData, position: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="Ответственность"
                value={editData.responsibility}
                onChange={(e) => setEditData({ ...editData, responsibility: e.target.value })}
                multiline
                rows={2}
              />
            </Stack>
          ) : (
            <Stack spacing={1}>
              {userData.position && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Work fontSize="small" color="action" />
                  <Typography variant="body2">{userData.position}</Typography>
                </Box>
              )}
              {userData.responsibility && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {userData.responsibility}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}

          <Divider />

          {/* Контакты */}
          <Box>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Контакты
            </Typography>
            
            {isEditing ? (
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  label="WhatsApp"
                  value={editData.contacts.whatsapp}
                  onChange={(e) => setEditData({
                    ...editData,
                    contacts: { ...editData.contacts, whatsapp: e.target.value }
                  })}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Telegram"
                  value={editData.contacts.telegram}
                  onChange={(e) => setEditData({
                    ...editData,
                    contacts: { ...editData.contacts, telegram: e.target.value }
                  })}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Телефон"
                  value={editData.contacts.phone}
                  onChange={(e) => setEditData({
                    ...editData,
                    contacts: { ...editData.contacts, phone: e.target.value }
                  })}
                />
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" color="primary" onClick={openEmail}>
                    <Email fontSize="small" />
                  </IconButton>

                  {(userData.contacts?.whatsapp || userData.contacts?.phone) && (
                    <IconButton size="small" color="success" onClick={openWhatsApp}>
                      <WhatsApp fontSize="small" />
                    </IconButton>
                  )}

                  {userData.contacts?.telegram && (
                    <IconButton size="small" color="info" onClick={openTelegram}>
                      <Telegram fontSize="small" />
                    </IconButton>
                  )}

                  {userData.contacts?.phone && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => window.open(`tel:${userData.contacts.phone}`, '_blank')}
                    >
                      <Phone fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  {userData.email}
                </Typography>
                {userData.contacts?.phone && (
                  <Typography variant="caption" color="text.secondary">
                    {userData.contacts.phone}
                  </Typography>
                )}
              </Stack>
            )}
          </Box>

          <Divider />

          {/* Доски */}
          <Box>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Общие доски ({boards.length})
            </Typography>
            {boards.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                Нет общих досок
              </Typography>
            ) : (
              <Stack spacing={0.5}>
                {boards.slice(0, 3).map((board) => (
                  <Box
                    key={board.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.5,
                    }}
                  >
                    <Typography variant="body2" noWrap>
                      {board.title}
                    </Typography>
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
                  </Box>
                ))}
                {boards.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{boards.length - 3} еще
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        {canEdit && (
          <>
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)} startIcon={<Cancel />} size="small">
                  Отмена
                </Button>
                <Button onClick={handleSave} variant="contained" startIcon={<Save />} size="small">
                  Сохранить
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} startIcon={<Edit />} size="small">
                Редактировать
              </Button>
            )}
          </>
        )}
        <Button onClick={onClose} size="small">Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserProfileModal;
