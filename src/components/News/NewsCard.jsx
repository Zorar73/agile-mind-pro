// src/components/News/NewsCard.jsx
import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CardMedia,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
  Menu,
  MenuItem,
  Collapse,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  MoreVert,
  Delete,
  Edit,
  Group,
  Person,
  Public,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import CommentSection from './CommentSection';
import PollDisplay from './PollDisplay';

function NewsCard({ news, currentUserId, userProfile, users, onLike, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  const isLiked = news.likes && news.likes[currentUserId];
  const canDelete = userProfile?.role === 'admin' || news.authorId === currentUserId;

  // Получаем автора из предзагруженных пользователей (оптимизация N+1)
  const author = users?.[news.authorId] || null;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить эту новость?')) {
      onDelete(news.id);
    }
    handleMenuClose();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
      return format(date, 'd MMMM yyyy, HH:mm', { locale: ru });
    } catch {
      return '';
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
          borderColor: 'primary.main',
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            src={author?.avatar}
            alt={author ? `${author.firstName} ${author.lastName}` : 'User'}
            sx={{
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            {author?.firstName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
        }
        action={
          canDelete && (
            <>
              <IconButton onClick={handleMenuOpen} size="small">
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                  <Delete fontSize="small" sx={{ mr: 1 }} />
                  Удалить
                </MenuItem>
              </Menu>
            </>
          )
        }
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            {author ? `${author.firstName} ${author.lastName}` : 'Загрузка...'}
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {formatDate(news.createdAt)}
          </Typography>
        }
        sx={{ pb: 1 }}
      />

      {news.imageUrl && (
        <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: 'grey.100' }}>
          <CardMedia
            component="img"
            height="320"
            image={news.imageUrl}
            alt={news.title}
            sx={{
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          />
        </Box>
      )}

      <CardContent sx={{ px: 3, pt: 2 }}>
        {/* Important badge */}
        {news.isImportant && (
          <Chip
            label={news.requiresConfirmation ? '⚠️ Важно — требует подтверждения' : '⚠️ Важная новость'}
            size="small"
            color="error"
            sx={{ mb: 1.5 }}
          />
        )}

        {/* Targeting indicator */}
        {news.targeting && news.targeting.type !== 'all' && (
          <Chip
            icon={
              news.targeting.type === 'roles' ? <Group fontSize="small" /> :
              news.targeting.type === 'teams' ? <Group fontSize="small" /> :
              news.targeting.type === 'users' ? <Person fontSize="small" /> :
              <Public fontSize="small" />
            }
            label={
              news.targeting.type === 'roles' ? 'Для ролей' :
              news.targeting.type === 'teams' ? 'Для команд' :
              news.targeting.type === 'users' ? 'Персонально' : 'Для всех'
            }
            size="small"
            variant="outlined"
            sx={{ mb: 1.5, ml: news.isImportant ? 1 : 0 }}
          />
        )}

        <Typography
          variant="h5"
          gutterBottom
          fontWeight={700}
          sx={{
            mb: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {news.title}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            whiteSpace: 'pre-line',
            lineHeight: 1.7,
            fontSize: '0.95rem'
          }}
        >
          {news.content}
        </Typography>

        {/* Poll */}
        {news.poll && (
          <PollDisplay
            newsId={news.id}
            poll={news.poll}
            currentUserId={currentUserId}
          />
        )}

        {news.tags && news.tags.length > 0 && (
          <Box sx={{ mt: 2.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {news.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions
        disableSpacing
        sx={{
          px: 3,
          pb: 2,
          pt: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <IconButton
            onClick={() => onLike(news.id)}
            color={isLiked ? 'error' : 'default'}
            size="small"
            sx={{
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.2)',
              }
            }}
          >
            {isLiked ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            {news.likesCount || 0}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            transition: 'all 0.2s',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
          onClick={() => setCommentsExpanded(!commentsExpanded)}
        >
          <IconButton
            size="small"
            sx={{
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.2)',
              }
            }}
          >
            <ChatBubbleOutline />
          </IconButton>
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            {news.commentsCount || 0}
          </Typography>
        </Box>
      </CardActions>

      <Collapse in={commentsExpanded} timeout="auto" unmountOnExit>
        <CommentSection
          newsId={news.id}
          currentUserId={currentUserId}
          users={users}
        />
      </Collapse>
    </Card>
  );
}

// Мемоизация для предотвращения лишних ререндеров
export default React.memo(NewsCard, (prevProps, nextProps) => {
  // Возвращаем true если props не изменились (пропускаем ререндер)
  const prevLikesCount = Object.keys(prevProps.news.likes || {}).length;
  const nextLikesCount = Object.keys(nextProps.news.likes || {}).length;
  const prevIsLiked = prevProps.news.likes?.[prevProps.currentUserId];
  const nextIsLiked = nextProps.news.likes?.[nextProps.currentUserId];
  
  // Проверяем изменения в poll
  const prevPollVotes = prevProps.news.poll?.totalVotes || 0;
  const nextPollVotes = nextProps.news.poll?.totalVotes || 0;

  return (
    prevProps.news.id === nextProps.news.id &&
    prevProps.news.title === nextProps.news.title &&
    prevProps.news.content === nextProps.news.content &&
    prevLikesCount === nextLikesCount &&
    prevIsLiked === nextIsLiked &&
    prevPollVotes === nextPollVotes &&
    prevProps.currentUserId === nextProps.currentUserId
  );
});
