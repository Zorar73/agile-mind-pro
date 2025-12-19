// src/services/sprint.service.js
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
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'sprints';

const sprintService = {
  // =====================
  // СПРИНТЫ
  // =====================

  // Создать спринт
  async createSprint(boardId, sprintData, userId) {
    try {
      const sprintRef = await addDoc(collection(db, COLLECTION), {
        boardId,
        name: sprintData.name,
        goal: sprintData.goal || '',
        startDate: sprintData.startDate 
          ? Timestamp.fromDate(new Date(sprintData.startDate)) 
          : null,
        endDate: sprintData.endDate 
          ? Timestamp.fromDate(new Date(sprintData.endDate)) 
          : null,
        status: 'planning', // planning, active, completed
        tasks: [], // ID задач в спринте
        velocity: 0,
        completedPoints: 0,
        totalPoints: 0,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, sprintId: sprintRef.id };
    } catch (error) {
      console.error('Error creating sprint:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить спринт по ID
  async getSprint(sprintId) {
    try {
      const docRef = doc(db, COLLECTION, sprintId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          success: true, 
          sprint: { 
            id: docSnap.id, 
            ...data,
            startDate: data.startDate?.toDate?.() || data.startDate,
            endDate: data.endDate?.toDate?.() || data.endDate,
            completedDate: data.completedDate?.toDate?.() || data.completedDate,
          } 
        };
      }
      
      return { success: false, error: 'Sprint not found' };
    } catch (error) {
      console.error('Error getting sprint:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить спринты доски
  async getBoardSprints(boardId) {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('boardId', '==', boardId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const sprints = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate?.() || data.startDate,
          endDate: data.endDate?.toDate?.() || data.endDate,
          completedDate: data.completedDate?.toDate?.() || data.completedDate,
        };
      });

      return { success: true, sprints };
    } catch (error) {
      console.error('Error getting sprints:', error);
      return { success: false, error: error.message, sprints: [] };
    }
  },

  // Получить активный спринт доски
  async getActiveSprint(boardId) {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('boardId', '==', boardId),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { success: false, error: 'No active sprint' };
      }
      
      const data = snapshot.docs[0].data();
      const sprint = {
        id: snapshot.docs[0].id,
        ...data,
        startDate: data.startDate?.toDate?.() || data.startDate,
        endDate: data.endDate?.toDate?.() || data.endDate,
      };

      return { success: true, sprint };
    } catch (error) {
      console.error('Error getting active sprint:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить завершённые спринты доски
  async getCompletedSprints(boardId) {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('boardId', '==', boardId),
        where('status', '==', 'completed'),
        orderBy('completedDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const sprints = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate?.() || data.startDate,
          endDate: data.endDate?.toDate?.() || data.endDate,
          completedDate: data.completedDate?.toDate?.() || data.completedDate,
        };
      });

      return { success: true, sprints };
    } catch (error) {
      console.error('Error getting completed sprints:', error);
      // Если ошибка индекса - пробуем без сортировки
      try {
        const q2 = query(
          collection(db, COLLECTION),
          where('boardId', '==', boardId),
          where('status', '==', 'completed')
        );
        const snapshot2 = await getDocs(q2);
        const sprints = snapshot2.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate?.() || data.startDate,
            endDate: data.endDate?.toDate?.() || data.endDate,
            completedDate: data.completedDate?.toDate?.() || data.completedDate,
          };
        });
        // Сортируем вручную
        sprints.sort((a, b) => (b.completedDate || 0) - (a.completedDate || 0));
        return { success: true, sprints };
      } catch (e) {
        return { success: false, error: e.message, sprints: [] };
      }
    }
  },

  // Обновить спринт
  async updateSprint(sprintId, updates) {
    try {
      const processedUpdates = { ...updates };
      
      // Конвертируем даты
      if (updates.startDate !== undefined) {
        processedUpdates.startDate = updates.startDate 
          ? Timestamp.fromDate(new Date(updates.startDate)) 
          : null;
      }
      if (updates.endDate !== undefined) {
        processedUpdates.endDate = updates.endDate 
          ? Timestamp.fromDate(new Date(updates.endDate)) 
          : null;
      }

      const docRef = doc(db, COLLECTION, sprintId);
      await updateDoc(docRef, {
        ...processedUpdates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating sprint:', error);
      return { success: false, error: error.message };
    }
  },

  // Запустить спринт
  async startSprint(sprintId) {
    try {
      const docRef = doc(db, COLLECTION, sprintId);
      await updateDoc(docRef, {
        status: 'active',
        actualStartDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error starting sprint:', error);
      return { success: false, error: error.message };
    }
  },

  // Завершить спринт
  async completeSprint(sprintId, retrospective = '', metrics = {}) {
    try {
      const docRef = doc(db, COLLECTION, sprintId);
      await updateDoc(docRef, {
        status: 'completed',
        completedDate: serverTimestamp(),
        retrospective,
        // Сохраняем финальные метрики
        finalMetrics: {
          completedTasks: metrics.completedTasks || 0,
          totalTasks: metrics.totalTasks || 0,
          completedPoints: metrics.completedPoints || 0,
          totalPoints: metrics.totalPoints || 0,
          velocity: metrics.completedPoints || 0,
        },
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error completing sprint:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // ЗАДАЧИ В СПРИНТЕ
  // =====================

  // Добавить задачи в спринт
  async addTasksToSprint(sprintId, taskIds) {
    try {
      const sprintRef = doc(db, COLLECTION, sprintId);
      const sprintSnap = await getDoc(sprintRef);
      
      if (!sprintSnap.exists()) {
        return { success: false, error: 'Sprint not found' };
      }
      
      const currentTasks = sprintSnap.data().tasks || [];
      const newTasks = [...new Set([...currentTasks, ...taskIds])];
      
      await updateDoc(sprintRef, {
        tasks: newTasks,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding tasks:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить задачу из спринта
  async removeTaskFromSprint(sprintId, taskId) {
    try {
      const sprintRef = doc(db, COLLECTION, sprintId);
      const sprintSnap = await getDoc(sprintRef);
      
      if (!sprintSnap.exists()) {
        return { success: false, error: 'Sprint not found' };
      }
      
      const currentTasks = sprintSnap.data().tasks || [];
      const newTasks = currentTasks.filter(id => id !== taskId);
      
      await updateDoc(sprintRef, {
        tasks: newTasks,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing task:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить спринт
  async deleteSprint(sprintId) {
    try {
      const docRef = doc(db, COLLECTION, sprintId);
      await deleteDoc(docRef);

      return { success: true };
    } catch (error) {
      console.error('Error deleting sprint:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // МЕТРИКИ
  // =====================

  // Рассчитать метрики спринта
  calculateSprintMetrics(sprint, tasks) {
    const sprintTasks = tasks.filter(t => sprint.tasks?.includes(t.id));
    
    const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedTasks = sprintTasks.filter(t => t.status === 'done');
    const completedPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    
    const totalTasksCount = sprintTasks.length;
    const completedTaskCount = completedTasks.length;
    const inProgressCount = sprintTasks.filter(t => t.status === 'in_progress').length;
    const todoCount = sprintTasks.filter(t => t.status === 'todo').length;
    
    const progress = totalTasksCount > 0 ? (completedTaskCount / totalTasksCount) * 100 : 0;
    const pointsProgress = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;

    // Расчёт дней до конца
    let daysRemaining = 0;
    if (sprint.endDate) {
      const endDate = sprint.endDate instanceof Date ? sprint.endDate : sprint.endDate.toDate?.() || new Date(sprint.endDate);
      const now = new Date();
      daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
    }

    return {
      totalTasks: totalTasksCount,
      completedTasks: completedTaskCount,
      inProgressTasks: inProgressCount,
      todoTasks: todoCount,
      totalPoints,
      completedPoints,
      remainingPoints: totalPoints - completedPoints,
      progress: Math.round(progress),
      pointsProgress: Math.round(pointsProgress),
      daysRemaining,
    };
  },

  // Рассчитать данные для burndown chart
  calculateBurndownData(sprint, tasks) {
    if (!sprint.startDate || !sprint.endDate) {
      return [];
    }

    const startDate = sprint.startDate instanceof Date 
      ? sprint.startDate 
      : sprint.startDate.toDate?.() || new Date(sprint.startDate);
    const endDate = sprint.endDate instanceof Date 
      ? sprint.endDate 
      : sprint.endDate.toDate?.() || new Date(sprint.endDate);
    
    const sprintTasks = tasks.filter(t => sprint.tasks?.includes(t.id));
    const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const idealBurnRate = totalPoints / totalDays;
    
    const data = [];
    const currentDate = new Date();
    
    for (let day = 0; day <= totalDays; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      
      // Идеальная линия
      const idealRemaining = Math.max(0, totalPoints - (idealBurnRate * day));
      
      // Фактическая линия (только до текущей даты)
      let actualRemaining = null;
      if (date <= currentDate) {
        const completedByDate = sprintTasks.filter(t => {
          if (!t.completedAt) return false;
          const completedDate = t.completedAt instanceof Date 
            ? t.completedAt 
            : t.completedAt.toDate?.() || new Date(t.completedAt);
          return completedDate <= date;
        });
        const completedPoints = completedByDate.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        actualRemaining = totalPoints - completedPoints;
      }
      
      data.push({
        date: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        ideal: Math.round(idealRemaining * 10) / 10,
        actual: actualRemaining !== null ? Math.round(actualRemaining * 10) / 10 : null,
      });
    }
    
    return data;
  },
};

export default sprintService;
