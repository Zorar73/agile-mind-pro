// src/services/user.service.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import notificationService from './notification.service';

class UserService {
  // Получить всех пользователей
  async getAllUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const users = [];

      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          uid: doc.id,  // Добавляем uid для совместимости
          ...doc.data()
        });
      });

      return { success: true, users };
    } catch (error) {
      console.error('Get users error:', error);
      return { success: false, message: error.message, users: [] };
    }
  }

  // Получить одобренных пользователей (для выбора в UI)
  async getApprovedUsers() {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', 'in', ['admin', 'user'])
      );

      const snapshot = await getDocs(q);
      const users = [];

      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          uid: doc.id,  // Добавляем uid для совместимости
          ...doc.data()
        });
      });

      return { success: true, users };
    } catch (error) {
      console.error('Get approved users error:', error);
      return { success: false, message: error.message, users: [] };
    }
  }

  // Подписка на пользователей (realtime)
  subscribeToUsers(callback) {
    return onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const users = [];
        snapshot.forEach(doc => {
          users.push({
            id: doc.id,
            uid: doc.id,  // Добавляем uid для совместимости
            ...doc.data()
          });
        });
        callback(users);
      },
      (error) => {
        console.error('Subscribe users error:', error);
      }
    );
  }

  // Получить пользователей, ожидающих подтверждения
  async getPendingUsers() {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      const users = [];

      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          uid: doc.id,  // Добавляем uid для совместимости
          ...doc.data()
        });
      });

      return { success: true, users };
    } catch (error) {
      console.error('Get pending users error:', error);
      return { success: false, message: error.message, users: [] };
    }
  }

  // Одобрить пользователя
  async approveUser(userId, approvedBy) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: 'user',
        approvedBy,
        approvedAt: new Date()
      });

      // Отправляем уведомление
      await notificationService.notifyUserApproved(userId);

      return { success: true };
    } catch (error) {
      console.error('Approve user error:', error);
      return { success: false, message: error.message };
    }
  }

  // Отклонить пользователя
  async rejectUser(userId) {
    try {
      await deleteDoc(doc(db, 'users', userId));
      return { success: true };
    } catch (error) {
      console.error('Reject user error:', error);
      return { success: false, message: error.message };
    }
  }

  // Изменить роль пользователя
  async changeUserRole(userId, newRole) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });

      return { success: true };
    } catch (error) {
      console.error('Change role error:', error);
      return { success: false, message: error.message };
    }
  }

  // Получить пользователя по ID
  async getUser(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return { success: false, message: 'Пользователь не найден' };
      }

      return {
        success: true,
        user: {
          id: userDoc.id,
          ...userDoc.data()
        }
      };
    } catch (error) {
      console.error('Get user error:', error);
      return { success: false, message: error.message };
    }
  }

  // Получить нескольких пользователей по ID
  async getUsersByIds(userIds) {
    try {
      const users = [];
      
      for (const userId of userIds) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          users.push({
            id: userDoc.id,
            ...userDoc.data()
          });
        }
      }

      return { success: true, users };
    } catch (error) {
      console.error('Get users by ids error:', error);
      return { success: false, message: error.message, users: [] };
    }
  }

  // Обновить аватар
  async updateAvatar(userId, avatar) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        avatar
      });

      return { success: true };
    } catch (error) {
      console.error('Update avatar error:', error);
      return { success: false, message: error.message };
    }
  }

  // Обновить контакты
  async updateContacts(userId, contacts) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        contacts
      });

      return { success: true };
    } catch (error) {
      console.error('Update contacts error:', error);
      return { success: false, message: error.message };
    }
  }

  // Обновить лимит команд
  async updateTeamLimit(userId, newLimit) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        teamLimit: newLimit
      });

      return { success: true };
    } catch (error) {
      console.error('Update team limit error:', error);
      return { success: false, message: error.message };
    }
  }

  // Обновить данные пользователя
  async updateUserData(userId, updates) {
    try {
      await updateDoc(doc(db, 'users', userId), updates);

      return { success: true };
    } catch (error) {
      console.error('Update user data error:', error);
      return { success: false, message: error.message };
    }
  }

  // Удалить пользователя
  async deleteUser(userId) {
    try {
      await deleteDoc(doc(db, 'users', userId));
      return { success: true };
    } catch (error) {
      console.error('Delete user error:', error);
      return { success: false, message: error.message };
    }
  }

  // Обновить права пользователя
  async updateUserPermissions(userId, permissions) {
    try {
      await updateDoc(doc(db, 'users', userId), permissions);
      return { success: true };
    } catch (error) {
      console.error('Update user permissions error:', error);
      return { success: false, message: error.message };
    }
  }

  // Алиас для getUser (для совместимости)
  async getUserById(userId) {
    return this.getUser(userId);
  }
}

export default new UserService();
