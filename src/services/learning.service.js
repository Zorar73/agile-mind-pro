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
        authors: [userId], // Создатель автоматически становится автором
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
      // Фильтруем undefined значения (Firestore не принимает undefined)
      const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const docRef = doc(db, COURSES_COLLECTION, courseId);
      await updateDoc(docRef, {
        ...filteredUpdates,
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
      let wasCompleted = false;

      if (docSnap.exists()) {
        completedLessons = docSnap.data().completedLessons || [];
        startedAt = docSnap.data().startedAt?.toDate?.() || startedAt;
        wasCompleted = docSnap.data().progress === 100;
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

      // Если курс только что завершен - выдаем сертификат
      if (isCompleted && !wasCompleted) {
        try {
          // Проверяем, нет ли уже сертификата
          const hasCertResult = await this.hasCertificate(userId, courseId);
          if (hasCertResult.success && !hasCertResult.hasCertificate) {
            // Получаем данные пользователя и курса
            const userDoc = await getDoc(doc(db, 'users', userId));
            const courseResult = await this.getCourse(courseId);

            if (userDoc.exists() && courseResult.success) {
              const userData = userDoc.data();
              await this.issueCertificate(userId, courseId, userData, courseResult.course);
              console.log('🎓 Сертификат выдан автоматически за курс:', courseResult.course.title);
            }
          }
        } catch (certError) {
          console.error('Error issuing certificate:', certError);
          // Не прерываем выполнение если сертификат не удалось выдать
        }
      }

      return { success: true, progress };
    } catch (error) {
      console.error('Error marking lesson completed:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить весь прогресс всех пользователей (для аналитики)
  async getAllProgress() {
    try {
      const snapshot = await getDocs(collection(db, PROGRESS_COLLECTION));
      const progress = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startedAt: doc.data().startedAt?.toDate?.() || doc.data().startedAt,
        completedAt: doc.data().completedAt?.toDate?.() || doc.data().completedAt,
      }));

      return { success: true, progress };
    } catch (error) {
      console.error('Error getting all progress:', error);
      return { success: false, error: error.message, progress: [] };
    }
  },

  // Получить все курсы пользователя с прогрессом
  async getUserCoursesWithProgress(userId, userTeams = [], userRoleId = null) {
    try {
      // Получаем roleId пользователя если не передан
      if (!userRoleId) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          userRoleId = userDoc.data().roleId;
        }
      }

      // Получаем все курсы
      const coursesResult = await this.getAllCourses();
      if (!coursesResult.success) {
        return coursesResult;
      }

      // Фильтруем курсы по доступу
      const accessibleCourses = coursesResult.courses.filter(course => {
        // Если курс публичный, доступен всем
        if (course.isPublic !== false) {
          return true;
        }

        // Проверяем, назначен ли пользователь напрямую
        if (course.assignedUsers && course.assignedUsers.includes(userId)) {
          return true;
        }

        // Проверяем, есть ли доступ через команды
        if (course.assignedTeams && userTeams && userTeams.length > 0) {
          const hasTeamAccess = userTeams.some(teamId =>
            course.assignedTeams.includes(teamId)
          );
          if (hasTeamAccess) {
            return true;
          }
        }

        // Проверяем, есть ли доступ через роль
        if (course.assignedRoles && userRoleId && course.assignedRoles.includes(userRoleId)) {
          return true;
        }

        return false;
      });

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
      const coursesWithProgress = accessibleCourses.map(course => ({
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

  // =====================
  // КАТЕГОРИИ КУРСОВ
  // =====================

  // Получить все категории
  async getCategories() {
    try {
      const q = query(
        collection(db, 'course_categories'),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, categories };
    } catch (error) {
      console.error('Error getting categories:', error);
      // Возвращаем дефолтные категории если коллекции нет
      return {
        success: true,
        categories: [
          { id: 'all', value: 'all', label: 'Все курсы', order: 0 },
        ],
      };
    }
  },

  // Создать категорию
  async createCategory(categoryData, userId) {
    try {
      const categoryRef = await addDoc(collection(db, 'course_categories'), {
        value: categoryData.value,
        label: categoryData.label,
        order: categoryData.order || 0,
        createdBy: userId,
        createdAt: serverTimestamp(),
      });

      return { success: true, categoryId: categoryRef.id };
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error: error.message };
    }
  },

  // Обновить категорию
  async updateCategory(categoryId, updates) {
    try {
      const docRef = doc(db, 'course_categories', categoryId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить категорию
  async deleteCategory(categoryId) {
    try {
      await deleteDoc(doc(db, 'course_categories', categoryId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error: error.message };
    }
  },

  // Инициализировать категории по умолчанию (вызывается один раз)
  async initializeDefaultCategories(userId) {
    try {
      const defaultCategories = [
        { value: 'all', label: 'Все курсы', order: 0 },
        { value: 'getting-started', label: 'Начало работы', order: 1 },
        { value: 'boards', label: 'Доски', order: 2 },
        { value: 'sprints', label: 'Спринты', order: 3 },
        { value: 'teams', label: 'Команды', order: 4 },
        { value: 'analytics', label: 'Аналитика', order: 5 },
        { value: 'ai', label: 'AI Ассистент', order: 6 },
      ];

      const promises = defaultCategories.map(cat =>
        this.createCategory(cat, userId)
      );

      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error('Error initializing categories:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // ЭКЗАМЕНЫ
  // =====================

  // Создать экзамен
  async createExam(examData, userId) {
    try {
      const examRef = await addDoc(collection(db, 'exams'), {
        courseId: examData.courseId || null,
        title: examData.title,
        description: examData.description || '',
        type: examData.type || 'auto', // auto, manual, combined
        questions: examData.questions || [], // [{question, type, options, correctAnswer, points}]
        passingScore: examData.passingScore || 70,
        timeLimit: examData.timeLimit || null, // в минутах
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, examId: examRef.id };
    } catch (error) {
      console.error('Error creating exam:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить экзамены курса
  async getCourseExams(courseId) {
    try {
      const q = query(
        collection(db, 'exams'),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(q);
      const exams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, exams };
    } catch (error) {
      console.error('Error getting exams:', error);
      return { success: false, error: error.message, exams: [] };
    }
  },

  // Получить экзамен
  async getExam(examId) {
    try {
      const docRef = doc(db, 'exams', examId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          exam: { id: docSnap.id, ...docSnap.data() },
        };
      }

      return { success: false, error: 'Exam not found' };
    } catch (error) {
      console.error('Error getting exam:', error);
      return { success: false, error: error.message };
    }
  },

  // Обновить экзамен
  async updateExam(examId, updates) {
    try {
      const docRef = doc(db, 'exams', examId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating exam:', error);
      return { success: false, error: error.message };
    }
  },

  // Удалить экзамен
  async deleteExam(examId) {
    try {
      await deleteDoc(doc(db, 'exams', examId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting exam:', error);
      return { success: false, error: error.message };
    }
  },

  // Сохранить результат экзамена
  async submitExamResult(resultData) {
    try {
      const resultRef = await addDoc(collection(db, 'exam_results'), {
        ...resultData,
        submittedAt: serverTimestamp(),
      });

      return { success: true, resultId: resultRef.id };
    } catch (error) {
      console.error('Error submitting exam result:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить результаты пользователя по экзамену (последняя попытка)
  async getUserExamResult(userId, examId) {
    try {
      const q = query(
        collection(db, 'exam_results'),
        where('userId', '==', userId),
        where('examId', '==', examId),
        orderBy('submittedAt', 'desc')
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { success: true, result: null };
      }

      const result = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
        submittedAt: snapshot.docs[0].data().submittedAt?.toDate?.(),
      };

      return { success: true, result };
    } catch (error) {
      console.error('Error getting exam result:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить все попытки пользователя по экзамену
  async getUserExamAttempts(userId, examId) {
    try {
      const q = query(
        collection(db, 'exam_results'),
        where('userId', '==', userId),
        where('examId', '==', examId),
        orderBy('submittedAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const attempts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.(),
      }));

      return {
        success: true,
        attempts,
        totalAttempts: attempts.length,
      };
    } catch (error) {
      console.error('Error getting exam attempts:', error);
      return { success: false, error: error.message, attempts: [], totalAttempts: 0 };
    }
  },

  // Получить все результаты экзамена (для админа)
  async getExamResults(examId) {
    try {
      const q = query(
        collection(db, 'exam_results'),
        where('examId', '==', examId),
        orderBy('submittedAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.(),
      }));

      return { success: true, results };
    } catch (error) {
      console.error('Error getting exam results:', error);
      return { success: false, error: error.message, results: [] };
    }
  },

  // Обновить результат экзамена (для ручной проверки)
  async updateExamResult(resultId, updates) {
    try {
      const docRef = doc(db, 'exam_results', resultId);
      await updateDoc(docRef, {
        ...updates,
        gradedAt: serverTimestamp(),
        gradingStatus: 'graded',
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating exam result:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить все результаты экзаменов пользователя
  async getUserExamResults(userId) {
    try {
      const q = query(
        collection(db, 'exam_results'),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.(),
      }));

      return { success: true, results };
    } catch (error) {
      console.error('Error getting user exam results:', error);
      return { success: false, error: error.message, results: [] };
    }
  },

  // Course Statistics for Admins
  async getCourseStatistics(courseId) {
    try {
      // Get all user progress for this course
      const progressQuery = query(
        collection(db, 'user_progress'),
        where('courseId', '==', courseId)
      );
      const progressSnapshot = await getDocs(progressQuery);

      const userProgressList = [];
      for (const doc of progressSnapshot.docs) {
        const progressData = doc.data();

        // Get user details
        let userName = 'Неизвестный пользователь';
        try {
          const userDoc = await getDoc(doc(db, 'users', progressData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userName = userData.name || userData.email || 'Неизвестный пользователь';
          }
        } catch (error) {
          console.error('Error getting user:', error);
        }

        userProgressList.push({
          userId: progressData.userId,
          userName,
          progress: progressData.progress || 0,
          completedLessons: progressData.completedLessons || [],
          startedAt: progressData.startedAt?.toDate?.() || null,
          completedAt: progressData.completedAt?.toDate?.() || null,
        });
      }

      // Sort by progress (descending)
      userProgressList.sort((a, b) => b.progress - a.progress);

      // Get exam statistics
      const examsQuery = query(
        collection(db, 'exams'),
        where('courseId', '==', courseId)
      );
      const examsSnapshot = await getDocs(examsQuery);

      const examStats = [];
      for (const examDoc of examsSnapshot.docs) {
        const examData = examDoc.data();

        // Get results for this exam
        const resultsQuery = query(
          collection(db, 'exam_results'),
          where('examId', '==', examDoc.id)
        );
        const resultsSnapshot = await getDocs(resultsQuery);

        const passed = resultsSnapshot.docs.filter(d => d.data().passed).length;
        const failed = resultsSnapshot.docs.filter(d => !d.data().passed && d.data().gradingStatus !== 'pending').length;
        const pending = resultsSnapshot.docs.filter(d => d.data().gradingStatus === 'pending').length;

        const scores = resultsSnapshot.docs
          .filter(d => d.data().gradingStatus !== 'pending')
          .map(d => d.data().scorePercentage || 0);
        const averageScore = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

        examStats.push({
          examId: examDoc.id,
          examTitle: examData.title,
          totalAttempts: resultsSnapshot.docs.length,
          passed,
          failed,
          pending,
          averageScore,
        });
      }

      // Calculate overall statistics
      const totalStudents = userProgressList.length;
      const completedStudents = userProgressList.filter(u => u.progress === 100).length;
      const inProgressStudents = userProgressList.filter(u => u.progress > 0 && u.progress < 100).length;
      const notStartedStudents = userProgressList.filter(u => u.progress === 0).length;

      const averageProgress = totalStudents > 0
        ? Math.round(userProgressList.reduce((sum, u) => sum + u.progress, 0) / totalStudents)
        : 0;

      return {
        success: true,
        statistics: {
          totalStudents,
          completedStudents,
          inProgressStudents,
          notStartedStudents,
          averageProgress,
          userProgressList,
          examStats,
        },
      };
    } catch (error) {
      console.error('Error getting course statistics:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all exam results for grading (admin view)
  async getAllExamResults(examId) {
    try {
      const q = query(
        collection(db, 'exam_results'),
        where('examId', '==', examId),
        orderBy('submittedAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const results = [];
      for (const doc of snapshot.docs) {
        const resultData = doc.data();

        // Get user name
        let userName = 'Неизвестный пользователь';
        try {
          const userDoc = await getDoc(doc(db, 'users', resultData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userName = userData.name || userData.email || 'Неизвестный пользователь';
          }
        } catch (error) {
          console.error('Error getting user:', error);
        }

        results.push({
          id: doc.id,
          ...resultData,
          userName,
          submittedAt: resultData.submittedAt?.toDate?.() || null,
        });
      }

      return { success: true, results };
    } catch (error) {
      console.error('Error getting exam results:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user teams
  async getUserTeams(userId) {
    try {
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const userTeams = teamsSnapshot.docs
        .filter(doc => {
          const teamData = doc.data();
          const members = teamData.members || [];
          // Handle both array and object formats
          if (Array.isArray(members)) {
            return members.includes(userId);
          } else if (typeof members === 'object') {
            return Object.keys(members).includes(userId) || Object.values(members).includes(userId);
          }
          return false;
        })
        .map(doc => doc.id);

      return { success: true, teams: userTeams };
    } catch (error) {
      console.error('Error getting user teams:', error);
      return { success: false, error: error.message, teams: [] };
    }
  },

  // Course Access Management
  async updateCourseAccess(courseId, accessData) {
    try {
      const courseRef = doc(db, COURSES_COLLECTION, courseId);
      const updateData = {
        assignedUsers: accessData.assignedUsers || [],
        assignedTeams: accessData.assignedTeams || [],
        assignedRoles: accessData.assignedRoles || [],
        isPublic: accessData.isPublic !== undefined ? accessData.isPublic : true,
        isRequired: accessData.isRequired || false,
        requiredForRoles: accessData.requiredForRoles || [],
        updatedAt: serverTimestamp(),
      };

      // Добавляем дедлайн если он указан
      if (accessData.deadline) {
        updateData.deadline = accessData.deadline;
      }

      await updateDoc(courseRef, updateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating course access:', error);
      return { success: false, error: error.message };
    }
  },

  async getCourseAccess(courseId) {
    try {
      const courseRef = doc(db, COURSES_COLLECTION, courseId);
      const courseDoc = await getDoc(courseRef);

      if (!courseDoc.exists()) {
        return { success: false, error: 'Course not found' };
      }

      const data = courseDoc.data();
      return {
        success: true,
        access: {
          assignedUsers: data.assignedUsers || [],
          assignedTeams: data.assignedTeams || [],
          assignedRoles: data.assignedRoles || [],
          isPublic: data.isPublic !== undefined ? data.isPublic : true,
          isRequired: data.isRequired || false,
          requiredForRoles: data.requiredForRoles || [],
          deadline: data.deadline || null,
        },
      };
    } catch (error) {
      console.error('Error getting course access:', error);
      return { success: false, error: error.message };
    }
  },

  async hasAccessToCourse(userId, userTeams, courseId, userRoleId = null) {
    try {
      const courseRef = doc(db, COURSES_COLLECTION, courseId);
      const courseDoc = await getDoc(courseRef);

      if (!courseDoc.exists()) {
        return { success: false, hasAccess: false };
      }

      const data = courseDoc.data();

      // If course is public, everyone has access
      if (data.isPublic !== false) {
        return { success: true, hasAccess: true };
      }

      // Check if user is directly assigned
      if (data.assignedUsers && data.assignedUsers.includes(userId)) {
        return { success: true, hasAccess: true };
      }

      // Check if any of user's teams are assigned
      if (data.assignedTeams && userTeams) {
        const hasTeamAccess = userTeams.some(teamId =>
          data.assignedTeams.includes(teamId)
        );
        if (hasTeamAccess) {
          return { success: true, hasAccess: true };
        }
      }

      // Check if user's role is assigned
      if (data.assignedRoles && userRoleId && data.assignedRoles.includes(userRoleId)) {
        return { success: true, hasAccess: true };
      }

      return { success: true, hasAccess: false };
    } catch (error) {
      console.error('Error checking course access:', error);
      return { success: false, hasAccess: false, error: error.message };
    }
  },

  // Получить обязательные курсы для роли
  async getRequiredCoursesForRole(roleId) {
    try {
      const q = query(
        collection(db, COURSES_COLLECTION),
        where('isRequired', '==', true),
        where('requiredForRoles', 'array-contains', roleId)
      );
      const snapshot = await getDocs(q);
      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      }));

      return { success: true, courses };
    } catch (error) {
      console.error('Error getting required courses:', error);
      return { success: false, error: error.message, courses: [] };
    }
  },

  // Проверка дедлайнов и отправка уведомлений
  async checkAndNotifyDeadlines(userId) {
    try {
      // Получаем все курсы пользователя с прогрессом
      const userTeamsResult = await this.getUserTeams(userId);
      const userTeams = userTeamsResult.success ? userTeamsResult.teams : [];

      const coursesResult = await this.getUserCoursesWithProgress(userId, userTeams);
      if (!coursesResult.success) {
        return { success: false, error: 'Failed to get user courses' };
      }

      const notifications = [];
      const now = new Date();

      for (const course of coursesResult.courses) {
        // Пропускаем завершенные курсы и курсы без дедлайна
        if (!course.isRequired || !course.deadline || course.userProgress.progress === 100) {
          continue;
        }

        let deadlineDate = null;

        if (course.deadline.type === 'fixed_date') {
          deadlineDate = course.deadline.value?.toDate?.() || new Date(course.deadline.value);
        } else if (course.deadline.type === 'days_after_assign' && course.userProgress.startedAt) {
          const startDate = course.userProgress.startedAt?.toDate?.() || new Date(course.userProgress.startedAt);
          deadlineDate = new Date(startDate);
          deadlineDate.setDate(deadlineDate.getDate() + course.deadline.value);
        }

        if (!deadlineDate) {
          continue;
        }

        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          // Просрочено
          notifications.push({
            status: 'overdue',
            courseId: course.id,
            courseTitle: course.title,
            userId,
            daysOverdue: Math.abs(diffDays)
          });
        } else if (diffDays <= 1) {
          // Срочно (сегодня/завтра)
          notifications.push({
            status: 'urgent',
            courseId: course.id,
            courseTitle: course.title,
            userId,
            daysLeft: diffDays
          });
        } else if (diffDays <= 3) {
          // Скоро (2-3 дня)
          notifications.push({
            status: 'soon',
            courseId: course.id,
            courseTitle: course.title,
            userId,
            daysLeft: diffDays
          });
        }
      }

      // Отправляем уведомления
      if (notifications.length > 0) {
        try {
          const notificationService = await import('./notification.service');
          await notificationService.default.notifyCourseDeadlinesBulk(notifications);
        } catch (error) {
          console.error('Error sending deadline notifications:', error);
        }
      }

      return { success: true, notificationsSent: notifications.length };
    } catch (error) {
      console.error('Error checking deadlines:', error);
      return { success: false, error: error.message };
    }
  },

  // Автоназначение курсов пользователю по его роли
  async autoEnrollUserByRole(userId, roleId) {
    try {
      console.log('📚 Автоназначение курсов для пользователя:', userId, 'Роль:', roleId);

      // Получаем обязательные курсы для роли
      const requiredCoursesResult = await this.getRequiredCoursesForRole(roleId);
      if (!requiredCoursesResult.success) {
        console.log('❌ Не удалось получить обязательные курсы для роли');
        return { success: false, error: 'Failed to get required courses' };
      }

      console.log('📋 Найдено обязательных курсов:', requiredCoursesResult.courses.length);

      const enrollments = [];
      for (const course of requiredCoursesResult.courses) {
        // Проверяем, не записан ли уже пользователь
        const existingEnrollment = await this.getUserProgress(userId, course.id);
        if (!existingEnrollment.success || !existingEnrollment.progress) {
          console.log('➕ Назначаем курс:', course.title);
          // Записываем на курс
          const enrollResult = await this.enrollUser(userId, course.id);
          if (enrollResult.success) {
            enrollments.push(course.id);

            // Отправляем уведомление о назначении курса
            try {
              const notificationService = await import('./notification.service');
              console.log('📧 Отправка уведомления о назначении курса:', course.title);
              await notificationService.default.notifyCourseAssigned(
                course.id,
                course.title,
                userId,
                course.isRequired,
                course.deadline
              );
              console.log('✅ Уведомление отправлено');
            } catch (error) {
              console.error('❌ Ошибка отправки уведомления:', error);
              // Не останавливаем выполнение если уведомление не удалось
            }
          }
        } else {
          console.log('⏭️  Пользователь уже записан на курс:', course.title);
        }
      }

      return { success: true, enrolledCourses: enrollments };
    } catch (error) {
      console.error('Error auto-enrolling user:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // ПРАКТИЧЕСКИЕ ЗАДАНИЯ (SUBMISSIONS)
  // =====================

  // Отправить практическое задание
  async submitAssignment(lessonId, userId, userData, files) {
    try {
      const submissionRef = await addDoc(
        collection(db, LESSONS_COLLECTION, lessonId, 'submissions'),
        {
          userId,
          userName: userData.displayName || `${userData.firstName} ${userData.lastName}`,
          userAvatar: userData.avatar || null,
          files: files.map(f => ({
            name: f.name,
            url: f.url,
            size: f.size,
            uploadedAt: serverTimestamp(),
          })),
          submittedAt: serverTimestamp(),
          status: 'pending', // pending | approved | rejected
          reviewedBy: null,
          reviewedAt: null,
          feedback: null,
          grade: null,
        }
      );

      return { success: true, submissionId: submissionRef.id };
    } catch (error) {
      console.error('Error submitting assignment:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить submission пользователя по уроку
  async getSubmission(lessonId, userId) {
    try {
      const q = query(
        collection(db, LESSONS_COLLECTION, lessonId, 'submissions'),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          success: true,
          submission: {
            id: doc.id,
            ...doc.data(),
            submittedAt: doc.data().submittedAt?.toDate?.() || doc.data().submittedAt,
            reviewedAt: doc.data().reviewedAt?.toDate?.() || doc.data().reviewedAt,
          },
        };
      }

      return { success: true, submission: null };
    } catch (error) {
      console.error('Error getting submission:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить все submissions для урока (для проверяющих)
  async getAllSubmissions(lessonId) {
    try {
      const q = query(
        collection(db, LESSONS_COLLECTION, lessonId, 'submissions'),
        orderBy('submittedAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const submissions = snapshot.docs.map(doc => ({
        id: doc.id,
        lessonId,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.() || doc.data().submittedAt,
        reviewedAt: doc.data().reviewedAt?.toDate?.() || doc.data().reviewedAt,
      }));

      return { success: true, submissions };
    } catch (error) {
      console.error('Error getting all submissions:', error);
      return { success: false, error: error.message, submissions: [] };
    }
  },

  // Получить все pending submissions (для страницы проверки)
  async getPendingSubmissions() {
    try {
      // Получаем все уроки типа practice
      const lessonsQuery = query(
        collection(db, LESSONS_COLLECTION),
        where('type', '==', 'practice')
      );
      const lessonsSnapshot = await getDocs(lessonsQuery);

      const allSubmissions = [];

      for (const lessonDoc of lessonsSnapshot.docs) {
        const lesson = { id: lessonDoc.id, ...lessonDoc.data() };
        const submissionsResult = await this.getAllSubmissions(lessonDoc.id);

        if (submissionsResult.success) {
          // Добавляем информацию об уроке и курсе
          const courseResult = await this.getCourse(lesson.courseId);
          const courseName = courseResult.success ? courseResult.course.title : 'Unknown';

          submissionsResult.submissions.forEach(sub => {
            allSubmissions.push({
              ...sub,
              lessonTitle: lesson.title,
              courseId: lesson.courseId,
              courseName,
            });
          });
        }
      }

      // Сортируем: pending сначала, потом по дате
      allSubmissions.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      });

      return { success: true, submissions: allSubmissions };
    } catch (error) {
      console.error('Error getting pending submissions:', error);
      return { success: false, error: error.message, submissions: [] };
    }
  },

  // Проверить submission
  async reviewSubmission(lessonId, submissionId, reviewerId, status, feedback, grade = null) {
    try {
      const submissionRef = doc(db, LESSONS_COLLECTION, lessonId, 'submissions', submissionId);

      await updateDoc(submissionRef, {
        status, // 'approved' | 'rejected'
        reviewedBy: reviewerId,
        reviewedAt: serverTimestamp(),
        feedback: feedback || null,
        grade: grade,
      });

      // Получаем submission для отправки уведомления
      const submissionSnap = await getDoc(submissionRef);
      const submissionData = submissionSnap.data();

      // Отправляем уведомление студенту
      try {
        const notificationService = await import('./notification.service');
        await notificationService.default.createNotification({
          userId: submissionData.userId,
          type: 'ASSIGNMENT_REVIEWED',
          title: status === 'approved' ? '✅ Задание принято' : '❌ Задание отклонено',
          message: feedback || (status === 'approved' ? 'Ваше задание было принято' : 'Ваше задание требует доработки'),
          link: `/learning/lesson/${lessonId}`,
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }

      return { success: true };
    } catch (error) {
      console.error('Error reviewing submission:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // СЕРТИФИКАТЫ
  // =====================

  // Генерировать уникальный номер сертификата
  generateCertificateNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${timestamp}-${random}`;
  },

  // Генерировать код верификации
  generateVerificationCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  },

  // Выдать сертификат
  async issueCertificate(userId, courseId, userData, courseData) {
    try {
      const certificateNumber = this.generateCertificateNumber();
      const verificationCode = this.generateVerificationCode();

      const certRef = await addDoc(collection(db, 'certificates'), {
        userId,
        courseId,
        userName: userData.displayName || `${userData.firstName} ${userData.lastName}`,
        courseName: courseData.title,
        certificateNumber,
        verificationCode,
        completedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      // Отправляем уведомление
      try {
        const notificationService = await import('./notification.service');
        await notificationService.default.createNotification({
          userId,
          type: 'CERTIFICATE_ISSUED',
          title: '🎓 Сертификат получен!',
          message: `Поздравляем! Вы получили сертификат за курс "${courseData.title}"`,
          link: '/profile',
        });
      } catch (error) {
        console.error('Error sending certificate notification:', error);
      }

      return {
        success: true,
        certificateId: certRef.id,
        certificateNumber,
        verificationCode,
      };
    } catch (error) {
      console.error('Error issuing certificate:', error);
      return { success: false, error: error.message };
    }
  },

  // Получить сертификаты пользователя
  async getUserCertificates(userId) {
    try {
      const q = query(
        collection(db, 'certificates'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const certificates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate?.() || doc.data().completedAt,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      }));

      return { success: true, certificates };
    } catch (error) {
      console.error('Error getting user certificates:', error);
      return { success: false, error: error.message, certificates: [] };
    }
  },

  // Верификация сертификата
  async verifyCertificate(verificationCode) {
    try {
      const q = query(
        collection(db, 'certificates'),
        where('verificationCode', '==', verificationCode)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          success: true,
          valid: true,
          certificate: {
            id: doc.id,
            ...doc.data(),
            completedAt: doc.data().completedAt?.toDate?.() || doc.data().completedAt,
          },
        };
      }

      return { success: true, valid: false };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return { success: false, error: error.message };
    }
  },

  // Проверить, есть ли у пользователя сертификат за курс
  async hasCertificate(userId, courseId) {
    try {
      const q = query(
        collection(db, 'certificates'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(q);

      return { success: true, hasCertificate: !snapshot.empty };
    } catch (error) {
      console.error('Error checking certificate:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // СТАТИСТИКА ДЛЯ ДОСТИЖЕНИЙ
  // =====================

  // Получить статистику обучения пользователя для достижений
  async getUserLearningStats(userId) {
    try {
      // Получаем все прогрессы пользователя
      const progressQuery = query(
        collection(db, PROGRESS_COLLECTION),
        where('userId', '==', userId)
      );
      const progressSnapshot = await getDocs(progressQuery);

      let completedCourses = 0;
      let quickCourses = 0; // Завершены за 1 день

      progressSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.progress === 100) {
          completedCourses++;

          // Проверяем, завершен ли за 1 день
          if (data.startedAt && data.completedAt) {
            const started = data.startedAt.toDate ? data.startedAt.toDate() : new Date(data.startedAt);
            const completed = data.completedAt.toDate ? data.completedAt.toDate() : new Date(data.completedAt);
            const diffHours = (completed - started) / (1000 * 60 * 60);
            if (diffHours <= 24) {
              quickCourses++;
            }
          }
        }
      });

      // Получаем результаты экзаменов
      const examResultsQuery = query(
        collection(db, 'exam_results'),
        where('userId', '==', userId)
      );
      const examResultsSnapshot = await getDocs(examResultsQuery);

      let perfectExams = 0;
      examResultsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.score === 100 || data.percentage === 100) {
          perfectExams++;
        }
      });

      // Получаем сертификаты
      const certificatesResult = await this.getUserCertificates(userId);
      const certificatesCount = certificatesResult.success ? certificatesResult.certificates.length : 0;

      return {
        success: true,
        stats: {
          completedCourses,
          quickCourses,
          perfectExams,
          certificatesCount,
        },
      };
    } catch (error) {
      console.error('Error getting user learning stats:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // АНАЛИТИКА ДЛЯ АДМИНОВ
  // =====================

  // Получить общую статистику LMS
  async getLMSAnalytics() {
    try {
      // Всего курсов
      const coursesSnapshot = await getDocs(collection(db, COURSES_COLLECTION));
      const totalCourses = coursesSnapshot.size;
      const activeCourses = coursesSnapshot.docs.filter(d => d.data().status !== 'archived').length;

      // Всего прогрессов (уникальных студентов)
      const progressSnapshot = await getDocs(collection(db, PROGRESS_COLLECTION));
      const uniqueStudents = new Set(progressSnapshot.docs.map(d => d.data().userId)).size;
      const completedEnrollments = progressSnapshot.docs.filter(d => d.data().progress === 100).length;

      // Сертификаты
      const certificatesSnapshot = await getDocs(collection(db, 'certificates'));
      const totalCertificates = certificatesSnapshot.size;

      // Статистика по курсам
      const courseStats = [];
      for (const courseDoc of coursesSnapshot.docs) {
        const courseData = courseDoc.data();
        const courseId = courseDoc.id;

        // Прогрессы для этого курса
        const courseProgressQuery = query(
          collection(db, PROGRESS_COLLECTION),
          where('courseId', '==', courseId)
        );
        const courseProgressSnapshot = await getDocs(courseProgressQuery);

        const enrolled = courseProgressSnapshot.size;
        const completed = courseProgressSnapshot.docs.filter(d => d.data().progress === 100).length;
        const avgProgress = enrolled > 0
          ? Math.round(courseProgressSnapshot.docs.reduce((sum, d) => sum + (d.data().progress || 0), 0) / enrolled)
          : 0;

        // Результаты экзаменов для курса
        const examResultsQuery = query(
          collection(db, 'exam_results'),
          where('courseId', '==', courseId)
        );
        const examResultsSnapshot = await getDocs(examResultsQuery);
        const avgExamScore = examResultsSnapshot.size > 0
          ? Math.round(examResultsSnapshot.docs.reduce((sum, d) => sum + (d.data().score || d.data().percentage || 0), 0) / examResultsSnapshot.size)
          : null;

        courseStats.push({
          id: courseId,
          title: courseData.title,
          enrolled,
          completed,
          avgProgress,
          avgExamScore,
          completionRate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
        });
      }

      // Распределение по статусам
      const statusDistribution = {
        notStarted: progressSnapshot.docs.filter(d => d.data().progress === 0).length,
        inProgress: progressSnapshot.docs.filter(d => d.data().progress > 0 && d.data().progress < 100).length,
        completed: completedEnrollments,
      };

      return {
        success: true,
        analytics: {
          overview: {
            totalCourses,
            activeCourses,
            uniqueStudents,
            completedEnrollments,
            totalCertificates,
          },
          courseStats: courseStats.sort((a, b) => b.enrolled - a.enrolled),
          statusDistribution,
        },
      };
    } catch (error) {
      console.error('Error getting LMS analytics:', error);
      return { success: false, error: error.message };
    }
  },
};

export default learningService;
