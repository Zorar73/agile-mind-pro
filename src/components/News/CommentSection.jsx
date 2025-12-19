// src/components/News/CommentSection.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import newsService from '../../services/news.service';
import CommentInput from '../Common/CommentInput';
import ThreadedComment from '../Common/ThreadedComment';

function CommentSection({ newsId, currentUserId, users = {} }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Конвертируем объект users в массив для совместимости с ThreadedComment
  const usersArray = Object.values(users);

  // Подписываемся на комментарии
  useEffect(() => {
    const unsubscribe = newsService.subscribeToComments(newsId, (updatedComments) => {
      setComments(updatedComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [newsId]);

  const handleAddComment = async (data) => {
    const result = await newsService.addComment(
      newsId,
      data.text,
      currentUserId,
      data.attachments,
      data.mentions,
      data.entityLinks
    );

    if (result.success) {
      const commentsResult = await newsService.getComments(newsId);
      if (commentsResult.success) {
        setComments(commentsResult.comments);
      }
    }
  };

  const handleReply = async (parentId, data) => {
    const result = await newsService.addComment(
      newsId,
      data.text,
      currentUserId,
      data.attachments,
      data.mentions,
      data.entityLinks,
      parentId
    );

    if (result.success) {
      const commentsResult = await newsService.getComments(newsId);
      if (commentsResult.success) {
        setComments(commentsResult.comments);
      }
    }
  };

  const handleEditComment = async (commentId, text) => {
    const result = await newsService.updateComment(newsId, commentId, { text });
    if (result.success) {
      const commentsResult = await newsService.getComments(newsId);
      if (commentsResult.success) {
        setComments(commentsResult.comments);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    const result = await newsService.deleteComment(newsId, commentId);
    if (result.success) {
      const commentsResult = await newsService.getComments(newsId);
      if (commentsResult.success) {
        setComments(commentsResult.comments);
      }
    }
  };

  // Строим дерево комментариев из плоского списка
  const buildCommentTree = (flatComments) => {
    const commentMap = {};
    const rootComments = [];

    // Создаем мапу всех комментариев
    flatComments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Строим дерево
    Object.values(commentMap).forEach(comment => {
      if (comment.parentId && commentMap[comment.parentId]) {
        // Это ответ на комментарий - добавляем в replies родителя
        commentMap[comment.parentId].replies.push(comment);
      } else {
        // Это корневой комментарий
        rootComments.push(comment);
      }
    });

    return rootComments;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Divider sx={{ mb: 2 }} />

      {/* Список комментариев */}
      {comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          Нет комментариев
        </Typography>
      ) : (
        <Stack spacing={2} sx={{ mb: 2 }}>
          {buildCommentTree(comments).map((comment) => (
            <ThreadedComment
              key={comment.id}
              comment={comment}
              author={usersArray.find(u => u.uid === comment.userId)}
              users={usersArray}
              replies={comment.replies || []}
              currentUserId={currentUserId}
              onReply={handleReply}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              entityType="news"
              entityId={newsId}
            />
          ))}
        </Stack>
      )}

      {/* Форма добавления комментария */}
      <CommentInput
        users={usersArray}
        onSubmit={handleAddComment}
        placeholder="Написать комментарий..."
      />
    </Box>
  );
}

export default CommentSection;
