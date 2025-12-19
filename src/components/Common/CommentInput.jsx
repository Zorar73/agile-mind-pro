// src/components/Common/CommentInput.jsx
// Универсальный компонент для ввода комментария с @mentions, attachments и entity links

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  CircularProgress,
  Tooltip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Send,
  AttachFile,
  Link as LinkIcon,
  Image as ImageIcon,
  Close,
  InsertDriveFile,
  VideoFile,
  AudioFile,
  PictureAsPdf,
} from '@mui/icons-material';
import MentionInput from './MentionInput';
import EntityPicker from './EntityPicker';
import EntityLink from './EntityLink';
import aiService from '../../services/ai.service';
import cloudinaryService from '../../services/cloudinary.service';

/**
 * Универсальный компонент ввода комментария
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback отправки (text, mentions, attachments, entityLinks)
 * @param {Array} props.users - Список пользователей для mentions
 * @param {string} props.userId - ID текущего пользователя
 * @param {string} props.placeholder - Placeholder
 * @param {boolean} props.allowFiles - Разрешить прикрепление файлов
 * @param {boolean} props.allowImages - Разрешить генерацию изображений
 * @param {boolean} props.allowEntities - Разрешить прикрепление сущностей
 * @param {Function} props.onReply - Callback ответа на комментарий (если это thread)
 */
function CommentInput({
  onSubmit,
  users = [],
  userId,
  placeholder = 'Написать комментарий...',
  allowFiles = true,
  allowImages = true,
  allowEntities = true,
  onReply,
}) {
  const [text, setText] = useState('');
  const [mentions, setMentions] = useState([]);
  const [entityLinks, setEntityLinks] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [entityPickerOpen, setEntityPickerOpen] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!text.trim() && entityLinks.length === 0 && attachments.length === 0) {
      return;
    }

    setSending(true);

    try {
      await onSubmit({
        text: text.trim(),
        mentions,
        entityLinks,
        attachments,
      });

      // Очищаем форму
      setText('');
      setMentions([]);
      setEntityLinks([]);
      setAttachments([]);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileAttach = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Проверка размера (макс 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Размер файла не должен превышать 10MB');
      return;
    }

    setUploadingFile(true);

    try {
      // Определяем тип файла
      let fileType = 'file';
      if (file.type.startsWith('image/')) fileType = 'image';
      else if (file.type.startsWith('video/')) fileType = 'video';
      else if (file.type.startsWith('audio/')) fileType = 'audio';
      else if (file.type.includes('pdf')) fileType = 'pdf';

      // Загружаем в Cloudinary
      const result = await cloudinaryService.upload(file, { folder: 'attachments' });

      if (result.success) {
        setAttachments([...attachments, {
          type: fileType,
          name: file.name,
          url: result.url,
          mimeType: file.type,
          size: file.size,
        }]);
      } else {
        alert('Ошибка загрузки файла: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Ошибка загрузки файла');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!text.trim()) {
      alert('Введите описание изображения');
      return;
    }

    setGeneratingImage(true);

    try {
      const result = await aiService.generateImage(text);

      if (result.success) {
        setAttachments([...attachments, {
          type: 'image',
          name: 'AI Generated Image',
          url: result.imageUrl,
        }]);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleEntitySelect = (type, entity) => {
    setEntityLinks([...entityLinks, {
      type,
      id: entity.id,
    }]);
  };

  const handleRemoveEntity = (index) => {
    setEntityLinks(entityLinks.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
      <Box component="form" onSubmit={handleSubmit}>
        {/* Input с mentions */}
        <MentionInput
          value={text}
          onChange={setText}
          users={users}
          mentions={mentions}
          onMentionsChange={setMentions}
          placeholder={placeholder}
          disabled={sending}
          onKeyDown={handleKeyPress}
        />

        {/* Entity Links */}
        {entityLinks.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
            {entityLinks.map((link, index) => (
              <Box key={index} sx={{ position: 'relative' }}>
                <EntityLink
                  type={link.type}
                  id={link.id}
                  onClick={() => handleRemoveEntity(index)}
                />
              </Box>
            ))}
          </Stack>
        )}

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <Stack spacing={1} sx={{ mt: 1 }}>
            {attachments.map((att, index) => {
              const getIcon = () => {
                switch (att.type) {
                  case 'image': return <ImageIcon />;
                  case 'video': return <VideoFile />;
                  case 'audio': return <AudioFile />;
                  case 'pdf': return <PictureAsPdf />;
                  default: return <InsertDriveFile />;
                }
              };

              return (
                <Paper
                  key={index}
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: 'background.default',
                  }}
                >
                  {getIcon()}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {att.name}
                    </Typography>
                    {att.size && (
                      <Typography variant="caption" color="text.secondary">
                        {cloudinaryService.formatFileSize(att.size)}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Paper>
              );
            })}
          </Stack>
        )}

        {/* Действия */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {allowFiles && (
              <Tooltip title="Прикрепить файл">
                <IconButton size="small" component="label" disabled={uploadingFile}>
                  {uploadingFile ? (
                    <CircularProgress size={20} />
                  ) : (
                    <AttachFile fontSize="small" />
                  )}
                  <input
                    type="file"
                    hidden
                    onChange={handleFileAttach}
                    disabled={uploadingFile}
                  />
                </IconButton>
              </Tooltip>
            )}

            {allowImages && (
              <Tooltip title="Сгенерировать изображение с AI">
                <IconButton
                  size="small"
                  onClick={handleGenerateImage}
                  disabled={generatingImage || !text.trim()}
                >
                  {generatingImage ? (
                    <CircularProgress size={20} />
                  ) : (
                    <ImageIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}

            {allowEntities && (
              <Tooltip title="Вставить ссылку на задачу/доску/команду/пользователя">
                <IconButton size="small" onClick={() => setEntityPickerOpen(true)}>
                  <LinkIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <IconButton
            type="submit"
            color="primary"
            disabled={
              sending ||
              (!text.trim() && entityLinks.length === 0 && attachments.length === 0)
            }
          >
            {sending ? <CircularProgress size={24} /> : <Send />}
          </IconButton>
        </Box>
      </Box>

      {/* Диалог выбора сущности */}
      <EntityPicker
        open={entityPickerOpen}
        onClose={() => setEntityPickerOpen(false)}
        onSelect={handleEntitySelect}
        userId={userId}
      />
    </Paper>
  );
}

export default CommentInput;
