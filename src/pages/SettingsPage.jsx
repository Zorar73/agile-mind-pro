// src/pages/SettingsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Button,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import { UserContext } from '../App';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

function SettingsPage() {
  const { user } = useContext(UserContext);
  const [settings, setSettings] = useState({
    emailNotifications: {
      newTasks: true,
      comments: true,
      deadlines: false,
    },
    interface: {
      darkMode: false,
      showTooltips: true,
    }
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data());
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await setDoc(doc(db, 'userSettings', user.uid), settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Ошибка сохранения настроек');
    }

    setSaving(false);
  };

  const handleChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  return (
    <MainLayout title="Настройки">
      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Настройки сохранены успешно!
        </Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            📧 Email-уведомления
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Выберите, о каких событиях вы хотите получать уведомления на email
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications.newTasks}
                onChange={(e) => handleChange('emailNotifications', 'newTasks', e.target.checked)}
              />
            }
            label="Новые назначенные задачи"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications.comments}
                onChange={(e) => handleChange('emailNotifications', 'comments', e.target.checked)}
              />
            }
            label="Комментарии и упоминания"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications.deadlines}
                onChange={(e) => handleChange('emailNotifications', 'deadlines', e.target.checked)}
              />
            }
            label="Напоминания о дедлайнах (за 1 день)"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            🎨 Интерфейс
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.interface.darkMode}
                onChange={(e) => handleChange('interface', 'darkMode', e.target.checked)}
              />
            }
            label="Темная тема"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.interface.showTooltips}
                onChange={(e) => handleChange('interface', 'showTooltips', e.target.checked)}
              />
            }
            label="Показывать подсказки"
          />
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </Box>
    </MainLayout>
  );
}

export default SettingsPage;