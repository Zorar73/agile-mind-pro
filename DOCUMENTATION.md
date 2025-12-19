# 📚 AGILE MIND PRO - Полная документация проекта

## 📖 Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Технологический стек](#технологический-стек)
3. [Быстрый старт](#быстрый-старт)
4. [Архитектура приложения](#архитектура-приложения)
5. [Структура проекта](#структура-проекта)
6. [Firebase конфигурация](#firebase-конфигурация)
7. [База данных Firestore](#база-данных-firestore)
8. [Сервисы (Services)](#сервисы-services)
9. [Компоненты (Components)](#компоненты-components)
10. [Страницы (Pages)](#страницы-pages)
11. [Маршрутизация (Routing)](#маршрутизация-routing)
12. [Система прав доступа](#система-прав-доступа)
13. [Стилизация и тема](#стилизация-и-тема)
14. [Инструкции по развертыванию](#инструкции-по-развертыванию)
15. [Troubleshooting](#troubleshooting)
16. [Расширение функциональности](#расширение-функциональности)

---

# 1. Обзор проекта

## Что это?

**Agile Mind Pro** — это корпоративная система управления задачами и проектами с встроенным AI-анализатором. Приложение построено по принципу Kanban-досок (аналог Trello/Jira) с дополнительными функциями для совместной работы команд.

## Основные возможности

### 🎯 Управление задачами
- **Kanban-доски** с колонками и перетаскиванием задач (drag & drop)
- **Календарь** с 5 масштабами просмотра (год, квартал, месяц, неделя, день)
- **Фильтрация** задач по исполнителям, доскам, тегам, приоритетам
- **Приоритеты задач**: обычная, срочная, повторяющаяся
- **Комментарии** с @mentions
- **Вложения** (файлы)
- **История изменений** (activity log)

### 👥 Командная работа
- **Команды** с лидером и участниками
- **Чат команды** с @mentions
- **Приглашения** в команды
- **Общие доски** команды
- **Проекты** (группировка досок и задач)

### 📝 Наброски
- **Личные наброски** (заметки)
- **Шаринг** с пользователями и командами
- **Комментарии** к наброскам
- **Вложения**

### 🤖 AI-функции
- **Анализ протоколов встреч** (извлечение задач)
- **Разделение задач** на подзадачи
- Модель: **Google Gemini 2.5-pro**

### 👤 Пользователи
- **Регистрация** с модерацией (pending → user → admin)
- **Профили** с контактами (WhatsApp, Telegram, телефон)
- **Аватары**: 25 стандартных + генерация + загрузка фото
- **Роли**: pending, user, admin

### 🔔 Уведомления
- **Назначение задач**
- **Комментарии** и **@mentions**
- **Дедлайны**
- **Приглашения в команды**
- **Одобрение пользователя**

---

# 2. Технологический стек

## Frontend

| Технология | Версия | Назначение |
|------------|--------|------------|
| **React** | 19.2.0 | UI библиотека |
| **Vite** | 7.2.5 (rolldown) | Сборщик |
| **Material-UI** | 7.3.5 | UI компоненты |
| **@emotion** | - | Стилизация |
| **React Router DOM** | 7.9.6 | Роутинг |
| **@dnd-kit** | 6.3.1 | Drag & Drop |
| **date-fns** | 4.1.0 | Работа с датами |
| **Recharts** | 3.5.0 | Графики |
| **react-markdown** | 10.1.0 | Markdown рендеринг |

## Backend

| Технология | Назначение |
|------------|------------|
| **Firebase Auth** | Аутентификация |
| **Firestore** | База данных NoSQL |
| **Firebase Storage** | Хранение файлов |

## AI

| Технология | API Key | Модель |
|------------|---------|--------|
| **Google Generative AI** | AIzaSyB8zF91xZeGD4vz92T6_0dEilbrmQieiJs | gemini-2.5-pro |

---

# 3. Быстрый старт

## Предварительные требования

- **Node.js** 18+ (проверь: `node --version`)
- **npm** 9+ (проверь: `npm --version`)
- **Аккаунт Firebase** (создай на https://console.firebase.google.com)
- **Git** (для клонирования репозитория)

## Установка за 5 шагов

### 1️⃣ Клонирование репозитория

```bash
git clone <repository-url>
cd agile-mind-pro/frontend
```

### 2️⃣ Установка зависимостей

```bash
npm install
```

### 3️⃣ Создание конфигурации Firebase

Создай файл `frontend/src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAngTFq2DEJla-q7823XvSfVL2CVOye7Jg",
  authDomain: "agile-mind-pro.firebaseapp.com",
  projectId: "agile-mind-pro",
  storageBucket: "agile-mind-pro.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 4️⃣ Настройка Firestore Rules

В Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function getUserRole() {
      return getUserData().role;
    }
    
    function isAdmin() {
      return isSignedIn() && getUserRole() == 'admin';
    }
    
    function isApproved() {
      return isSignedIn() && getUserRole() != 'pending';
    }

    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if true;
      allow update: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }

    match /userSettings/{userId} {
      allow read, write: if isSignedIn() && request.auth.uid == userId;
    }

    match /boards/{boardId} {
      allow read: if isSignedIn();
      allow create: if isApproved();
      allow update, delete: if isSignedIn();
      
      match /{document=**} {
        allow read, write: if isSignedIn();
      }
    }

    match /teams/{teamId} {
      allow read: if isSignedIn();
      allow create: if isApproved();
      allow update, delete: if isSignedIn();
      
      match /{document=**} {
        allow read, write: if isSignedIn();
      }
    }

    match /sketches/{sketchId} {
      allow read: if isSignedIn();
      allow create: if isApproved();
      allow update, delete: if isSignedIn();
      
      match /{document=**} {
        allow read, write: if isSignedIn();
      }
    }

    match /projects/{projectId} {
      allow read: if isSignedIn();
      allow create: if isApproved();
      allow update, delete: if isSignedIn();
      
      match /{document=**} {
        allow read, write: if isSignedIn();
      }
    }

    match /notifications/{notificationId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 5️⃣ Запуск приложения

```bash
npm run dev
```

Приложение откроется на http://localhost:5173

---

# 4. Архитектура приложения

## Диаграмма архитектуры

```
┌─────────────────────────────────────────────┐
│         React Application (SPA)              │
│  ┌────────────────────────────────────────┐  │
│  │          App.jsx (Root)                │  │
│  │  - UserContext                         │  │
│  │  - Router                              │  │
│  │  - ProtectedRoute                      │  │
│  │  - ThemeProvider                       │  │
│  └────────────────────────────────────────┘  │
│                    │                         │
│    ┌───────────────┴───────────────┐         │
│    ▼                               ▼         │
│  Pages                        Components     │
│  ├─ Dashboard                 ├─ MainLayout  │
│  ├─ Board                     ├─ Sidebar     │
│  ├─ Calendar                  ├─ TaskCard    │
│  ├─ MyTasks                   ├─ TaskModal   │
│  ├─ Team                      ├─ AIAnalyzer  │
│  ├─ Sketches                  └─ ...         │
│  ├─ Users                                    │
│  ├─ Settings                                 │
│  └─ Profile                                  │
│                                              │
│            ▼                                 │
│         Services                             │
│  ├─ auth.service.js                          │
│  ├─ board.service.js                         │
│  ├─ task.service.js                          │
│  ├─ team.service.js                          │
│  ├─ sketch.service.js                        │
│  ├─ notification.service.js                  │
│  ├─ user.service.js                          │
│  └─ ai.service.js                            │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│              Firebase Backend                │
│  ┌────────────┬────────────┬──────────────┐ │
│  │   Auth     │ Firestore  │   Storage    │ │
│  │            │            │              │ │
│  │ - Login    │ - users    │ - avatars    │ │
│  │ - Register │ - boards   │ - task files │ │
│  │ - Logout   │ - tasks    │              │ │
│  │            │ - teams    │              │ │
│  │            │ - sketches │              │ │
│  │            │ - projects │              │ │
│  │            │ - notify   │              │ │
│  └────────────┴────────────┴──────────────┘ │
└─────────────────────────────────────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │  Google Generative AI  │
        │  (Gemini 2.5-pro)      │
        └────────────────────────┘
```

## Паттерны проектирования

### Service Layer Pattern
Вся бизнес-логика вынесена в сервисы.

```javascript
// ❌ Неправильно - логика в компоненте
function BoardPage() {
  const createTask = async () => {
    const taskRef = await addDoc(collection(db, 'tasks'), {...});
  };
}

// ✅ Правильно - логика в сервисе
function BoardPage() {
  const createTask = async () => {
    await taskService.createTask(boardId, taskData, user.uid);
  };
}
```

### Context API для глобального state

```javascript
// App.jsx
export const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {/* ... */}
    </UserContext.Provider>
  );
}

// В любом компоненте
const { user } = useContext(UserContext);
```

### Protected Routes

```javascript
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) return <CircularProgress />;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'pending') return <Navigate to="/pending" />;

  return children;
}
```

### Real-time Subscriptions

```javascript
useEffect(() => {
  const unsubscribe = taskService.subscribeToTasks(boardId, (tasks) => {
    setTasks(tasks);
  });
  
  return () => unsubscribe();
}, [boardId]);
```

---

# 5. Структура проекта

```
agile-mind-pro/
├── frontend/
│   ├── public/
│   │   ├── avatars/                    # 25 SVG аватарок
│   │   │   ├── avatar-1.svg           # 🚀
│   │   │   ├── avatar-2.svg           # ⭐
│   │   │   └── ...
│   │   └── index.html
│   ├── src/
│   │   ├── components/                 # React компоненты
│   │   │   ├── Layout/
│   │   │   │   ├── MainLayout.jsx     # Главный layout
│   │   │   │   └── Sidebar.jsx        # Боковое меню
│   │   │   ├── Kanban/
│   │   │   │   ├── KanbanColumn.jsx   # Колонка доски
│   │   │   │   ├── TaskCard.jsx       # Карточка задачи
│   │   │   │   └── TaskModal.jsx      # Модальное окно
│   │   │   ├── AI/
│   │   │   │   └── AIAnalyzer.jsx     # AI анализатор
│   │   │   ├── Team/
│   │   │   │   ├── CreateTeamDialog.jsx
│   │   │   │   ├── TeamCard.jsx
│   │   │   │   └── UserProfileModal.jsx
│   │   │   ├── Sketch/
│   │   │   │   └── SketchModal.jsx
│   │   │   ├── Profile/
│   │   │   │   └── AvatarSelector.jsx
│   │   │   ├── Notifications/
│   │   │   │   └── NotificationCenter.jsx
│   │   │   └── DebugConsole.jsx
│   │   ├── pages/                      # Страницы
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── BoardPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── MyTasksPage.jsx
│   │   │   ├── TeamPage.jsx
│   │   │   ├── SketchesPage.jsx
│   │   │   ├── UsersPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── PendingApprovalPage.jsx
│   │   ├── services/                   # Сервисы
│   │   │   ├── auth.service.js
│   │   │   ├── board.service.js
│   │   │   ├── task.service.js
│   │   │   ├── team.service.js
│   │   │   ├── sketch.service.js
│   │   │   ├── notification.service.js
│   │   │   ├── user.service.js
│   │   │   └── ai.service.js
│   │   ├── config/
│   │   │   └── firebase.js
│   │   ├── utils/
│   │   │   └── avatarGenerator.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── theme.js
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

# 6. Firebase конфигурация

## Project Info

```
Project ID: agile-mind-pro
API Key: AIzaSyAngTFq2DEJla-q7823XvSfVL2CVOye7Jg
Auth Domain: agile-mind-pro.firebaseapp.com
Storage Bucket: agile-mind-pro.firebasestorage.app
```

## firebase.js

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAngTFq2DEJla-q7823XvSfVL2CVOye7Jg",
  authDomain: "agile-mind-pro.firebaseapp.com",
  projectId: "agile-mind-pro",
  storageBucket: "agile-mind-pro.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## Storage Rules

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /boards/{boardId}/tasks/{taskId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /avatars/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

# 7. База данных Firestore

## Структура коллекций

### 📁 users

```javascript
{
  id: "user_id",                    // Document ID
  email: "user@example.com",
  firstName: "Иван",
  middleName: "Иванович",
  lastName: "Иванов",
  position: "Backend Developer",
  responsibility: "API разработка",
  role: "user",                     // 'pending' | 'user' | 'admin'
  avatar: "generated",              // 'generated' | 'default-1' | 'https://...'
  contacts: {
    whatsapp: "+79991234567",
    telegram: "@username",
    phone: "+79991234567"
  },
  teamLimit: 10,                    // Лимит команд
  teamsCount: 3,                    // Текущее количество
  createdAt: Timestamp,
  approvedBy: "admin_user_id",      // Кто одобрил
  approvedAt: Timestamp
}
```

### 📁 boards

```javascript
{
  id: "board_id",
  title: "Проект X",
  ownerId: "user_id",
  members: {
    "user_id_1": "owner",           // 'owner' | 'editor' | 'viewer'
    "user_id_2": "editor",
    "user_id_3": "viewer"
  },
  columnOrder: [                    // Порядок колонок
    "column_id_1",
    "column_id_2",
    "column_id_3"
  ],
  settings: {
    whoCanMoveToStatus: {
      "column_id_1": ["owner", "editor"],
      "column_id_2": ["owner"]
    }
  },
  createdAt: Timestamp
}
```

### 📁 boards/{boardId}/columns

```javascript
{
  id: "column_id",
  title: "📋 Задача поставлена",
  color: "#1976d2",
  order: 0,
  createdAt: Timestamp
}
```

### 📁 boards/{boardId}/tasks

```javascript
{
  id: "task_id",
  title: "Реализовать авторизацию",
  description: "Markdown описание задачи",
  columnId: "column_id",
  order: 0,
  assigneeId: "user_id",           // Исполнитель
  creatorId: "user_id",            // Создатель
  dueDate: "2024-12-31",           // Дедлайн (строка YYYY-MM-DD)
  priority: "normal",              // 'normal' | 'urgent' | 'recurring'
  tags: ["backend", "security"],
  attachments: [
    {
      name: "design.pdf",
      url: "https://...",
      size: 1024,
      uploadedAt: Timestamp
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 📁 boards/{boardId}/tasks/{taskId}/comments

```javascript
{
  id: "comment_id",
  userId: "user_id",
  text: "Отличная работа! @username",
  mentions: ["user_id_1"],         // Упомянутые пользователи
  createdAt: Timestamp
}
```

### 📁 boards/{boardId}/tasks/{taskId}/activity

```javascript
{
  id: "activity_id",
  type: "task_moved",              // 'task_created' | 'task_moved' | 'task_updated' | ...
  userId: "user_id",
  details: {
    from: "column_id_1",
    to: "column_id_2"
  },
  timestamp: Timestamp,
  changes: {
    field: "columnId",
    oldValue: "column_id_1",
    newValue: "column_id_2"
  }
}
```

### 📁 teams

```javascript
{
  id: "team_id",
  name: "Backend Team",
  description: "Команда backend разработки",
  image: "🚀",                     // Эмодзи или URL
  leaderId: "user_id",             // Лидер команды
  members: {
    "user_id_1": "leader",
    "user_id_2": "member",
    "user_id_3": "member"
  },
  createdAt: Timestamp,
  createdBy: "user_id"
}
```

### 📁 teams/{teamId}/invitations

```javascript
{
  id: "invitation_id",
  teamId: "team_id",
  userId: "user_id",               // Кого приглашают
  invitedBy: "user_id",            // Кто пригласил
  status: "pending",               // 'pending' | 'accepted' | 'rejected'
  createdAt: Timestamp
}
```

### 📁 teams/{teamId}/chat

```javascript
{
  id: "message_id",
  userId: "user_id",
  text: "Привет команда! @username",
  mentions: ["user_id_1"],
  attachments: [
    {
      name: "file.pdf",
      url: "https://...",
      size: 1024,
      uploadedAt: Timestamp
    }
  ],
  createdAt: Timestamp
}
```

### 📁 sketches

```javascript
{
  id: "sketch_id",
  title: "Идея для нового фичи",
  description: "Подробное описание",
  authorId: "user_id",
  sharedWith: {
    users: ["user_id_1", "user_id_2"],
    teams: ["team_id_1"]
  },
  attachments: [
    {
      name: "mockup.png",
      url: "https://...",
      size: 2048,
      uploadedAt: Timestamp
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 📁 sketches/{sketchId}/comments

```javascript
{
  id: "comment_id",
  userId: "user_id",
  text: "Интересная идея! @username",
  mentions: ["user_id_1"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 📁 projects

```javascript
{
  id: "project_id",
  name: "Проект Альфа",
  description: "Описание проекта",
  teamId: "team_id",               // null если личный
  createdBy: "user_id",
  members: {
    "user_id_1": "owner",
    "user_id_2": "editor"
  },
  createdAt: Timestamp
}
```

### 📁 projects/{projectId}/items

```javascript
{
  id: "item_id",
  type: "board",                   // 'board' | 'task' | 'sketch'
  itemId: "board_id",              // ID оригинального элемента
  addedBy: "user_id",
  addedAt: Timestamp
}
```

### 📁 notifications

```javascript
{
  id: "notification_id",
  type: "task_assigned",           // См. типы ниже
  userId: "user_id",               // Кому
  title: "Вам назначена задача",
  message: "Задача 'Реализовать авторизацию' назначена вам",
  taskId: "task_id",               // Опционально
  actorId: "user_id",              // Кто совершил действие
  link: "/board/board_id",         // Куда вести
  read: false,
  createdAt: Timestamp,
  readAt: Timestamp                // Когда прочитано
}
```

**Типы уведомлений:**
- `task_assigned` - Назначена задача
- `task_comment` - Комментарий к задаче
- `task_mention` - Упоминание в комментарии
- `task_deadline` - Приближается дедлайн
- `task_updated` - Задача обновлена
- `team_invitation` - Приглашение в команду
- `team_mention` - Упоминание в чате
- `user_approved` - Пользователь одобрен

### 📁 userSettings

```javascript
{
  id: "user_id",                   // Document ID = userId
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

# 8. Сервисы (Services)

## 8.1 auth.service.js

### Методы

#### register(userData)
Регистрация нового пользователя.

```javascript
// Использование
const result = await authService.register({
  email: "user@example.com",
  password: "password123",
  firstName: "Иван",
  middleName: "Иванович",
  lastName: "Иванов",
  position: "Developer",
  responsibility: "Backend development"
});

if (result.success) {
  console.log('User registered:', result.user);
}
```

**Что происходит:**
1. Создается пользователь в Firebase Auth
2. Создается документ в `users` с ролью `pending`
3. Генерируется аватар `generated`
4. Устанавливается `teamLimit: 10`

#### login(email, password)
Авторизация пользователя.

```javascript
const result = await authService.login("user@example.com", "password123");

if (result.success) {
  console.log('Logged in:', result.user);
  // result.user содержит данные из Firestore
}
```

#### logout()
Выход из системы.

```javascript
await authService.logout();
```

#### getCurrentUser()
Получить текущего пользователя.

```javascript
const user = await authService.getCurrentUser();
console.log(user); // { uid, email, firstName, ... }
```

#### onAuthStateChanged(callback)
Подписка на изменение статуса авторизации.

```javascript
useEffect(() => {
  const unsubscribe = authService.onAuthStateChanged((currentUser) => {
    setUser(currentUser);
    setLoading(false);
  });
  
  return () => unsubscribe();
}, []);
```

---

## 8.2 board.service.js

### Методы

#### createBoard(title, ownerId)
Создать доску с дефолтными колонками.

```javascript
const result = await boardService.createBoard("Проект X", user.uid);

if (result.success) {
  console.log('Board created:', result.id);
}
```

**Дефолтные колонки:**
1. 📋 Задача поставлена
2. 🔨 В работе
3. 🔍 Согласование
4. ✅ Готово
5. ⏸️ Отложена
6. ❌ Отменена

#### getUserBoards(userId)
Получить все доски пользователя.

```javascript
const result = await boardService.getUserBoards(user.uid);

if (result.success) {
  console.log('Boards:', result.boards);
}
```

#### subscribeToUserBoards(userId, callback)
Real-time подписка на доски.

```javascript
useEffect(() => {
  const unsubscribe = boardService.subscribeToUserBoards(user.uid, (boards) => {
    setBoards(boards);
  });
  
  return () => unsubscribe();
}, [user.uid]);
```

#### subscribeToBoard(boardId, callback)
Подписка на конкретную доску.

```javascript
useEffect(() => {
  const unsubscribe = boardService.subscribeToBoard(boardId, (board) => {
    setBoard(board);
  });
  
  return () => unsubscribe();
}, [boardId]);
```

#### subscribeToColumns(boardId, callback)
Подписка на колонки доски.

```javascript
useEffect(() => {
  const unsubscribe = boardService.subscribeToColumns(boardId, (columns) => {
    setColumns(columns);
  });
  
  return () => unsubscribe();
}, [boardId]);
```

#### addColumn(boardId, title, color)
Добавить колонку.

```javascript
await boardService.addColumn(boardId, "🎉 Готово к деплою", "#4caf50");
```

#### deleteColumn(boardId, columnId)
Удалить колонку.

```javascript
await boardService.deleteColumn(boardId, columnId);
```

#### updateBoardTitle(boardId, newTitle)
Обновить название доски.

```javascript
await boardService.updateBoardTitle(boardId, "Новое название");
```

#### updateColumnTitle(boardId, columnId, newTitle)
Обновить название колонки.

```javascript
await boardService.updateColumnTitle(boardId, columnId, "✨ Новое название");
```

#### addMember(boardId, userId, role)
Добавить участника на доску.

```javascript
await boardService.addMember(boardId, userId, "editor"); // 'owner' | 'editor' | 'viewer'
```

#### removeMember(boardId, userId)
Удалить участника.

```javascript
await boardService.removeMember(boardId, userId);
```

#### updateMovePermissions(boardId, columnId, roles)
Настроить кто может перемещать в колонку.

```javascript
await boardService.updateMovePermissions(boardId, columnId, ["owner", "editor"]);
```

---

## 8.3 task.service.js

### Методы

#### createTask(boardId, taskData, userId)
Создать задачу.

```javascript
const result = await taskService.createTask(boardId, {
  title: "Реализовать API",
  description: "Создать REST API для авторизации",
  columnId: columnId,
  priority: "urgent",
  tags: ["backend", "api"],
  dueDate: "2024-12-31"
}, user.uid);
```

#### getTasks(boardId)
Получить все задачи доски.

```javascript
const result = await taskService.getTasks(boardId);
console.log(result.tasks);
```

#### subscribeToTasks(boardId, callback)
Real-time подписка на задачи.

```javascript
useEffect(() => {
  const unsubscribe = taskService.subscribeToTasks(boardId, (tasks) => {
    setTasks(tasks);
  });
  
  return () => unsubscribe();
}, [boardId]);
```

#### getTask(boardId, taskId)
Получить конкретную задачу.

```javascript
const result = await taskService.getTask(boardId, taskId);
console.log(result.task);
```

#### subscribeToTask(boardId, taskId, callback)
Подписка на задачу.

```javascript
useEffect(() => {
  const unsubscribe = taskService.subscribeToTask(boardId, taskId, (task) => {
    setTask(task);
  });
  
  return () => unsubscribe();
}, [boardId, taskId]);
```

#### updateTask(boardId, taskId, updates, userId)
Обновить задачу с логированием изменений.

```javascript
await taskService.updateTask(boardId, taskId, {
  title: "Новое название",
  priority: "urgent"
}, user.uid);
```

**Автоматически:**
- Логирует изменения в `activity`
- Обновляет `updatedAt`

#### moveTask(boardId, taskId, newColumnId, newOrder, userId)
Переместить задачу в другую колонку.

```javascript
await taskService.moveTask(boardId, taskId, newColumnId, 0, user.uid);
```

**Автоматически:**
- Проверяет права доступа (`whoCanMoveToStatus`)
- Логирует перемещение

#### deleteTask(boardId, taskId)
Удалить задачу.

```javascript
await taskService.deleteTask(boardId, taskId);
```

**Автоматически:**
- Удаляет все вложения из Storage
- Удаляет комментарии
- Удаляет activity

#### uploadFile(boardId, taskId, file)
Загрузить файл.

```javascript
const result = await taskService.uploadFile(boardId, taskId, file);

if (result.success) {
  console.log('File URL:', result.url);
  console.log('File name:', result.name);
}
```

**Путь в Storage:**
`boards/{boardId}/tasks/{taskId}/{timestamp}_{filename}`

#### deleteFile(url)
Удалить файл.

```javascript
await taskService.deleteFile(fileUrl);
```

#### addComment(boardId, taskId, userId, text, mentions)
Добавить комментарий.

```javascript
const result = await taskService.addComment(
  boardId,
  taskId,
  user.uid,
  "Отличная работа! @username",
  ["user_id_1"]
);
```

**Автоматически:**
- Отправляет уведомления упомянутым пользователям

#### deleteComment(boardId, taskId, commentId)
Удалить комментарий.

```javascript
await taskService.deleteComment(boardId, taskId, commentId);
```

#### subscribeToComments(boardId, taskId, callback)
Подписка на комментарии.

```javascript
useEffect(() => {
  const unsubscribe = taskService.subscribeToComments(boardId, taskId, (comments) => {
    setComments(comments);
  });
  
  return () => unsubscribe();
}, [boardId, taskId]);
```

#### logActivity(boardId, taskId, type, userId, details, changes)
Залогировать действие (используется внутри сервиса).

```javascript
await taskService.logActivity(
  boardId,
  taskId,
  "task_updated",
  user.uid,
  { field: "title" },
  { oldValue: "Старое", newValue: "Новое" }
);
```

#### getActivity(boardId, taskId)
Получить историю изменений.

```javascript
const result = await taskService.getActivity(boardId, taskId);
console.log(result.activities);
```

#### subscribeToActivity(boardId, taskId, callback)
Подписка на activity.

```javascript
useEffect(() => {
  const unsubscribe = taskService.subscribeToActivity(boardId, taskId, (activities) => {
    setActivities(activities);
  });
  
  return () => unsubscribe();
}, [boardId, taskId]);
```

---

## 8.4 team.service.js

### Методы

#### createTeam(teamData, userId)
Создать команду.

```javascript
const result = await teamService.createTeam({
  name: "Backend Team",
  description: "Команда backend разработки",
  image: "🚀",
  members: ["user_id_1", "user_id_2"] // Опционально - для отправки приглашений
}, user.uid);

if (result.success) {
  console.log('Team ID:', result.id);
}
```

**Автоматически:**
- Создатель становится лидером
- Увеличивается `teamsCount` пользователя
- Отправляются приглашения указанным пользователям

#### getUserTeams(userId)
Получить команды пользователя.

```javascript
const result = await teamService.getUserTeams(user.uid);
console.log(result.teams);
```

#### subscribeToUserTeams(userId, callback)
Real-time подписка.

```javascript
useEffect(() => {
  const unsubscribe = teamService.subscribeToUserTeams(user.uid, (teams) => {
    setTeams(teams);
  });
  
  return () => unsubscribe();
}, [user.uid]);
```

#### inviteUser(teamId, userId, invitedBy)
Пригласить пользователя (только лидер).

```javascript
const result = await teamService.inviteUser(teamId, userId, user.uid);
```

**Автоматически:**
- Создает приглашение со статусом `pending`
- Отправляет уведомление `team_invitation`

#### getUserInvitations(userId)
Получить приглашения пользователя.

```javascript
const result = await teamService.getUserInvitations(user.uid);
console.log(result.invitations);
```

#### acceptInvitation(teamId, invitationId, userId)
Принять приглашение.

```javascript
await teamService.acceptInvitation(teamId, invitationId, user.uid);
```

**Автоматически:**
- Добавляет в `members` с ролью `member`
- Увеличивает `teamsCount`
- Меняет статус на `accepted`

#### rejectInvitation(teamId, invitationId)
Отклонить приглашение.

```javascript
await teamService.rejectInvitation(teamId, invitationId);
```

#### leaveTeam(teamId, userId)
Выйти из команды.

```javascript
const result = await teamService.leaveTeam(teamId, user.uid);

if (!result.success) {
  alert(result.message); // "Лидер не может выйти из команды"
}
```

#### removeMember(teamId, userId, removedBy)
Удалить участника (только лидер).

```javascript
await teamService.removeMember(teamId, userId, user.uid);
```

#### deleteTeam(teamId, userId)
Удалить команду (только лидер).

```javascript
await teamService.deleteTeam(teamId, user.uid);
```

**Автоматически:**
- Уменьшает `teamsCount` у всех участников
- Удаляет всю подколлекцию (invitations, chat)

#### sendMessage(teamId, userId, text, mentions, attachments)
Отправить сообщение в чат.

```javascript
await teamService.sendMessage(
  teamId,
  user.uid,
  "Привет команда! @username",
  ["user_id_1"],
  []
);
```

**Автоматически:**
- Отправляет уведомления `team_mention` упомянутым

#### subscribeToChat(teamId, callback)
Подписка на чат команды.

```javascript
useEffect(() => {
  const unsubscribe = teamService.subscribeToChat(teamId, (messages) => {
    setMessages(messages);
  });
  
  return () => unsubscribe();
}, [teamId]);
```

---

## 8.5 sketch.service.js

### Методы

#### createSketch(sketchData, userId)
Создать набросок.

```javascript
const result = await sketchService.createSketch({
  title: "Идея для фичи",
  description: "Подробное описание"
}, user.uid);
```

#### getUserSketches(userId)
Получить наброски пользователя.

```javascript
const result = await sketchService.getUserSketches(user.uid);
```

#### getAccessibleSketches(userId, userTeams)
Получить доступные наброски (свои + shared).

```javascript
const result = await sketchService.getAccessibleSketches(
  user.uid,
  ["team_id_1", "team_id_2"]
);
```

#### subscribeToSketch(sketchId, callback)
Подписка на набросок.

```javascript
useEffect(() => {
  const unsubscribe = sketchService.subscribeToSketch(sketchId, (sketch) => {
    setSketch(sketch);
  });
  
  return () => unsubscribe();
}, [sketchId]);
```

#### updateSketch(sketchId, updates)
Обновить набросок.

```javascript
await sketchService.updateSketch(sketchId, {
  title: "Новое название",
  description: "Обновленное описание"
});
```

#### shareWithUser(sketchId, userId)
Поделиться с пользователем.

```javascript
await sketchService.shareWithUser(sketchId, userId);
```

#### shareWithTeam(sketchId, teamId)
Поделиться с командой.

```javascript
await sketchService.shareWithTeam(sketchId, teamId);
```

#### addComment(sketchId, userId, text, mentions)
Добавить комментарий.

```javascript
await sketchService.addComment(
  sketchId,
  user.uid,
  "Интересная идея! @username",
  ["user_id_1"]
);
```

#### updateComment(sketchId, commentId, text)
Обновить комментарий.

```javascript
await sketchService.updateComment(sketchId, commentId, "Исправленный текст");
```

#### deleteComment(sketchId, commentId)
Удалить комментарий.

```javascript
await sketchService.deleteComment(sketchId, commentId);
```

#### subscribeToComments(sketchId, callback)
Подписка на комментарии.

```javascript
useEffect(() => {
  const unsubscribe = sketchService.subscribeToComments(sketchId, (comments) => {
    setComments(comments);
  });
  
  return () => unsubscribe();
}, [sketchId]);
```

#### deleteSketch(sketchId)
Удалить набросок.

```javascript
await sketchService.deleteSketch(sketchId);
```

---

## 8.6 notification.service.js

### Константы

```javascript
const TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMMENT: 'task_comment',
  TASK_MENTION: 'task_mention',
  TASK_DEADLINE: 'task_deadline',
  TASK_UPDATED: 'task_updated',
  TEAM_INVITATION: 'team_invitation',
  TEAM_MENTION: 'team_mention',
  USER_APPROVED: 'user_approved'
};
```

### Методы

#### create(notificationData)
Создать уведомление.

```javascript
await notificationService.create({
  type: 'task_assigned',
  userId: 'user_id',
  title: 'Новая задача',
  message: 'Вам назначена задача "Реализовать API"',
  taskId: 'task_id',
  actorId: user.uid,
  link: '/board/board_id'
});
```

**Автоматически:**
- Проверяет настройки email уведомлений
- Отправляет email если включено (пока не реализовано)

#### subscribeToUserNotifications(userId, callback)
Подписка на уведомления пользователя.

```javascript
useEffect(() => {
  const unsubscribe = notificationService.subscribeToUserNotifications(
    user.uid,
    (notifications) => {
      setNotifications(notifications);
    }
  );
  
  return () => unsubscribe();
}, [user.uid]);
```

#### getUnreadCount(userId)
Получить количество непрочитанных.

```javascript
const count = await notificationService.getUnreadCount(user.uid);
```

#### markAsRead(notificationId)
Отметить как прочитанное.

```javascript
await notificationService.markAsRead(notificationId);
```

#### markAllAsRead(userId)
Отметить все как прочитанные.

```javascript
await notificationService.markAllAsRead(user.uid);
```

#### Специализированные методы

##### notifyTaskAssigned(taskId, assigneeId, taskTitle, actorId, boardId)

```javascript
await notificationService.notifyTaskAssigned(
  taskId,
  assigneeId,
  "Реализовать API",
  user.uid,
  boardId
);
```

##### notifyTaskComment(taskId, taskTitle, commentText, authorId, boardId)

```javascript
await notificationService.notifyTaskComment(
  taskId,
  "Реализовать API",
  "Отличная работа!",
  user.uid,
  boardId
);
```

##### notifyTaskMention(taskId, mentionedUserId, taskTitle, authorId, boardId)

```javascript
await notificationService.notifyTaskMention(
  taskId,
  mentionedUserId,
  "Реализовать API",
  user.uid,
  boardId
);
```

##### notifyTaskDeadline(taskId, assigneeId, taskTitle, dueDate, boardId)

```javascript
await notificationService.notifyTaskDeadline(
  taskId,
  assigneeId,
  "Реализовать API",
  "2024-12-31",
  boardId
);
```

##### notifyUserApproved(userId)

```javascript
await notificationService.notifyUserApproved(userId);
```

---

## 8.7 user.service.js

### Методы

#### getAllUsers()
Получить всех пользователей.

```javascript
const result = await userService.getAllUsers();
console.log(result.users);
```

#### subscribeToUsers(callback)
Real-time подписка на пользователей.

```javascript
useEffect(() => {
  const unsubscribe = userService.subscribeToUsers((users) => {
    setUsers(users);
  });
  
  return () => unsubscribe();
}, []);
```

#### getPendingUsers()
Получить пользователей на модерации.

```javascript
const result = await userService.getPendingUsers();
console.log(result.users); // role === 'pending'
```

#### approveUser(userId, approvedBy)
Одобрить пользователя.

```javascript
await userService.approveUser(userId, user.uid);
```

**Автоматически:**
- Меняет роль `pending` → `user`
- Устанавливает `approvedBy` и `approvedAt`
- Отправляет уведомление `user_approved`

#### rejectUser(userId)
Отклонить пользователя.

```javascript
await userService.rejectUser(userId);
```

**Удаляет пользователя из Firestore.**

#### changeUserRole(userId, newRole)
Изменить роль пользователя.

```javascript
await userService.changeUserRole(userId, "admin"); // 'user' | 'admin'
```

#### getUser(userId)
Получить конкретного пользователя.

```javascript
const result = await userService.getUser(userId);
console.log(result.user);
```

#### updateAvatar(userId, avatar)
Обновить аватар.

```javascript
await userService.updateAvatar(user.uid, "default-5"); // или 'generated' или URL
```

#### updateContacts(userId, contacts)
Обновить контакты.

```javascript
await userService.updateContacts(user.uid, {
  whatsapp: "+79991234567",
  telegram: "@username",
  phone: "+79991234567"
});
```

#### updateTeamLimit(userId, newLimit)
Обновить лимит команд (только админ).

```javascript
await userService.updateTeamLimit(userId, 20);
```

#### updateUserData(userId, updates)
Обновить любые данные пользователя.

```javascript
await userService.updateUserData(user.uid, {
  firstName: "Иван",
  position: "Senior Developer",
  contacts: { ... }
});
```

---

## 8.8 ai.service.js

### Конфигурация

```javascript
const API_KEY = "AIzaSyB8zF91xZeGD4vz92T6_0dEilbrmQieiJs";
const MODEL_NAME = "gemini-2.5-pro";

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};
```

### Методы

#### analyzeRecap(recapText, context)
Анализ протокола встречи.

```javascript
const result = await aiService.analyzeRecap(
  "Протокол встречи: обсудили новый API...",
  {
    boards: boards,
    tags: allTags,
    users: users
  }
);

if (result.success) {
  console.log('Tasks:', result.tasks);
  console.log('Summary:', result.summary);
  console.log('Action Items:', result.actionItems);
}
```

**Формат ответа AI:**
```json
{
  "tasks": [
    {
      "title": "Реализовать REST API",
      "description": "Создать endpoints для авторизации",
      "boardId": "board_id",
      "assigneeId": "user_id",
      "priority": "urgent",
      "tags": ["backend", "api"],
      "dueDate": "2024-12-31"
    }
  ],
  "summary": "Краткое резюме встречи",
  "actionItems": ["Пункт 1", "Пункт 2"]
}
```

#### splitTask(task, context)
Разделение задачи на подзадачи.

```javascript
const result = await aiService.splitTask(
  {
    title: "Реализовать систему авторизации",
    description: "Полная система с JWT токенами"
  },
  {
    boards: boards,
    tags: allTags,
    users: users
  }
);

if (result.success) {
  console.log('Subtasks:', result.subtasks);
}
```

**Формат ответа AI:**
```json
{
  "subtasks": [
    {
      "title": "Настроить JWT библиотеку",
      "description": "Установить и настроить jsonwebtoken",
      "estimatedTime": "2 часа"
    },
    {
      "title": "Создать endpoint /login",
      "description": "Реализовать авторизацию пользователя",
      "estimatedTime": "4 часа"
    }
  ]
}
```

#### buildSystemPrompt(boards, tags, users)
Построить системный промпт (используется внутри).

```javascript
const prompt = aiService.buildSystemPrompt(boards, tags, users);
```

**Содержит:**
- Список досок с ID
- Список тегов
- Список пользователей с ID
- Инструкции по формату ответа

#### parseAIResponse(text)
Парсинг ответа AI (используется внутри).

```javascript
const parsed = aiService.parseAIResponse(aiResponseText);
console.log(parsed); // JSON объект
```

**Обрабатывает:**
- Извлекает JSON из markdown кода
- Убирает ```json и ```
- Парсит JSON

---

# 9. Компоненты (Components)

## 9.1 Layout/MainLayout.jsx

Главный layout приложения.

### Props

```javascript
{
  children: ReactNode,      // Содержимое страницы
  title: string,            // Заголовок в AppBar
  showAppBar: boolean       // Показывать ли AppBar (default: true)
}
```

### Использование

```javascript
<MainLayout title="Календарь">
  <CalendarPage />
</MainLayout>
```

### Что включает

- **Sidebar** - боковое меню
- **AppBar** - верхняя панель с заголовком
- **NotificationCenter** - иконка уведомлений
- **DebugConsole** - кнопка отладки (🐛)
- **Content area** - область контента с padding

### State

```javascript
const [sidebarOpen, setSidebarOpen] = useState(true);
const [boards, setBoards] = useState([]);
const [debugOpen, setDebugOpen] = useState(false);
```

### Подписки

```javascript
useEffect(() => {
  const unsubscribe = boardService.subscribeToUserBoards(user.uid, (boards) => {
    setBoards(boards);
  });
  
  return () => unsubscribe();
}, [user]);
```

---

## 9.2 Layout/Sidebar.jsx

Боковое меню навигации.

### Props

```javascript
{
  open: boolean,           // Открыт ли sidebar
  onClose: function,       // Callback при закрытии
  boards: Array            // Список досок для отображения
}
```

### Структура меню

```javascript
const menuItems = [
  { title: 'Главная', icon: <Dashboard />, path: '/' },
  { title: 'Календарь', icon: <Event />, path: '/calendar' },
  { title: 'Мои задачи', icon: <Assignment />, path: '/my-tasks' },
  { title: 'Команда', icon: <Group />, path: '/team' },
  { title: 'Наброски', icon: <Description />, path: '/sketches' },
];

// Только для админов
if (user?.role === 'admin') {
  menuItems.push({ title: 'Пользователи', icon: <People />, path: '/users' });
}

menuItems.push(
  { title: 'Настройки', icon: <Settings />, path: '/settings' },
  { title: 'Профиль', icon: <Person />, path: '/profile' }
);
```

### Особенности

- **Collapsible доски** - первые 5 досок с возможностью раскрытия
- **Профиль пользователя** - аватар, имя, должность
- **Тема** - переключатель темной темы
- **Выход** - кнопка logout

---

## 9.3 Kanban/KanbanColumn.jsx

Колонка Kanban доски.

### Props

```javascript
{
  column: {
    id: string,
    title: string,
    color: string
  },
  tasks: Array,            // Задачи в колонке
  onTaskClick: function,   // Клик по задаче
  onTaskMove: function,    // Перемещение задачи
  board: Object            // Доска (для проверки прав)
}
```

### Использование

```javascript
<KanbanColumn
  column={column}
  tasks={tasksInColumn}
  onTaskClick={(task) => setSelectedTask(task)}
  onTaskMove={(taskId, newColumnId) => handleMove(taskId, newColumnId)}
  board={board}
/>
```

### Drag & Drop

Использует **@dnd-kit**:

```javascript
<SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
  {tasks.map(task => (
    <SortableTaskCard key={task.id} task={task} />
  ))}
</SortableContext>
```

---

## 9.4 Kanban/TaskCard.jsx

Карточка задачи на доске.

### Props

```javascript
{
  task: {
    id: string,
    title: string,
    description: string,
    priority: string,
    tags: Array,
    assigneeId: string,
    dueDate: string
  },
  onClick: function,       // Клик по карточке
  users: Array             // Список пользователей
}
```

### Отображение

```javascript
<Card onClick={() => onClick(task)}>
  <CardContent>
    {/* Приоритет */}
    {task.priority === 'urgent' && <Chip label="Срочно" color="error" />}
    
    {/* Заголовок */}
    <Typography variant="h6">{task.title}</Typography>
    
    {/* Теги */}
    {task.tags.map(tag => <Chip key={tag} label={tag} />)}
    
    {/* Исполнитель */}
    <Avatar src={getAssigneeAvatar()} />
    
    {/* Дедлайн */}
    {task.dueDate && <Typography>{formatDate(task.dueDate)}</Typography>}
  </CardContent>
</Card>
```

### Цвета приоритетов

```javascript
const priorityColors = {
  normal: 'default',
  urgent: 'error',
  recurring: 'info'
};
```

---

## 9.5 Kanban/TaskModal.jsx

Модальное окно задачи.

### Props

```javascript
{
  open: boolean,
  onClose: function,
  task: Object,
  boardId: string,
  onUpdate: function       // Callback после обновления
}
```

### Tabs

1. **Детали** - описание, assignee, priority, tags, dueDate
2. **Комментарии** - список комментариев с возможностью добавления
3. **Вложения** - файлы с возможностью загрузки/удаления
4. **История** - activity log

### Функционал

```javascript
// Обновление задачи
const handleUpdate = async (field, value) => {
  await taskService.updateTask(boardId, task.id, {
    [field]: value
  }, user.uid);
};

// Добавление комментария
const handleAddComment = async () => {
  const mentions = extractMentions(commentText);
  await taskService.addComment(boardId, task.id, user.uid, commentText, mentions);
  setCommentText('');
};

// Загрузка файла
const handleFileUpload = async (file) => {
  const result = await taskService.uploadFile(boardId, task.id, file);
  if (result.success) {
    // Обновить список вложений
  }
};
```

### @mentions

```javascript
const extractMentions = (text) => {
  const regex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const username = match[1];
    const user = users.find(u => 
      u.firstName.toLowerCase() === username.toLowerCase()
    );
    if (user) mentions.push(user.id);
  }
  
  return mentions;
};
```

---

## 9.6 AI/AIAnalyzer.jsx

AI анализатор протоколов встреч.

### Props

```javascript
{
  open: boolean,
  onClose: function,
  boards: Array,
  users: Array,
  allTags: Array,
  onTasksCreated: function  // Callback после создания задач
}
```

### Использование

```javascript
<AIAnalyzer
  open={analyzerOpen}
  onClose={() => setAnalyzerOpen(false)}
  boards={boards}
  users={users}
  allTags={allTags}
  onTasksCreated={() => {
    loadTasks();
    setAnalyzerOpen(false);
  }}
/>
```

### Процесс анализа

```javascript
const handleAnalyze = async () => {
  setAnalyzing(true);
  
  // 1. Анализ протокола
  const result = await aiService.analyzeRecap(recapText, {
    boards,
    tags: allTags,
    users
  });
  
  if (result.success) {
    // 2. Показать предложенные задачи
    setSuggestedTasks(result.tasks);
    setSummary(result.summary);
    setActionItems(result.actionItems);
  }
  
  setAnalyzing(false);
};

const handleCreateTasks = async () => {
  // 3. Создать выбранные задачи
  for (const task of selectedTasks) {
    await taskService.createTask(task.boardId, task, user.uid);
  }
  
  onTasksCreated();
};
```

### UI

```javascript
<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
  <DialogTitle>AI Анализатор протоколов</DialogTitle>
  <DialogContent>
    {/* Textarea для ввода протокола */}
    <TextField
      multiline
      rows={10}
      value={recapText}
      onChange={(e) => setRecapText(e.target.value)}
      placeholder="Вставьте текст протокола встречи..."
    />
    
    {analyzing && <CircularProgress />}
    
    {/* Результаты анализа */}
    {summary && <Alert severity="info">{summary}</Alert>}
    
    {/* Список задач */}
    {suggestedTasks.map(task => (
      <Card key={task.id}>
        <Checkbox
          checked={selectedTasks.includes(task)}
          onChange={() => toggleTask(task)}
        />
        <Typography>{task.title}</Typography>
        {/* ... */}
      </Card>
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleAnalyze} disabled={!recapText}>
      Анализировать
    </Button>
    <Button onClick={handleCreateTasks} disabled={!selectedTasks.length}>
      Создать задачи ({selectedTasks.length})
    </Button>
  </DialogActions>
</Dialog>
```

---

## 9.7 Team/CreateTeamDialog.jsx

Диалог создания команды.

### Props

```javascript
{
  open: boolean,
  onClose: function,
  onCreated: function      // Callback после создания
}
```

### Функционал

```javascript
const [formData, setFormData] = useState({
  name: '',
  description: '',
  image: '🚀',            // Эмодзи аватар команды
  members: []             // Выбранные участники
});

const handleCreate = async () => {
  const result = await teamService.createTeam(formData, user.uid);
  
  if (result.success) {
    // Отправить приглашения
    for (const userId of formData.members) {
      await teamService.inviteUser(result.id, userId, user.uid);
    }
    
    onCreated();
    onClose();
  }
};
```

### UI элементы

1. **Выбор аватара команды** - сетка эмодзи
2. **Название команды** - TextField
3. **Описание** - TextField multiline
4. **Выбор участников** - Select multiple с чипами

---

## 9.8 Team/UserProfileModal.jsx

Модальное окно профиля пользователя.

### Props

```javascript
{
  open: boolean,
  onClose: function,
  user: Object,            // Просматриваемый пользователь
  currentUser: Object      // Текущий пользователь
}
```

### Функционал

```javascript
const canEdit = currentUser.role === 'admin' || currentUser.uid === user.id;

const [isEditing, setIsEditing] = useState(false);
const [editData, setEditData] = useState({...});

const handleSave = async () => {
  await userService.updateUserData(user.id, editData);
  setIsEditing(false);
};
```

### Отображение

1. **Аватар** с возможностью изменения
2. **ФИО, должность, ответственность**
3. **Контакты** с иконками WhatsApp, Telegram, Email
4. **Доски** - список общих досок с ролями
5. **Кнопки редактирования** (если есть права)

### Контакты

```javascript
const openWhatsApp = () => {
  const phone = user.contacts?.whatsapp || user.contacts?.phone;
  if (phone) {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  }
};

const openTelegram = () => {
  const telegram = user.contacts?.telegram;
  if (telegram) {
    const username = telegram.startsWith('@') ? telegram.slice(1) : telegram;
    window.open(`https://t.me/${username}`, '_blank');
  }
};
```

---

## 9.9 Sketch/SketchModal.jsx

Модальное окно наброска.

### Props

```javascript
{
  open: boolean,
  onClose: function,
  sketch: Object,
  teams: Array             // Команды для шаринга
}
```

### Tabs

1. **Описание** - текст наброска
2. **Комментарии** - обсуждение

### Функционал

```javascript
// Редактирование (только автор)
const [isEditing, setIsEditing] = useState(false);

const handleSave = async () => {
  await sketchService.updateSketch(sketch.id, {
    title: editData.title,
    description: editData.description
  });
  setIsEditing(false);
};

// Шаринг
const handleShare = async () => {
  if (shareType === 'user') {
    await sketchService.shareWithUser(sketch.id, shareTarget);
  } else {
    await sketchService.shareWithTeam(sketch.id, shareTarget);
  }
};

// Комментарии
const handleAddComment = async () => {
  const mentions = extractMentions(newComment);
  await sketchService.addComment(sketch.id, user.uid, newComment, mentions);
  setNewComment('');
};
```

---

## 9.10 Profile/AvatarSelector.jsx

Диалог выбора аватара.

### Props

```javascript
{
  open: boolean,
  onClose: function,
  onSelect: function,      // Callback с выбранным аватаром
  currentAvatar: string,
  firstName: string,
  lastName: string
}
```

### Tabs

1. **Стандартные** - 25 SVG аватарок
2. **Генерация** - буква на цветном фоне

### Использование

```javascript
<AvatarSelector
  open={avatarSelectorOpen}
  onClose={() => setAvatarSelectorOpen(false)}
  onSelect={async (avatar) => {
    await userService.updateAvatar(user.uid, avatar);
    setUser({ ...user, avatar });
  }}
  currentAvatar={user.avatar}
  firstName={user.firstName}
  lastName={user.lastName}
/>
```

### Генерация аватара

```javascript
import { generateLetterAvatar } from '../../utils/avatarGenerator';

const avatarSrc = generateLetterAvatar(firstName, lastName);
// Возвращает data:image/svg+xml;base64,...
```

---

## 9.11 Notifications/NotificationCenter.jsx

Центр уведомлений в AppBar.

### State

```javascript
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [anchorEl, setAnchorEl] = useState(null);
```

### Real-time подписка

```javascript
useEffect(() => {
  const unsubscribe = notificationService.subscribeToUserNotifications(
    user.uid,
    (notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    }
  );
  
  return () => unsubscribe();
}, [user.uid]);
```

### UI

```javascript
<IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
  <Badge badgeContent={unreadCount} color="error">
    <Notifications />
  </Badge>
</IconButton>

<Menu anchorEl={anchorEl} open={Boolean(anchorEl)}>
  {notifications.map(notification => (
    <MenuItem
      key={notification.id}
      onClick={() => {
        notificationService.markAsRead(notification.id);
        navigate(notification.link);
      }}
      sx={{
        bgcolor: notification.read ? 'transparent' : 'action.hover'
      }}
    >
      {/* Иконка по типу */}
      <ListItemIcon>
        {getNotificationIcon(notification.type)}
      </ListItemIcon>
      
      {/* Текст */}
      <ListItemText
        primary={notification.title}
        secondary={notification.message}
      />
      
      {/* Время */}
      <Typography variant="caption">
        {formatDistanceToNow(notification.createdAt, { locale: ru })}
      </Typography>
    </MenuItem>
  ))}
  
  <Divider />
  <MenuItem onClick={() => notificationService.markAllAsRead(user.uid)}>
    Прочитать все
  </MenuItem>
</Menu>
```

### Иконки по типам

```javascript
const getNotificationIcon = (type) => {
  switch (type) {
    case 'task_assigned': return <Assignment />;
    case 'task_comment': return <Comment />;
    case 'task_mention': return <AlternateEmail />;
    case 'task_deadline': return <Event />;
    case 'team_invitation': return <Group />;
    case 'user_approved': return <CheckCircle />;
    default: return <Notifications />;
  }
};
```

---

## 9.12 DebugConsole.jsx

Консоль отладки.

### Функционал

- Перехват `console.error` и `console.warn`
- Хранение логов в `window.appLogs`
- Экспорт логов в JSON
- Очистка логов

### Открытие

```javascript
// В MainLayout.jsx
<Fab
  color="error"
  sx={{ position: 'fixed', bottom: 88, right: 24 }}
  onClick={() => setDebugOpen(true)}
>
  <BugReport />
</Fab>

<DebugConsole open={debugOpen} onClose={() => setDebugOpen(false)} />
```

### Перехват логов

```javascript
// Глобальное хранилище
window.appLogs = window.appLogs || [];

// Перехват console.error
const originalError = console.error;
console.error = (...args) => {
  originalError(...args);
  window.appLogs.push({
    type: 'error',
    message: args.join(' '),
    timestamp: new Date(),
    stack: new Error().stack
  });
};
```

### UI

```javascript
<Drawer anchor="right" open={open} onClose={onClose}>
  <Box sx={{ width: 500, p: 2 }}>
    <Typography variant="h6">Debug Console</Typography>
    
    <Button onClick={downloadLogs}>
      <Download /> Экспорт логов
    </Button>
    
    <Button onClick={() => window.appLogs = []}>
      <Delete /> Очистить
    </Button>
    
    <List>
      {logs.map((log, index) => (
        <ListItem key={index}>
          <Chip
            label={log.type}
            color={log.type === 'error' ? 'error' : 'warning'}
          />
          <Typography>{log.message}</Typography>
          <Typography variant="caption">
            {format(log.timestamp, 'HH:mm:ss')}
          </Typography>
        </ListItem>
      ))}
    </List>
  </Box>
</Drawer>
```

---

# 10. Страницы (Pages)

## 10.1 LoginPage.jsx

Страница входа.

### State

```javascript
const [formData, setFormData] = useState({
  email: '',
  password: ''
});
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```

### Логин

```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  const result = await authService.login(formData.email, formData.password);
  
  if (result.success) {
    setUser(result.user);
    navigate('/');
  } else {
    setError(result.message);
  }
  
  setLoading(false);
};
```

### UI

```javascript
<Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
  <Typography variant="h4">Вход</Typography>
  
  {error && <Alert severity="error">{error}</Alert>}
  
  <form onSubmit={handleLogin}>
    <TextField
      fullWidth
      label="Email"
      type="email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    />
    
    <TextField
      fullWidth
      label="Пароль"
      type="password"
      value={formData.password}
      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
    />
    
    <Button
      fullWidth
      type="submit"
      variant="contained"
      disabled={loading}
    >
      {loading ? <CircularProgress size={24} /> : 'Войти'}
    </Button>
  </form>
  
  <Link to="/register">Регистрация</Link>
</Box>
```

---

## 10.2 RegisterPage.jsx

Страница регистрации.

### Form Data

```javascript
const [formData, setFormData] = useState({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  middleName: '',
  lastName: '',
  position: '',
  responsibility: ''
});
```

### Валидация

```javascript
const validateForm = () => {
  if (!formData.email || !formData.password) {
    return 'Заполните обязательные поля';
  }
  
  if (formData.password !== formData.confirmPassword) {
    return 'Пароли не совпадают';
  }
  
  if (formData.password.length < 6) {
    return 'Пароль должен быть не менее 6 символов';
  }
  
  return null;
};
```

### Регистрация

```javascript
const handleRegister = async (e) => {
  e.preventDefault();
  
  const error = validateForm();
  if (error) {
    setError(error);
    return;
  }
  
  setLoading(true);
  
  const result = await authService.register(formData);
  
  if (result.success) {
    navigate('/pending'); // Страница ожидания одобрения
  } else {
    setError(result.message);
  }
  
  setLoading(false);
};
```

---

## 10.3 DashboardPage.jsx

Главная страница.

### Отображение

```javascript
<MainLayout title="Главная">
  <Grid container spacing={3}>
    {/* Приветствие */}
    <Grid item xs={12}>
      <Typography variant="h4">
        Добро пожаловать, {user.firstName}!
      </Typography>
    </Grid>
    
    {/* Статистика */}
    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6">Активные задачи</Typography>
          <Typography variant="h3">{activeTasksCount}</Typography>
        </CardContent>
      </Card>
    </Grid>
    
    {/* Мои доски */}
    <Grid item xs={12}>
      <Typography variant="h5">Мои доски</Typography>
      <Grid container spacing={2}>
        {boards.map(board => (
          <Grid item xs={12} sm={6} md={4} key={board.id}>
            <Card onClick={() => navigate(`/board/${board.id}`)}>
              <CardContent>
                <Typography variant="h6">{board.title}</Typography>
                <Typography variant="body2">
                  {getBoardTasksCount(board.id)} задач
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Grid>
    
    {/* Создать доску */}
    <Grid item xs={12}>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleCreateBoard}
      >
        Создать доску
      </Button>
    </Grid>
  </Grid>
</MainLayout>
```

### Функционал

```javascript
const [boards, setBoards] = useState([]);
const [activeTasksCount, setActiveTasksCount] = useState(0);

useEffect(() => {
  loadData();
}, [user]);

const loadData = async () => {
  const boardsResult = await boardService.getUserBoards(user.uid);
  setBoards(boardsResult.boards);
  
  // Подсчитать активные задачи
  let count = 0;
  for (const board of boardsResult.boards) {
    const tasksResult = await taskService.getTasks(board.id);
    count += tasksResult.tasks.filter(t => t.columnId !== 'done').length;
  }
  setActiveTasksCount(count);
};

const handleCreateBoard = async () => {
  const title = prompt('Название доски:');
  if (title) {
    const result = await boardService.createBoard(title, user.uid);
    if (result.success) {
      navigate(`/board/${result.id}`);
    }
  }
};
```

---

## 10.4 BoardPage.jsx

Страница Kanban доски.

### URL параметры

```javascript
const { boardId } = useParams();
```

### State

```javascript
const [board, setBoard] = useState(null);
const [columns, setColumns] = useState([]);
const [tasks, setTasks] = useState([]);
const [selectedTask, setSelectedTask] = useState(null);
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
```

### Загрузка данных

```javascript
useEffect(() => {
  loadBoardData();
}, [boardId]);

const loadBoardData = async () => {
  setLoading(true);
  
  // Подписка на доску
  const unsubBoard = boardService.subscribeToBoard(boardId, (boardData) => {
    setBoard(boardData);
  });
  
  // Подписка на колонки
  const unsubColumns = boardService.subscribeToColumns(boardId, (columnsData) => {
    setColumns(columnsData);
  });
  
  // Подписка на задачи
  const unsubTasks = taskService.subscribeToTasks(boardId, (tasksData) => {
    setTasks(tasksData);
  });
  
  // Загрузить пользователей
  const usersResult = await userService.getAllUsers();
  setUsers(usersResult.users);
  
  setLoading(false);
  
  return () => {
    unsubBoard();
    unsubColumns();
    unsubTasks();
  };
};
```

### Drag & Drop

```javascript
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }
  })
);

const handleDragEnd = async (event) => {
  const { active, over } = event;
  
  if (!over) return;
  
  const taskId = active.id;
  const newColumnId = over.id;
  
  const task = tasks.find(t => t.id === taskId);
  
  if (task.columnId !== newColumnId) {
    await taskService.moveTask(boardId, taskId, newColumnId, 0, user.uid);
  }
};
```

### Render

```javascript
<MainLayout title={board?.title || 'Доска'}>
  {loading ? (
    <CircularProgress />
  ) : (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter(t => t.columnId === column.id)}
            onTaskClick={(task) => setSelectedTask(task)}
            board={board}
          />
        ))}
      </Box>
    </DndContext>
  )}
  
  {selectedTask && (
    <TaskModal
      open={Boolean(selectedTask)}
      onClose={() => setSelectedTask(null)}
      task={selectedTask}
      boardId={boardId}
      onUpdate={() => loadBoardData()}
    />
  )}
</MainLayout>
```

---

## 10.5 CalendarPage.jsx

Страница календаря с 5 масштабами.

### State

```javascript
const [currentDate, setCurrentDate] = useState(new Date());
const [viewMode, setViewMode] = useState('month'); // 'year' | 'quarter' | 'month' | 'week' | 'day'
const [allTasks, setAllTasks] = useState([]);
const [filteredTasks, setFilteredTasks] = useState([]);
const [filters, setFilters] = useState({
  myTasks: true,
  assignedToOthers: false,
  urgent: true,
  normal: true,
  recurring: true,
  assignees: [],
  boards: [],
  tags: []
});
```

### Масштабы

#### Year View

```javascript
const renderYearView = () => {
  const months = Array.from({ length: 12 }, (_, i) => i);
  
  return (
    <Grid container spacing={2}>
      {months.map(month => {
        const monthDate = new Date(currentDate.getFullYear(), month, 1);
        const tasksCount = getTasksInMonth(monthDate).length;
        
        return (
          <Grid item xs={3} key={month}>
            <Card
              onClick={() => {
                setCurrentDate(monthDate);
                setViewMode('month');
              }}
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
            >
              <CardContent>
                <Typography variant="h6">
                  {format(monthDate, 'LLLL', { locale: ru })}
                </Typography>
                <Typography variant="body2">
                  {tasksCount} задач
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};
```

#### Month View (с Drag & Drop)

```javascript
const renderMonthView = () => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { locale: ru });
  const endDate = endOfWeek(monthEnd, { locale: ru });
  
  const days = [];
  let day = startDate;
  
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }
  
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Grid container spacing={1}>
        {days.map(day => (
          <Grid item xs={12/7} key={day.toString()}>
            <DroppableDay
              date={day}
              tasks={getTasksOnDate(day)}
              isCurrentMonth={isSameMonth(day, currentDate)}
              onClick={() => {
                setCurrentDate(day);
                setViewMode('day');
              }}
            />
          </Grid>
        ))}
      </Grid>
    </DndContext>
  );
};
```

#### Day View

```javascript
const renderDayView = () => {
  const tasks = getTasksOnDate(currentDate);
  
  return (
    <Box>
      <Typography variant="h5">
        {format(currentDate, 'd MMMM yyyy', { locale: ru })}
      </Typography>
      
      <List>
        {tasks.length === 0 ? (
          <Typography>Нет задач на этот день</Typography>
        ) : (
          tasks.map(task => (
            <ListItem key={task.id}>
              <TaskCard task={task} onClick={() => setSelectedTask(task)} />
            </ListItem>
          ))
        )}
      </List>
      
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => handleCreateTask(currentDate)}
      >
        Добавить задачу
      </Button>
    </Box>
  );
};
```

### Drag & Drop в календаре

```javascript
const handleDragEnd = async (event) => {
  const { active, over } = event;
  
  if (!over) return;
  
  const taskId = active.id;
  const newDateStr = over.id; // ID = дата в формате YYYY-MM-DD
  
  const task = allTasks.find(t => t.id === taskId);
  
  // Проверить права
  const board = boards.find(b => b.id === task.boardId);
  if (!canEditBoard(board)) {
    alert('Нет прав на редактирование');
    return;
  }
  
  // Обновить дедлайн
  await taskService.updateTask(task.boardId, taskId, {
    dueDate: newDateStr
  }, user.uid);
  
  // Отправить уведомления
  if (task.assigneeId && task.assigneeId !== user.uid) {
    await notificationService.create({
      type: 'task_updated',
      userId: task.assigneeId,
      title: 'Изменён дедлайн задачи',
      message: `Дедлайн задачи "${task.title}" изменён на ${format(new Date(newDateStr), 'd MMMM yyyy', { locale: ru })}`,
      taskId: task.id,
      actorId: user.uid,
      link: `/board/${task.boardId}`
    });
  }
};
```

### Фильтры

```javascript
const applyFilters = () => {
  let filtered = [...allTasks];
  
  // По принадлежности
  if (filters.myTasks && !filters.assignedToOthers) {
    filtered = filtered.filter(t => t.assigneeId === user.uid);
  } else if (!filters.myTasks && filters.assignedToOthers) {
    filtered = filtered.filter(t => t.assigneeId !== user.uid);
  }
  
  // По приоритету
  const priorities = [];
  if (filters.urgent) priorities.push('urgent');
  if (filters.normal) priorities.push('normal');
  if (filters.recurring) priorities.push('recurring');
  
  filtered = filtered.filter(t => priorities.includes(t.priority));
  
  // По исполнителям
  if (filters.assignees.length > 0) {
    filtered = filtered.filter(t => filters.assignees.includes(t.assigneeId));
  }
  
  // По доскам
  if (filters.boards.length > 0) {
    filtered = filtered.filter(t => filters.boards.includes(t.boardId));
  }
  
  // По тегам
  if (filters.tags.length > 0) {
    filtered = filtered.filter(t => 
      t.tags.some(tag => filters.tags.includes(tag))
    );
  }
  
  setFilteredTasks(filtered);
};

useEffect(() => {
  applyFilters();
}, [allTasks, filters]);
```

---

## 10.6 MyTasksPage.jsx

Страница "Мои задачи".

### Фильтры

```javascript
const [filter, setFilter] = useState('all'); // 'all' | 'assigned' | 'created' | 'urgent'
```

### Загрузка задач

```javascript
useEffect(() => {
  loadMyTasks();
}, [user, filter]);

const loadMyTasks = async () => {
  const boardsResult = await boardService.getUserBoards(user.uid);
  const allTasks = [];
  
  for (const board of boardsResult.boards) {
    const tasksResult = await taskService.getTasks(board.id);
    allTasks.push(...tasksResult.tasks);
  }
  
  let filtered = allTasks;
  
  switch (filter) {
    case 'assigned':
      filtered = allTasks.filter(t => t.assigneeId === user.uid);
      break;
    case 'created':
      filtered = allTasks.filter(t => t.creatorId === user.uid);
      break;
    case 'urgent':
      filtered = allTasks.filter(t => t.priority === 'urgent');
      break;
  }
  
  setTasks(filtered);
};
```

### Render

```javascript
<MainLayout title="Мои задачи">
  <Box sx={{ mb: 2 }}>
    <ButtonGroup>
      <Button
        variant={filter === 'all' ? 'contained' : 'outlined'}
        onClick={() => setFilter('all')}
      >
        Все
      </Button>
      <Button
        variant={filter === 'assigned' ? 'contained' : 'outlined'}
        onClick={() => setFilter('assigned')}
      >
        Назначенные мне
      </Button>
      <Button
        variant={filter === 'created' ? 'contained' : 'outlined'}
        onClick={() => setFilter('created')}
      >
        Созданные мной
      </Button>
      <Button
        variant={filter === 'urgent' ? 'contained' : 'outlined'}
        onClick={() => setFilter('urgent')}
      >
        Срочные
      </Button>
    </ButtonGroup>
  </Box>
  
  <List>
    {tasks.map(task => (
      <ListItem key={task.id}>
        <TaskCard
          task={task}
          onClick={() => setSelectedTask(task)}
          users={users}
        />
      </ListItem>
    ))}
  </List>
</MainLayout>
```

---

## 10.7 TeamPage.jsx

Страница команды.

### Tabs

```javascript
const [activeTab, setActiveTab] = useState(0); // 0 = Все пользователи, 1 = Мои команды
```

### Загрузка данных

```javascript
useEffect(() => {
  loadData();
}, [user]);

const loadData = async () => {
  // Пользователи
  const usersResult = await userService.getAllUsers();
  setUsers(usersResult.users.filter(u => u.role !== 'pending'));
  
  // Команды
  const teamsResult = await teamService.getUserTeams(user.uid);
  setTeams(teamsResult.teams);
};
```

### Render

```javascript
<MainLayout title="Команда">
  <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
    <Tab icon={<People />} label="Все пользователи" />
    <Tab icon={<Group />} label={`Мои команды (${teams.length})`} />
  </Tabs>
  
  {activeTab === 0 && (
    <Box>
      <TextField
        fullWidth
        placeholder="Поиск пользователей..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <Grid container spacing={2}>
        {filteredUsers.map(user => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
            <Card onClick={() => handleUserClick(user)}>
              <CardContent>
                <Avatar src={getAvatarSrc(user)} />
                <Typography>{user.firstName} {user.lastName}</Typography>
                <Typography variant="body2">{user.position}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )}
  
  {activeTab === 1 && (
    <Box>
      <Grid container spacing={2}>
        {teams.map(team => (
          <Grid item xs={12} sm={6} md={4} key={team.id}>
            <TeamCard team={team} onUpdate={loadData} />
          </Grid>
        ))}
      </Grid>
      
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateTeamOpen(true)}
      >
        <Add />
      </Fab>
    </Box>
  )}
  
  <UserProfileModal
    open={profileModalOpen}
    onClose={() => setProfileModalOpen(false)}
    user={selectedUser}
    currentUser={user}
  />
  
  <CreateTeamDialog
    open={createTeamOpen}
    onClose={() => setCreateTeamOpen(false)}
    onCreated={loadData}
  />
</MainLayout>
```

---

## 10.8 SketchesPage.jsx

Страница набросков.

### State

```javascript
const [sketches, setSketches] = useState([]);
const [teams, setTeams] = useState([]);
const [createDialogOpen, setCreateDialogOpen] = useState(false);
const [selectedSketch, setSelectedSketch] = useState(null);
```

### Загрузка

```javascript
useEffect(() => {
  loadData();
}, [user]);

const loadData = async () => {
  setLoading(true);
  
  const teamsResult = await teamService.getUserTeams(user.uid);
  const userTeams = teamsResult.success ? teamsResult.teams.map(t => t.id) : [];
  setTeams(teamsResult.teams || []);
  
  const sketchesResult = await sketchService.getAccessibleSketches(user.uid, userTeams);
  if (sketchesResult.success) {
    setSketches(sketchesResult.sketches);
  }
  
  setLoading(false);
};
```

### Создание

```javascript
const handleCreate = async () => {
  if (!newSketchData.title.trim()) {
    alert('Введите название');
    return;
  }
  
  setCreating(true);
  const result = await sketchService.createSketch(newSketchData, user.uid);
  
  if (result.success) {
    setNewSketchData({ title: '', description: '' });
    setCreateDialogOpen(false);
    await loadData();
  }
  setCreating(false);
};
```

### Render

```javascript
<MainLayout title="Наброски">
  <Grid container spacing={2}>
    {sketches.map(sketch => (
      <Grid item xs={12} sm={6} md={4} key={sketch.id}>
        <Card onClick={() => setSelectedSketch(sketch)}>
          <CardContent>
            <Typography variant="h6">{sketch.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {sketch.description?.substring(0, 100)}...
            </Typography>
            <Chip
              label={sketch.authorId === user.uid ? 'Мой' : 'Общий'}
              size="small"
            />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
  
  <Fab
    color="primary"
    sx={{ position: 'fixed', bottom: 16, right: 16 }}
    onClick={() => setCreateDialogOpen(true)}
  >
    <Add />
  </Fab>
  
  <SketchModal
    open={Boolean(selectedSketch)}
    onClose={() => {
      setSelectedSketch(null);
      loadData();
    }}
    sketch={selectedSketch}
    teams={teams}
  />
</MainLayout>
```

---

## 10.9 UsersPage.jsx

Страница управления пользователями (только админ).

### Tabs

```javascript
const [activeTab, setActiveTab] = useState(0); // 0 = Все, 1 = На модерации
```

### State

```javascript
const [users, setUsers] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [selectedUser, setSelectedUser] = useState(null);
const [dialogType, setDialogType] = useState(null); // 'approve' | 'reject' | 'changeRole' | 'delete'
const [loading, setLoading] = useState(true);
const [actionLoading, setActionLoading] = useState(false);
```

### Real-time подписка

```javascript
useEffect(() => {
  const unsubscribe = userService.subscribeToUsers((usersData) => {
    setUsers(usersData);
    setLoading(false);
  });
  
  return () => unsubscribe();
}, []);
```

### Модерация

```javascript
const handleApprove = async (userId) => {
  setActionLoading(true);
  await userService.approveUser(userId, user.uid);
  setActionLoading(false);
  setDialogType(null);
};

const handleReject = async (userId) => {
  if (window.confirm('Отклонить пользователя? Это удалит его из системы.')) {
    setActionLoading(true);
    await userService.rejectUser(userId);
    setActionLoading(false);
    setDialogType(null);
  }
};
```

### Render

```javascript
<MainLayout title="Управление пользователями">
  <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
    <Tab label={`Все пользователи (${users.length})`} />
    <Tab label={
      <Badge badgeContent={users.filter(u => u.role === 'pending').length} color="error">
        На модерации
      </Badge>
    } />
  </Tabs>
  
  <TextField
    fullWidth
    placeholder="Поиск..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Аватар</TableCell>
          <TableCell>ФИО</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Должность</TableCell>
          <TableCell>Роль</TableCell>
          <TableCell>Дата регистрации</TableCell>
          <TableCell>Действия</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredUsers.map(user => (
          <TableRow key={user.id}>
            <TableCell>
              <Avatar src={getAvatarSrc(user)} />
            </TableCell>
            <TableCell>
              {user.firstName} {user.lastName}
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.position}</TableCell>
            <TableCell>
              <Chip
                label={getRoleLabel(user.role)}
                color={getRoleColor(user.role)}
              />
            </TableCell>
            <TableCell>
              {format(user.createdAt.toDate(), 'd MMM yyyy', { locale: ru })}
            </TableCell>
            <TableCell>
              {user.role === 'pending' ? (
                <>
                  <IconButton
                    color="success"
                    onClick={() => handleApprove(user.id)}
                    disabled={actionLoading}
                  >
                    <Check />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleReject(user.id)}
                    disabled={actionLoading}
                  >
                    <Close />
                  </IconButton>
                </>
              ) : (
                <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                  <MoreVert />
                </IconButton>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</MainLayout>
```

---

## 10.10 SettingsPage.jsx

Страница настроек.

### Settings State

```javascript
const [settings, setSettings] = useState({
  emailNotifications: {
    newTasks: true,
    comments: true,
    deadlines: true
  },
  interface: {
    darkMode: false,
    showTooltips: true
  }
});
```

### Загрузка и сохранение

```javascript
useEffect(() => {
  loadSettings();
}, [user]);

const loadSettings = async () => {
  const docRef = doc(db, 'userSettings', user.uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    setSettings(docSnap.data());
  }
};

const handleSave = async () => {
  const docRef = doc(db, 'userSettings', user.uid);
  await setDoc(docRef, settings);
  alert('Настройки сохранены');
};
```

### Render

```javascript
<MainLayout title="Настройки">
  <Card>
    <CardContent>
      <Typography variant="h6">Email уведомления</Typography>
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.emailNotifications.newTasks}
            onChange={(e) => setSettings({
              ...settings,
              emailNotifications: {
                ...settings.emailNotifications,
                newTasks: e.target.checked
              }
            })}
          />
        }
        label="Новые задачи"
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.emailNotifications.comments}
            onChange={(e) => setSettings({
              ...settings,
              emailNotifications: {
                ...settings.emailNotifications,
                comments: e.target.checked
              }
            })}
          />
        }
        label="Комментарии"
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.emailNotifications.deadlines}
            onChange={(e) => setSettings({
              ...settings,
              emailNotifications: {
                ...settings.emailNotifications,
                deadlines: e.target.checked
              }
            })}
          />
        }
        label="Дедлайны"
      />
    </CardContent>
  </Card>
  
  <Card sx={{ mt: 2 }}>
    <CardContent>
      <Typography variant="h6">Интерфейс</Typography>
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.interface.darkMode}
            onChange={(e) => setSettings({
              ...settings,
              interface: {
                ...settings.interface,
                darkMode: e.target.checked
              }
            })}
          />
        }
        label="Тёмная тема"
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.interface.showTooltips}
            onChange={(e) => setSettings({
              ...settings,
              interface: {
                ...settings.interface,
                showTooltips: e.target.checked
              }
            })}
          />
        }
        label="Показывать подсказки"
      />
    </CardContent>
  </Card>
  
  <Button
    variant="contained"
    onClick={handleSave}
    sx={{ mt: 2 }}
  >
    Сохранить
  </Button>
</MainLayout>
```

---

## 10.11 ProfilePage.jsx

Страница профиля.

### State

```javascript
const [isEditing, setIsEditing] = useState(false);
const [avatarSelectorOpen, setAvatarSelectorOpen] = useState(false);
const [editData, setEditData] = useState({
  firstName: user?.firstName || '',
  middleName: user?.middleName || '',
  lastName: user?.lastName || '',
  position: user?.position || '',
  responsibility: user?.responsibility || '',
  contacts: user?.contacts || {
    whatsapp: '',
    telegram: '',
    phone: ''
  }
});
```

### Сохранение

```javascript
const handleSave = async () => {
  await userService.updateUserData(user.uid, editData);
  
  setUser({
    ...user,
    ...editData
  });
  
  setIsEditing(false);
};
```

### Аватар

```javascript
const handleAvatarSelect = async (avatar) => {
  await userService.updateAvatar(user.uid, avatar);
  setUser({
    ...user,
    avatar
  });
};
```

### Render

```javascript
<MainLayout title="Профиль">
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={getAvatarSrc()}
            sx={{ width: 80, height: 80 }}
          />
          <IconButton
            sx={{
              position: 'absolute',
              bottom: -5,
              right: -5,
              bgcolor: 'primary.main',
              color: 'white'
            }}
            size="small"
            onClick={() => setAvatarSelectorOpen(true)}
          >
            <PhotoCamera />
          </IconButton>
        </Box>
        
        {isEditing ? (
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Имя"
                value={editData.firstName}
                onChange={(e) => setEditData({
                  ...editData,
                  firstName: e.target.value
                })}
              />
            </Grid>
            {/* ... */}
          </Grid>
        ) : (
          <Box>
            <Typography variant="h5">
              {user.firstName} {user.middleName} {user.lastName}
            </Typography>
            <Typography variant="body2">
              {user.position}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ ml: 'auto' }}>
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)}>
                Отмена
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Сохранить
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
            >
              Редактировать
            </Button>
          )}
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Контакты, должность и т.д. */}
    </CardContent>
  </Card>
  
  <AvatarSelector
    open={avatarSelectorOpen}
    onClose={() => setAvatarSelectorOpen(false)}
    onSelect={handleAvatarSelect}
    currentAvatar={user?.avatar}
    firstName={user?.firstName}
    lastName={user?.lastName}
  />
