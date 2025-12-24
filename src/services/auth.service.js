import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

class AuthService {
  async register(userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Получаем роль по умолчанию
      let defaultRoleId = 'office'; // Fallback
      try {
        const roleService = await import('./role.service');
        const defaultRoleResult = await roleService.default.getDefaultRole();
        if (defaultRoleResult.success && defaultRoleResult.role) {
          defaultRoleId = defaultRoleResult.role.id;
        }
      } catch (error) {
        console.error('Error getting default role:', error);
      }

      // Создаем документ пользователя
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userData.email,
        firstName: userData.firstName,
        middleName: userData.middleName || '',
        lastName: userData.lastName,
        position: userData.position,
        responsibility: userData.responsibility || '',
        role: 'pending', // Оставляем для обратной совместимости
        roleId: defaultRoleId, // Новая система ролей
        avatar: 'generated',
        contacts: {
          whatsapp: '',
          telegram: '',
          phone: ''
        },
        teamLimit: 10,
        teamsCount: 0,
        createdAt: serverTimestamp()
      });

      // Автоназначение обязательных курсов для роли
      try {
        const learningService = await import('./learning.service');
        await learningService.default.autoEnrollUserByRole(userCredential.user.uid, defaultRoleId);
      } catch (error) {
        console.error('Error auto-enrolling courses:', error);
        // Не останавливаем регистрацию если автоназначение не удалось
      }

      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        return { 
          success: true, 
          user: {
            ...userDoc.data(),                    // СНАЧАЛА данные из Firestore
            uid: userCredential.user.uid,         // ПОТОМ uid из Auth (гарантированно правильный)
            email: userCredential.user.email,
          }
        };
      }
      
      return { success: false, message: 'User data not found' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  }

  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: error.message };
    }
  }

  async getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return {
          ...userDoc.data(),        // СНАЧАЛА данные из Firestore
          uid: user.uid,            // ПОТОМ uid из Auth
          email: user.email,
        };
      }
    }
    return null;
  }

  onAuthStateChanged(callback) {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Отписываемся от предыдущего snapshot если был
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        // Подписываемся на изменения документа пользователя в реальном времени
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeSnapshot = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            callback({
              ...userDoc.data(),              // СНАЧАЛА данные из Firestore
              uid: firebaseUser.uid,          // ПОТОМ uid из Auth (гарантированно правильный)
              email: firebaseUser.email,
            });
          } else {
            callback(null);
          }
        }, (error) => {
          console.error('Error listening to user changes:', error);
          callback(null);
        });
      } else {
        callback(null);
      }
    });

    // Возвращаем функцию, которая отписывается от обоих listeners
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }
}

export default new AuthService();
