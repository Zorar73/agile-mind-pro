// src/services/storage.service.js
// Universal storage service - works with Firebase Storage and Cloudinary

import { storage } from "../config/firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import cloudinaryService from "./cloudinary.service";

class StorageService {
  constructor() {
    this.preferredStorage = "firebase"; // or "cloudinary"
  }

  /**
   * Upload file to storage
   * @param {File} file - File to upload
   * @param {Object} options - Upload options
   * @param {string} options.folder - Folder path (e.g., "avatars", "news", "tasks")
   * @param {string} options.storage - Force specific storage ("firebase" or "cloudinary")
   * @param {Function} options.onProgress - Progress callback (0-100)
   * @returns {Promise<{success: boolean, url?: string, path?: string, error?: string}>}
   */
  async uploadFile(file, options = {}) {
    const {
      folder = "general",
      storage = this.preferredStorage,
      onProgress = null,
    } = options;

    // Validate file
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size exceeds 10MB limit" };
    }

    try {
      if (storage === "cloudinary") {
        return await this._uploadToCloudinary(file, folder, onProgress);
      } else {
        return await this._uploadToFirebase(file, folder, onProgress);
      }
    } catch (error) {
      console.error("Storage upload error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload to Firebase Storage
   * @private
   */
  async _uploadToFirebase(file, folder, onProgress) {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `${folder}/${fileName}`;
    const storageRef = ref(storage, filePath);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (onProgress) {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            onProgress(progress);
          }
        },
        (error) => {
          console.error("Firebase upload error:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              url: downloadURL,
              path: filePath,
              storage: "firebase",
              fileName,
              size: file.size,
              type: file.type,
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Upload to Cloudinary
   * @private
   */
  async _uploadToCloudinary(file, folder, onProgress) {
    const result = await cloudinaryService.upload(file, {
      folder,
      onProgress,
    });

    if (result.success) {
      return {
        success: true,
        url: result.url,
        publicId: result.publicId,
        storage: "cloudinary",
        fileName: result.originalFilename,
        size: result.size,
        type: file.type,
      };
    }

    return result;
  }

  /**
   * Upload multiple files
   * @param {File[]} files - Array of files
   * @param {Object} options - Upload options
   * @returns {Promise<{success: boolean, results: Array}>}
   */
  async uploadMultiple(files, options = {}) {
    const { onFileProgress, ...uploadOptions } = options;
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadFile(files[i], {
        ...uploadOptions,
        onProgress: onFileProgress ? (p) => onFileProgress(i, p) : null,
      });
      results.push({
        file: files[i].name,
        ...result,
      });
    }

    return {
      success: results.every((r) => r.success),
      results,
      uploaded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }

  /**
   * Delete file from storage
   * @param {string} pathOrUrl - File path (Firebase) or URL (Cloudinary)
   * @param {string} storage - Storage type
   * @returns {Promise<{success: boolean}>}
   */
  async deleteFile(pathOrUrl, storageType = "firebase") {
    try {
      if (storageType === "firebase") {
        const fileRef = ref(storage, pathOrUrl);
        await deleteObject(fileRef);
        return { success: true };
      } else {
        // Cloudinary delete requires server-side
        console.warn("Cloudinary delete not implemented client-side");
        return { success: false, error: "Cloudinary delete requires server" };
      }
    } catch (error) {
      console.error("Storage delete error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get optimized image URL
   * @param {string} url - Original URL
   * @param {Object} options - Transform options
   * @returns {string}
   */
  getOptimizedImageUrl(url, options = {}) {
    if (url.includes("cloudinary.com")) {
      return cloudinaryService.getOptimizedUrl(url, options);
    }
    // Firebase URLs are already optimized
    return url;
  }

  /**
   * Get avatar URL
   * @param {string} url - Original URL
   * @param {number} size - Size in pixels
   * @returns {string}
   */
  getAvatarUrl(url, size = 150) {
    if (url.includes("cloudinary.com")) {
      return cloudinaryService.getAvatarUrl(url, size);
    }
    return url;
  }

  /**
   * Get thumbnail URL
   * @param {string} url - Original URL
   * @param {number} maxWidth - Max width
   * @returns {string}
   */
  getThumbnailUrl(url, maxWidth = 400) {
    if (url.includes("cloudinary.com")) {
      return cloudinaryService.getThumbnailUrl(url, maxWidth);
    }
    return url;
  }

  /**
   * Validate file type
   * @param {File} file - File to validate
   * @param {string[]} allowedTypes - Allowed MIME types
   * @returns {boolean}
   */
  validateFileType(file, allowedTypes = []) {
    if (allowedTypes.length === 0) return true;
    return allowedTypes.some((type) => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.replace("/*", "/"));
      }
      return file.type === type;
    });
  }

  /**
   * Format file size for display
   * @param {number} bytes - Size in bytes
   * @returns {string}
   */
  formatFileSize(bytes) {
    return cloudinaryService.formatFileSize(bytes);
  }

  /**
   * Get file icon based on MIME type
   * @param {string} mimeType - MIME type
   * @returns {string} - MUI icon name
   */
  getFileIcon(mimeType) {
    return cloudinaryService.getFileIcon(mimeType);
  }

  /**
   * Check if file is an image
   * @param {File|string} file - File or MIME type
   * @returns {boolean}
   */
  isImage(file) {
    return cloudinaryService.isImage(file);
  }
}

export default new StorageService();
