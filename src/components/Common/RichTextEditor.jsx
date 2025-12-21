// src/components/Common/RichTextEditor.jsx
import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import {
  Box,
  Paper,
  IconButton,
  Divider,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Undo,
  Redo,
} from '@mui/icons-material';

// Cloudinary upload function
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default');
  formData.append('folder', 'lessons/content');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

function RichTextEditor({ value, onChange, placeholder = 'Введите текст...' }) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  // Update editor content when value prop changes
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        setUploading(true);
        try {
          const url = await uploadToCloudinary(file);
          editor.chain().focus().setImage({ src: url }).run();
        } catch (error) {
          console.error('Failed to upload image:', error);
          alert('Ошибка загрузки изображения');
        } finally {
          setUploading(false);
        }
      }
    };
  }, [editor]);

  const handleAddLink = useCallback(() => {
    const url = window.prompt('Введите URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {uploading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 1000,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Toolbar */}
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 1,
          bgcolor: 'action.hover',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
        }}
      >
        {/* Text formatting */}
        <ToggleButtonGroup size="small">
          <ToggleButton
            value="bold"
            selected={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Tooltip title="Жирный"><FormatBold fontSize="small" /></Tooltip>
          </ToggleButton>
          <ToggleButton
            value="italic"
            selected={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Tooltip title="Курсив"><FormatItalic fontSize="small" /></Tooltip>
          </ToggleButton>
          <ToggleButton
            value="underline"
            selected={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Tooltip title="Подчеркнутый"><FormatUnderlined fontSize="small" /></Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Lists */}
        <ToggleButtonGroup size="small">
          <ToggleButton
            value="bulletList"
            selected={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <Tooltip title="Маркированный список"><FormatListBulleted fontSize="small" /></Tooltip>
          </ToggleButton>
          <ToggleButton
            value="orderedList"
            selected={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <Tooltip title="Нумерованный список"><FormatListNumbered fontSize="small" /></Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Alignment */}
        <ToggleButtonGroup size="small">
          <ToggleButton
            value="left"
            selected={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <Tooltip title="По левому краю"><FormatAlignLeft fontSize="small" /></Tooltip>
          </ToggleButton>
          <ToggleButton
            value="center"
            selected={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <Tooltip title="По центру"><FormatAlignCenter fontSize="small" /></Tooltip>
          </ToggleButton>
          <ToggleButton
            value="right"
            selected={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <Tooltip title="По правому краю"><FormatAlignRight fontSize="small" /></Tooltip>
          </ToggleButton>
          <ToggleButton
            value="justify"
            selected={editor.isActive({ textAlign: 'justify' })}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          >
            <Tooltip title="По ширине"><FormatAlignJustify fontSize="small" /></Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Quote & Code */}
        <ToggleButtonGroup size="small">
          <ToggleButton
            value="blockquote"
            selected={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Tooltip title="Цитата"><FormatQuote fontSize="small" /></Tooltip>
          </ToggleButton>
          <ToggleButton
            value="code"
            selected={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Tooltip title="Код"><Code fontSize="small" /></Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Image & Link */}
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={handleImageUpload} color="primary">
            <Tooltip title="Вставить изображение"><ImageIcon fontSize="small" /></Tooltip>
          </IconButton>
          <IconButton size="small" onClick={handleAddLink} color="primary">
            <Tooltip title="Вставить ссылку"><LinkIcon fontSize="small" /></Tooltip>
          </IconButton>
        </Stack>

        <Divider orientation="vertical" flexItem />

        {/* Undo/Redo */}
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Tooltip title="Отменить"><Undo fontSize="small" /></Tooltip>
          </IconButton>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Tooltip title="Повторить"><Redo fontSize="small" /></Tooltip>
          </IconButton>
        </Stack>
      </Box>

      {/* Editor */}
      <Box
        sx={{
          p: 2,
          minHeight: 300,
          maxHeight: 500,
          overflow: 'auto',
          '& .tiptap-editor': {
            outline: 'none',
            '& p': { mb: 1 },
            '& h1': { fontSize: '2rem', fontWeight: 700, mb: 2, mt: 2 },
            '& h2': { fontSize: '1.75rem', fontWeight: 700, mb: 1.5, mt: 2 },
            '& h3': { fontSize: '1.5rem', fontWeight: 600, mb: 1.5, mt: 1.5 },
            '& h4': { fontSize: '1.25rem', fontWeight: 600, mb: 1, mt: 1.5 },
            '& h5': { fontSize: '1.1rem', fontWeight: 600, mb: 1, mt: 1 },
            '& h6': { fontSize: '1rem', fontWeight: 600, mb: 1, mt: 1 },
            '& ul, & ol': { pl: 3, mb: 1 },
            '& li': { mb: 0.5 },
            '& blockquote': {
              borderLeft: '4px solid #1E88E5',
              pl: 2,
              py: 1,
              mb: 2,
              fontStyle: 'italic',
              bgcolor: 'action.hover',
            },
            '& pre': {
              bgcolor: 'action.hover',
              p: 2,
              borderRadius: 1,
              mb: 2,
              overflow: 'auto',
              '& code': {
                fontFamily: 'monospace',
                fontSize: '0.9em',
              },
            },
            '& code': {
              bgcolor: 'action.hover',
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              fontFamily: 'monospace',
              fontSize: '0.9em',
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              my: 1,
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          },
          '& .tiptap-editor.ProseMirror-focused': {
            outline: 'none',
          },
          '& .tiptap-editor p.is-editor-empty:first-of-type::before': {
            color: 'text.disabled',
            content: `"${placeholder}"`,
            float: 'left',
            height: 0,
            pointerEvents: 'none',
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
}

export default RichTextEditor;
