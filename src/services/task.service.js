// src/services/task.service.js
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

class TaskService {
  // Создать задачу
  async createTask(boardId, taskData) {
    try {
      const tasksRef = collection(db, `boards/${boardId}/tasks`);
      
      // Получаем количество задач в колонке для определения order
      const columnTasks = await getDocs(
        query(tasksRef, where('columnId', '==', taskData.columnId))
      );

      const taskRef = await addDoc(tasksRef, {
        title: taskData.title,
        description: taskData.description || '',
        columnId: taskData.columnId,
        order: columnTasks.size,
        assigneeId: taskData.assigneeId || null,
        creatorId: taskData.creatorId,
        dueDate: taskData.dueDate || null,
        priority: taskData.priority || 'normal',
        tags: taskData.tags || [],
        attachments: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Логируем создание задачи
      await this.logActivity(boardId, taskRef.id, {
        type: 'created',
        userId: taskData.creatorId,
        details: 'Задача создана'
      });

      return { success: true, taskId: taskRef.id };
    } catch (error) {
      console.error('Create task error:', error);
      return { success: false, message: error.message };
    }
  }

  // Получить задачи доски
  async getTasks(boardId) {
    try {
      const snapshot = await getDocs(collection(db, `boards/${boardId}/tasks`));
      const tasks = [];

      snapshot.forEach(doc => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, tasks };
    } catch (error) {
      console.error('Get tasks error:', error);
      return { success: false, message: error.message };
    }
  }

  // Подписка на задачи (Realtime)
  subscribeToTasks(boardId, callback) {
    return onSnapshot(
      collection(db, `boards/${boardId}/tasks`),
      (snapshot) => {
        const tasks = [];
        snapshot.forEach(doc => {
          tasks.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(tasks);
      }
    );
  }

  // Получить задачу по ID
  async getTask(boardId, taskId) {
    try {
      const taskDoc = await getDoc(doc(db, `boards/${boardId}/tasks`, taskId));
      
      if (!taskDoc.exists()) {
        return { success: false, message: 'Задача не найдена' };
      }

      return {
        success: true,
        task: {
          id: taskDoc.id,
          ...taskDoc.data()
        }
      };
    } catch (error) {
      console.error('Get task error:', error);
      return { success: false, message: error.message };
    }
  }

  // Подписка на задачу (Realtime)
  subscribeToTask(boardId, taskId, callback) {
    return onSnapshot(doc(db, `boards/${boardId}/tasks`, taskId), (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      }
    });
  }

  // Обновить задачу
  async updateTask(boardId, taskId, updates, userId) {
    try {
      await updateDoc(doc(db, `boards/${boardId}/tasks`, taskId), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Логируем изменения
      const changes = Object.keys(updates).map(key => ({
        field: key,
        value: updates[key]
      }));

      await this.logActivity(boardId, taskId, {
        type: 'updated',
        userId,
        details: 'Задача обновлена',
        changes
      });

      return { success: true };
    } catch (error) {
      console.error('Update task error:', error);
      return { success: false, message: error.message };
    }
  }

  // Переместить задачу
  async moveTask(boardId, taskId, newColumnId, newOrder, userId) {
    try {
      const taskRef = doc(db, `boards/${boardId}/tasks`, taskId);
      const taskDoc = await getDoc(taskRef);
      const oldColumnId = taskDoc.data().columnId;

      await updateDoc(taskRef, {
        columnId: newColumnId,
        order: newOrder,
        updatedAt: serverTimestamp()
      });

      // Логируем перемещение
      await this.logActivity(boardId, taskId, {
        type: 'moved',
        userId,
        details: `Задача перемещена в другую колонку`,
        oldColumnId,
        newColumnId
      });

      return { success: true };
    } catch (error) {
      console.error('Move task error:', error);
      return { success: false, message: error.message };
    }
  }

  // Удалить задачу
  async deleteTask(boardId, taskId, userId) {
    try {
      // Удаляем все вложения
      const taskDoc = await getDoc(doc(db, `boards/${boardId}/tasks`, taskId));
      const attachments = taskDoc.data().attachments || [];

      for (const attachment of attachments) {
        try {
          const fileRef = ref(storage, attachment.path);
          await deleteObject(fileRef);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }

      // Удаляем задачу
      await deleteDoc(doc(db, `boards/${boardId}/tasks`, taskId));

      return { success: true };
    } catch (error) {
      console.error('Delete task error:', error);
      return { success: false, message: error.message };
    }
  }

  // Загрузить файл
  async uploadFile(boardId, taskId, file, userId) {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `boards/${boardId}/tasks/${taskId}/${fileName}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Добавляем информацию о файле в задачу
      const taskRef = doc(db, `boards/${boardId}/tasks`, taskId);
      const taskDoc = await getDoc(taskRef);
      const attachments = taskDoc.data().attachments || [];

      attachments.push({
        name: file.name,
        url: downloadURL,
        path: filePath,
        size: file.size,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      });

      await updateDoc(taskRef, {
        attachments,
        updatedAt: serverTimestamp()
      });

      // Логируем
      await this.logActivity(boardId, taskId, {
        type: 'file_added',
        userId,
        details: `Добавлен файл: ${file.name}`
      });

      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Upload file error:', error);
      return { success: false, message: error.message };
    }
  }

  // Удалить файл
  async deleteFile(boardId, taskId, attachmentIndex, userId) {
    try {
      const taskRef = doc(db, `boards/${boardId}/tasks`, taskId);
      const taskDoc = await getDoc(taskRef);
      const attachments = taskDoc.data().attachments || [];

      if (attachmentIndex >= attachments.length) {
        return { success: false, message: 'Файл не найден' };
      }

      const attachment = attachments[attachmentIndex];
      
      // Удаляем из Storage
      const fileRef = ref(storage, attachment.path);
      await deleteObject(fileRef);

      // Удаляем из массива
      attachments.splice(attachmentIndex, 1);

      await updateDoc(taskRef, {
        attachments,
        updatedAt: serverTimestamp()
      });

      // Логируем
      await this.logActivity(boardId, taskId, {
        type: 'file_deleted',
        userId,
        details: `Удален файл: ${attachment.name}`
      });

      return { success: true };
    } catch (error) {
      console.error('Delete file error:', error);
      return { success: false, message: error.message };
    }
  }

  // Добавить комментарий
  async addComment(boardId, taskId, text, userId, mentions = []) {
    try {
      const commentRef = await addDoc(
        collection(db, `boards/${boardId}/tasks/${taskId}/comments`),
        {
          userId,
          text,
          mentions,
          createdAt: serverTimestamp()
        }
      );

      // Обновляем время последнего изменения задачи
      await updateDoc(doc(db, `boards/${boardId}/tasks`, taskId), {
        updatedAt: serverTimestamp()
      });

      // Логируем
      await this.logActivity(boardId, taskId, {
        type: 'comment_added',
        userId,
        details: 'Добавлен комментарий'
      });

      return { success: true, commentId: commentRef.id };
    } catch (error) {
      console.error('Add comment error:', error);
      return { success: false, message: error.message };
    }
  }

  // Подписка на комментарии (Realtime)
  subscribeToComments(boardId, taskId, callback) {
    return onSnapshot(
      query(
        collection(db, `boards/${boardId}/tasks/${taskId}/comments`),
        orderBy('createdAt', 'asc')
      ),
      (snapshot) => {
        const comments = [];
        snapshot.forEach(doc => {
          comments.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(comments);
      }
    );
  }

  // Удалить комментарий
  async deleteComment(boardId, taskId, commentId, userId) {
    try {
      await deleteDoc(doc(db, `boards/${boardId}/tasks/${taskId}/comments`, commentId));

      // Логируем
      await this.logActivity(boardId, taskId, {
        type: 'comment_deleted',
        userId,
        details: 'Удален комментарий'
      });

      return { success: true };
    } catch (error) {
      console.error('Delete comment error:', error);
      return { success: false, message: error.message };
    }
  }

  // Логирование активности
  async logActivity(boardId, taskId, activity) {
    try {
      await addDoc(
        collection(db, `boards/${boardId}/tasks/${taskId}/activity`),
        {
          ...activity,
          timestamp: serverTimestamp()
        }
      );
    } catch (error) {
      console.error('Log activity error:', error);
    }
  }

  // Получить историю активности
  async getActivity(boardId, taskId) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, `boards/${boardId}/tasks/${taskId}/activity`),
          orderBy('timestamp', 'desc')
        )
      );

      const activities = [];
      snapshot.forEach(doc => {
        activities.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, activities };
    } catch (error) {
      console.error('Get activity error:', error);
      return { success: false, message: error.message };
    }
  }

  // Подписка на активность (Realtime)
  subscribeToActivity(boardId, taskId, callback) {
    return onSnapshot(
      query(
        collection(db, `boards/${boardId}/tasks/${taskId}/activity`),
        orderBy('timestamp', 'desc')
      ),
      (snapshot) => {
        const activities = [];
        snapshot.forEach(doc => {
          activities.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(activities);
      }
    );
  }
}

export default new TaskService();