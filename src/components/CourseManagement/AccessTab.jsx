import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Switch,
  FormControlLabel,
  Autocomplete,
  TextField,
  Chip,
  Alert,
  Divider,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  Save,
  Lock,
  LockOpen,
  People,
  Person,
  Group,
  WorkspacePremium,
  Schedule,
  StarRate,
} from '@mui/icons-material';
import learningService from '../../services/learning.service';
import { useToast } from '../../contexts/ToastContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const bauhaus = {
  blue: '#1E88E5',
  teal: '#26A69A',
};

function AccessTab({ courseId, course }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [assignedRoles, setAssignedRoles] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [courseAuthors, setCourseAuthors] = useState([]);
  const [isRequired, setIsRequired] = useState(false);
  const [requiredForRoles, setRequiredForRoles] = useState([]);
  const [deadlineType, setDeadlineType] = useState('none');
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [deadlineDate, setDeadlineDate] = useState('');

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const loadData = async () => {
    setLoading(true);

    // Load course access
    const accessResult = await learningService.getCourseAccess(courseId);
    if (accessResult.success) {
      setIsPublic(accessResult.access.isPublic);
      setAssignedUsers(accessResult.access.assignedUsers || []);
      setAssignedTeams(accessResult.access.assignedTeams || []);
      setAssignedRoles(accessResult.access.assignedRoles || []);
      setIsRequired(accessResult.access.isRequired || false);
      setRequiredForRoles(accessResult.access.requiredForRoles || []);

      // Load deadline settings
      if (accessResult.access.deadline) {
        const deadline = accessResult.access.deadline;
        setDeadlineType(deadline.type || 'none');
        if (deadline.type === 'days_after_assign') {
          setDeadlineDays(deadline.value || 30);
        } else if (deadline.type === 'fixed_date') {
          // Convert Firestore timestamp to date string
          const date = deadline.value?.toDate?.() || new Date(deadline.value);
          setDeadlineDate(date.toISOString().split('T')[0]);
        }
      }
    }

    // Load course to get authors
    if (course?.authors) {
      setCourseAuthors(course.authors);
    }

    // Load available users
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        label: doc.data().name || doc.data().email || 'Неизвестный пользователь',
        ...doc.data(),
      }));
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }

    // Load available teams
    try {
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const teams = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        label: doc.data().name || 'Команда без названия',
        ...doc.data(),
      }));
      setAvailableTeams(teams);
    } catch (error) {
      console.error('Error loading teams:', error);
    }

    // Load available roles
    try {
      const rolesSnapshot = await getDocs(collection(db, 'roles'));
      const roles = rolesSnapshot.docs.map(doc => ({
        id: doc.id,
        label: doc.data().name || 'Роль без названия',
        ...doc.data(),
      }));
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Error loading roles:', error);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const accessData = {
      isPublic,
      assignedUsers,
      assignedTeams,
      assignedRoles,
      isRequired,
      requiredForRoles,
    };

    // Добавляем дедлайн если он настроен
    if (deadlineType !== 'none') {
      accessData.deadline = {
        type: deadlineType,
        value: deadlineType === 'days_after_assign'
          ? parseInt(deadlineDays)
          : new Date(deadlineDate),
      };
    } else {
      accessData.deadline = null;
    }

    const result = await learningService.updateCourseAccess(courseId, accessData);

    if (result.success) {
      toast.success('Настройки доступа сохранены');
    } else {
      toast.error('Ошибка сохранения настроек');
    }

    setSaving(false);
  };

  const handleSaveAuthors = async () => {
    setSaving(true);

    const result = await learningService.updateCourse(courseId, { authors: courseAuthors });

    if (result.success) {
      toast.success('Список авторов обновлен');
    } else {
      toast.error('Ошибка сохранения авторов');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedUsers = availableUsers.filter(u => assignedUsers.includes(u.id));
  const selectedTeams = availableTeams.filter(t => assignedTeams.includes(t.id));
  const selectedAuthors = availableUsers.filter(u => courseAuthors.includes(u.id));

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Управление доступом
      </Typography>

      {/* Course Authors */}
      <Card sx={{ borderRadius: 3, mb: 3, bgcolor: '#1E88E505', border: '2px solid', borderColor: bauhaus.blue }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <People sx={{ color: bauhaus.blue }} />
              <Typography variant="h6" fontWeight={700}>
                Авторы курса
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Авторы имеют полные права на редактирование курса, уроков, экзаменов и управление доступом
            </Typography>

            <Autocomplete
              multiple
              options={availableUsers}
              value={selectedAuthors}
              onChange={(e, newValue) => {
                setCourseAuthors(newValue.map(u => u.id));
              }}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Выберите пользователей для назначения авторами"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    icon={<Person />}
                    label={option.label}
                    {...getTagProps({ index })}
                    color="primary"
                  />
                ))
              }
            />

            <Box sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                onClick={handleSaveAuthors}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                sx={{ background: 'linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)' }}
              >
                {saving ? 'Сохранение...' : 'Сохранить авторов'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Public/Private Toggle */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {isPublic ? <LockOpen /> : <Lock />}
                    <Typography variant="subtitle1" fontWeight={600}>
                      {isPublic ? 'Публичный курс' : 'Приватный курс'}
                    </Typography>
                  </Stack>
                }
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                {isPublic
                  ? 'Все пользователи системы могут просматривать и проходить этот курс'
                  : 'Только назначенные пользователи и команды имеют доступ к курсу'}
              </Typography>
            </Box>

            <Divider />

            {/* Assigned Users */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Person sx={{ color: bauhaus.blue }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Назначенные пользователи
                </Typography>
              </Stack>

              {!isPublic && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Выберите пользователей, которые будут иметь доступ к курсу
                </Alert>
              )}

              <Autocomplete
                multiple
                disabled={isPublic}
                options={availableUsers}
                value={selectedUsers}
                onChange={(e, newValue) => {
                  setAssignedUsers(newValue.map(u => u.id));
                }}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={isPublic ? 'Курс доступен всем' : 'Выберите пользователей'}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option.id}
                      icon={<Person />}
                      label={option.label}
                      {...getTagProps({ index })}
                      disabled={isPublic}
                    />
                  ))
                }
              />

              {!isPublic && assignedUsers.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Выбрано пользователей: {assignedUsers.length}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Assigned Teams */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Group sx={{ color: bauhaus.teal }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Назначенные команды
                </Typography>
              </Stack>

              {!isPublic && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Все участники выбранных команд получат доступ к курсу
                </Alert>
              )}

              <Autocomplete
                multiple
                disabled={isPublic}
                options={availableTeams}
                value={selectedTeams}
                onChange={(e, newValue) => {
                  setAssignedTeams(newValue.map(t => t.id));
                }}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={isPublic ? 'Курс доступен всем' : 'Выберите команды'}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option.id}
                      icon={<Group />}
                      label={option.label}
                      {...getTagProps({ index })}
                      disabled={isPublic}
                    />
                  ))
                }
              />

              {!isPublic && assignedTeams.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Выбрано команд: {assignedTeams.length}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Assigned Roles */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <WorkspacePremium sx={{ color: '#FF9800' }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Назначенные роли
                </Typography>
              </Stack>

              {!isPublic && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Все пользователи с выбранными ролями получат доступ к курсу
                </Alert>
              )}

              <Autocomplete
                multiple
                disabled={isPublic}
                options={availableRoles}
                value={availableRoles.filter(r => assignedRoles.includes(r.id))}
                onChange={(e, newValue) => {
                  setAssignedRoles(newValue.map(r => r.id));
                }}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={isPublic ? 'Курс доступен всем' : 'Выберите роли'}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option.id}
                      icon={<WorkspacePremium />}
                      label={option.label}
                      {...getTagProps({ index })}
                      disabled={isPublic}
                      sx={{ bgcolor: '#FF980010' }}
                    />
                  ))
                }
              />

              {!isPublic && assignedRoles.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Выбрано ролей: {assignedRoles.length}
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Summary */}
      {!isPublic && (
        <Card sx={{ mb: 3, borderRadius: 3, bgcolor: '#1E88E505' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <People sx={{ color: bauhaus.blue }} />
              <Typography variant="subtitle1" fontWeight={700}>
                Сводка по доступу
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              К курсу имеют доступ:
            </Typography>
            <Typography variant="body2">
              • {assignedUsers.length} {assignedUsers.length === 1 ? 'пользователь' : 'пользователей'}
            </Typography>
            <Typography variant="body2">
              • {assignedTeams.length} {assignedTeams.length === 1 ? 'команда' : 'команд'}
            </Typography>
            <Typography variant="body2">
              • {assignedRoles.length} {assignedRoles.length === 1 ? 'роль' : 'ролей'}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Required Courses Section */}
      <Card sx={{ borderRadius: 3, mb: 3, bgcolor: '#FF980005', border: '2px solid #FF9800' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <StarRate sx={{ color: '#FF9800' }} />
              <Typography variant="h6" fontWeight={700}>
                Обязательное обучение
              </Typography>
            </Stack>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Typography variant="subtitle1" fontWeight={600}>
                    Сделать курс обязательным
                  </Typography>
                }
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                {isRequired
                  ? 'Пользователи с выбранными ролями будут автоматически записаны на курс'
                  : 'Курс доступен для добровольного прохождения'}
              </Typography>
            </Box>

            {isRequired && (
              <>
                <Divider />

                {/* Required for Roles */}
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <WorkspacePremium sx={{ color: '#FF9800' }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Обязателен для ролей
                    </Typography>
                  </Stack>

                  <Alert severity="warning" sx={{ mb: 2 }}>
                    При назначении роли или создании пользователя с выбранной ролью, курс будет автоматически назначен
                  </Alert>

                  <Autocomplete
                    multiple
                    options={availableRoles}
                    value={availableRoles.filter(r => requiredForRoles.includes(r.id))}
                    onChange={(e, newValue) => {
                      setRequiredForRoles(newValue.map(r => r.id));
                    }}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Выберите роли, для которых курс обязателен"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          key={option.id}
                          icon={<WorkspacePremium />}
                          label={option.label}
                          {...getTagProps({ index })}
                          color="warning"
                        />
                      ))
                    }
                  />
                </Box>

                <Divider />

                {/* Deadline Settings */}
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Schedule sx={{ color: '#FF9800' }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Дедлайн прохождения
                    </Typography>
                  </Stack>

                  <FormControl component="fieldset">
                    <RadioGroup
                      value={deadlineType}
                      onChange={(e) => setDeadlineType(e.target.value)}
                    >
                      <FormControlLabel
                        value="none"
                        control={<Radio color="warning" />}
                        label="Без дедлайна"
                      />
                      <FormControlLabel
                        value="days_after_assign"
                        control={<Radio color="warning" />}
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>Через</Typography>
                            <TextField
                              type="number"
                              value={deadlineDays}
                              onChange={(e) => setDeadlineDays(e.target.value)}
                              disabled={deadlineType !== 'days_after_assign'}
                              size="small"
                              sx={{ width: 80 }}
                              inputProps={{ min: 1, max: 365 }}
                            />
                            <Typography>дней после назначения</Typography>
                          </Stack>
                        }
                      />
                      <FormControlLabel
                        value="fixed_date"
                        control={<Radio color="warning" />}
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>Фиксированная дата:</Typography>
                            <TextField
                              type="date"
                              value={deadlineDate}
                              onChange={(e) => setDeadlineDate(e.target.value)}
                              disabled={deadlineType !== 'fixed_date'}
                              size="small"
                              InputLabelProps={{ shrink: true }}
                            />
                          </Stack>
                        }
                      />
                    </RadioGroup>
                  </FormControl>

                  {deadlineType !== 'none' && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      {deadlineType === 'days_after_assign'
                        ? `Пользователи должны пройти курс в течение ${deadlineDays} дней после назначения`
                        : `Все пользователи должны пройти курс до ${new Date(deadlineDate).toLocaleDateString('ru-RU')}`}
                    </Alert>
                  )}
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            py: 1.5,
            px: 6,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1E88E5 0%, #26A69A 100%)',
          }}
        >
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </Box>
    </Box>
  );
}

export default AccessTab;
