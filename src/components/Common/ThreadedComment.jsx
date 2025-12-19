// src/components/Common/ThreadedComment.jsx
// Универсальный компонент комментария с поддержкой ответов (threading)

import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Button,
  Collapse,
  Stack,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Reply,
  Delete,
  Edit,
  MoreVert,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import EntityLink from './EntityLink';
import CommentInput from './CommentInput';
import AttachmentViewer from './AttachmentViewer';

/**
 * Универсальный компонент комментария с threading
 * @param {Object} props
 * @param {Object} props.comment - Данные комментария
 * @param {Object} props.author - Данные автора
 * @param {string} props.currentUserId - ID текущего пользователя
 * @param {Array} props.users - Список пользователей для mentions
 * @param {Array} props.replies - Массив ответов (комментарии)
 * @param {Function} props.onReply - Callback ответа на комментарий
 * @param {Function} props.onEdit - Callback редактирования
 * @param {Function} props.onDelete - Callback удаления
 * @param {number} props.depth - Глубина вложенности (для отступов)
 * @param {number} props.maxDepth - Максимальная глубина вложенности
 */
function ThreadedComment({
  comment,
  author,
  currentUserId,
  users = [],
  replies = [],
  onReply,
  onEdit,
  onDelete,
  depth = 0,
  maxDepth = 3,
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const canModify = currentUserId === comment.userId;
  const hasReplies = replies.length > 0;
  const canReply = depth < maxDepth;

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
      return formatDistanceToNow(date, { addSuffix: true, locale: ru });
    } catch {
      return '';
    }
  };

  const handleReplySubmit = async (data) => {
    await onReply(comment.id, data);
    setShowReplyInput(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    if (window.confirm('Удалить комментарий?')) {
      onDelete(comment.id);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    onEdit(comment.id, comment.text);
    handleMenuClose();
  };

  // Парсинг текста комментария для отображения mentions как ссылок
  const renderCommentText = (text) => {
    // Простой парсинг @mentions
    const mentionRegex = /@([А-Яа-яA-Za-z]+\s[А-Яа-яA-Za-z]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Текст до упоминания
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Упоминание
      const mentionName = match[1];
      const mentionedUser = users.find(
        u => `${u.firstName} ${u.lastName}` === mentionName
      );

      if (mentionedUser) {
        parts.push(
          <EntityLink
            key={`mention-${match.index}`}
            type="user"
            id={mentionedUser.id}
            size="small"
          />
        );
      } else {
        parts.push(`@${mentionName}`);
      }

      lastIndex = match.index + match[0].length;
    }

    // Остаток текста
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        ml: depth > 0 ? 3 : 0,
        position: 'relative',
      }}
    >
      {/* Линия для показа threading */}
      {depth > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: -16,
            top: 0,
            bottom: 0,
            width: 1,
            bgcolor: 'divider',
            opacity: 0.3,
          }}
        />
      )}

      {/* Аватар */}
      <Avatar
        src={author?.avatar}
        sx={{
          width: depth > 0 ? 28 : 32,
          height: depth > 0 ? 28 : 32,
          fontSize: depth > 0 ? '0.8rem' : '0.9rem',
        }}
      >
        {author?.firstName?.[0] || '?'}
      </Avatar>

      {/* Контент */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
            {author ? `${author.firstName} ${author.lastName}` : 'Загрузка...'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            · {getTimeAgo(comment.createdAt)}
          </Typography>

          {canModify && (
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                ml: 'auto',
                width: 24,
                height: 24,
                opacity: 0.6,
                '&:hover': { opacity: 1 }
              }}
            >
              <MoreVert sx={{ fontSize: 16 }} />
            </IconButton>
          )}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>
              <Edit fontSize="small" sx={{ mr: 1 }} />
              Редактировать
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <Delete fontSize="small" sx={{ mr: 1 }} />
              Удалить
            </MenuItem>
          </Menu>
        </Box>

        {/* Текст комментария */}
        <Box
          sx={{
            mb: 0.5,
          }}
        >
          <Typography
            variant="body2"
            component="div"
            sx={{
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
              fontSize: '0.875rem',
              lineHeight: 1.5,
            }}
          >
            {renderCommentText(comment.text)}
          </Typography>

          {/* Entity Links */}
          {comment.entityLinks && comment.entityLinks.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
              {comment.entityLinks.map((link, index) => (
                <EntityLink
                  key={index}
                  type={link.type}
                  id={link.id}
                  size="small"
                />
              ))}
            </Stack>
          )}

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <Stack spacing={1} sx={{ mt: 1 }}>
              {comment.attachments.map((att, index) => (
                <AttachmentViewer
                  key={index}
                  attachment={att}
                  size="medium"
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Действия */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 0.5 }}>
          {canReply && onReply && (
            <Button
              size="small"
              onClick={() => setShowReplyInput(!showReplyInput)}
              sx={{
                textTransform: 'none',
                minWidth: 'auto',
                p: 0,
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'transparent',
                  color: 'primary.main',
                }
              }}
            >
              Ответить
            </Button>
          )}

          {hasReplies && (
            <Button
              size="small"
              onClick={() => setShowReplies(!showReplies)}
              sx={{
                textTransform: 'none',
                minWidth: 'auto',
                p: 0,
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'transparent',
                  color: 'primary.main',
                }
              }}
            >
              {showReplies ? '↑' : '↓'} {replies.length} {replies.length === 1 ? 'ответ' : 'ответов'}
            </Button>
          )}
        </Box>

        {/* Форма ответа */}
        <Collapse in={showReplyInput}>
          <Box sx={{ mt: 1 }}>
            <CommentInput
              onSubmit={handleReplySubmit}
              users={users}
              userId={currentUserId}
              placeholder="Написать ответ..."
              allowFiles={false}
              allowImages={false}
            />
          </Box>
        </Collapse>

        {/* Ответы (рекурсивно) */}
        <Collapse in={showReplies}>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {replies.map((reply) => (
              <ThreadedComment
                key={reply.id}
                comment={reply}
                author={users.find(u => u.id === reply.userId)}
                currentUserId={currentUserId}
                users={users}
                replies={reply.replies || []}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
          </Stack>
        </Collapse>
      </Box>
    </Box>
  );
}

// Мемоизация для предотвращения лавинных ререндеров рекурсивного компонента
export default React.memo(ThreadedComment, (prevProps, nextProps) => {
  // Возвращаем true если props не изменились (пропускаем ререндер)
  return (
    prevProps.comment.id === nextProps.comment.id &&
    prevProps.comment.text === nextProps.comment.text &&
    prevProps.comment.createdAt === nextProps.comment.createdAt &&
    prevProps.comment.author?.uid === nextProps.comment.author?.uid &&
    prevProps.replies.length === nextProps.replies.length &&
    prevProps.currentUserId === nextProps.currentUserId
  );
});
