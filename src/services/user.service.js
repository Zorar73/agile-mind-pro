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
  async getAllUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const users = [];
      
      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, users };
    } catch (error) {
      console.error('Get users error:', error);
      return { success: false, message: error.message };
    }
  }

  subscribeToUsers(callback) {
    return onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const users = [];
        snapshot.forEach(doc => {
          users.push({
            id: doc.id,
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
          ...doc.data()
        });
      });

      return { success: true, users };
    } catch (error) {
      console.error('Get pending users error:', error);
      return { success: false, message: error.message };
    }
  }

  async approveUser(userId, approvedBy) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: 'user',
        approvedBy,
        approvedAt: new Date()
      });

      await notificationService.notifyUserApproved(userId);

      return { success: true };
    } catch (error) {
      console.error('Approve user error:', error);
      return { success: false, message: error.message };
    }
  }

  async rejectUser(userId) {
    try {
      await deleteDoc(doc(db, 'users', userId));
      return { success: true };
    } catch (error) {
      console.error('Reject user error:', error);
      return { success: false, message: error.message };
    }
  }

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

  // ДОБАВЬ СЮДА НОВЫЕ МЕТОДЫ ⬇️

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

  async updateUserData(userId, updates) {
    try {
      await updateDoc(doc(db, 'users', userId), updates);

      return { success: true };
    } catch (error) {
      console.error('Update user data error:', error);
      return { success: false, message: error.message };
    }
  }
}

export default new UserService();