// src/services/cloudinary.service.js
// Сервис для работы с Cloudinary (загрузка изображений и файлов)

import { cloudinaryConfig } from '../config/cloudinary';

const { cloudName, uploadPreset, maxFileSizeMB } = cloudinaryConfig;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${cloudName}`;

class CloudinaryService {
  /**
   * Загрузить файл в Cloudinary
   * @param {File} file - Файл для загрузки
   * @param {Object} options - Опции загрузки
   * @param {string} options.folder - Папка в Cloudinary (tasks, sketches, avatars, chat)
   * @param {string} options.resourceType - Тип ресурса (image, raw, video, auto)
   * @param {Function} options.onProgress - Callback прогресса (0-100)
   * @returns {Promise<{success: boolean, url?: string, publicId?: string, error?: string}>}
   */
  async upload(file, options = {}) {
    const {
      folder = 'general',
      resourceType = 'auto',
      onProgress = null,
    } = options;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', `agile-mind-pro/${folder}`);

      // Добавляем tags для удобной фильтрации
      formData.append('tags', [folder, file.type.split('/')[0]].join(','));

      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', `${CLOUDINARY_URL}/${resourceType}/upload`);
        
        // Прогресс загрузки
        if (onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      return {
        success: true,
        url: response.secure_url,
        publicId: response.public_id,
        format: response.format,
        size: response.bytes,
        width: response.width,
        height: response.height,
        resourceType: response.resource_type,
        originalFilename: response.original_filename,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Загрузить несколько файлов
   * @param {File[]} files - Массив файлов
   * @param {Object} options - Опции загрузки
   * @param {Function} options.onFileProgress - Callback (fileIndex, percent)
   * @returns {Promise<{success: boolean, results: Array}>}
   */
  async uploadMultiple(files, options = {}) {
    const { onFileProgress, ...uploadOptions } = options;
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const result = await this.upload(files[i], {
        ...uploadOptions,
        onProgress: onFileProgress ? (p) => onFileProgress(i, p) : null,
      });
      results.push({
        file: files[i].name,
        ...result,
      });
    }

    return {
      success: results.every(r => r.success),
      results,
      uploaded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    };
  }

  /**
   * Удалить файл из Cloudinary
   * Требует серверную часть (Cloud Function) для безопасного удаления
   * @param {string} publicId - Public ID файла
   * @returns {Promise<{success: boolean}>}
   */
  async delete(publicId) {
    // TODO: Реализовать через Cloud Function
    // Cloudinary не позволяет удалять файлы напрямую из браузера
    console.warn('Delete requires server-side implementation');
    return { success: false, error: 'Server-side delete not implemented' };
  }

  /**
   * Получить оптимизированный URL изображения
   * @param {string} url - Оригинальный URL Cloudinary
   * @param {Object} transforms - Трансформации
   * @returns {string} - Трансформированный URL
   */
  getOptimizedUrl(url, transforms = {}) {
    if (!url || !url.includes('cloudinary.com')) return url;

    const {
      width,
      height,
      crop = 'fill',
      quality = 'auto',
      format = 'auto',
      gravity = 'auto',
    } = transforms;

    // Строим строку трансформаций
    const parts = [];
    
    if (width) parts.push(`w_${width}`);
    if (height) parts.push(`h_${height}`);
    if (width || height) {
      parts.push(`c_${crop}`);
      if (crop === 'fill' || crop === 'thumb') {
        parts.push(`g_${gravity}`);
      }
    }
    parts.push(`q_${quality}`);
    parts.push(`f_${format}`);

    const transformation = parts.join(',');

    // Вставляем трансформации в URL
    return url.replace('/upload/', `/upload/${transformation}/`);
  }

  /**
   * Получить URL для аватара
   * @param {string} url - Оригинальный URL
   * @param {number} size - Размер (по умолчанию 150)
   * @returns {string}
   */
  getAvatarUrl(url, size = 150) {
    return this.getOptimizedUrl(url, {
      width: size,
      height: size,
      crop: 'thumb',
      gravity: 'face',
    });
  }

  /**
   * Получить URL для превью изображения
   * @param {string} url - Оригинальный URL
   * @param {number} maxWidth - Максимальная ширина
   * @returns {string}
   */
  getThumbnailUrl(url, maxWidth = 400) {
    return this.getOptimizedUrl(url, {
      width: maxWidth,
      crop: 'limit',
    });
  }

  /**
   * Проверить, является ли файл изображением
   * @param {File|string} file - Файл или MIME-тип
   * @returns {boolean}
   */
  isImage(file) {
    const mimeType = typeof file === 'string' ? file : file.type;
    return mimeType.startsWith('image/');
  }

  /**
   * Проверить размер файла
   * @param {File} file - Файл
   * @param {number} maxSizeMB - Максимальный размер в МБ
   * @returns {boolean}
   */
  validateFileSize(file, maxSizeMB = 10) {
    return file.size <= maxSizeMB * 1024 * 1024;
  }

  /**
   * Получить человекочитаемый размер файла
   * @param {number} bytes - Размер в байтах
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Получить иконку по типу файла
   * @param {string} mimeType - MIME-тип
   * @returns {string} - Название иконки MUI
   */
  getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'VideoFile';
    if (mimeType.startsWith('audio/')) return 'AudioFile';
    if (mimeType.includes('pdf')) return 'PictureAsPdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Description';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'TableChart';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Slideshow';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'FolderZip';
    return 'InsertDriveFile';
  }
}

export default new CloudinaryService();
