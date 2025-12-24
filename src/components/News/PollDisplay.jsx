// src/components/News/PollDisplay.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  LinearProgress,
  TextField,
  IconButton,
  Chip,
  Paper,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Poll as PollIcon,
  Add,
  HowToVote,
  CheckCircle,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import newsService from '../../services/news.service';
import { useToast } from '../../contexts/ToastContext';

function PollDisplay({ newsId, poll, currentUserId }) {
  const toast = useToast();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddOption, setShowAddOption] = useState(false);

  // Проверяем, голосовал ли текущий пользователь
  const userVotedOptions = poll.options
    .map((opt, idx) => (opt.votes && opt.votes[currentUserId] ? idx : -1))
    .filter(idx => idx !== -1);
  
  const hasVoted = userVotedOptions.length > 0;

  // Считаем максимум голосов для масштабирования
  const maxVotes = Math.max(...poll.options.map(opt => opt.votesCount || 0), 1);

  const handleOptionSelect = (index) => {
    if (poll.multipleChoice) {
      // Множественный выбор
      if (selectedOptions.includes(index)) {
        setSelectedOptions(selectedOptions.filter(i => i !== index));
      } else {
        setSelectedOptions([...selectedOptions, index]);
      }
    } else {
      // Одиночный выбор
      setSelectedOptions([index]);
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0) {
      toast.warning('Выберите вариант ответа');
      return;
    }

    setLoading(true);
    try {
      const result = await newsService.votePoll(newsId, currentUserId, selectedOptions);
      if (result.success) {
        toast.success('Ваш голос учтён!');
        setSelectedOptions([]);
      } else {
        toast.error(result.error || 'Ошибка при голосовании');
      }
    } catch (error) {
      toast.error('Ошибка при голосовании');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = async () => {
    if (!newOption.trim()) {
      toast.warning('Введите вариант ответа');
      return;
    }

    setLoading(true);
    try {
      const result = await newsService.addPollOption(newsId, currentUserId, newOption.trim());
      if (result.success) {
        toast.success('Вариант добавлен!');
        setNewOption('');
        setShowAddOption(false);
      } else {
        toast.error(result.error || 'Ошибка при добавлении варианта');
      }
    } catch (error) {
      toast.error('Ошибка при добавлении варианта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mt: 2,
        borderRadius: 2,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Заголовок опроса */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <PollIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={600}>
          {poll.question}
        </Typography>
      </Box>

      {/* Информация о типе опроса */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {poll.multipleChoice && (
          <Chip
            label="Множественный выбор"
            size="small"
            variant="outlined"
            color="info"
          />
        )}
        {hasVoted && (
          <Chip
            label="Вы проголосовали"
            size="small"
            icon={<CheckCircle />}
            color="success"
          />
        )}
        <Chip
          label={`${poll.totalVotes || 0} голосов`}
          size="small"
          variant="outlined"
        />
      </Box>

      {/* Варианты ответа */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {poll.options.map((option, index) => {
          const votesCount = option.votesCount || 0;
          const percentage = poll.totalVotes > 0 
            ? Math.round((votesCount / poll.totalVotes) * 100) 
            : 0;
          const isSelected = selectedOptions.includes(index);
          const userVotedThis = option.votes && option.votes[currentUserId];

          return (
            <Box
              key={index}
              onClick={() => !hasVoted && handleOptionSelect(index)}
              sx={{
                position: 'relative',
                cursor: hasVoted ? 'default' : 'pointer',
                borderRadius: 1.5,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: isSelected || userVotedThis ? 'primary.main' : 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.2s',
                '&:hover': hasVoted ? {} : {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              {/* Progress bar (показываем если проголосовали или showResults) */}
              {(hasVoted || poll.showResults) && (
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '100%',
                    opacity: 0.15,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: userVotedThis ? 'primary.main' : 'grey.500',
                    },
                  }}
                />
              )}

              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {!hasVoted && (
                    poll.multipleChoice ? (
                      <Checkbox
                        checked={isSelected}
                        size="small"
                        sx={{ p: 0 }}
                      />
                    ) : (
                      <Radio
                        checked={isSelected}
                        size="small"
                        sx={{ p: 0 }}
                      />
                    )
                  )}
                  {userVotedThis && <CheckCircle color="primary" fontSize="small" />}
                  <Typography variant="body2" fontWeight={userVotedThis ? 600 : 400}>
                    {option.text}
                  </Typography>
                </Box>

                {/* Показываем результаты */}
                {(hasVoted || poll.showResults) && (
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={userVotedThis ? 'primary.main' : 'text.secondary'}
                  >
                    {percentage}% ({votesCount})
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Кнопка голосования */}
      {!hasVoted && (
        <Button
          variant="contained"
          startIcon={<HowToVote />}
          onClick={handleVote}
          disabled={loading || selectedOptions.length === 0}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? 'Голосование...' : 'Проголосовать'}
        </Button>
      )}

      {/* Добавление варианта (если разрешено) */}
      {poll.allowAddOptions && (
        <Box sx={{ mt: 2 }}>
          <Button
            size="small"
            startIcon={showAddOption ? <ExpandLess /> : <Add />}
            onClick={() => setShowAddOption(!showAddOption)}
          >
            {showAddOption ? 'Скрыть' : 'Добавить свой вариант'}
          </Button>
          
          <Collapse in={showAddOption}>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                size="small"
                placeholder="Ваш вариант ответа"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                fullWidth
                onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
              />
              <Button
                variant="outlined"
                onClick={handleAddOption}
                disabled={loading || !newOption.trim()}
              >
                Добавить
              </Button>
            </Box>
          </Collapse>
        </Box>
      )}
    </Paper>
  );
}

export default React.memo(PollDisplay);
