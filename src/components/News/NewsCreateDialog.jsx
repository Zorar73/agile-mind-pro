// src/components/News/NewsCreateDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  IconButton,
  Typography,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormGroup,
  Checkbox,
  Divider,
  Autocomplete,
} from '@mui/material';
import { Close, Image as ImageIcon, Add } from '@mui/icons-material';
import cloudinaryService from '../../services/cloudinary.service';
import roleService from '../../services/role.service';
import teamService from '../../services/team.service';
import userService from '../../services/user.service';
import { useToast } from '../../contexts/ToastContext';

function NewsCreateDialog({ open, onClose, onCreate }) {
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  // Targeting
  const [targetingType, setTargetingType] = useState('all');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Important news
  const [isImportant, setIsImportant] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);

  // Poll
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollMultipleChoice, setPollMultipleChoice] = useState(false);
  const [pollShowResults, setPollShowResults] = useState(true);
  const [pollAllowAddOptions, setPollAllowAddOptions] = useState(false);

  // Data for selectors
  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);

  // Load roles, teams, and users when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    // Load roles
    const rolesResult = await roleService.getRoles();
    if (rolesResult.success) {
      setRoles(rolesResult.roles);
    }

    // Load all teams
    const teamsSnapshot = await teamService.getUserTeams('dummy'); // This gets all teams, we'll need to modify it
    // For now, let's get teams differently
    // We'll use a simple approach - get all documents from teams collection
    const { getDocs, collection } = await import('firebase/firestore');
    const { db } = await import('../../config/firebase');
    const teamsSnap = await getDocs(collection(db, 'teams'));
    const allTeams = teamsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTeams(allTeams);

    // Load users
    const usersResult = await userService.getAllUsers();
    if (usersResult.success) {
      setUsers(usersResult.users);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Введите заголовок новости');
      return;
    }

    if (!content.trim()) {
      toast.error('Введите содержание новости');
      return;
    }

    // Validate poll if enabled
    if (hasPoll) {
      if (!pollQuestion.trim()) {
        toast.error('Введите вопрос опроса');
        return;
      }

      const validOptions = pollOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast.error('Добавьте минимум 2 варианта ответа');
        return;
      }
    }

    // Build targeting object
    const targeting = {
      type: targetingType,
      roleIds: targetingType === 'roles' ? selectedRoles.map(r => r.id) : [],
      teamIds: targetingType === 'teams' ? selectedTeams.map(t => t.id) : [],
      userIds: targetingType === 'users' ? selectedUsers.map(u => u.uid) : [],
    };

    // Build poll object
    const poll = hasPoll ? {
      question: pollQuestion.trim(),
      options: pollOptions.filter(opt => opt.trim()).map(opt => ({ text: opt.trim() })),
      multipleChoice: pollMultipleChoice,
      showResults: pollShowResults,
      allowAddOptions: pollAllowAddOptions,
    } : null;

    onCreate({
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim() || null,
      tags,
      targeting,
      isImportant,
      requiresConfirmation,
      poll,
    });

    // Очищаем форму
    setTitle('');
    setContent('');
    setImageUrl('');
    setTags([]);
    setTagInput('');
    setTargetingType('all');
    setSelectedRoles([]);
    setSelectedTeams([]);
    setSelectedUsers([]);
    setIsImportant(false);
    setRequiresConfirmation(false);
    setHasPoll(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollMultipleChoice(false);
    setPollShowResults(true);
    setPollAllowAddOptions(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleRemovePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка размера файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Можно загружать только изображения');
      return;
    }

    setUploading(true);

    try {
      const result = await cloudinaryService.upload(file, { folder: 'news' });
      if (result.success) {
        setImageUrl(result.url);
        toast.success('Изображение загружено');
      } else {
        toast.error('Ошибка загрузки изображения: ' + result.error);
      }
    } catch (error) {
      toast.error('Ошибка загрузки изображения');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Создать новость
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Заголовок */}
          <TextField
            label="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            autoFocus
          />

          {/* Содержание */}
          <TextField
            label="Содержание"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={6}
            fullWidth
            required
          />

          {/* Загрузка изображения */}
          <Box>
            <input
              accept="image/*"
              id="image-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={uploading ? <CircularProgress size={20} /> : <ImageIcon />}
                disabled={uploading}
              >
                {uploading ? 'Загрузка...' : 'Загрузить изображение'}
              </Button>
            </label>
            {imageUrl && (
              <Box sx={{ mt: 2, position: 'relative' }}>
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
                <IconButton
                  onClick={() => setImageUrl('')}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                  size="small"
                >
                  <Close />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Теги */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Теги
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Добавить тег"
                fullWidth
              />
              <IconButton onClick={handleAddTag} color="primary">
                <Add />
              </IconButton>
            </Box>
            {tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Targeting */}
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">
              <Typography variant="subtitle2" gutterBottom>
                Кому показывать новость
              </Typography>
            </FormLabel>
            <RadioGroup
              value={targetingType}
              onChange={(e) => {
                setTargetingType(e.target.value);
                setSelectedRoles([]);
                setSelectedTeams([]);
                setSelectedUsers([]);
              }}
            >
              <FormControlLabel value="all" control={<Radio />} label="Всем пользователям" />
              <FormControlLabel value="roles" control={<Radio />} label="Определенным ролям" />
              <FormControlLabel value="teams" control={<Radio />} label="Определенным командам" />
              <FormControlLabel value="users" control={<Radio />} label="Конкретным пользователям" />
            </RadioGroup>
          </FormControl>

          {/* Role selector */}
          {targetingType === 'roles' && (
            <Autocomplete
              multiple
              options={roles}
              value={selectedRoles}
              onChange={(event, newValue) => setSelectedRoles(newValue)}
              getOptionLabel={(option) => option.name || ''}
              renderInput={(params) => (
                <TextField {...params} label="Выберите роли" placeholder="Роли" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
          )}

          {/* Team selector */}
          {targetingType === 'teams' && (
            <Autocomplete
              multiple
              options={teams}
              value={selectedTeams}
              onChange={(event, newValue) => setSelectedTeams(newValue)}
              getOptionLabel={(option) => option.name || ''}
              renderInput={(params) => (
                <TextField {...params} label="Выберите команды" placeholder="Команды" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
          )}

          {/* User selector */}
          {targetingType === 'users' && (
            <Autocomplete
              multiple
              options={users}
              value={selectedUsers}
              onChange={(event, newValue) => setSelectedUsers(newValue)}
              getOptionLabel={(option) => option.displayName || option.email || ''}
              renderInput={(params) => (
                <TextField {...params} label="Выберите пользователей" placeholder="Пользователи" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.displayName || option.email}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
          )}

          <Divider sx={{ my: 2 }} />

          {/* Important news */}
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Важная новость
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Новость будет отображаться с повышенным приоритетом
                  </Typography>
                </Box>
              }
            />
            {isImportant && (
              <FormControlLabel
                sx={{ ml: 4 }}
                control={
                  <Checkbox
                    checked={requiresConfirmation}
                    onChange={(e) => setRequiresConfirmation(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Требует подтверждения прочтения
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Пользователи должны подтвердить, что прочитали новость
                    </Typography>
                  </Box>
                }
              />
            )}
          </FormGroup>

          <Divider sx={{ my: 2 }} />

          {/* Poll */}
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasPoll}
                  onChange={(e) => setHasPoll(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Добавить опрос
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Создайте опрос для сбора мнений
                  </Typography>
                </Box>
              }
            />

            {hasPoll && (
              <Box sx={{ ml: 4, mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Poll question */}
                <TextField
                  label="Вопрос опроса"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  fullWidth
                  required
                  placeholder="Например: Какой способ решения задачи вы предпочитаете?"
                />

                {/* Poll options */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Варианты ответа
                  </Typography>
                  {pollOptions.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        value={option}
                        onChange={(e) => handlePollOptionChange(index, e.target.value)}
                        placeholder={`Вариант ${index + 1}`}
                        fullWidth
                      />
                      {pollOptions.length > 2 && (
                        <IconButton
                          onClick={() => handleRemovePollOption(index)}
                          size="small"
                          color="error"
                        >
                          <Close />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={handleAddPollOption}
                    disabled={pollOptions.length >= 10}
                  >
                    Добавить вариант
                  </Button>
                </Box>

                {/* Poll settings */}
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={pollMultipleChoice}
                        onChange={(e) => setPollMultipleChoice(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Множественный выбор
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={pollShowResults}
                        onChange={(e) => setPollShowResults(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Показывать результаты
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={pollAllowAddOptions}
                        onChange={(e) => setPollAllowAddOptions(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Разрешить пользователям добавлять варианты
                      </Typography>
                    }
                  />
                </Box>
              </Box>
            )}
          </FormGroup>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewsCreateDialog;
