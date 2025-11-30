# Agile Mind Pro - Полная Техническая Документация

## 📋 Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Технологический стек](#технологический-стек)
3. [Установка и запуск](#установка-и-запуск)
4. [Архитектура проекта](#архитектура-проекта)
5. [Firebase конфигурация](#firebase-конфигурация)
6. [Структура базы данных](#структура-базы-данных)
7. [Сервисы](#сервисы)
8. [Компоненты](#компоненты)
9. [Страницы](#страницы)
10. [Маршрутизация](#маршрутизация)
11. [AI функциональность](#ai-функциональность)
12. [Система уведомлений](#система-уведомлений)
13. [Система прав доступа](#система-прав-доступа)
14. [Drag & Drop](#drag--drop)
15. [Дизайн система](#дизайн-система)

---

## Обзор проекта

**Agile Mind Pro** — корпоративная система управления задачами с AI-анализатором, построенная по принципу Kanban-досок (аналог Trello/Jira).

### Основные возможности:
- ✅ Kanban доски с колонками и задачами
- ✅ Drag & Drop задач между колонками
- ✅ AI-анализ протоколов встреч и создание задач
- ✅ Календарь задач с 5 масштабами (год, квартал, месяц, неделя, день)
- ✅ Система модерации новых пользователей
- ✅ Realtime обновления (Firebase)
- ✅ Уведомления о событиях
- ✅ Файловые вложения
- ✅ Комментарии с @mentions
- ✅ История изменений
- ✅ Управление ролями (admin/user/pending)

---

## Технологический стек

### Frontend
```json
{
  "react": "19.2.0",
  "vite": "7.2.5",
  "@mui/material": "7.3.5",
  "@emotion/react": "11.14.0",
  "@emotion/styled": "11.14.0",
  "react-router-dom": "7.9.6",
  "@dnd-kit/core": "6.3.1",
  "@dnd-kit/sortable": "6.3.1",
  "date-fns": "4.1.0",
  "recharts": "3.5.0",
  "react-markdown": "10.1.0"
}
```

### Backend
- **Firebase Authentication** - аутентификация
- **Cloud Firestore** - база данных
- **Firebase Storage** - хранение файлов

### AI
- **Google Generative AI** (Gemini 2.5-pro) - анализ текста

---

## Установка и запуск

### Шаг 1: Клонирование проекта
```bash
git clone <repository-url>
cd agile-mind-pro
```

### Шаг 2: Установка зависимостей
```bash
cd frontend
npm install
```

### Шаг 3: Настройка Firebase

1. Создай проект в [Firebase Console](https://console.firebase.google.com/)
2. Включи Authentication (Email/Password)
3. Создай Firestore Database
4. Создай Storage bucket
5. Скопируй конфигурацию

### Шаг 4: Создай файл конфигурации

**frontend/src/config/firebase.js:**
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### Шаг 5: Настройка AI

**frontend/src/config/ai.js:**
```javascript
export const AI_CONFIG = {
  apiKey: 'YOUR_GOOGLE_AI_API_KEY',
  model: 'gemini-2.5-pro',
  temperature: 0.7,
  maxOutputTokens: 8192
};
```

### Шаг 6: Запуск
```bash
npm run dev
```

Приложение откроется на `http://localhost:5173`

---

## Архитектура проекта
```
frontend/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── AI/
│   │   │   └── AIAnalyzer.jsx
│   │   ├── Board/
│   │   │   ├── KanbanColumn.jsx
│   │   │   └── TaskCard.jsx
│   │   ├── Debug/
│   │   │   └── DebugConsole.jsx
│   │   ├── Layout/
│   │   │   ├── MainLayout.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── Notifications/
│   │   │   └── NotificationCenter.jsx
│   │   └── Task/
│   │       └── TaskModal.jsx
│   ├── config/              # Конфигурация
│   │   ├── firebase.js
│   │   └── ai.js
│   ├── pages/               # Страницы приложения
│   │   ├── App.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── BoardPage.jsx
│   │   ├── CalendarPage.jsx
│   │   ├── MyTasksPage.jsx
│   │   ├── UsersPage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── PendingApprovalPage.jsx
│   ├── services/            # Бизнес-логика
│   │   ├── auth.service.js
│   │   ├── board.service.js
│   │   ├── task.service.js
│   │   ├── user.service.js
│   │   ├── ai.service.js
│   │   └── notification.service.js
│   ├── theme.js             # Material-UI тема
│   └── main.jsx             # Точка входа
├── public/
├── index.html
├── package.json
└── vite.config.js
```

---

## Firebase конфигурация

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == userId || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Доски
    match /boards/{boardId} {
      allow read: if request.auth != null && 
                    request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      (resource.data.members[request.auth.uid] == 'owner' || 
                       resource.data.members[request.auth.uid] == 'editor');
      allow delete: if request.auth != null && 
                      resource.data.members[request.auth.uid] == 'owner';
      
      // Колонки
      match /columns/{columnId} {
        allow read, write: if request.auth != null && 
                             request.auth.uid in get(/databases/$(database)/documents/boards/$(boardId)).data.members;
      }
      
      // Задачи
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && 
                             request.auth.uid in get(/databases/$(database)/documents/boards/$(boardId)).data.members;
        
        match /comments/{commentId} {
          allow read, write: if request.auth != null;
        }
        
        match /activity/{activityId} {
          allow read: if request.auth != null;
          allow write: if request.auth != null;
        }
      }
    }
    
    // Уведомления
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      resource.data.userId == request.auth.uid;
    }
    
    // Настройки пользователей
    match /userSettings/{userId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == userId;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /boards/{boardId}/tasks/{taskId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.resource.size < 10 * 1024 * 1024; // 10MB
      allow delete: if request.auth != null;
    }
  }
}
```

---

## Структура базы данных

### Collection: `users`
```javascript
{
  id: "user_id",
  email: "user@example.com",
  firstName: "Иван",
  middleName: "Иванович",
  lastName: "Иванов",
  position: "Разработчик",
  responsibility: "Frontend разработка",
  role: "user", // 'admin' | 'user' | 'pending'
  avatar: "https://...",
  createdAt: Timestamp,
  approvedBy: "admin_user_id",
  approvedAt: Timestamp
}
```

### Collection: `boards`
```javascript
{
  id: "board_id",
  title: "Название доски",
  ownerId: "user_id",
  members: {
    "user_id_1": "owner",   // 'owner' | 'editor' | 'viewer'
    "user_id_2": "editor",
    "user_id_3": "viewer"
  },
  columnOrder: ["col1", "col2", "col3"],
  settings: {
    whoCanMoveToStatus: {
      "column_id": ["owner", "editor"] // кто может перемещать в эту колонку
    }
  },
  createdAt: Timestamp
}
```

### Collection: `boards/{boardId}/columns`
```javascript
{
  id: "column_id",
  title: "📋 Задача поставлена",
  color: "#1976d2",
  order: 0,
  createdAt: Timestamp
}
```

**Дефолтные колонки:**
1. 📋 Задача поставлена
2. 🔨 В работе
3. 🔍 Согласование
4. ✅ Готово
5. ⏸️ Отложена
6. ❌ Отменена

### Collection: `boards/{boardId}/tasks`
```javascript
{
  id: "task_id",
  title: "Название задачи",
  description: "Описание",
  columnId: "column_id",
  order: 0,
  assigneeId: "user_id",
  creatorId: "user_id",
  dueDate: "2025-12-31", // строка YYYY-MM-DD
  priority: "normal", // 'normal' | 'urgent' | 'recurring'
  tags: ["backend", "api"],
  attachments: [
    {
      name: "file.pdf",
      url: "https://...",
      size: 1024,
      uploadedBy: "user_id",
      uploadedAt: Timestamp
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection: `boards/{boardId}/tasks/{taskId}/comments`
```javascript
{
  id: "comment_id",
  userId: "user_id",
  text: "Текст комментария с @mention",
  mentions: ["user_id_1", "user_id_2"],
  createdAt: Timestamp
}
```

### Collection: `boards/{boardId}/tasks/{taskId}/activity`
```javascript
{
  id: "activity_id",
  type: "created", // 'created' | 'updated' | 'moved' | 'file_added' | 'file_deleted' | 'comment_added' | 'comment_deleted'
  userId: "user_id",
  details: "Детали изменения",
  timestamp: Timestamp,
  changes: {
    field: "title",
    oldValue: "Старое значение",
    newValue: "Новое значение"
  }
}
```

### Collection: `notifications`
```javascript
{
  id: "notification_id",
  type: "task_assigned", // 'task_assigned' | 'task_comment' | 'task_mention' | 'task_deadline' | 'task_updated' | 'user_approved'
  userId: "user_id",
  title: "Заголовок",
  message: "Сообщение",
  taskId: "task_id",
  actorId: "user_id",
  link: "/board/board_id",
  read: false,
  createdAt: Timestamp,
  readAt: Timestamp
}
```

### Collection: `userSettings`
```javascript
{
  id: "user_id",
  emailNotifications: {
    newTasks: true,
    comments: true,
    deadlines: true
  },
  interface: {
    darkMode: false,
    showTooltips: true
  }
}
```

---

## Сервисы

### auth.service.js

**Методы:**
- `register(userData)` - регистрация с role='pending'
- `login(email, password)` - вход
- `logout()` - выход
- `getCurrentUser()` - текущий пользователь

**Пример:**
```javascript
import authService from './services/auth.service';

// Регистрация
const result = await authService.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'Иван',
  middleName: 'Иванович',
  lastName: 'Иванов',
  position: 'Разработчик',
  responsibility: 'Frontend'
});

// Вход
const loginResult = await authService.login('user@example.com', 'password123');
```

### board.service.js

**Методы:**
- `createBoard(title, ownerId)` - создание доски с дефолтными колонками
- `getUserBoards(userId)` - получить доски пользователя
- `subscribeToUserBoards(userId, callback)` - Realtime подписка
- `subscribeToBoard(boardId, callback)` - подписка на доску
- `getColumns(boardId)` - получить колонки
- `subscribeToColumns(boardId, callback)` - подписка на колонки
- `addColumn(boardId, title, color)` - добавить колонку
- `deleteColumn(boardId, columnId)` - удалить колонку
- `updateBoardTitle(boardId, title)` - изменить название
- `updateColumnTitle(boardId, columnId, title)` - изменить название колонки
- `addMember(boardId, userId, role)` - добавить участника
- `removeMember(boardId, userId)` - удалить участника
- `updateMovePermissions(boardId, columnId, roles)` - настройка прав

**Пример:**
```javascript
import boardService from './services/board.service';

// Создать доску
const board = await boardService.createBoard('Новый проект', userId);

// Подписаться на доски
const unsubscribe = boardService.subscribeToUserBoards(userId, (boards) => {
  console.log('Доски обновлены:', boards);
});
```

### task.service.js

**Методы:**
- `createTask(boardId, taskData)` - создать задачу
- `getTasks(boardId)` - получить задачи
- `subscribeToTasks(boardId, callback)` - Realtime подписка
- `getTask(boardId, taskId)` - получить задачу
- `subscribeToTask(boardId, taskId, callback)` - подписка на задачу
- `updateTask(boardId, taskId, updates, userId)` - обновить с логированием
- `moveTask(boardId, taskId, newColumnId, newOrder, userId)` - переместить
- `deleteTask(boardId, taskId, userId)` - удалить с очисткой вложений
- `uploadFile(boardId, taskId, file, userId)` - загрузить файл
- `deleteFile(boardId, taskId, fileIndex, userId)` - удалить файл
- `addComment(boardId, taskId, userId, text, mentions)` - добавить комментарий
- `deleteComment(boardId, taskId, commentId)` - удалить комментарий
- `subscribeToComments(boardId, taskId, callback)` - подписка на комментарии
- `logActivity(boardId, taskId, type, userId, details, changes)` - логирование
- `getActivity(boardId, taskId)` - получить историю
- `subscribeToActivity(boardId, taskId, callback)` - подписка на историю

**Пример:**
```javascript
import taskService from './services/task.service';

// Создать задачу
const task = await taskService.createTask(boardId, {
  title: 'Новая задача',
  description: 'Описание',
  columnId: 'column_id',
  assigneeId: 'user_id',
  creatorId: 'creator_id',
  dueDate: '2025-12-31',
  priority: 'urgent',
  tags: ['backend']
});

// Обновить задачу
await taskService.updateTask(boardId, taskId, {
  title: 'Обновленное название'
}, userId);

// Загрузить файл
const file = event.target.files[0];
await taskService.uploadFile(boardId, taskId, file, userId);
```

### user.service.js

**Методы:**
- `getAllUsers()` - все пользователи
- `subscribeToUsers(callback)` - Realtime подписка
- `getPendingUsers()` - пользователи на модерации
- `approveUser(userId, approvedBy)` - одобрить (role: pending → user)
- `rejectUser(userId)` - отклонить (удаление)
- `changeUserRole(userId, newRole)` - изменить роль
- `getUser(userId)` - получить пользователя

**Пример:**
```javascript
import userService from './services/user.service';

// Подписаться на пользователей
const unsubscribe = userService.subscribeToUsers((users) => {
  console.log('Пользователи:', users);
});

// Одобрить пользователя
await userService.approveUser(userId, adminId);

// Изменить роль
await userService.changeUserRole(userId, 'admin');
```

### ai.service.js

**Методы:**
- `analyzeRecap(recapText, context)` - анализ протокола встречи
- `splitTask(task, context)` - разбиение задачи на подзадачи
- `buildSystemPrompt(boards, tags, users)` - построение промпта
- `parseAIResponse(text)` - парсинг JSON ответа

**Конфигурация:**
- Модель: `gemini-2.5-pro`
- Temperature: `0.7`
- Max tokens: `8192`

**Пример:**
```javascript
import aiService from './services/ai.service';

// Анализ протокола
const recapText = "Обсудили новый проект...";
const context = {
  boards: [{id: '1', title: 'Разработка'}],
  tags: ['backend', 'frontend'],
  users: [{firstName: 'Иван', lastName: 'Иванов', position: 'Dev'}]
};

const tasks = await aiService.analyzeRecap(recapText, context);
// Вернет массив задач для создания

// Разделить задачу
const subtasks = await aiService.splitTask(task, context);
// Вернет 2-5 подзадач
```

### notification.service.js

**Методы:**
- `create(notification)` - создать уведомление
- `subscribeToUserNotifications(userId, callback)` - подписка
- `getUnreadCount(userId)` - количество непрочитанных
- `markAsRead(notificationId)` - отметить прочитанным
- `markAllAsRead(userId)` - отметить все прочитанными
- `notifyTaskAssigned(taskId, taskTitle, assigneeId, assignedBy)` - назначение
- `notifyTaskComment(taskId, taskTitle, userId, commentedBy)` - комментарий
- `notifyTaskMention(taskId, taskTitle, mentionedUserId, mentionedBy)` - упоминание
- `notifyTaskDeadline(taskId, taskTitle, assigneeId)` - дедлайн
- `notifyUserApproved(userId)` - одобрение регистрации

**Типы уведомлений:**
- `task_assigned`
- `task_comment`
- `task_mention`
- `task_deadline`
- `task_updated`
- `user_approved`

**Пример:**
```javascript
import notificationService from './services/notification.service';

// Подписаться на уведомления
const unsubscribe = notificationService.subscribeToUserNotifications(
  userId,
  (notifications) => {
    console.log('Уведомления:', notifications);
  }
);

// Уведомить о назначении
await notificationService.notifyTaskAssigned(
  taskId,
  'Новая задача',
  assigneeId,
  currentUserId
);
```

---

## Компоненты

### AIAnalyzer.jsx

**Путь:** `src/components/AI/AIAnalyzer.jsx`

**Назначение:** Диалог для AI-анализа протоколов встреч

**Props:**
- `open` - открыт ли диалог
- `onClose` - callback закрытия
- `boardId` - ID доски для создания задач

**Использование:**
```jsx
<AIAnalyzer
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  boardId={currentBoardId}
/>
```

**Функциональность:**
1. Шаг 1: Ввод текста протокола → AI анализ
2. Шаг 2: Предпросмотр и редактирование извлеченных задач
3. Кнопка "Разделить на подзадачи" для каждой задачи
4. Массовое создание задач

### KanbanColumn.jsx

**Путь:** `src/components/Board/KanbanColumn.jsx`

**Назначение:** Колонка на доске

**Props:**
- `column` - данные колонки
- `tasks` - массив задач в колонке
- `boardId` - ID доски
- `onTaskClick` - callback клика по задаче
- `onAddTask` - callback добавления задачи
- `onColumnEdit` - callback редактирования колонки
- `onColumnDelete` - callback удаления колонки

**Возможности:**
- Drag & drop зона (useDroppable)
- Inline редактирование названия
- Меню действий (переименовать, удалить)
- Chip с количеством задач
- Кнопка "Добавить задачу"

### TaskCard.jsx

**Путь:** `src/components/Board/TaskCard.jsx`

**Назначение:** Карточка задачи

**Props:**
- `task` - данные задачи
- `onClick` - callback клика

**Drag & Drop:**
```jsx
const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
  isDragging
} = useSortable({ id: task.id });
```

**Отображает:**
- Название
- Теги (Chips)
- Приоритет (Flag icon для urgent, Loop для recurring)
- Дедлайн (Calendar icon)
- Количество вложений
- Количество комментариев
- Аватар исполнителя

### TaskModal.jsx

**Путь:** `src/components/Task/TaskModal.jsx`

**Назначение:** Модальное окно редактирования задачи

**Props:**
- `boardId` - ID доски
- `task` - данные задачи
- `columns` - массив колонок
- `onClose` - callback закрытия

**Табы:**
1. **Детали** - title, description, assignee, dueDate, priority, tags
2. **Вложения** - список файлов, загрузка, удаление
3. **Комментарии** - список, добавление, @mentions, Markdown
4. **История** - activity log

**Автосохранение:**
- `hasUnsavedChanges` флаг
- Кнопка "Сохранить" активна при изменениях
- Предупреждение при закрытии

**Realtime:**
- `subscribeToTask` - данные задачи
- `subscribeToComments` - комментарии
- `subscribeToActivity` - история

### NotificationCenter.jsx

**Путь:** `src/components/Notifications/NotificationCenter.jsx`

**Назначение:** Центр уведомлений в AppBar

**Возможности:**
- Badge с количеством непрочитанных
- Dropdown меню с уведомлениями
- Realtime обновления
- Клик → переход по ссылке + отметка прочитанным
- Кнопка "Прочитать все"

**Иконки по типам:**
- `task_assigned` - Assignment
- `task_comment` - Comment
- `task_mention` - AlternateEmail
- `task_deadline` - Event
- `user_approved` - CheckCircle

### MainLayout.jsx

**Путь:** `src/components/Layout/MainLayout.jsx`

**Назначение:** Основной layout с sidebar и AppBar

**Props:**
- `children` - контент страницы
- `title` - заголовок в AppBar
- `showAppBar` - показывать ли AppBar

**Структура:**
- Sidebar (260px desktop, drawer на mobile)
- AppBar с заголовком и NotificationCenter
- Контентная область

**Адаптивность:**
- Desktop (≥600px): sidebar всегда видим, может схлопываться до 64px
- Mobile (<600px): drawer поверх контента

### DebugConsole.jsx

**Путь:** `src/components/Debug/DebugConsole.jsx`

**Назначение:** Система отладки

**Функции:**
- Перехват `console.error` и `console.warn`
- Хранение в `window.appLogs`
- Drawer справа с логами
- Кнопки "Скачать" (JSON) и "Очистить"
- Экспорт: `logError(message, data)`, `logInfo(message, data)`

---

## Страницы

### App.jsx

**Путь:** `src/pages/App.jsx`

**Назначение:** Корневой компонент

**Структура:**
```jsx
<UserContext.Provider>
  <ThemeProvider theme={corporateTheme}>
    <Router>
      <Routes>
        {/* Публичные */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Защищенные */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/board/:boardId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/my-tasks" element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </Router>
    <DebugConsole />
  </ThemeProvider>
</UserContext.Provider>
```

**UserContext:**
```javascript
export const UserContext = createContext(null);

// Provider предоставляет:
{
  user: {
    uid: "user_id",
    email: "user@example.com",
    firstName: "Иван",
    // ... остальные поля
  }
}
```

**Проверка модерации:**
Если `user.role === 'pending'` → редирект на `PendingApprovalPage`

### DashboardPage.jsx

**Назначение:** Главная страница со списком досок

**Возможности:**
- Grid карточек досок
- Realtime обновления (subscribeToUserBoards)
- Диалог создания доски
- Чипы ролей (Владелец/Редактор/Наблюдатель)

### BoardPage.jsx

**Назначение:** Страница доски с колонками

**Возможности:**
- Drag & Drop (DndContext, PointerSensor, closestCorners)
- Realtime (subscribeToBoard, subscribeToColumns, subscribeToTasks)
- Inline редактирование названия доски
- Кнопка "AI Анализ" → AIAnalyzer
- Проверка прав на перенос (whoCanMoveToStatus)
- Меню (добавить колонку, настройки)
- FAB "Новая задача"
- Hotkey: Ctrl+Enter для создания задачи

**Drag & Drop:**
```jsx
const handleDragEnd = (event) => {
  const { active, over } = event;
  
  // Проверка прав
  const userRole = board.members[user.uid];
  const columnSettings = board.settings?.whoCanMoveToStatus?.[over.id] || [];
  
  if (!columnSettings.includes(userRole)) {
    alert('Недостаточно прав');
    return;
  }
  
  // Перемещение
  await taskService.moveTask(boardId, active.id, over.id, newOrder, user.uid);
};
```

### CalendarPage.jsx

**Назначение:** Календарь задач с 5 масштабами

**Масштабы:**
1. **Год** - сетка 4x3 месяцев с количеством задач
2. **Квартал** - 3 месяца
3. **Месяц** - сетка 7x5/6 дней с задачами (drag & drop)
4. **Неделя** - 7 колонок дней (drag & drop)
5. **День** - детальный список задач

**Фильтры:**
- По принадлежности: myTasks, assignedToOthers
- По приоритету: urgent, normal, recurring
- По исполнителям (Select)
- По доскам (Select)
- По тегам (Select)
- Кнопка "Очистить фильтры"

**Навигация:**
- ChevronLeft/Right - предыдущий/следующий период
- Today - переход к текущей дате
- Клик по дню → режим "день"

**Drag & Drop (month, week):**
- Задачи можно перетаскивать между днями
- Автоматически меняется dueDate
- Проверка прав на доске
- Уведомления исполнителю и создателю

### MyTasksPage.jsx

**Назначение:** Личные задачи

**Табы:**
1. Все задачи
2. Назначенные мне
3. Созданные мной

**Возможности:**
- Поиск по названию/описанию
- Таблица: задача, доска, приоритет, дедлайн, теги
- Клик → навигация на доску

### UsersPage.jsx

**Назначение:** Управление пользователями (только админы)

**Табы:**
1. **Все пользователи** - полный список
2. **На модерации** - с badge количества

**Возможности:**
- Поиск по имени, email, должности
- Таблица: Avatar, email, должность, ответственность, роль, дата регистрации
- Действия для pending:
  - Кнопка "Одобрить" (success) → approveUser → уведомление
  - Кнопка "Отклонить" (error) → rejectUser
- Действия для активных (меню):
  - "Изменить роль" → диалог выбора user/admin
  - "Удалить" → диалог подтверждения
- Skeleton при загрузке
- CircularProgress при действиях
- Disabled кнопок во время операций

### SettingsPage.jsx

**Назначение:** Настройки пользователя

**Разделы:**
1. **Email-уведомления**
   - Switch: новые задачи
   - Switch: комментарии
   - Switch: дедлайны

2. **Интерфейс**
   - Switch: темная тема
   - Switch: показывать подсказки

**Сохранение:** Firestore `userSettings/{userId}`

### ProfilePage.jsx

**Назначение:** Профиль пользователя

**Отображает:**
- Avatar
- ФИО
- Email
- Должность
- Ответственность
- Роль (Chip)

### PendingApprovalPage.jsx

**Назначение:** Страница ожидания модерации

**Отображает:**
- HourglassEmpty icon
- Сообщение: "Ваша учетная запись на модерации"
- Кнопка "Выйти"

---

## Маршрутизация
```jsx
// Публичные маршруты
/login          → LoginPage
/register       → RegisterPage

// Защищенные маршруты (требуют аутентификации)
/               → DashboardPage (список досок)
/board/:boardId → BoardPage (доска с задачами)
/calendar       → CalendarPage
/my-tasks       → MyTasksPage
/users          → UsersPage (только admin)
/settings       → SettingsPage
/profile        → ProfilePage

// Специальные
/pending        → PendingApprovalPage (автоматически для role='pending')
```

**ProtectedRoute компонент:**
```jsx
function ProtectedRoute({ children }) {
  const { user } = useContext(UserContext);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role === 'pending') {
    return <Navigate to="/pending" />;
  }
  
  return children;
}
```

---

## AI функциональность

### Анализ протоколов встреч

**Процесс:**
1. Пользователь вводит текст протокола в AIAnalyzer
2. Загружается контекст:
   - Доски: `[{id, title}]`
   - Теги: `['backend', 'frontend']`
   - Пользователи: `[{firstName, lastName, position, responsibility}]`
3. Формируется системный промпт с инструкциями
4. Отправка в Gemini API (`gemini-2.5-pro`)
5. Парсинг JSON ответа:
```json
[
  {
    "title": "Реализовать API авторизации",
    "description": "Детальное описание...",
    "suggestedBoard": "Backend разработка",
    "suggestedAssignee": "Иванов Иван",
    "suggestedPriority": "urgent",
    "suggestedTags": ["backend", "auth"],
    "suggestedDueDate": "2025-12-15"
  }
]
```
6. Предпросмотр и редактирование
7. Массовое создание через `taskService.createTask`

**Системный промпт:**
```
Ты - ассистент для анализа протоколов встреч и создания задач.

Твоя задача:
1. Прочитать протокол встречи
2. Извлечь все упомянутые задачи
3. Для каждой задачи определить:
   - Название (кратко, до 50 символов)
   - Описание (детально)
   - Доску (из доступных)
   - Исполнителя (по должности и ответственности)
   - Приоритет (normal/urgent/recurring)
   - Теги
   - Дедлайн (если упомянут)

Доступные доски: [список]
Доступные теги: [список]
Сотрудники: [список с должностями]

Верни JSON массив задач.
```

### Разделение задачи на подзадачи

**Процесс:**
1. Пользователь выбирает задачу в TaskModal
2. Нажимает "AI: Разделить на подзадачи"
3. Вызов `aiService.splitTask(task, context)`
4. AI возвращает 2-5 подзадач
5. Автоматическое создание на той же доске в той же колонке

**Промпт:**
```
Разбей задачу на подзадачи (2-5 штук).

Задача:
Название: {task.title}
Описание: {task.description}

Каждая подзадача должна быть:
- Конкретной и выполнимой
- Логически связанной с основной задачей
- Иметь четкий результат

Верни JSON массив подзадач.
```

---

## Система уведомлений

### Типы уведомлений

1. **task_assigned** - назначение задачи
   - Триггер: смена `assigneeId`
   - Кому: новый исполнитель
   - Email: если `emailNotifications.newTasks === true`

2. **task_comment** - новый комментарий
   - Триггер: `addComment`
   - Кому: создатель и исполнитель задачи
   - Email: если `emailNotifications.comments === true`

3. **task_mention** - упоминание в комментарии
   - Триггер: `@username` в комментарии
   - Кому: упомянутые пользователи
   - Email: если `emailNotifications.comments === true`

4. **task_deadline** - приближается дедлайн
   - Триггер: за день до dueDate (cronjob)
   - Кому: исполнитель
   - Email: если `emailNotifications.deadlines === true`

5. **task_updated** - изменение задачи
   - Триггер: изменение dueDate, priority и т.д.
   - Кому: исполнитель и создатель
   - Email: если `emailNotifications.deadlines === true`

6. **user_approved** - одобрение регистрации
   - Триггер: `approveUser`
   - Кому: новый пользователь
   - Email: всегда

### Отправка уведомлений

**Из кода:**
```javascript
// При назначении задачи
if (updates.assigneeId && updates.assigneeId !== task.assigneeId) {
  await notificationService.notifyTaskAssigned(
    taskId,
    task.title,
    updates.assigneeId,
    userId
  );
}

// При комментарии
await notificationService.notifyTaskComment(
  taskId,
  task.title,
  task.creatorId,
  userId
);

// При упоминании
mentions.forEach(mentionedUserId => {
  notificationService.notifyTaskMention(
    taskId,
    task.title,
    mentionedUserId,
    userId
  );
});
```

### Email интеграция

**Настройка (будущее):**
1. Подключить Firebase Cloud Functions
2. Настроить SendGrid/Mailgun
3. Триггер: onCreate в notifications
4. Проверка `userSettings.emailNotifications`
5. Отправка письма

**Шаблон письма:**
```html
<h2>{notification.title}</h2>
<p>{notification.message}</p>
<a href="https://app.agilemind.com{notification.link}">Перейти к задаче</a>
```

---

## Система прав доступа

### Роли пользователей

**pending** - на модерации
- Доступ: только PendingApprovalPage
- Действия: нет

**user** - обычный пользователь
- Доступ: все страницы кроме UsersPage
- Действия: 
  - Создавать доски
  - Работать с задачами на своих досках
  - Просматривать задачи на досках где есть доступ

**admin** - администратор
- Доступ: все страницы
- Действия:
  - Все что может user
  - Модерация пользователей (UsersPage)
  - Изменение ролей

### Роли на досках

**owner** - владелец
- Может: все
- Назначается: создателю доски

**editor** - редактор
- Может:
  - Создавать/редактировать/удалять задачи
  - Перемещать задачи
  - Добавлять участников
  - Комментировать
- Не может:
  - Удалять доску
  - Менять владельца

**viewer** - наблюдатель
- Может:
  - Просматривать задачи
  - Комментировать
- Не может:
  - Создавать задачи
  - Редактировать задачи
  - Перемещать задачи

### Права на перенос задач

**Настройка в settings.whoCanMoveToStatus:**
```javascript
{
  "column_id_1": ["owner", "editor"],  // все могут
  "column_id_2": ["owner"],            // только владелец
  "column_id_3": []                    // никто не может (автоматически)
}
```

**Проверка при перемещении:**
```javascript
const userRole = board.members[user.uid];
const allowedRoles = board.settings?.whoCanMoveToStatus?.[newColumnId] || ['owner', 'editor'];

if (!allowedRoles.includes(userRole)) {
  alert('Недостаточно прав для перемещения в эту колонку');
  return;
}
```

---

## Drag & Drop

### Библиотека
**@dnd-kit** - современная, производительная библиотека для drag-and-drop

**Установка:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Использование на досках

**Структура:**
```jsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCorners}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  {columns.map(column => (
    <DroppableColumn key={column.id} column={column}>
      <SortableContext items={tasks.map(t => t.id)}>
        {tasks.map(task => (
          <DraggableTask key={task.id} task={task} />
        ))}
      </SortableContext>
    </DroppableColumn>
  ))}
  
  <DragOverlay>
    {activeTask && <TaskCard task={activeTask} />}
  </DragOverlay>
</DndContext>
```

**Сенсоры:**
```javascript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // нужно сдвинуть на 8px для начала drag
    },
  })
);
```

**Обработчики:**
```javascript
const handleDragStart = (event) => {
  const task = tasks.find(t => t.id === event.active.id);
  setActiveTask(task);
};

const handleDragEnd = async (event) => {
  const { active, over } = event;
  
  if (!over) return;
  
  // Проверка прав
  // Перемещение задачи
  await taskService.moveTask(boardId, active.id, over.id, newOrder, userId);
  
  setActiveTask(null);
};
```

### Использование в календаре

**Month/Week view:**
```jsx
<DndContext
  sensors={sensors}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  {days.map(day => (
    <DroppableDay key={day} date={day}>
      {tasks.map(task => (
        <DraggableTask key={task.id} task={task} />
      ))}
    </DroppableDay>
  ))}
</DndContext>
```

**handleDragEnd в календаре:**
```javascript
const handleDragEnd = async (event) => {
  const { active, over } = event;
  
  // Извлекаем новую дату из over.id ("day-2025-12-31")
  const newDate = over.id.replace('day-', '');
  
  // Обновляем dueDate
  await taskService.updateTask(boardId, taskId, {
    dueDate: newDate
  }, userId);
  
  // Отправляем уведомления
  await notificationService.create({
    type: 'task_updated',
    userId: task.assigneeId,
    message: `Дедлайн изменен на ${newDate}`
  });
};
```

---

## Дизайн система

### Тема (theme.js)

**Палитра (Atlassian Jira):**
```javascript
palette: {
  primary: {
    main: '#0747A6',    // Синий Atlassian
    light: '#0052CC',
    dark: '#042E5C'
  },
  secondary: {
    main: '#5243AA',    // Фиолетовый
    light: '#6554C0',
    dark: '#403294'
  },
  error: {
    main: '#DE350B'
  },
  warning: {
    main: '#FF991F'
  },
  success: {
    main: '#00875A'
  },
  info: {
    main: '#0065FF'
  },
  background: {
    default: '#F4F5F7',
    paper: '#FFFFFF'
  },
  text: {
    primary: '#172B4D',
    secondary: '#5E6C84',
    disabled: '#A5ADBA'
  }
}
```

**Типографика:**
```javascript
typography: {
  fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  h1: { fontSize: '2.5rem', fontWeight: 600 },
  h2: { fontSize: '2rem', fontWeight: 600 },
  h3: { fontSize: '1.75rem', fontWeight: 600 },
  h4: { fontSize: '1.5rem', fontWeight: 600 },
  h5: { fontSize: '1.25rem', fontWeight: 600 },
  h6: { fontSize: '1rem', fontWeight: 600 },
  body1: { fontSize: '0.875rem' },
  body2: { fontSize: '0.8125rem' },
  button: { fontWeight: 500, textTransform: 'none' }
}
```

**Компоненты:**
```javascript
components: {
  MuiButton: {
    defaultProps: {
      disableElevation: true
    },
    styleOverrides: {
      root: {
        borderRadius: 3
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 3,
        boxShadow: '0 1px 2px rgba(9, 30, 66, 0.25)'
      }
    }
  },
  MuiTextField: {
    defaultProps: {
      size: 'small'
    }
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 500
      }
    }
  }
}
```

### Цветовая кодировка

**Приоритеты задач:**
- 🔴 Urgent (urgent) - `error.main` (#DE350B)
- 🔵 Normal (normal) - `primary.main` (#0747A6)
- 🔁 Recurring (recurring) - `info.main` (#0065FF)

**Роли пользователей:**
- 🔴 Admin - `error` Chip
- 🟢 User - `success` Chip
- 🟡 Pending - `warning` Chip

**Роли на досках:**
- Владелец - `primary` Chip
- Редактор - `secondary` Chip
- Наблюдатель - `default` Chip

**Иконки:**
- 📋 Задача поставлена
- 🔨 В работе
- 🔍 Согласование
- ✅ Готово
- ⏸️ Отложена
- ❌ Отменена

---

## Полезные команды

### Разработка
```bash
# Запуск dev сервера
npm run dev

# Сборка production
npm run build

# Preview production сборки
npm run preview

# Линтинг
npm run lint
```

### Firebase
```bash
# Установка Firebase CLI
npm install -g firebase-tools

# Логин
firebase login

# Инициализация проекта
firebase init

# Деплой правил Firestore
firebase deploy --only firestore:rules

# Деплой правил Storage
firebase deploy --only storage

# Деплой всего
firebase deploy
```

### Отладка
```bash
# Открыть DebugConsole в приложении
# Нажать FAB кнопку с иконкой BugReport в правом нижнем углу

# Скачать логи
# Кнопка "Скачать" в DebugConsole → agile-mind-logs-{timestamp}.json
```

---

## Чеклист запуска проекта

### 1. Подготовка
- [ ] Node.js установлен (v18+)
- [ ] Git установлен
- [ ] Firebase аккаунт создан

### 2. Firebase настройка
- [ ] Проект создан в Firebase Console
- [ ] Authentication включен (Email/Password)
- [ ] Firestore Database создан
- [ ] Storage bucket создан
- [ ] Правила Firestore настроены
- [ ] Правила Storage настроены

### 3. Проект
- [ ] Код склонирован
- [ ] `npm install` выполнен
- [ ] `firebase.js` настроен с вашими credentials
- [ ] `ai.js` настроен с Google AI API key

### 4. Первый запуск
- [ ] `npm run dev` запущен
- [ ] Приложение открывается на localhost:5173
- [ ] Регистрация работает
- [ ] Создан первый admin пользователь вручную в Firestore:
```javascript
  // В Firestore консоли найди документ пользователя
  // Измени поле role с 'pending' на 'admin'
```

### 5. Проверка функций
- [ ] Логин/регистрация работает
- [ ] Создание доски работает
- [ ] Создание задачи работает
- [ ] Drag & drop работает
- [ ] Календарь открывается
- [ ] AI анализ работает
- [ ] Уведомления работают
- [ ] Модерация пользователей работает

---

## Расширение функциональности

### Добавление новой страницы

1. Создай компонент в `src/pages/`
```jsx
// src/pages/ReportsPage.jsx
import MainLayout from '../components/Layout/MainLayout';

function ReportsPage() {
  return (
    <MainLayout title="Отчеты">
      {/* Контент */}
    </MainLayout>
  );
}

export default ReportsPage;
```

2. Добавь маршрут в `App.jsx`
```jsx
<Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
```

3. Добавь пункт в Sidebar
```jsx
// В Sidebar.jsx
{
  title: 'Отчеты',
  icon: <Assessment />,
  path: '/reports'
}
```

### Добавление нового типа уведомления

1. Добавь тип в `notification.service.js`
```javascript
TYPES = {
  // ...
  TASK_OVERDUE: 'task_overdue'
}
```

2. Добавь метод создания
```javascript
async notifyTaskOverdue(taskId, taskTitle, assigneeId) {
  return await this.create({
    type: this.TYPES.TASK_OVERDUE,
    userId: assigneeId,
    title: 'Просрочена задача',
    message: `Задача "${taskTitle}" просрочена`,
    taskId,
    link: `/task/${taskId}`
  });
}
```

3. Добавь иконку в NotificationCenter
```javascript
case 'task_overdue':
  return <Warning color="error" />;
```

### Добавление нового сервиса
```javascript
// src/services/analytics.service.js
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

class AnalyticsService {
  async getTasksCompletedThisMonth(userId) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const q = query(
      collection(db, 'tasks'),
      where('assigneeId', '==', userId),
      where('status', '==', 'completed'),
      where('completedAt', '>=', monthStart)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  }
}

export default new AnalyticsService();
```

---

## Troubleshooting

### Белый экран после логина
**Проблема:** Пользователь с role='pending' не может войти

**Решение:**
1. Открой Firestore Console
2. Найди коллекцию `users`
3. Найди документ пользователя
4. Измени поле `role` с `'pending'` на `'user'` или `'admin'`

### Задачи не перетаскиваются
**Проблема:** Drag & Drop не работает

**Решение:**
1. Проверь что установлен `@dnd-kit`: `npm install @dnd-kit/core @dnd-kit/sortable`
2. Проверь права на доске (должен быть owner или editor)
3. Проверь `whoCanMoveToStatus` в настройках доски

### AI не работает
**Проблема:** Ошибка при анализе протокола

**Решение:**
1. Проверь API key в `ai.js`
2. Проверь квоту Google AI API
3. Проверь консоль браузера на ошибки
4. Проверь что модель `gemini-2.5-pro` доступна

### Уведомления не приходят
**Проблема:** NotificationCenter пустой

**Решение:**
1. Проверь Firestore rules для коллекции `notifications`
2. Проверь что userId совпадает
3. Проверь консоль на ошибки подписки
4. Проверь что вызываются методы `notificationService.notify...`

### Файлы не загружаются
**Проблема:** Ошибка при загрузке вложений

**Решение:**
1. Проверь Storage rules
2. Проверь лимит размера файла (10MB по умолчанию)
3. Проверь что bucket настроен правильно в `firebase.js`

---

## Production деплой

### Подготовка

1. **Оптимизация сборки**
```bash
npm run build
```

2. **Тестирование production сборки**
```bash
npm run preview
```

### Firebase Hosting
```bash
# Инициализация
firebase init hosting

# Ответы:
# - Public directory: dist
# - Single-page app: Yes
# - Automatic builds: No

# Деплой
firebase deploy --only hosting
```

### Переменные окружения

Создай `.env.production`:
```
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_domain
VITE_FIREBASE_PROJECT_ID=your_production_project_id
VITE_GOOGLE_AI_API_KEY=your_production_ai_key
```

Обнови `firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};
```

---

## Контакты и поддержка

- **Email:** support@agilemind.com
- **Документация:** https://docs.agilemind.com
- **GitHub:** https://github.com/your-org/agile-mind-pro

---

**Версия документации:** 1.0.0  
**Последнее обновление:** 29.11.2025