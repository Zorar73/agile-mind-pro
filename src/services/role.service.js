// src/services/role.service.js
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
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { DEFAULT_ROLES_CONFIG, SYSTEM_ROLES, ACCESS_LEVELS } from '../constants';
import { withErrorHandling } from '../utils/errorHandler';

const ROLES_COLLECTION = 'roles';
const USERS_COLLECTION = 'users';

const roleService = {
  /**
   * Инициализация системных ролей (выполняется один раз)
   */
  async initializeDefaultRoles(userId) {
    try {
      const batch = writeBatch(db);

      for (const roleConfig of DEFAULT_ROLES_CONFIG) {
        const roleRef = doc(db, ROLES_COLLECTION, roleConfig.id);
        batch.set(roleRef, {
          ...roleConfig,
          usersCount: 0,
          createdAt: serverTimestamp(),
          createdBy: userId || 'system',
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();

      return { success: true };
    } catch (error) {
      console.error('Error initializing default roles:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Получить все роли
   */
  async getRoles() {
    try {
      const q = query(collection(db, ROLES_COLLECTION), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);

      const roles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      }));

      return { success: true, roles };
    } catch (error) {
      console.error('Error getting roles:', error);
      return { success: false, error: error.message, roles: [] };
    }
  },

  /**
   * Получить роль по ID
   */
  async getRole(roleId) {
    try {
      const docRef = doc(db, ROLES_COLLECTION, roleId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          role: {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt,
            updatedAt: docSnap.data().updatedAt?.toDate?.() || docSnap.data().updatedAt,
          },
        };
      }

      return { success: false, error: 'Role not found' };
    } catch (error) {
      console.error('Error getting role:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Создать роль
   */
  async createRole(roleData, userId) {
    try {
      const roleRef = await addDoc(collection(db, ROLES_COLLECTION), {
        name: roleData.name,
        description: roleData.description || '',
        isSystem: false,
        isDefault: roleData.isDefault || false,
        modules: roleData.modules || {},
        usersCount: 0,
        createdAt: serverTimestamp(),
        createdBy: userId,
        updatedAt: serverTimestamp(),
      });

      // Если это роль по умолчанию, убираем флаг у других ролей
      if (roleData.isDefault) {
        await roleService.setDefaultRole(roleRef.id);
      }

      return { success: true, roleId: roleRef.id };
    } catch (error) {
      console.error('Error creating role:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Обновить роль
   */
  async updateRole(roleId, updates) {
    try {
      const roleRef = doc(db, ROLES_COLLECTION, roleId);

      await updateDoc(roleRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Если устанавливаем роль по умолчанию
      if (updates.isDefault) {
        await roleService.setDefaultRole(roleId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating role:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Удалить роль
   */
  async deleteRole(roleId) {
    try {
      // Проверяем, что это не системная роль
      const roleResult = await roleService.getRole(roleId);
      if (!roleResult.success) {
        return { success: false, error: 'Role not found' };
      }

      if (roleResult.role.isSystem) {
        return { success: false, error: 'Cannot delete system role' };
      }

      // Проверяем, что нет пользователей с этой ролью
      if (roleResult.role.usersCount > 0) {
        return { success: false, error: 'Cannot delete role with assigned users' };
      }

      await deleteDoc(doc(db, ROLES_COLLECTION, roleId));

      return { success: true };
    } catch (error) {
      console.error('Error deleting role:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Установить роль по умолчанию
   */
  async setDefaultRole(roleId) {
    try {
      const batch = writeBatch(db);

      // Убираем флаг isDefault у всех ролей
      const rolesSnapshot = await getDocs(collection(db, ROLES_COLLECTION));
      rolesSnapshot.docs.forEach(doc => {
        if (doc.data().isDefault) {
          batch.update(doc.ref, { isDefault: false });
        }
      });

      // Устанавливаем флаг для выбранной роли
      const roleRef = doc(db, ROLES_COLLECTION, roleId);
      batch.update(roleRef, { isDefault: true });

      await batch.commit();

      return { success: true };
    } catch (error) {
      console.error('Error setting default role:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Получить роль по умолчанию
   */
  async getDefaultRole() {
    try {
      const q = query(collection(db, ROLES_COLLECTION), where('isDefault', '==', true));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const roleDoc = snapshot.docs[0];
        return {
          success: true,
          role: {
            id: roleDoc.id,
            ...roleDoc.data(),
          },
        };
      }

      // Если нет роли по умолчанию, возвращаем роль "office"
      return await roleService.getRole(SYSTEM_ROLES.OFFICE);
    } catch (error) {
      console.error('Error getting default role:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Назначить роль пользователю
   */
  async assignRole(userId, roleId) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);

      // Получаем старую роль пользователя
      const userSnap = await getDoc(userRef);
      const oldRoleId = userSnap.data()?.roleId;

      // Обновляем роль пользователя
      await updateDoc(userRef, {
        roleId: roleId,
        updatedAt: serverTimestamp(),
      });

      // Обновляем счётчики
      if (oldRoleId) {
        await roleService.decrementUserCount(oldRoleId);
      }
      await roleService.incrementUserCount(roleId);

      // Автоназначение обязательных курсов для новой роли
      try {
        const learningService = await import('./learning.service');
        await learningService.default.autoEnrollUserByRole(userId, roleId);
      } catch (error) {
        console.error('Error auto-enrolling courses:', error);
        // Не останавливаем выполнение если автоназначение не удалось
      }

      return { success: true };
    } catch (error) {
      console.error('Error assigning role:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Массовое назначение роли
   */
  async assignRoleBulk(userIds, roleId) {
    try {
      const batch = writeBatch(db);

      for (const userId of userIds) {
        const userRef = doc(db, USERS_COLLECTION, userId);
        batch.update(userRef, {
          roleId: roleId,
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();

      // Обновляем счётчик пользователей роли
      await roleService.recalculateUserCount(roleId);

      // Автоназначение обязательных курсов для всех пользователей
      try {
        const learningService = await import('./learning.service');
        for (const userId of userIds) {
          await learningService.default.autoEnrollUserByRole(userId, roleId);
        }
      } catch (error) {
        console.error('Error auto-enrolling courses:', error);
        // Не останавливаем выполнение если автоназначение не удалось
      }

      return { success: true };
    } catch (error) {
      console.error('Error bulk assigning role:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Получить пользователей с определённой ролью
   */
  async getUsersByRole(roleId) {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('roleId', '==', roleId)
      );
      const snapshot = await getDocs(q);

      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, users };
    } catch (error) {
      console.error('Error getting users by role:', error);
      return { success: false, error: error.message, users: [] };
    }
  },

  /**
   * Увеличить счётчик пользователей роли
   */
  async incrementUserCount(roleId) {
    try {
      const roleRef = doc(db, ROLES_COLLECTION, roleId);
      const roleSnap = await getDoc(roleRef);

      if (roleSnap.exists()) {
        const currentCount = roleSnap.data().usersCount || 0;
        await updateDoc(roleRef, { usersCount: currentCount + 1 });
      }

      return { success: true };
    } catch (error) {
      console.error('Error incrementing user count:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Уменьшить счётчик пользователей роли
   */
  async decrementUserCount(roleId) {
    try {
      const roleRef = doc(db, ROLES_COLLECTION, roleId);
      const roleSnap = await getDoc(roleRef);

      if (roleSnap.exists()) {
        const currentCount = roleSnap.data().usersCount || 0;
        await updateDoc(roleRef, { usersCount: Math.max(0, currentCount - 1) });
      }

      return { success: true };
    } catch (error) {
      console.error('Error decrementing user count:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Пересчитать количество пользователей роли
   */
  async recalculateUserCount(roleId) {
    try {
      const usersResult = await roleService.getUsersByRole(roleId);

      if (usersResult.success) {
        const roleRef = doc(db, ROLES_COLLECTION, roleId);
        await updateDoc(roleRef, { usersCount: usersResult.users.length });
      }

      return { success: true };
    } catch (error) {
      console.error('Error recalculating user count:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Миграция: назначить роли существующим пользователям на основе поля role
   */
  async migrateUsersToRoles() {
    try {
      const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
      const batch = writeBatch(db);

      let migratedCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        // Пропускаем, если roleId уже установлен
        if (userData.roleId) continue;

        // Определяем новую роль на основе старого поля role
        let newRoleId = SYSTEM_ROLES.OFFICE; // По умолчанию

        if (userData.role === 'admin' || userData.role === 'owner') {
          newRoleId = SYSTEM_ROLES.ADMIN;
        } else if (userData.role === 'pending') {
          newRoleId = SYSTEM_ROLES.TRAINEE;
        } else if (userData.role === 'member') {
          newRoleId = SYSTEM_ROLES.OFFICE;
        }

        batch.update(userDoc.ref, {
          roleId: newRoleId,
          // Оставляем старое поле role для совместимости (пока)
        });

        migratedCount++;
      }

      await batch.commit();

      // Пересчитываем счётчики для всех ролей
      const rolesSnapshot = await getDocs(collection(db, ROLES_COLLECTION));
      for (const roleDoc of rolesSnapshot.docs) {
        await roleService.recalculateUserCount(roleDoc.id);
      }

      return { success: true, migratedCount };
    } catch (error) {
      console.error('Error migrating users to roles:', error);
      return { success: false, error: error.message };
    }
  },
};

// Экспортируем обёрнутые в error handling методы для критичных операций
export default {
  ...roleService,
  getRoles: withErrorHandling(roleService.getRoles, 'getRoles'),
  getRole: withErrorHandling(roleService.getRole, 'getRole'),
  createRole: withErrorHandling(roleService.createRole, 'createRole'),
  updateRole: withErrorHandling(roleService.updateRole, 'updateRole'),
  deleteRole: withErrorHandling(roleService.deleteRole, 'deleteRole'),
  assignRole: withErrorHandling(roleService.assignRole, 'assignRole'),
  assignRoleBulk: withErrorHandling(roleService.assignRoleBulk, 'assignRoleBulk'),
};
