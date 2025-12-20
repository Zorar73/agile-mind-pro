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

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userData.email,
        firstName: userData.firstName,
        middleName: userData.middleName || '',
        lastName: userData.lastName,
        position: userData.position,
        responsibility: userData.responsibility || '',
        role: 'pending',
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
