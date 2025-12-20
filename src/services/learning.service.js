// src/services/learning.service.js
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
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COURSES_COLLECTION = 'courses';
const LESSONS_COLLECTION = 'lessons';
const PROGRESS_COLLECTION = 'user_progress';

const learningService = {
  // =====================
  // КУРСЫ
  // =====================

  // Создать курс (только админы)
  async createCourse(courseData, userId) {
    try {
      const courseRef = await addDoc(collection(db, COURSES_COLLECTION), {
        title: courseData.title,
        description: courseData.description || '',
        category: courseData.category || 'general',
        thumbnail: courseData.thumbnail || '',
        duration: courseData.duration || '',
        requiredRole: courseData.requiredRole || 'all',
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lessonsCount: 0,
        studentsCount: 0,
      });

      return { success: true, courseId: courseRef.id };
    } catch (error) {
      console.error('Error creating course:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить все курсы
  async getAllCourses() {
    try {
      const q = query(
        collection(db, COURSES_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      }));

      return { success: true, courses };
    } catch (error) {
      console.error('Error getting courses:', error);
      return { success: false, error: error.message, courses: [] };
    }
  },

  // Получить курс по ID
  async getCourse(courseId) {
    try {
      const docRef = doc(db, COURSES_COLLECTION, courseId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          course: {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt,
          },
        };
      }

      return { success: false, error: 'Course not found' };
    } catch (error) {
      console.error('Error getting course:', error);
      return { success: false, error: error.message };
    }
  },

  // Обновить курс
  async updateCourse(courseId, updates) {
    try {
      const docRef = doc(db, COURSES_COLLECTION, courseId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating course:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить курс
  async deleteCourse(courseId) {
    try {
      // Удаляем все уроки курса
      const lessonsQuery = query(
        collection(db, LESSONS_COLLECTION),
        where('courseId', '==', courseId)
      );
      const lessonsSnapshot = await getDocs(lessonsQuery);
      const deletePromises = lessonsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Удаляем сам курс
      await deleteDoc(doc(db, COURSES_COLLECTION, courseId));

      return { success: true };
    } catch (error) {
      console.error('Error deleting course:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // УРОКИ
  // =====================

  // Создать урок
  async createLesson(lessonData, userId) {
    try {
      const lessonRef = await addDoc(collection(db, LESSONS_COLLECTION), {
        courseId: lessonData.courseId,
        title: lessonData.title,
        content: lessonData.content || '',
        videoUrl: lessonData.videoUrl || '',
        type: lessonData.type || 'article', // video, article, quiz
        duration: lessonData.duration || '',
        order: lessonData.order || 0,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Обновляем счетчик уроков в курсе
      const courseRef = doc(db, COURSES_COLLECTION, lessonData.courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        await updateDoc(courseRef, {
          lessonsCount: (courseSnap.data().lessonsCount || 0) + 1,
        });
      }

      return { success: true, lessonId: lessonRef.id };
    } catch (error) {
      console.error('Error creating lesson:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить уроки курса
  async getCourseLessons(courseId) {
    try {
      const q = query(
        collection(db, LESSONS_COLLECTION),
        where('courseId', '==', courseId),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const lessons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, lessons };
    } catch (error) {
      console.error('Error getting lessons:', error);
      return { success: false, error: error.message, lessons: [] };
    }
  },

  // Получить урок по ID
  async getLesson(lessonId) {
    try {
      const docRef = doc(db, LESSONS_COLLECTION, lessonId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          lesson: {
            id: docSnap.id,
            ...docSnap.data(),
          },
        };
      }

      return { success: false, error: 'Lesson not found' };
    } catch (error) {
      console.error('Error getting lesson:', error);
      return { success: false, error: error.message };
    }
  },

  // Обновить урок
  async updateLesson(lessonId, updates) {
    try {
      const docRef = doc(db, LESSONS_COLLECTION, lessonId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating lesson:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить урок
  async deleteLesson(lessonId, courseId) {
    try {
      await deleteDoc(doc(db, LESSONS_COLLECTION, lessonId));

      // Обновляем счетчик уроков в курсе
      const courseRef = doc(db, COURSES_COLLECTION, courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        await updateDoc(courseRef, {
          lessonsCount: Math.max(0, (courseSnap.data().lessonsCount || 1) - 1),
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // ПРОГРЕСС
  // =====================

  // Получить прогресс пользователя по курсу
  async getUserCourseProgress(userId, courseId) {
    try {
      const progressId = `${userId}_${courseId}`;
      const docRef = doc(db, PROGRESS_COLLECTION, progressId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          progress: {
            id: docSnap.id,
            ...docSnap.data(),
            startedAt: docSnap.data().startedAt?.toDate?.() || docSnap.data().startedAt,
            completedAt: docSnap.data().completedAt?.toDate?.() || docSnap.data().completedAt,
          },
        };
      }

      // Если прогресса нет, создаем новый
      return {
        success: true,
        progress: {
          userId,
          courseId,
          completedLessons: [],
          progress: 0,
          startedAt: null,
          completedAt: null,
        },
      };
    } catch (error) {
      console.error('Error getting progress:', error);
      return { success: false, error: error.message };
    }
  },

  // Отметить урок как пройденный
  async markLessonCompleted(userId, courseId, lessonId) {
    try {
      const progressId = `${userId}_${courseId}`;
      const docRef = doc(db, PROGRESS_COLLECTION, progressId);
      const docSnap = await getDoc(docRef);

      let completedLessons = [];
      let startedAt = new Date();

      if (docSnap.exists()) {
        completedLessons = docSnap.data().completedLessons || [];
        startedAt = docSnap.data().startedAt?.toDate?.() || startedAt;
      }

      // Добавляем урок если его еще нет
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }

      // Получаем общее количество уроков в курсе
      const lessonsResult = await this.getCourseLessons(courseId);
      const totalLessons = lessonsResult.lessons?.length || 0;
      const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

      // Проверяем, завершен ли курс
      const isCompleted = progress === 100;

      await setDoc(docRef, {
        userId,
        courseId,
        completedLessons,
        progress,
        startedAt: Timestamp.fromDate(startedAt),
        completedAt: isCompleted ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      });

      return { success: true, progress };
    } catch (error) {
      console.error('Error marking lesson completed:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить все курсы пользователя с прогрессом
  async getUserCoursesWithProgress(userId) {
    try {
      // Получаем все курсы
      const coursesResult = await this.getAllCourses();
      if (!coursesResult.success) {
        return coursesResult;
      }

      // Получаем прогресс по всем курсам
      const progressQuery = query(
        collection(db, PROGRESS_COLLECTION),
        where('userId', '==', userId)
      );
      const progressSnapshot = await getDocs(progressQuery);
      const progressMap = {};
      progressSnapshot.docs.forEach(doc => {
        const data = doc.data();
        progressMap[data.courseId] = {
          ...data,
          startedAt: data.startedAt?.toDate?.() || data.startedAt,
          completedAt: data.completedAt?.toDate?.() || data.completedAt,
        };
      });

      // Объединяем курсы с прогрессом
      const coursesWithProgress = coursesResult.courses.map(course => ({
        ...course,
        userProgress: progressMap[course.id] || {
          completedLessons: [],
          progress: 0,
          startedAt: null,
          completedAt: null,
        },
      }));

      return { success: true, courses: coursesWithProgress };
    } catch (error) {
      console.error('Error getting user courses with progress:', error);
      return { success: false, error: error.message, courses: [] };
    }
  },
};

export default learningService;
