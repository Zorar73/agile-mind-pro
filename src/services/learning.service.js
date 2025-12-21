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
  async getUserCoursesWithProgress(userId, userTeams = []) {
    try {
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
      await updateDoc(courseRef, {
        assignedUsers: accessData.assignedUsers || [],
        assignedTeams: accessData.assignedTeams || [],
        isPublic: accessData.isPublic !== undefined ? accessData.isPublic : true,
        updatedAt: serverTimestamp(),
      });
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
          isPublic: data.isPublic !== undefined ? data.isPublic : true,
        },
      };
    } catch (error) {
      console.error('Error getting course access:', error);
      return { success: false, error: error.message };
    }
  },

  async hasAccessToCourse(userId, userTeams, courseId) {
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

      return { success: true, hasAccess: false };
    } catch (error) {
      console.error('Error checking course access:', error);
      return { success: false, hasAccess: false, error: error.message };
    }
  },
};

export default learningService;
