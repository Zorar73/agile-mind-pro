// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ============================================================================
// ЗАМЕНИ НА СВОИ ДАННЫЕ ИЗ FIREBASE CONSOLE!
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyAngTFq2DEJla-q7823XvSfVL2CVOye7Jg",
  authDomain: "agile-mind-pro.firebaseapp.com",
  projectId: "agile-mind-pro",
  storageBucket: "agile-mind-pro.firebasestorage.app",
  messagingSenderId: "1007018796084",
  appId: "1:1007018796084:web:24bc65ab378c7b4b20d661"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспорт сервисов
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;