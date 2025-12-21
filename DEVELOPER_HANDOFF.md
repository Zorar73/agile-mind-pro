# 🚀 Agile Mind Pro - Документация для передачи разработки

**Дата последнего обновления:** 21 декабря 2024
**Текущая версия:** Production Ready
**Статус:** Полностью функциональное приложение с мобильной адаптацией

---

## 📋 Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Архитектура приложения](#архитектура-приложения)
3. [Структура проекта](#структура-проекта)
4. [Технологический стек](#технологический-стек)
5. [Ключевые компоненты](#ключевые-компоненты)
6. [Паттерны и соглашения](#паттерны-и-соглашения)
7. [Процесс разработки](#процесс-разработки)
8. [Деплой](#деплой)
9. [Текущее состояние](#текущее-состояние)
10. [Известные проблемы](#известные-проблемы)
11. [Roadmap](#roadmap)

---

## 🎯 Обзор проекта

**Agile Mind Pro** - полнофункциональная система управления проектами с встроенной платформой обучения (LMS).

### Основные модули:

#### 1. **Project Management**
- Kanban-доски с drag-and-drop (@dnd-kit)
- Спринты (Scrum методология)
- Backlog с приоритизацией
- Календарь задач и событий
- Система уведомлений в реальном времени
- Наброски (Sketches)
- Команды (Teams) с ролями

#### 2. **Learning Management System (LMS)**
- Курсы с категориями
- Уроки с rich-text контентом (TipTap)
- Экзамены с автопроверкой
- Ручная проверка результатов преподавателем
- Система попыток (3 попытки на экзамен)
- Статистика обучения
- Управление доступом к курсам

#### 3. **User Management**
- Firebase Authentication (Email/Password)
- Роли: admin, member, pending
- Профили с аватарами (Cloudinary)
- Pending approval система

#### 4. **AI Features**
- Генерация задач через Google Gemini AI
- AI анализ досок

---

## 🏗️ Архитектура приложения

### Frontend Architecture

```
┌─────────────────────────────────────────┐
│          React Application              │
│         (React 19 + Vite)               │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │    Pages     │  │   Components    │ │
│  │              │  │                 │ │
│  │ - Dashboard  │  │ - Layout        │ │
│  │ - Boards     │  │ - Dashboard     │ │
│  │ - Learning   │  │ - Board         │ │
│  │ - Calendar   │  │ - Task          │ │
│  │ - etc.       │  │ - Sketch        │ │
│  └──────────────┘  └─────────────────┘ │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │   Services   │  │     Context     │ │
│  │              │  │                 │ │
│  │ - board      │  │ - UserContext   │ │
│  │ - task       │  │                 │ │
│  │ - learning   │  │                 │ │
│  │ - ai         │  │                 │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│           Firebase Backend              │
├─────────────────────────────────────────┤
│  Authentication │ Firestore │ Storage   │
└─────────────────────────────────────────┘
```

### Data Flow

```
Component → Service → Firebase → Realtime Updates → Component
                ↓
            Cloudinary (Images)
                ↓
            Gemini AI (Generation)
```

---

## 📁 Структура проекта

```
frontend/
├── public/              # Статические файлы
│   └── avatars/        # Дефолтные аватары
│
├── src/
│   ├── components/     # React компоненты
│   │   ├── Layout/
│   │   │   ├── MainLayout.jsx      # Основной layout с sidebar
│   │   │   └── Sidebar.jsx         # Боковое меню
│   │   │
│   │   ├── Dashboard/
│   │   │   └── widgets/           # Виджеты для дашборда
│   │   │       ├── StatsWidget.jsx
│   │   │       ├── TasksWidget.jsx
│   │   │       ├── OverdueWidget.jsx
│   │   │       ├── BoardsWidget.jsx
│   │   │       ├── SketchesWidget.jsx
│   │   │       ├── TeamsWidget.jsx
│   │   │       └── NotificationsWidget.jsx
│   │   │
│   │   ├── Board/                 # Kanban board компоненты
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── DroppableColumn.jsx
│   │   │   └── DraggableTask.jsx
│   │   │
│   │   ├── Task/                  # Задачи
│   │   │   └── TaskDrawer.jsx
│   │   │
│   │   ├── Sketch/                # Наброски
│   │   │   └── SketchDrawer.jsx
│   │   │
│   │   ├── Team/                  # Команды
│   │   │   └── TeamDrawer.jsx
│   │   │
│   │   ├── Calendar/              # Календарь
│   │   │   ├── DroppableDay.jsx
│   │   │   └── DroppableWeekDay.jsx
│   │   │
│   │   ├── RichTextEditor/        # TipTap редактор
│   │   │   └── RichTextEditor.jsx
│   │   │
│   │   ├── Notifications/         # Уведомления
│   │   │   └── NotificationCenter.jsx
│   │   │
│   │   ├── Common/                # Общие компоненты
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── FileUpload.jsx
│   │   │
│   │   └── DebugConsole.jsx       # Консоль отладки
│   │
│   ├── pages/          # Страницы приложения
│   │   ├── DashboardPage.jsx      # Главная страница
│   │   ├── BoardsPage.jsx         # Список досок
│   │   ├── BoardPage.jsx          # Kanban доска
│   │   ├── BacklogPage.jsx        # Backlog
│   │   ├── SprintsPage.jsx        # Спринты
│   │   ├── CalendarPage.jsx       # Календарь
│   │   ├── MyTasksPage.jsx        # Мои задачи
│   │   ├── SketchesPage.jsx       # Наброски
│   │   ├── TeamPage.jsx           # Команда
│   │   ├── NewsPage.jsx           # Новости
│   │   ├── NotificationsPage.jsx  # Уведомления
│   │   ├── UsersPage.jsx          # Пользователи
│   │   ├── ProfilePage.jsx        # Профиль
│   │   ├── SettingsPage.jsx       # Настройки
│   │   │
│   │   ├── LearningPortalPage.jsx      # Портал обучения
│   │   ├── LearningAdminPage.jsx       # Админка LMS
│   │   ├── CourseManagementPage.jsx    # Управление курсом
│   │   ├── CoursePage.jsx              # Страница курса
│   │   ├── LessonPage.jsx              # Урок
│   │   ├── LessonManagementPage.jsx    # Управление уроком
│   │   ├── ExamManagementPage.jsx      # Управление экзаменом
│   │   ├── ExamTakingPage.jsx          # Прохождение экзамена
│   │   ├── ExamResultPage.jsx          # Результат экзамена
│   │   ├── ExamResultsReviewPage.jsx   # Проверка результатов
│   │   ├── CourseStatsPage.jsx         # Статистика курса
│   │   ├── CourseCategoriesPage.jsx    # Категории
│   │   ├── CourseAccessPage.jsx        # Доступ к курсам
│   │   ├── MyLearningStatsPage.jsx     # Моя статистика
│   │   │
│   │   ├── LandingPage.jsx        # Landing page
│   │   ├── LoginPage.jsx          # Вход
│   │   ├── RegisterPage.jsx       # Регистрация
│   │   └── PendingApprovalPage.jsx # Ожидание одобрения
│   │
│   ├── services/       # Firebase services
│   │   ├── firebase.js            # Firebase config
│   │   ├── board.service.js       # Доски
│   │   ├── task.service.js        # Задачи
│   │   ├── sprint.service.js      # Спринты
│   │   ├── sketch.service.js      # Наброски
│   │   ├── team.service.js        # Команды
│   │   ├── notification.service.js # Уведомления
│   │   ├── learning.service.js    # LMS
│   │   ├── ai.service.js          # AI функции
│   │   └── cloudinary.service.js  # Cloudinary
│   │
│   ├── App.jsx         # Главный компонент
│   ├── main.jsx        # Entry point
│   └── theme.js        # MUI тема
│
├── .env.local          # Environment variables (НЕ в git)
├── vite.config.js      # Vite конфигурация
├── package.json        # Dependencies
└── *.md                # Документация
```

---

## 🛠️ Технологический стек

### Core Technologies

| Технология | Версия | Назначение |
|-----------|--------|------------|
| React | 19.0.0 | UI Framework |
| Vite | 7.2.5 | Build tool (rolldown) |
| Material-UI | 6.2.0 | Component library |
| React Router | 7.1.1 | Routing |
| Firebase | 11.1.0 | Backend (Auth, Firestore) |
| @dnd-kit | 6.3.2 | Drag and Drop |
| TipTap | 2.10.4 | Rich Text Editor |
| date-fns | 4.1.0 | Date utilities |

### Key Dependencies

```json
{
  "@dnd-kit/core": "^6.3.2",
  "@dnd-kit/sortable": "^9.0.1",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.0",
  "@mui/icons-material": "^6.2.0",
  "@mui/material": "^6.2.0",
  "@mui/x-date-pickers": "^7.23.3",
  "@tiptap/extension-highlight": "^2.10.4",
  "@tiptap/extension-image": "^2.10.4",
  "@tiptap/extension-link": "^2.10.4",
  "@tiptap/extension-text-align": "^2.10.4",
  "@tiptap/extension-underline": "^2.10.4",
  "@tiptap/react": "^2.10.4",
  "@tiptap/starter-kit": "^2.10.4",
  "date-fns": "^4.1.0",
  "firebase": "^11.1.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router": "^7.1.1",
  "recharts": "^2.15.0"
}
```

---

## 🔑 Ключевые компоненты

### 1. MainLayout (`src/components/Layout/MainLayout.jsx`)

Основной layout приложения с:
- Responsive sidebar (DRAWER_WIDTH = 260px)
- Breadcrumbs navigation с динамической загрузкой названий
- Theme toggle
- Notification center
- Mobile adaptation (xs < 600px)

**Важные детали:**
- На мобильных: sidebar overlay, width: 100%
- На десктопе: sidebar permanent, content margin
- Breadcrumbs: maxItems={2}, adaptive maxWidth

### 2. Dashboard Widgets System

**Архитектура:**
- `DashboardPage.jsx` - контейнер с grid layout
- `WidgetWrapper.jsx` - базовая обертка для всех виджетов
- Индивидуальные виджеты: Stats, Tasks, Overdue, Boards, etc.

**Grid система:**
```jsx
gridTemplateColumns: {
  xs: 'repeat(1, 1fr)',  // 1 колонка на мобильных
  sm: 'repeat(2, 1fr)',  // 2 колонки на планшетах
  md: 'repeat(4, 1fr)',  // 4 колонки на десктопе
}
```

**Widget config:**
```javascript
{
  id: 'w1',
  type: 'stats',
  width: 4,  // Занимает 4 колонки
  height: 2, // Занимает 2 ряда
  config: { visibleStats: ['boards', 'completed', 'overdue'] }
}
```

### 3. Kanban Board (`BoardPage.jsx`)

**DnD контексты:**
- DndContext с sensors (mouse, touch, keyboard)
- DroppableColumn для колонок
- DraggableTask для задач

**Важные функции:**
- `handleDragEnd` - обработка перемещения
- `handleAddTask` - добавление задачи
- `handleEditTask` - редактирование

**Mobile adaptation:**
```jsx
flexDirection: isMobile ? 'column' : 'row'
overflowX: isMobile ? 'visible' : 'auto'
```

### 4. Learning System

**Структура курса:**
```
Course
  ├── Lessons (порядок: order)
  └── Exams (порядок: order)
```

**Exam Result Flow:**
```
Student takes exam → ExamTakingPage
      ↓
Submits answers → Creates examResult (isPending: true)
      ↓
Teacher reviews → ExamResultsReviewPage
      ↓
Approves/Rejects → Updates examResult (isPending: false)
      ↓
Student sees result → ExamResultPage
```

**Важные коллекции Firestore:**
- `courses` - курсы
- `lessons` - уроки
- `exams` - экзамены
- `examResults` - результаты экзаменов
- `userProgress` - прогресс студентов

### 5. Services Layer

Все Firebase операции инкапсулированы в services:

```javascript
// Пример: board.service.js
export default {
  // CRUD
  async createBoard(userId, boardData) { ... },
  async updateBoard(boardId, updates) { ... },
  async deleteBoard(boardId) { ... },

  // Realtime subscriptions
  subscribeToUserBoards(userId, callback) { ... },
  subscribeToBoard(boardId, callback) { ... },

  // Complex operations
  async moveTaskToColumn(taskId, fromColumn, toColumn) { ... }
}
```

---

## 📏 Паттерны и соглашения

### 1. Mobile-First Responsive Design

**Всегда используем responsive breakpoints:**
```jsx
<Box sx={{
  padding: { xs: 2, sm: 3 },        // 16px → 24px
  fontSize: { xs: '0.875rem', sm: '1rem' },
  flexDirection: { xs: 'column', md: 'row' }
}}>
```

**Breakpoints MUI:**
- `xs`: < 600px (мобильные)
- `sm`: 600-900px (планшеты)
- `md`: 900-1200px (маленькие десктопы)
- `lg`: 1200-1536px (большие десктопы)
- `xl`: > 1536px

### 2. Grid Containers - ВАЖНО!

**Всегда оборачивать Grid в Box с overflow:**
```jsx
<Box sx={{ overflow: 'hidden', width: '100%' }}>
  <Grid container spacing={3}>
    <Grid item xs={12} sm={6} md={4}>
      ...
    </Grid>
  </Grid>
</Box>
```

**Причина:** Grid negative margin из-за spacing может вызывать overflow.

### 3. State Management

**User Context:**
```jsx
const { user } = useContext(UserContext);
```

**Local State:**
- `useState` для компонентной логики
- `useEffect` для subscriptions с cleanup

**Firebase Subscriptions Pattern:**
```jsx
useEffect(() => {
  if (!user) return;

  const unsubscribe = boardService.subscribeToUserBoards(
    user.uid,
    (boards) => setBoards(boards)
  );

  return () => unsubscribe(); // Cleanup!
}, [user]);
```

### 4. Error Handling

```jsx
try {
  await someService.operation();
} catch (error) {
  console.error('Operation failed:', error);
  // Показать уведомление пользователю
  alert('Произошла ошибка');
}
```

### 5. Bauhaus Color Palette

```javascript
const bauhaus = {
  blue: '#1E88E5',
  red: '#E53935',
  yellow: '#FDD835',
  teal: '#26A69A',
  purple: '#7E57C2',
};
```

Используется везде для консистентности UI.

### 6. File Naming Conventions

- Components: `PascalCase.jsx` (ComponentName.jsx)
- Services: `camelCase.service.js` (board.service.js)
- Pages: `PascalCase.jsx` (DashboardPage.jsx)
- Constants: `UPPER_SNAKE_CASE`

---

## 🔄 Процесс разработки

### Setup

```bash
# 1. Clone repository
git clone https://github.com/Zorar73/agile-mind-pro.git
cd agile-mind-pro/frontend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Заполнить Firebase credentials, Cloudinary, Gemini AI

# 4. Run development server
npm run dev
```

### Environment Variables

Создать `.env.local`:
```bash
# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...

# Google AI
VITE_GEMINI_API_KEY=...
```

### Development Workflow

1. **Создание новой фичи:**
   ```bash
   git checkout -b feature/название-фичи
   ```

2. **Разработка:**
   - Следовать паттернам существующего кода
   - Mobile-first подход
   - Тестировать на 360px ширине

3. **Commit:**
   ```bash
   git add .
   git commit -m "Feat: Описание изменений"
   ```

4. **Push:**
   ```bash
   git push origin feature/название-фичи
   ```

### Code Style

- ESLint + Prettier (настроены в проекте)
- 2 spaces для индентации
- Single quotes для строк
- Semicolons обязательны

---

## 🚀 Деплой

### Production Build

```bash
npm run build
```

Создаёт оптимизированную версию в `dist/`.

### Deploy на сервер (89.23.98.91)

#### Способ 1: SCP (текущий)

```bash
# Build
npm run build

# Copy to server
scp -r dist/* root@89.23.98.91:/var/www/agile-mind-pro/frontend/
```

#### Способ 2: Git-based deploy

```bash
# На сервере (если настроен git):
ssh root@89.23.98.91
cd /var/www/agile-mind-pro/frontend
git pull origin main
npm install
npm run build
```

### Nginx Configuration

Nginx должен быть настроен для SPA:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Firebase Deploy (альтернатива)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## 📊 Текущее состояние (21 декабря 2024)

### ✅ Реализованные функции

#### Project Management
- ✅ Kanban boards с drag-and-drop
- ✅ Спринты (создание, управление, архивирование)
- ✅ Backlog с приоритетами
- ✅ Календарь (месяц, квартал, год, неделя views)
- ✅ Мои задачи (kanban, cards, table views)
- ✅ Наброски (Sketches)
- ✅ Команды (Teams) с приглашениями
- ✅ Уведомления в реальном времени
- ✅ AI генерация задач (Gemini)

#### LMS (Learning Management System)
- ✅ Полная система курсов
- ✅ Уроки с rich-text контентом
- ✅ Экзамены с разными типами вопросов
- ✅ Система попыток (3 попытки)
- ✅ Ручная проверка результатов преподавателем
- ✅ Статистика обучения
- ✅ Категории курсов
- ✅ Управление доступом
- ✅ Прогресс студентов

#### User Management
- ✅ Регистрация/Вход
- ✅ Профили с аватарами
- ✅ Pending approval система
- ✅ Роли (admin, member, pending)

#### UI/UX
- ✅ Dark/Light theme toggle
- ✅ Полная мобильная адаптация (360px+)
- ✅ Responsive dashboard с виджетами
- ✅ Breadcrumbs navigation
- ✅ Landing page

### 🎨 Последние изменения (Commit 77a9b72)

**Полная мобильная адаптация для всех страниц (360px):**

1. **MainLayout:**
   - Исправлен width calculation для мобильных
   - Адаптивные breadcrumbs (maxWidth, fontSize)
   - Уменьшен padding на мобильных

2. **Dashboard виджеты:**
   - StatsWidget: вертикальный стек на мобильных
   - TasksWidget/OverdueWidget: уменьшены шрифты, отступы
   - WidgetWrapper: адаптивный gridColumn

3. **Grid containers (8 страниц):**
   - Все Grid обернуты в Box с overflow
   - LearningPortalPage, CourseStatsPage, ExamResultPage, etc.

4. **Фиксированные ширины (5 страниц):**
   - CalendarPage: 5 адаптивных grid layouts
   - LandingPage: Kanban, pricing, features
   - MyTasksPage: вертикальный Kanban на мобильных
   - BoardsPage: адаптивные TextField, Select

5. **Таблицы (4 страницы):**
   - Все TableContainer с overflowX: auto

**Результат:**
- 20 файлов изменено
- +433 строк, -139 строк
- Нет горизонтального скролла на мобильных
- Все элементы помещаются на экран 360px

---

## ⚠️ Известные проблемы

### 1. Grid v1 Deprecation Warnings

**Проблема:** Используется старая версия Grid (Grid v1)
```
Warning: The Grid v1 component was deprecated
```

**Решение:** Мигрировать на Grid v2
```jsx
// Было:
<Grid item xs={12} sm={6}>

// Станет:
<Grid size={{ xs: 12, sm: 6 }}>
```

**Приоритет:** Low (функционал работает)

### 2. LearningPortalPage Tabs Value Error

**Проблема:** Invalid tab value "all"
```
MUI: The value provided `all` is invalid
```

**Где:** `src/pages/LearningPortalPage.jsx:250`

**Решение:**
```jsx
// Добавить tab "all" в categories или изменить defaultValue
<Tab key="all" value="all" label="Все курсы" />
```

**Приоритет:** Low

### 3. HTML Nesting Violations

**Проблема:** `<p>` внутри `<p>`, `<div>` внутри `<p>`
**Где:** CoursePage, ExamResultPage

**Решение:** Заменить `<p>` на `<div>` или `<Box>`

**Приоритет:** Low

### 4. CalendarPage useContext Crash

**Проблема:** `useContext` возвращает `undefined` при некорректной навигации

**Решение:** Добавить проверку `if (!user) return null;`

**Приоритет:** Medium

---

## 🗺️ Roadmap

### Near-term (1-2 недели)

- [ ] Миграция на Grid v2
- [ ] Исправление warnings в консоли
- [ ] Добавить unit тесты (Vitest)
- [ ] Оптимизация bundle size

### Mid-term (1 месяц)

- [ ] Email notifications (Firebase Cloud Functions)
- [ ] File attachments для задач (расширение Cloudinary)
- [ ] Comments на задачах
- [ ] Activity log/history
- [ ] Экспорт данных (CSV, PDF)

### Long-term (3+ месяца)

- [ ] Real-time collaboration (присутствие пользователей)
- [ ] Gantt charts для спринтов
- [ ] Advanced analytics и отчёты
- [ ] Mobile app (React Native)
- [ ] Интеграции (Slack, Telegram, etc.)
- [ ] API для внешних приложений

---

## 📚 Дополнительная документация

В проекте есть следующие документы:

- `DOCUMENTATION.md` - Общая документация (устарела)
- `LEARNING_SYSTEM_DOCS.md` - Подробно про LMS
- `DEPLOY_MANUAL.md` - Инструкции по деплою
- `AI_FEATURES.md` - AI функционал
- `RICH_TEXT_EDITOR_SETUP.md` - Настройка TipTap
- `FIREBASE_SETUP.md` - Настройка Firebase
- `CLOUDINARY_SETUP.md` - Настройка Cloudinary

---

## 🤝 Передача разработки

### Checklist для нового разработчика:

- [ ] Прочитать эту документацию полностью
- [ ] Настроить локальное окружение (Setup)
- [ ] Получить доступы:
  - [ ] Firebase проект
  - [ ] Cloudinary аккаунт
  - [ ] Google AI API key
  - [ ] Сервер SSH (89.23.98.91)
  - [ ] GitHub репозиторий
- [ ] Запустить проект локально (`npm run dev`)
- [ ] Проверить все основные функции
- [ ] Протестировать на мобильных (360px)
- [ ] Сделать тестовый деплой

### Важные контакты:

- **Репозиторий:** https://github.com/Zorar73/agile-mind-pro
- **Production URL:** http://89.23.98.91
- **Firebase Console:** https://console.firebase.google.com
- **Cloudinary:** https://cloudinary.com

### Вопросы?

При возникновении вопросов:
1. Проверьте существующую документацию (*.md файлы)
2. Изучите похожие компоненты в коде
3. Проверьте Firebase/Firestore структуру данных
4. Посмотрите git history для понимания изменений

---

**Удачи в разработке! 🚀**

*Документация обновлена: 21 декабря 2024*