</MainLayout>
```

---

## 10.12 PendingApprovalPage.jsx

Страница ожидания одобрения.

### Простой UI

```javascript
<Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, textAlign: 'center' }}>
  <HourglassEmpty sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
  
  <Typography variant="h4" gutterBottom>
    Ожидание одобрения
  </Typography>
  
  <Typography variant="body1" color="text.secondary" paragraph>
    Ваша учётная запись ожидает одобрения администратором.
    Вы получите email уведомление когда администратор одобрит вашу заявку.
  </Typography>
  
  <Typography variant="body2" color="text.secondary">
    Email: {user.email}
  </Typography>
  
  <Button
    variant="outlined"
    onClick={() => authService.logout()}
    sx={{ mt: 3 }}
  >
    Выйти
  </Button>
</Box>
```

---

# 11. Маршрутизация (Routing)

## App.jsx - Полная структура

```javascript
import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import theme from './theme';
import authService from './services/auth.service';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import CalendarPage from './pages/CalendarPage';
import MyTasksPage from './pages/MyTasksPage';
import TeamPage from './pages/TeamPage';
import SketchesPage from './pages/SketchesPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import PendingApprovalPage from './pages/PendingApprovalPage';

const UserContext = createContext();

function ProtectedRoute({ children }) {
  const { user, loading } = React.useContext(UserContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserContext.Provider value={{ user, setUser, loading }}>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pending" element={<PendingApprovalPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/board/:boardId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/my-tasks" element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
            <Route path="/sketches" element={<ProtectedRoute><SketchesPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </Router>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

export { UserContext };
export default App;
```

## Типы маршрутов

### Public Routes
Доступны без авторизации:
- `/login` - Вход
- `/register` - Регистрация

### Semi-Protected Routes
Требуют авторизации, но не одобрения:
- `/pending` - Ожидание одобрения

### Protected Routes
Требуют авторизации И одобрения (role !== 'pending'):
- `/` - Главная
- `/board/:boardId` - Доска
- `/calendar` - Календарь
- `/my-tasks` - Мои задачи
- `/team` - Команда
- `/sketches` - Наброски
- `/settings` - Настройки
- `/profile` - Профиль

### Admin Routes
Требуют роли `admin`:
- `/users` - Управление пользователями

---

# 12. Система прав доступа

## Роли пользователей

### pending
- **Описание**: Новый пользователь, ожидающий одобрения
- **Доступ**: Только страница `/pending`
- **Действия**: Нет

### user
- **Описание**: Обычный пользователь
- **Доступ**: Все основные страницы
- **Действия**:
  - Создавать доски
  - Создавать задачи
  - Создавать команды (до лимита)
  - Создавать наброски
  - Комментировать
  - Редактировать свой профиль

### admin
- **Описание**: Администратор
- **Доступ**: Все страницы включая `/users`
- **Действия**:
  - Всё что может `user`
  - Одобрять/отклонять пользователей
  - Изменять роли пользователей
  - Удалять пользователей
  - Изменять лимит команд
  - Редактировать профили других пользователей

## Роли на досках

### owner
- **Описание**: Владелец доски
- **Действия**:
  - Всё управление доской
  - Добавлять/удалять участников
  - Изменять настройки прав
  - Удалить доску

### editor
- **Описание**: Редактор
- **Действия**:
  - Создавать задачи
  - Редактировать любые задачи
  - Перемещать задачи (если разрешено в `whoCanMoveToStatus`)
  - Комментировать

### viewer
- **Описание**: Наблюдатель
- **Действия**:
  - Только просмотр
  - Комментировать

## Роли в команде

### leader
- **Описание**: Лидер команды
- **Действия**:
  - Приглашать участников
  - Удалять участников
  - Удалить команду
  - Всё что может `member`

### member
- **Описание**: Участник
- **Действия**:
  - Просмотр команды
  - Отправка сообщений в чат
  - Выход из команды

## Проверка прав в коде

### Проверка роли пользователя

```javascript
// В компоненте
const { user } = useContext(UserContext);

if (user.role === 'admin') {
  // Показать админские функции
}
```

### Проверка роли на доске

```javascript
const canEditBoard = (board) => {
  return board.members[user.uid] === 'owner' || 
         board.members[user.uid] === 'editor';
};

const canDeleteBoard = (board) => {
  return board.members[user.uid] === 'owner';
};
```

### Проверка прав перемещения

```javascript
const canMoveToColumn = (board, columnId) => {
  const userRole = board.members[user.uid];
  const allowedRoles = board.settings?.whoCanMoveToStatus?.[columnId] || ['owner', 'editor'];
  
  return allowedRoles.includes(userRole);
};
```

### Проверка в Firestore Rules

```javascript
// Пример правила
match /boards/{boardId} {
  allow read: if isSignedIn() && (
    resource.data.ownerId == request.auth.uid ||
    resource.data.members[request.auth.uid] != null
  );
  
  allow update: if isSignedIn() && (
    resource.data.ownerId == request.auth.uid ||
    resource.data.members[request.auth.uid] in ['owner', 'editor']
  );
}
```

---

# 13. Стилизация и тема

## theme.js

```javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#2e7d32',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});

export default theme;
```

## Использование темы

```javascript
// В main.jsx
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
```

## Кастомные стили

### Использование sx prop

```javascript
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: 3,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 1,
  }}
>
  {/* Content */}
</Box>
```

### Использование theme

```javascript
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <Box sx={{ color: theme.palette.primary.main }}>
      Colored text
    </Box>
  );
}
```

## Палитра цветов

```javascript
// Primary
theme.palette.primary.main      // #1976d2
theme.palette.primary.light     // #42a5f5
theme.palette.primary.dark      // #1565c0

