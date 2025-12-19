// src/components/News/NewsFeed.jsx
import React from 'react';
import { Box, Stack } from '@mui/material';
import NewsCard from './NewsCard';

function NewsFeed({ news, currentUserId, userProfile, users, onLike, onDelete }) {
  return (
    <Stack spacing={3}>
      {news.map((newsItem) => (
        <NewsCard
          key={newsItem.id}
          news={newsItem}
          currentUserId={currentUserId}
          userProfile={userProfile}
          users={users}
          onLike={onLike}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}

export default NewsFeed;
