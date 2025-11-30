import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  Grid,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import { STANDARD_AVATARS, generateLetterAvatar } from '../../utils/avatarGenerator';

function AvatarSelector({ open, onClose, onSelect, currentAvatar, firstName, lastName }) {
  const [activeTab, setActiveTab] = useState(0);
  const [selected, setSelected] = useState(currentAvatar);

  const handleSelect = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Выбрать аватар</DialogTitle>
      <DialogContent>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label="Стандартные" />
          <Tab label="Генерация" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Выберите один из стандартных аватаров:
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {STANDARD_AVATARS.map((avatar, index) => (
                <Grid item key={index}>
                  <Box
                    component="img"
                    src={`/avatars/avatar-${index + 1}.svg`}
                    alt={`Avatar ${index + 1}`}
                    sx={{
                      width: 60,
                      height: 60,
                      cursor: 'pointer',
                      border: selected === `default-${index + 1}` ? '3px solid' : '2px solid transparent',
                      borderColor: selected === `default-${index + 1}` ? 'primary.main' : 'transparent',
                      borderRadius: '50%',
                      '&:hover': {
                        borderColor: 'primary.light',
                      },
                    }}
                    onClick={() => setSelected(`default-${index + 1}`)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Avatar
              src={generateLetterAvatar(firstName, lastName)}
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto',
                mb: 2,
                cursor: 'pointer',
                border: selected === 'generated' ? '3px solid' : 'none',
                borderColor: 'primary.main',
              }}
              onClick={() => setSelected('generated')}
            />
            <Typography variant="body2" color="text.secondary">
              Аватар с первой буквой имени на цветном фоне
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSelect} variant="contained">
          Выбрать
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AvatarSelector;
