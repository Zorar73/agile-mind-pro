// src/services/task.service.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy as firestoreOrderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import notificationService from './notification.service';

const TASKS_COLLECTION = 'tasks';
const COMMENTS_SUBCOLLECTION = 'comments';
const SUBTASKS_SUBCOLLECTION = 'subtasks';

const taskService = {
  // =====================
  // ЗАДАЧИ
  // =====================

  // Получить задачи конкретной доски
  async getTasksByBoard(boardId) {
    try {
      const q = query(
        collection(db, TASKS_COLLECTION),
        where('boardId', '==', boardId),
        firestoreOrderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt,
        };
      });
      
      return { success: true, tasks };
    } catch (error) {
      console.error('Error getting tasks by board:', error);
      return { success: false, error: error.message, tasks: [] };
    }
  },

  // Подписка на задачи доски (realtime)
  subscribeToTasksByBoard(boardId, callback) {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('boardId', '==', boardId),
      firestoreOrderBy('order', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt,
        };
      });
      callback(tasks);
    });
  },

  // Получить все задачи пользователя (где он участник)
  async getUserTasks(userId) {
    try {
      // Получаем все задачи и фильтруем по members
      const snapshot = await getDocs(collection(db, TASKS_COLLECTION));
      const tasks = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.members && data.members[userId]) {
          tasks.push({
            id: doc.id,
            ...data,
            userRole: data.members[userId],
            dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate,
            startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt,
          });
        }
      });
      
      // Сортируем по order
      tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      return { success: true, tasks };
    } catch (error) {
      console.error('Error getting user tasks:', error);
      return { success: false, error: error.message, tasks: [] };
    }
  },

  // Получить задачу по ID
  async getTask(taskId) {
    try {
      const docRef = doc(db, TASKS_COLLECTION, taskId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          success: true,
          task: {
            id: docSnap.id,
            ...data,
            dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate,
            startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt,
          }
        };
      }
      
      return { success: false, error: 'Task not found' };
    } catch (error) {
      console.error('Error getting task:', error);
      return { success: false, error: error.message };
    }
  },

  // Создать задачу
  async createTask(taskData, userId) {
    try {
      const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
        title: taskData.title,
        description: taskData.description || '',
        boardId: taskData.boardId,
        columnId: taskData.columnId || null,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'normal',
        members: {
          [userId]: 'assignee',
          ...(taskData.assigneeId && taskData.assigneeId !== userId
            ? { [taskData.assigneeId]: 'assignee' }
            : {})
        },
        tags: taskData.tags || [],
        dueDate: taskData.dueDate ? Timestamp.fromDate(new Date(taskData.dueDate)) : null,
        startDate: taskData.startDate ? Timestamp.fromDate(new Date(taskData.startDate)) : null,
        storyPoints: taskData.storyPoints || 0,
        order: taskData.order ?? Date.now(),
        sprintId: taskData.sprintId || null,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        completedAt: null,
      });

      // Уведомление о назначении задачи
      if (taskData.assigneeId && taskData.assigneeId !== userId) {
        await notificationService.notifyTaskAssigned(
          docRef.id,
          taskData.title,
          taskData.boardId,
          taskData.assigneeId,
          userId
        );
      }

      return { success: true, taskId: docRef.id };
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }
  },

  // Обновить задачу
  async updateTask(taskId, updates, currentUserId) {
    try {
      const docRef = doc(db, TASKS_COLLECTION, taskId);

      // Получаем текущие данные задачи для сравнения
      const taskDoc = await getDoc(docRef);
      if (!taskDoc.exists()) {
        return { success: false, error: 'Task not found' };
      }

      const oldData = taskDoc.data();
      const processedUpdates = { ...updates };

      // Конвертируем даты
      if (updates.dueDate !== undefined) {
        processedUpdates.dueDate = updates.dueDate
          ? Timestamp.fromDate(new Date(updates.dueDate))
          : null;
      }
      if (updates.startDate !== undefined) {
        processedUpdates.startDate = updates.startDate
          ? Timestamp.fromDate(new Date(updates.startDate))
          : null;
      }

      // Если задача завершена, ставим completedAt
      if (updates.status === 'done') {
        processedUpdates.completedAt = serverTimestamp();
      } else if (updates.status && updates.status !== 'done') {
        processedUpdates.completedAt = null;
      }

      await updateDoc(docRef, {
        ...processedUpdates,
        updatedAt: serverTimestamp(),
      });

      // Отправляем уведомления об изменениях
      if (currentUserId) {
        const memberIds = oldData.members ? Object.keys(oldData.members) : [];

        // Уведомление об изменении статуса
        if (updates.status && updates.status !== oldData.status) {
          await notificationService.notifyTaskStatusChanged(
            taskId,
            oldData.title,
            oldData.boardId,
            memberIds,
            updates.status,
            currentUserId
          );

          // Уведомление о завершении задачи
          if (updates.status === 'done') {
            await notificationService.notifyTaskCompleted(
              taskId,
              oldData.title,
              oldData.boardId,
              memberIds,
              currentUserId
            );
          }
        }

        // Уведомление об изменении приоритета
        if (updates.priority && updates.priority !== oldData.priority) {
          await notificationService.notifyTaskPriorityChanged(
            taskId,
            oldData.title,
            oldData.boardId,
            memberIds,
            updates.priority,
            currentUserId
          );
        }

        // Уведомление об изменении дедлайна
        if (updates.dueDate !== undefined && updates.dueDate !== oldData.dueDate) {
          const dueDateStr = updates.dueDate
            ? new Date(updates.dueDate).toLocaleDateString('ru-RU')
            : 'не установлен';

          await notificationService.notifyTaskDueDateChanged(
            taskId,
            oldData.title,
            oldData.boardId,
            memberIds,
            dueDateStr,
            currentUserId
          );
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить задачу (с каскадным удалением комментариев и подзадач)
  async deleteTask(taskId) {
    try {
      const batch = writeBatch(db);
      
      // Удаляем комментарии
      const commentsSnapshot = await getDocs(
        collection(db, TASKS_COLLECTION, taskId, COMMENTS_SUBCOLLECTION)
      );
      commentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Удаляем подзадачи
      const subtasksSnapshot = await getDocs(
        collection(db, TASKS_COLLECTION, taskId, SUBTASKS_SUBCOLLECTION)
      );
      subtasksSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Удаляем задачу
      batch.delete(doc(db, TASKS_COLLECTION, taskId));
      
      await batch.commit();
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }
  },

  // Переместить задачу в другую колонку
  async moveTask(taskId, newColumnId, newOrder) {
    try {
      await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
        columnId: newColumnId,
        order: newOrder,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error moving task:', error);
      return { success: false, error: error.message };
    }
  },

  // Переупорядочить задачи
  async reorderTasks(taskOrderArray) {
    try {
      const batch = writeBatch(db);
      
      taskOrderArray.forEach((item) => {
        batch.update(doc(db, TASKS_COLLECTION, item.id), {
          order: item.order,
          columnId: item.columnId,
          updatedAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error reordering tasks:', error);
      return { success: false, error: error.message };
    }
  },

  // Добавить участника в задачу
  async addTaskMember(taskId, userId, role = 'assignee', currentUserId) {
    try {
      await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
        [`members.${userId}`]: role,
        updatedAt: serverTimestamp(),
      });

      // Получаем данные задачи для уведомления
      if (currentUserId && userId !== currentUserId) {
        const taskDoc = await getDoc(doc(db, TASKS_COLLECTION, taskId));
        const taskData = taskDoc.data();

        if (taskData) {
          await notificationService.notifyTaskAssigned(
            taskId,
            taskData.title,
            taskData.boardId,
            userId,
            currentUserId
          );
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding task member:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить участника из задачи
  async removeTaskMember(taskId, userId) {
    try {
      const taskDoc = await getDoc(doc(db, TASKS_COLLECTION, taskId));
      const members = { ...taskDoc.data().members };
      delete members[userId];
      
      await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
        members,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error removing task member:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // КОММЕНТАРИИ
  // =====================

  // Получить комментарии задачи
  async getComments(taskId) {
    try {
      const q = query(
        collection(db, TASKS_COLLECTION, taskId, COMMENTS_SUBCOLLECTION),
        firestoreOrderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        };
      });
      
      return { success: true, comments };
    } catch (error) {
      console.error('Error getting comments:', error);
      return { success: false, error: error.message, comments: [] };
    }
  },

  // Подписка на комментарии (realtime)
  subscribeToComments(taskId, callback) {
    const q = query(
      collection(db, TASKS_COLLECTION, taskId, COMMENTS_SUBCOLLECTION),
      firestoreOrderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        };
      });
      callback(comments);
    });
  },

  // Добавить комментарий
  async addComment(taskId, text, userId, attachments = [], mentions = [], entityLinks = [], parentId = null) {
    try {
      const commentData = {
        text,
        userId,
        attachments,
        mentions,
        entityLinks,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Если это ответ, добавляем parentId
      if (parentId) {
        commentData.parentId = parentId;
      }

      const docRef = await addDoc(
        collection(db, TASKS_COLLECTION, taskId, COMMENTS_SUBCOLLECTION),
        commentData
      );

      // Обновляем задачу
      await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
        updatedAt: serverTimestamp(),
      });

      // Получаем данные задачи для уведомлений
      const taskDoc = await getDoc(doc(db, TASKS_COLLECTION, taskId));
      const taskData = taskDoc.data();

      // Уведомляем участников задачи о новом комментарии
      if (taskData && taskData.members) {
        const memberIds = Object.keys(taskData.members);
        for (const memberId of memberIds) {
          if (memberId !== userId) {
            await notificationService.notifyTaskComment(
              taskId,
              taskData.title,
              taskData.boardId,
              memberId,
              userId
            );
          }
        }
      }

      // Уведомляем упомянутых пользователей
      if (mentions && mentions.length > 0) {
        for (const mentionedUserId of mentions) {
          if (mentionedUserId !== userId) {
            await notificationService.notifyTaskMention(
              taskId,
              taskData?.title || 'Задача',
              taskData?.boardId,
              mentionedUserId,
              userId
            );
          }
        }
      }

      return { success: true, commentId: docRef.id };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  },

  // Обновить комментарий
  async updateComment(taskId, commentId, data) {
    try {
      await updateDoc(
        doc(db, TASKS_COLLECTION, taskId, COMMENTS_SUBCOLLECTION, commentId),
        {
          ...data,
          updatedAt: serverTimestamp(),
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating comment:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить комментарий
  async deleteComment(taskId, commentId) {
    try {
      await deleteDoc(
        doc(db, TASKS_COLLECTION, taskId, COMMENTS_SUBCOLLECTION, commentId)
      );
      
      await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
        updatedAt: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // ПОДЗАДАЧИ
  // =====================

  // Получить подзадачи
  async getSubtasks(taskId) {
    try {
      const q = query(
        collection(db, TASKS_COLLECTION, taskId, SUBTASKS_SUBCOLLECTION),
        firestoreOrderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const subtasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, subtasks };
    } catch (error) {
      console.error('Error getting subtasks:', error);
      return { success: false, error: error.message, subtasks: [] };
    }
  },

  // Подписка на подзадачи (realtime)
  subscribeToSubtasks(taskId, callback) {
    const q = query(
      collection(db, TASKS_COLLECTION, taskId, SUBTASKS_SUBCOLLECTION),
      firestoreOrderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const subtasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(subtasks);
    });
  },

  // Добавить подзадачу
  async addSubtask(taskId, title) {
    try {
      const docRef = await addDoc(
        collection(db, TASKS_COLLECTION, taskId, SUBTASKS_SUBCOLLECTION),
        {
          title,
          completed: false,
          createdAt: serverTimestamp(),
        }
      );
      
      return { success: true, subtaskId: docRef.id };
    } catch (error) {
      console.error('Error adding subtask:', error);
      return { success: false, error: error.message };
    }
  },

  // Обновить подзадачу
  async updateSubtask(taskId, subtaskId, updates) {
    try {
      await updateDoc(
        doc(db, TASKS_COLLECTION, taskId, SUBTASKS_SUBCOLLECTION, subtaskId),
        updates
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating subtask:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить подзадачу
  async deleteSubtask(taskId, subtaskId) {
    try {
      await deleteDoc(
        doc(db, TASKS_COLLECTION, taskId, SUBTASKS_SUBCOLLECTION, subtaskId)
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting subtask:', error);
      return { success: false, error: error.message };
    }
  },

  // Переключить статус подзадачи
  async toggleSubtask(taskId, subtaskId) {
    try {
      const subtaskDoc = await getDoc(
        doc(db, TASKS_COLLECTION, taskId, SUBTASKS_SUBCOLLECTION, subtaskId)
      );
      
      const currentCompleted = subtaskDoc.data().completed;
      
      await updateDoc(
        doc(db, TASKS_COLLECTION, taskId, SUBTASKS_SUBCOLLECTION, subtaskId),
        { completed: !currentCompleted }
      );
      
      return { success: true, completed: !currentCompleted };
    } catch (error) {
      console.error('Error toggling subtask:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // АЛИАСЫ ДЛЯ СОВМЕСТИМОСТИ
  // =====================
  
  // Алиас для getTasksByBoard (для обратной совместимости)
  async getTasks(boardId) {
    return this.getTasksByBoard(boardId);
  },
};

export default taskService;