// Secondary
theme.palette.secondary.main    // #9c27b0

// Status colors
theme.palette.error.main        // #d32f2f
theme.palette.warning.main      // #ed6c02
theme.palette.info.main         // #0288d1
theme.palette.success.main      // #2e7d32

// Background
theme.palette.background.default // #f5f5f5
theme.palette.background.paper   // #ffffff

// Text
theme.palette.text.primary       // rgba(0, 0, 0, 0.87)
theme.palette.text.secondary     // rgba(0, 0, 0, 0.6)
```

---

# 14. Инструкции по развертыванию

## Development

### Локальный запуск

```bash
cd frontend
npm install
npm run dev
```

Приложение откроется на http://localhost:5173

### Сборка для production

```bash
npm run build
```

Результат в папке `dist/`

## Firebase Hosting

### 1. Установка Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Логин в Firebase

```bash
firebase login
```

### 3. Инициализация проекта

```bash
firebase init hosting
```

Выбери:
- Public directory: `dist`
- Configure as SPA: `Yes`
- Set up automatic builds: `No`

### 4. Деплой

```bash
npm run build
firebase deploy --only hosting
```

### firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## Environment Variables

### Development (.env.development)

```
VITE_FIREBASE_API_KEY=AIzaSyAngTFq2DEJla-q7823XvSfVL2CVOye7Jg
VITE_FIREBASE_AUTH_DOMAIN=agile-mind-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=agile-mind-pro
VITE_FIREBASE_STORAGE_BUCKET=agile-mind-pro.firebasestorage.app
VITE_GEMINI_API_KEY=AIzaSyB8zF91xZeGD4vz92T6_0dEilbrmQieiJs
```

### Production (.env.production)

Те же значения, но можно использовать другие ключи для production.

### Использование в коде

```javascript
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
```

---

# 15. Troubleshooting

## Частые проблемы и решения

### 1. Permission Denied в Firestore

**Проблема:**
```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions
```

**Решение:**
1. Проверь Firestore Rules в Firebase Console
2. Убедись что правила обновлены (см. раздел "Firestore Rules")
3. Проверь что пользователь авторизован (`user !== null`)
4. Проверь роль пользователя (`role !== 'pending'`)

### 2. Белый экран после сборки

**Проблема:**
После `npm run build` и деплоя - белый экран.

**Решение:**
1. Проверь `firebase.json` - должен быть rewrite на `/index.html`
2. Проверь консоль браузера на ошибки
3. Убедись что `public` в `firebase.json` указывает на `dist`

### 3. CORS ошибки при загрузке файлов

**Проблема:**
```
Access to fetch at 'https://...' has been blocked by CORS policy
```

**Решение:**
1. Проверь Storage Rules в Firebase Console
2. Добавь правило для CORS:

```javascript
// Storage Rules
match /{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

### 4. Не работает drag & drop

**Проблема:**
Задачи не перетаскиваются на доске.

**Решение:**
1. Проверь что `@dnd-kit` установлен
2. Проверь `sensors` настроены правильно:

```javascript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }
  })
);
```

3. Проверь права доступа к доске

### 5. Уведомления не приходят

**Проблема:**
Уведомления не создаются или не отображаются.

**Решение:**
1. Проверь что `notificationService.create()` вызывается
2. Проверь консоль на ошибки
3. Проверь Firestore Rules для коллекции `notifications`
4. Проверь что `NotificationCenter` подписан на уведомления:

```javascript
useEffect(() => {
  const unsubscribe = notificationService.subscribeToUserNotifications(
    user.uid,
    (notifications) => {
      setNotifications(notifications);
    }
  );
  
  return () => unsubscribe();
}, [user.uid]);
```

### 6. AI не отвечает

**Проблема:**
AI анализатор не возвращает результаты.

**Решение:**
1. Проверь API ключ Gemini
2. Проверь консоль на ошибки
3. Проверь квоту API в Google Cloud Console
4. Проверь формат промпта

### 7. Аватары не отображаются

**Проблема:**
Вместо аватаров - иконка по умолчанию.

**Решение:**
1. Проверь что папка `public/avatars` содержит 25 SVG файлов
2. Проверь путь к аватарам: `/avatars/avatar-1.svg`
3. Проверь функцию `getAvatarSrc()`:

```javascript
const getAvatarSrc = (userData) => {
  if (userData.avatar === 'generated' || !userData.avatar) {
    return generateLetterAvatar(userData.firstName, userData.lastName);
  }
  if (userData.avatar?.startsWith('default-')) {
    const num = userData.avatar.replace('default-', '');
    return `/avatars/avatar-${num}.svg`;
  }
  return userData.avatar;
};
```

### 8. DebugConsole не появляется

**Проблема:**
Кнопка отладки не видна.

**Решение:**
1. Проверь `MainLayout.jsx` - должен быть `Fab` с `<BugReport />`
2. Проверь z-index кнопки: `zIndex: 2000`
3. Проверь position: `position: 'fixed', bottom: 88, right: 24`

### 9. Команды не создаются

**Проблема:**
При создании команды - ничего не происходит.

**Решение:**
1. Открой консоль браузера (F12)
2. Проверь логи `teamService`:
   ```
   🔵 [TeamService] Creating team: ...
   ✅ [TeamService] Team created with ID: ...
   ```
3. Если видишь `permission-denied` - обнови Firestore Rules
4. Проверь `teamsCount` и `teamLimit` пользователя

### 10. Real-time обновления не работают

**Проблема:**
Изменения не отображаются автоматически.

**Решение:**
1. Проверь что используется `onSnapshot` а не `getDocs`
2. Проверь что `unsubscribe()` вызывается в `useEffect` cleanup:

```javascript
useEffect(() => {
  const unsubscribe = service.subscribe(...);
  
  return () => unsubscribe(); // ВАЖНО!
}, [dependencies]);
```

3. Проверь dependencies массив в `useEffect`

---

# 16. Расширение функциональности

## Как добавить новую страницу

### 1. Создай компонент страницы

```javascript
// src/pages/NewPage.jsx
import React from 'react';
import MainLayout from '../components/Layout/MainLayout';

function NewPage() {
  return (
    <MainLayout title="Новая страница">
      <div>Содержимое новой страницы</div>
    </MainLayout>
  );
}

export default NewPage;
```

### 2. Добавь маршрут в App.jsx

```javascript
import NewPage from './pages/NewPage';

// В Routes
<Route path="/new-page" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
```

### 3. Добавь пункт меню в Sidebar.jsx

```javascript
const menuItems = [
  // ...существующие
  { title: 'Новая страница', icon: <NewIcon />, path: '/new-page' },
];
```

## Как добавить новый сервис

### 1. Создай файл сервиса

```javascript
// src/services/new.service.js
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

class NewService {
  async createItem(data) {
    try {
      const docRef = await addDoc(collection(db, 'newCollection'), data);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, message: error.message };
    }
  }
  
  async getItems() {
    try {
      const snapshot = await getDocs(collection(db, 'newCollection'));
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, items };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, message: error.message };
    }
  }
}

export default new NewService();
```

### 2. Используй сервис в компоненте

```javascript
import newService from '../services/new.service';

function MyComponent() {
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    loadItems();
  }, []);
  
  const loadItems = async () => {
    const result = await newService.getItems();
    if (result.success) {
      setItems(result.items);
    }
  };
  
  // ...
}
```

## Как добавить новый тип уведомления

### 1. Добавь тип в notification.service.js

```javascript
const TYPES = {
  // ...существующие
  NEW_TYPE: 'new_type',
};
```

### 2. Создай метод для отправки

```javascript
async notifyNewType(userId, data) {
  await this.create({
    type: this.TYPES.NEW_TYPE,
    userId,
    title: 'Заголовок уведомления',
    message: `Сообщение с ${data}`,
    link: '/target-page',
    actorId: currentUserId
  });
}
```

### 3. Добавь иконку в NotificationCenter

```javascript
const getNotificationIcon = (type) => {
  switch (type) {
    // ...существующие
    case 'new_type': return <NewIcon />;
    default: return <Notifications />;
  }
};
```

## Как добавить новое поле в задачу

### 1. Обнови структуру в task.service.js

```javascript
async createTask(boardId, taskData, userId) {
  const taskRef = await addDoc(collection(db, 'boards', boardId, 'tasks'), {
    // ...существующие поля
    newField: taskData.newField || null, // НОВОЕ ПОЛЕ
    createdAt: serverTimestamp(),
  });
}
```

### 2. Обнови TaskModal.jsx

```javascript
// Добавь в форму
<TextField
  label="Новое поле"
  value={task.newField}
  onChange={(e) => handleUpdate('newField', e.target.value)}
/>
```

### 3. Обнови TaskCard.jsx (опционально)

```javascript
{task.newField && (
  <Typography variant="caption">
    {task.newField}
  </Typography>
)}
```

## Как добавить новую коллекцию в Firestore

### 1. Обнови Firestore Rules

```javascript
match /newCollection/{docId} {
  allow read: if isSignedIn();
  allow create: if isApproved();
  allow update, delete: if isSignedIn();
}
```

### 2. Создай сервис для работы с коллекцией

```javascript
// src/services/newCollection.service.js
import { collection, addDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

class NewCollectionService {
  async create(data) {
    const docRef = await addDoc(collection(db, 'newCollection'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  }
  
  subscribeToCollection(callback) {
    return onSnapshot(collection(db, 'newCollection'), (snapshot) => {
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      callback(items);
    });
  }
}

export default new NewCollectionService();
```

---

# 🎉 Заключение

Эта документация покрывает все основные аспекты проекта Agile Mind Pro. Для более детальной информации по конкретным темам обращайтесь к:

- **Firebase Documentation**: https://firebase.google.com/docs
- **React Documentation**: https://react.dev
- **Material-UI Documentation**: https://mui.com
- **@dnd-kit Documentation**: https://docs.dndkit.com
- **Google Generative AI**: https://ai.google.dev

## Полезные команды

```bash
# Development
npm run dev              # Запуск dev сервера
npm run build            # Сборка для production
npm run preview          # Предпросмотр production сборки

# Firebase
firebase login           # Авторизация
firebase init            # Инициализация проекта
firebase deploy          # Деплой всего
firebase deploy --only hosting  # Деплой только хостинга

# Debugging
npm run dev -- --host    # Доступ из локальной сети
```

## Структура команды разработки

- **Frontend Developer**: React, Material-UI, State management
- **Backend Developer**: Firebase, Firestore Rules, Cloud Functions
- **AI Developer**: Gemini integration, Prompt engineering
- **DevOps**: Firebase Hosting, CI/CD
- **QA**: Тестирование, Bug tracking

## Roadmap

### Фаза 1 (Текущая) ✅
- ✅ Базовая структура
- ✅ Аутентификация
- ✅ Kanban доски
- ✅ Задачи с комментариями
- ✅ Календарь
- ✅ Команды
- ✅ Наброски
- ✅ Уведомления
- ✅ AI анализатор

### Фаза 2 (Планируется)
- [ ] Проекты (полная реализация)
- [ ] Чат команды с файлами
- [ ] Email уведомления (через Cloud Functions)
- [ ] Графики и аналитика
- [ ] Экспорт данных
- [ ] Интеграции (Slack, Telegram)
- [ ] Мобильное приложение

### Фаза 3 (Будущее)
- [ ] Time tracking
- [ ] Gantt charts
- [ ] Автоматизация (правила, триггеры)
- [ ] Custom fields
- [ ] API для интеграций
- [ ] White-label решение

---

**Версия документации**: 1.0  
**Дата**: 30 ноября 2024  
**Автор**: AI Assistant  
**Проект**: Agile Mind Pro