// src/config/cloudinary.js
// Конфигурация Cloudinary

export const cloudinaryConfig = {
  // TODO: Заменить на реальные значения из Cloudinary Dashboard
  cloudName: 'djmetivec',
  uploadPreset: 'agile_mind_pro', // Создать в Settings > Upload > Upload presets (Unsigned)
  
  // Лимиты
  maxFileSizeMB: 10,
  maxImageSizeMB: 5,
  
  // Допустимые типы файлов
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  
  // Папки для разных типов контента
  folders: {
    avatars: 'avatars',
    tasks: 'tasks',
    sketches: 'sketches',
    chat: 'chat',
    general: 'general',
  },
};

/**
 * Инструкция по настройке Cloudinary:
 * 
 * 1. Зарегистрируйся на https://cloudinary.com (бесплатный план)
 * 
 * 2. В Dashboard скопируй Cloud Name
 * 
 * 3. Создай Upload Preset:
 *    - Settings → Upload → Upload presets → Add upload preset
 *    - Signing Mode: Unsigned (для загрузки из браузера)
 *    - Folder: agile-mind-pro
 *    - Unique filename: Yes
 *    - Сохрани имя preset'а
 * 
 * 4. Замени значения выше на реальные
 * 
 * Бесплатный план включает:
 * - 25 Credits/месяц
 * - ~25GB хранилища
 * - ~25GB трафика
 */

export default cloudinaryConfig;
