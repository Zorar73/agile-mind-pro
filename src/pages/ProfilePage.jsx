import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  Button,
  TextField,
  IconButton,
  Grid,
} from '@mui/material';
import { Edit, Save, Cancel, PhotoCamera } from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import { UserContext } from '../App';
import userService from '../services/user.service';
import AvatarSelector from '../components/Profile/AvatarSelector';
import { generateLetterAvatar } from '../utils/avatarGenerator';

function ProfilePage() {
  const { user, setUser } = useContext(UserContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [avatarSelectorOpen, setAvatarSelectorOpen] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    middleName: user?.middleName || '',
    lastName: user?.lastName || '',
    position: user?.position || '',
    responsibility: user?.responsibility || '',
    contacts: user?.contacts || { whatsapp: '', telegram: '', phone: '' },
  });

  const getAvatarSrc = () => {
    if (user.avatar === 'generated' || !user.avatar) {
      return generateLetterAvatar(user.firstName, user.lastName);
    }
    if (user.avatar?.startsWith('default-')) {
      const num = user.avatar.replace('default-', '');
      return `/avatars/avatar-${num}.svg`;
    }
    return user.avatar;
  };

  const handleSave = async () => {
    await userService.updateUserData(user.uid, editData);
    
    // Обновить контекст
    setUser({
      ...user,
      ...editData,
    });
    
    setIsEditing(false);
  };

  const handleAvatarSelect = async (avatar) => {
    await userService.updateAvatar(user.uid, avatar);
    setUser({
      ...user,
      avatar,
    });
  };

  return (
    <MainLayout title="Мой профиль">
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={getAvatarSrc()}
                sx={{ width: 80, height: 80, fontSize: '2rem' }}
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  width: 32,
                  height: 32,
                }}
                size="small"
                onClick={() => setAvatarSelectorOpen(true)}
              >
                <PhotoCamera sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            {isEditing ? (
              <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Имя"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Отчество"
                    value={editData.middleName}
                    onChange={(e) => setEditData({ ...editData, middleName: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Фамилия"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    size="small"
                  />
                </Grid>
              </Grid>
            ) : (
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {user?.firstName} {user?.middleName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.position}
                </Typography>
              </Box>
            )}

            <Box sx={{ ml: 'auto' }}>
              {isEditing ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<Cancel />}
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        firstName: user?.firstName || '',
                        middleName: user?.middleName || '',
                        lastName: user?.lastName || '',
                        position: user?.position || '',
                        responsibility: user?.responsibility || '',
                        contacts: user?.contacts || { whatsapp: '', telegram: '', phone: '' },
                      });
                    }}
                  >
                    Отмена
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                  >
                    Сохранить
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                >
                  Редактировать
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography variant="body1">{user?.email}</Typography>
            </Box>
            
            {isEditing ? (
              <>
                <TextField
                  fullWidth
                  label="Должность"
                  value={editData.position}
                  onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Ответственность"
                  value={editData.responsibility}
                  onChange={(e) => setEditData({ ...editData, responsibility: e.target.value })}
                  multiline
                  rows={2}
                />
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6">Контакты</Typography>
                <TextField
                  fullWidth
                  label="WhatsApp"
                  placeholder="+79991234567"
                  value={editData.contacts.whatsapp}
                  onChange={(e) => setEditData({
                    ...editData,
                    contacts: { ...editData.contacts, whatsapp: e.target.value }
                  })}
                />
                <TextField
                  fullWidth
                  label="Telegram"
                  placeholder="@username"
                  value={editData.contacts.telegram}
                  onChange={(e) => setEditData({
                    ...editData,
                    contacts: { ...editData.contacts, telegram: e.target.value }
                  })}
                />
                <TextField
                  fullWidth
                  label="Телефон"
                  placeholder="+79991234567"
                  value={editData.contacts.phone}
                  onChange={(e) => setEditData({
                    ...editData,
                    contacts: { ...editData.contacts, phone: e.target.value }
                  })}
                />
              </>
            ) : (
              <>
                <Box>
                  <Typography variant="caption" color="text.secondary">Должность</Typography>
                  <Typography variant="body1">{user?.position}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Ответственность</Typography>
                  <Typography variant="body1">{user?.responsibility}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Роль</Typography>
                  <Typography variant="body1">
                    {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </Typography>
                </Box>
                {user?.contacts && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6">Контакты</Typography>
                    {user.contacts.whatsapp && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">WhatsApp</Typography>
                        <Typography variant="body1">{user.contacts.whatsapp}</Typography>
                      </Box>
                    )}
                    {user.contacts.telegram && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">Telegram</Typography>
                        <Typography variant="body1">{user.contacts.telegram}</Typography>
                      </Box>
                    )}
                    {user.contacts.phone && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">Телефон</Typography>
                        <Typography variant="body1">{user.contacts.phone}</Typography>
                      </Box>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      <AvatarSelector
        open={avatarSelectorOpen}
        onClose={() => setAvatarSelectorOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={user?.avatar}
        firstName={user?.firstName}
        lastName={user?.lastName}
      />
    </MainLayout>
  );
}

export default ProfilePage;
