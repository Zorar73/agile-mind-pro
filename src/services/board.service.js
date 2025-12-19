// src/services/board.service.js
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
  orderBy,
  serverTimestamp,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import notificationService from './notification.service';

const BOARDS_COLLECTION = 'boards';
const COLUMNS_SUBCOLLECTION = 'columns';
const TASKS_COLLECTION = 'tasks';

const boardService = {
  // =====================
  // ДОСКИ
  // =====================

  // Получить доску по ID
  async getBoard(boardId) {
    try {
      const docRef = doc(db, BOARDS_COLLECTION, boardId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          board: { id: docSnap.id, ...docSnap.data() }
        };
      }
      
      return { success: false, error: 'Board not found' };
    } catch (error) {
      console.error('Error getting board:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить все доски пользователя (где он участник)
  async getUserBoards(userId) {
    try {
      // Firestore не поддерживает запросы по ключам map напрямую,
      // поэтому получаем все доски и фильтруем
      const snapshot = await getDocs(collection(db, BOARDS_COLLECTION));
      const boards = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.members && data.members[userId]) {
          boards.push({
            id: doc.id,
            ...data,
            userRole: data.members[userId]
          });
        }
      });
      
      // Сортируем по дате создания (новые первые)
      boards.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      return { success: true, boards };
    } catch (error) {
      console.error('Error getting user boards:', error);
      return { success: false, error: error.message, boards: [] };
    }
  },

  // Получить доски пользователя вместе с колонками и задачами (оптимизировано)
  async getUserBoardsWithData(userId) {
    try {
      // Сначала получаем все доски пользователя
      const boardsResult = await this.getUserBoards(userId);
      if (!boardsResult.success) {
        return { success: false, error: boardsResult.error, boards: [], columns: {}, tasks: {} };
      }

      const boards = boardsResult.boards;

      // Параллельная загрузка колонок для всех досок
      const columnsPromises = boards.map(board =>
        this.getColumns(board.id).then(result => ({
          boardId: board.id,
          success: result.success,
          columns: result.columns || []
        }))
      );

      // Параллельная загрузка задач для всех досок
      const tasksPromises = boards.map(board =>
        // Используем динамический импорт чтобы избежать циклических зависимостей
        getDocs(query(
          collection(db, TASKS_COLLECTION),
          where('boardId', '==', board.id),
          orderBy('order', 'asc')
        )).then(snapshot => ({
          boardId: board.id,
          success: true,
          tasks: snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        }))
      );

      // Ждем параллельного выполнения всех запросов
      const [columnsResults, tasksResults] = await Promise.all([
        Promise.all(columnsPromises),
        Promise.all(tasksPromises)
      ]);

      // Формируем удобные объекты для быстрого доступа
      const columnsMap = {};
      const tasksMap = {};

      columnsResults.forEach(result => {
        if (result.success) {
          columnsMap[result.boardId] = result.columns;
        }
      });

      tasksResults.forEach(result => {
        if (result.success) {
          tasksMap[result.boardId] = result.tasks;
        }
      });

      return {
        success: true,
        boards,
        columns: columnsMap,
        tasks: tasksMap
      };
    } catch (error) {
      console.error('Error getting user boards with data:', error);
      return { success: false, error: error.message, boards: [], columns: {}, tasks: {} };
    }
  },

  // Подписка на доски пользователя (realtime)
  subscribeToUserBoards(userId, callback) {
    return onSnapshot(collection(db, BOARDS_COLLECTION), (snapshot) => {
      const boards = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.members && data.members[userId]) {
          boards.push({
            id: doc.id,
            ...data,
            userRole: data.members[userId]
          });
        }
      });
      
      boards.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      callback(boards);
    });
  },

  // Создать доску
  async createBoard(boardData, userId) {
    try {
      const docRef = await addDoc(collection(db, BOARDS_COLLECTION), {
        title: boardData.title || 'Новая доска',
        description: boardData.description || '',
        color: boardData.color || '#1976d2',
        isPublic: boardData.isPublic !== undefined ? boardData.isPublic : true, // По умолчанию публичные
        ownerId: userId,
        members: {
          [userId]: 'owner'
        },
        settings: {
          defaultView: 'kanban',
          ...boardData.settings
        },
        columnOrder: [],
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Создаём стандартные колонки
      const defaultColumns = [
        { title: 'К выполнению', order: 0 },
        { title: 'В работе', order: 1 },
        { title: 'Готово', order: 2 },
      ];
      
      const columnIds = [];
      for (const col of defaultColumns) {
        const colRef = await addDoc(
          collection(db, BOARDS_COLLECTION, docRef.id, COLUMNS_SUBCOLLECTION),
          {
            title: col.title,
            order: col.order,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );
        columnIds.push(colRef.id);
      }
      
      // Обновляем порядок колонок в доске
      await updateDoc(docRef, { columnOrder: columnIds });
      
      return { success: true, boardId: docRef.id };
    } catch (error) {
      console.error('Error creating board:', error);
      return { success: false, error: error.message };
    }
  },

  // Обновить доску
  async updateBoard(boardId, updates, currentUserId) {
    try {
      const docRef = doc(db, BOARDS_COLLECTION, boardId);

      // Получаем старые данные для сравнения
      const boardDoc = await getDoc(docRef);
      if (!boardDoc.exists()) {
        return { success: false, error: 'Board not found' };
      }

      const oldData = boardDoc.data();

      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Отправляем уведомления об изменениях
      if (currentUserId && oldData.members) {
        const memberIds = Object.keys(oldData.members);
        const changes = [];

        if (updates.title && updates.title !== oldData.title) {
          changes.push('изменено название');
        }
        if (updates.description !== undefined && updates.description !== oldData.description) {
          changes.push('изменено описание');
        }
        if (updates.color && updates.color !== oldData.color) {
          changes.push('изменён цвет');
        }

        if (changes.length > 0) {
          await notificationService.notifyBoardUpdated(
            boardId,
            updates.title || oldData.title,
            memberIds,
            currentUserId,
            changes
          );
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating board:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить доску (с каскадным удалением)
  async deleteBoard(boardId) {
    try {
      const batch = writeBatch(db);
      
      // 1. Удаляем все колонки доски
      const columnsSnapshot = await getDocs(
        collection(db, BOARDS_COLLECTION, boardId, COLUMNS_SUBCOLLECTION)
      );
      columnsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // 2. Удаляем все задачи доски (и их комментарии)
      const tasksQuery = query(
        collection(db, TASKS_COLLECTION),
        where('boardId', '==', boardId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      
      for (const taskDoc of tasksSnapshot.docs) {
        // Удаляем комментарии задачи
        const commentsSnapshot = await getDocs(
          collection(db, TASKS_COLLECTION, taskDoc.id, 'comments')
        );
        commentsSnapshot.docs.forEach(commentDoc => {
          batch.delete(commentDoc.ref);
        });
        
        // Удаляем подзадачи
        const subtasksSnapshot = await getDocs(
          collection(db, TASKS_COLLECTION, taskDoc.id, 'subtasks')
        );
        subtasksSnapshot.docs.forEach(subtaskDoc => {
          batch.delete(subtaskDoc.ref);
        });
        
        batch.delete(taskDoc.ref);
      }
      
      // 3. Удаляем саму доску
      batch.delete(doc(db, BOARDS_COLLECTION, boardId));
      
      await batch.commit();
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting board:', error);
      return { success: false, error: error.message };
    }
  },

  // Добавить участника на доску
  async addMember(boardId, userId, role = 'editor', invitedBy, isInvitation = false) {
    try {
      const docRef = doc(db, BOARDS_COLLECTION, boardId);
      await updateDoc(docRef, {
        [`members.${userId}`]: role,
        updatedAt: serverTimestamp(),
      });

      // Отправляем уведомление о приглашении или добавлении
      if (invitedBy && userId !== invitedBy) {
        const boardDoc = await getDoc(docRef);
        const boardData = boardDoc.data();

        if (boardData) {
          if (isInvitation) {
            await notificationService.notifyBoardInvitation(
              boardId,
              boardData.title,
              userId,
              invitedBy
            );
          } else {
            await notificationService.notifyBoardMemberAdded(
              boardId,
              boardData.title,
              userId,
              invitedBy
            );
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding member:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить участника с доски
  async removeMember(boardId, userId, removedBy) {
    try {
      const boardDoc = await getDoc(doc(db, BOARDS_COLLECTION, boardId));
      const boardData = boardDoc.data();

      // Нельзя удалить владельца
      if (boardData.members[userId] === 'owner') {
        return { success: false, error: 'Cannot remove owner' };
      }

      const newMembers = { ...boardData.members };
      delete newMembers[userId];

      await updateDoc(doc(db, BOARDS_COLLECTION, boardId), {
        members: newMembers,
        updatedAt: serverTimestamp(),
      });

      // Отправляем уведомление об удалении
      if (removedBy && userId !== removedBy) {
        await notificationService.notifyBoardMemberRemoved(
          boardId,
          boardData.title,
          userId,
          removedBy
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing member:', error);
      return { success: false, error: error.message };
    }
  },

  // Изменить роль участника
  async changeMemberRole(boardId, userId, newRole, changedBy) {
    try {
      const docRef = doc(db, BOARDS_COLLECTION, boardId);

      // Получаем данные доски для уведомления
      const boardDoc = await getDoc(docRef);
      const boardData = boardDoc.data();

      await updateDoc(docRef, {
        [`members.${userId}`]: newRole,
        updatedAt: serverTimestamp(),
      });

      // Отправляем уведомление об изменении роли
      if (changedBy && userId !== changedBy && boardData) {
        await notificationService.notifyBoardMemberRoleChanged(
          boardId,
          boardData.title,
          userId,
          newRole,
          changedBy
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error changing member role:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // КОЛОНКИ
  // =====================

  // Получить колонки доски
  async getColumns(boardId) {
    try {
      const q = query(
        collection(db, BOARDS_COLLECTION, boardId, COLUMNS_SUBCOLLECTION),
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const columns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, columns };
    } catch (error) {
      console.error('Error getting columns:', error);
      return { success: false, error: error.message, columns: [] };
    }
  },

  // Подписка на колонки доски (realtime)
  subscribeToColumns(boardId, callback) {
    const q = query(
      collection(db, BOARDS_COLLECTION, boardId, COLUMNS_SUBCOLLECTION),
      orderBy('order', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const columns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(columns);
    });
  },

  // Добавить колонку
  async addColumn(boardId, columnData) {
    try {
      // Получаем текущее количество колонок для order
      const columnsSnapshot = await getDocs(
        collection(db, BOARDS_COLLECTION, boardId, COLUMNS_SUBCOLLECTION)
      );
      const order = columnData.order ?? columnsSnapshot.size;
      
      const docRef = await addDoc(
        collection(db, BOARDS_COLLECTION, boardId, COLUMNS_SUBCOLLECTION),
        {
          title: columnData.title,
          order: order,
          color: columnData.color || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
      
      // Обновляем columnOrder в доске
      const boardDoc = await getDoc(doc(db, BOARDS_COLLECTION, boardId));
      const columnOrder = boardDoc.data().columnOrder || [];
      columnOrder.push(docRef.id);
      
      await updateDoc(doc(db, BOARDS_COLLECTION, boardId), {
        columnOrder,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true, columnId: docRef.id };
    } catch (error) {
      console.error('Error adding column:', error);
      return { success: false, error: error.message };
    }
  },

  // Обновить колонку
  async updateColumn(boardId, columnId, updates) {
    try {
      const docRef = doc(db, BOARDS_COLLECTION, boardId, COLUMNS_SUBCOLLECTION, columnId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating column:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить колонку
  async deleteColumn(boardId, columnId, moveTasksToColumnId = null) {
    try {
      // Если указана колонка для переноса задач
      if (moveTasksToColumnId) {
        const tasksQuery = query(
          collection(db, TASKS_COLLECTION),
          where('boardId', '==', boardId),
          where('columnId', '==', columnId)
        );
        
        const tasksSnapshot = await getDocs(tasksQuery);
        const batch = writeBatch(db);
        
        tasksSnapshot.docs.forEach(taskDoc => {
          batch.update(taskDoc.ref, {
            columnId: moveTasksToColumnId,
            updatedAt: serverTimestamp(),
          });
        });
        
        await batch.commit();
      }
      
      // Удаляем колонку
      await deleteDoc(doc(db, BOARDS_COLLECTION, boardId, COLUMNS_SUBCOLLECTION, columnId));
      
      // Обновляем columnOrder в доске
      const boardDoc = await getDoc(doc(db, BOARDS_COLLECTION, boardId));
      const columnOrder = (boardDoc.data().columnOrder || []).filter(id => id !== columnId);
      
      await updateDoc(doc(db, BOARDS_COLLECTION, boardId), {
        columnOrder,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting column:', error);
      return { success: false, error: error.message };
    }
  },

  // Переупорядочить колонки
  async reorderColumns(boardId, columnOrderArray) {
    try {
      const batch = writeBatch(db);
      
      // Обновляем order в каждой колонке
      columnOrderArray.forEach((item, index) => {
        const colRef = doc(db, BOARDS_COLLECTION, boardId, COLUMNS_SUBCOLLECTION, item.id);
        batch.update(colRef, {
          order: index,
          updatedAt: serverTimestamp(),
        });
      });
      
      // Обновляем columnOrder в доске
      const columnOrder = columnOrderArray.map(item => item.id);
      batch.update(doc(db, BOARDS_COLLECTION, boardId), {
        columnOrder,
        updatedAt: serverTimestamp(),
      });
      
      await batch.commit();
      
      return { success: true };
    } catch (error) {
      console.error('Error reordering columns:', error);
      return { success: false, error: error.message };
    }
  },

  // Проверить есть ли задачи в колонке
  async checkColumnHasTasks(boardId, columnId) {
    try {
      const q = query(
        collection(db, TASKS_COLLECTION),
        where('boardId', '==', boardId),
        where('columnId', '==', columnId)
      );
      
      const snapshot = await getDocs(q);
      return { success: true, hasTasks: !snapshot.empty, count: snapshot.size };
    } catch (error) {
      console.error('Error checking column tasks:', error);
      return { success: false, error: error.message, hasTasks: false };
    }
  },

  // Получить все публичные доски
  async getPublicBoards() {
    try {
      const snapshot = await getDocs(collection(db, BOARDS_COLLECTION));
      const boards = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Показываем публичные доски
        if (data.isPublic === true) {
          boards.push({
            id: doc.id,
            ...data
          });
        }
      });

      boards.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      return { success: true, boards };
    } catch (error) {
      console.error('Error getting public boards:', error);
      return { success: false, error: error.message, boards: [] };
    }
  },

  // Получить все доски (публичные + мои приватные)
  async getAllAvailableBoards(userId) {
    try {
      const snapshot = await getDocs(collection(db, BOARDS_COLLECTION));
      const boards = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const isMember = data.members && data.members[userId];
        const isPublic = data.isPublic === true;

        // Показываем если: публичная доска ИЛИ я участник
        if (isPublic || isMember) {
          boards.push({
            id: doc.id,
            ...data,
            userRole: isMember ? data.members[userId] : null,
            isMember: !!isMember
          });
        }
      });

      boards.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      return { success: true, boards };
    } catch (error) {
      console.error('Error getting all available boards:', error);
      return { success: false, error: error.message, boards: [] };
    }
  },

  // Запросить доступ к доске (сразу добавляем как viewer)
  async requestBoardAccess(boardId, userId) {
    try {
      const docRef = doc(db, BOARDS_COLLECTION, boardId);
      const boardDoc = await getDoc(docRef);

      if (!boardDoc.exists()) {
        return { success: false, error: 'Board not found' };
      }

      const boardData = boardDoc.data();

      // Проверяем что пользователь ещё не участник
      if (boardData.members && boardData.members[userId]) {
        return { success: false, error: 'Already a member' };
      }

      // Добавляем пользователя как viewer
      await updateDoc(docRef, {
        [`members.${userId}`]: 'viewer',
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error requesting board access:', error);
      return { success: false, error: error.message };
    }
  },

  // Изменить видимость доски (публичная/приватная)
  async toggleBoardVisibility(boardId, isPublic) {
    try {
      const docRef = doc(db, BOARDS_COLLECTION, boardId);

      await updateDoc(docRef, {
        isPublic,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error toggling board visibility:', error);
      return { success: false, error: error.message };
    }
  },
};

export default boardService;
