// src/services/board.service.js
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
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

class BoardService {
  // Дефолтные колонки для новой доски
  defaultColumns = [
    { title: '📋 Задача поставлена', order: 0, color: '#6B7280' },
    { title: '🔨 В работе', order: 1, color: '#3B82F6' },
    { title: '🔍 Согласование', order: 2, color: '#F59E0B' },
    { title: '✅ Готово', order: 3, color: '#10B981' },
    { title: '⏸️ Отложена', order: 4, color: '#6366F1' },
    { title: '❌ Отменена', order: 5, color: '#EF4444' }
  ];

  // Создание новой доски
  async createBoard(title, ownerId) {
    try {
      const boardRef = await addDoc(collection(db, 'boards'), {
        title,
        ownerId,
        members: {
          [ownerId]: 'owner'
        },
        columnOrder: [],
        settings: {
          whoCanMoveToStatus: {}
        },
        createdAt: serverTimestamp()
      });

      // Создаем дефолтные колонки
      const batch = writeBatch(db);
      const columnIds = [];

      for (const column of this.defaultColumns) {
        const columnRef = doc(collection(db, `boards/${boardRef.id}/columns`));
        batch.set(columnRef, {
          ...column,
          createdAt: serverTimestamp()
        });
        columnIds.push(columnRef.id);
        
        // Дефолтные права: владелец и редакторы могут переносить
        batch.update(doc(db, 'boards', boardRef.id), {
          [`settings.whoCanMoveToStatus.${columnRef.id}`]: ['owner', 'editor']
        });
      }

      // Обновляем порядок колонок
      batch.update(doc(db, 'boards', boardRef.id), {
        columnOrder: columnIds
      });

      await batch.commit();

      return { success: true, boardId: boardRef.id };
    } catch (error) {
      console.error('Create board error:', error);
      return { success: false, message: error.message };
    }
  }

  // Получить доски пользователя
  async getUserBoards(userId) {
    try {
      const q = query(
        collection(db, 'boards'),
        where(`members.${userId}`, 'in', ['owner', 'editor', 'viewer'])
      );

      const snapshot = await getDocs(q);
      const boards = [];

      snapshot.forEach(doc => {
        boards.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, boards };
    } catch (error) {
      console.error('Get boards error:', error);
      return { success: false, message: error.message };
    }
  }

  // Подписка на доски (Realtime)
  subscribeToUserBoards(userId, callback) {
    const q = query(
      collection(db, 'boards'),
      where(`members.${userId}`, 'in', ['owner', 'editor', 'viewer'])
    );

    return onSnapshot(q, (snapshot) => {
      const boards = [];
      snapshot.forEach(doc => {
        boards.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(boards);
    });
  }

  // Получить доску по ID
  async getBoard(boardId) {
    try {
      const boardDoc = await getDoc(doc(db, 'boards', boardId));
      
      if (!boardDoc.exists()) {
        return { success: false, message: 'Доска не найдена' };
      }

      return {
        success: true,
        board: {
          id: boardDoc.id,
          ...boardDoc.data()
        }
      };
    } catch (error) {
      console.error('Get board error:', error);
      return { success: false, message: error.message };
    }
  }

  // Подписка на доску (Realtime)
  subscribeToBoard(boardId, callback) {
    return onSnapshot(doc(db, 'boards', boardId), (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      }
    });
  }

  // Получить колонки доски
  async getColumns(boardId) {
    try {
      const snapshot = await getDocs(collection(db, `boards/${boardId}/columns`));
      const columns = [];

      snapshot.forEach(doc => {
        columns.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Сортируем по order
      columns.sort((a, b) => a.order - b.order);

      return { success: true, columns };
    } catch (error) {
      console.error('Get columns error:', error);
      return { success: false, message: error.message };
    }
  }

  // Подписка на колонки (Realtime)
  subscribeToColumns(boardId, callback) {
    return onSnapshot(collection(db, `boards/${boardId}/columns`), (snapshot) => {
      const columns = [];
      snapshot.forEach(doc => {
        columns.push({
          id: doc.id,
          ...doc.data()
        });
      });
      columns.sort((a, b) => a.order - b.order);
      callback(columns);
    });
  }

  // Добавить колонку
  async addColumn(boardId, title, color = '#6B7280') {
    try {
      const boardDoc = await getDoc(doc(db, 'boards', boardId));
      const columnOrder = boardDoc.data().columnOrder || [];

      const columnRef = await addDoc(collection(db, `boards/${boardId}/columns`), {
        title,
        color,
        order: columnOrder.length,
        createdAt: serverTimestamp()
      });

      // Обновляем порядок колонок
      await updateDoc(doc(db, 'boards', boardId), {
        columnOrder: [...columnOrder, columnRef.id],
        [`settings.whoCanMoveToStatus.${columnRef.id}`]: ['owner', 'editor']
      });

      return { success: true, columnId: columnRef.id };
    } catch (error) {
      console.error('Add column error:', error);
      return { success: false, message: error.message };
    }
  }

  // Удалить колонку
  async deleteColumn(boardId, columnId) {
    try {
      // Проверяем, есть ли задачи в колонке
      const tasksSnapshot = await getDocs(
        query(
          collection(db, `boards/${boardId}/tasks`),
          where('columnId', '==', columnId)
        )
      );

      if (!tasksSnapshot.empty) {
        return {
          success: false,
          message: 'Нельзя удалить колонку с задачами. Переместите или удалите задачи сначала.'
        };
      }

      // Удаляем колонку
      await deleteDoc(doc(db, `boards/${boardId}/columns`, columnId));

      // Обновляем порядок колонок
      const boardDoc = await getDoc(doc(db, 'boards', boardId));
      const columnOrder = boardDoc.data().columnOrder.filter(id => id !== columnId);

      await updateDoc(doc(db, 'boards', boardId), {
        columnOrder
      });

      return { success: true };
    } catch (error) {
      console.error('Delete column error:', error);
      return { success: false, message: error.message };
    }
  }

  // Обновить название доски
  async updateBoardTitle(boardId, title) {
    try {
      await updateDoc(doc(db, 'boards', boardId), { title });
      return { success: true };
    } catch (error) {
      console.error('Update board title error:', error);
      return { success: false, message: error.message };
    }
  }

  // Обновить название колонки
  async updateColumnTitle(boardId, columnId, title) {
    try {
      await updateDoc(doc(db, `boards/${boardId}/columns`, columnId), { title });
      return { success: true };
    } catch (error) {
      console.error('Update column title error:', error);
      return { success: false, message: error.message };
    }
  }

  // Добавить участника на доску
  async addMember(boardId, userId, role = 'viewer') {
    try {
      await updateDoc(doc(db, 'boards', boardId), {
        [`members.${userId}`]: role
      });
      return { success: true };
    } catch (error) {
      console.error('Add member error:', error);
      return { success: false, message: error.message };
    }
  }

  // Удалить участника
  async removeMember(boardId, userId) {
    try {
      await updateDoc(doc(db, 'boards', boardId), {
        [`members.${userId}`]: null
      });
      return { success: true };
    } catch (error) {
      console.error('Remove member error:', error);
      return { success: false, message: error.message };
    }
  }

  // Обновить права на перенос задач в статус
  async updateMovePermissions(boardId, columnId, roles) {
    try {
      await updateDoc(doc(db, 'boards', boardId), {
        [`settings.whoCanMoveToStatus.${columnId}`]: roles
      });
      return { success: true };
    } catch (error) {
      console.error('Update permissions error:', error);
      return { success: false, message: error.message };
    }
  }
}

export default new BoardService();