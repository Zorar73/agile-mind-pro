# 🚀 Agile Mind Pro

Полнофункциональная система управления проектами и обучения (LMS) на базе React + Firebase.

![Status](https://img.shields.io/badge/status-production-green)
![React](https://img.shields.io/badge/react-19.0-blue)
![Firebase](https://img.shields.io/badge/firebase-11.1-orange)

---

## 🎯 Что это?

**Agile Mind Pro** - современная платформа для управления проектами по методологии Agile/Scrum с встроенной системой обучения.

### Основные возможности:

- 📋 **Kanban доски** с drag-and-drop
- 🏃 **Спринты** (Scrum)
- 📅 **Календарь** задач и событий
- 📚 **LMS** - полная система обучения с курсами и экзаменами
- 🤖 **AI генерация** задач (Google Gemini)
- 👥 **Управление командой** и ролями
- 📱 **Полная мобильная адаптация** (360px+)
- 🌓 **Dark/Light** тема

---

## 🚀 Быстрый старт

### 1. Установка

```bash
# Клонировать репозиторий
git clone https://github.com/Zorar73/agile-mind-pro.git
cd agile-mind-pro/frontend

# Установить зависимости
npm install
```

### 2. Настройка окружения

Создать файл `.env.local`:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary (для загрузки изображений)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

# Google AI (для AI функций)
VITE_GEMINI_API_KEY=your_gemini_key
```

### 3. Запуск

```bash
# Development сервер
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Приложение откроется на `http://localhost:5173`

---

## 📚 Документация

### Для разработчиков:

📖 **[DEVELOPER_HANDOFF.md](./DEVELOPER_HANDOFF.md)** - **НАЧНИТЕ ОТСЮДА!**
> Полная документация для передачи проекта новому разработчику

### Дополнительные документы:

- 📘 [LEARNING_SYSTEM_DOCS.md](./LEARNING_SYSTEM_DOCS.md) - Система обучения (LMS)
- 🚀 [DEPLOY_MANUAL.md](./DEPLOY_MANUAL.md) - Деплой на сервер
- 🤖 [AI_FEATURES.md](./AI_FEATURES.md) - AI функционал
- ✍️ [RICH_TEXT_EDITOR_SETUP.md](./RICH_TEXT_EDITOR_SETUP.md) - TipTap редактор
- 🔥 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Настройка Firebase
- ☁️ [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) - Настройка Cloudinary

---

## 🛠️ Технологии

### Frontend
- **React 19** - UI фреймворк
- **Vite** - Build tool
- **Material-UI** - Компоненты
- **React Router v7** - Навигация
- **@dnd-kit** - Drag and Drop
- **TipTap** - Rich Text редактор

### Backend
- **Firebase Auth** - Аутентификация
- **Firestore** - База данных
- **Cloudinary** - Хранение изображений
- **Google Gemini AI** - AI генерация

---

## 📁 Структура проекта

```
frontend/
├── src/
│   ├── components/      # React компоненты
│   │   ├── Layout/      # MainLayout, Sidebar
│   │   ├── Dashboard/   # Виджеты дашборда
│   │   ├── Board/       # Kanban компоненты
│   │   └── ...
│   ├── pages/           # Страницы приложения
│   ├── services/        # Firebase services
│   ├── App.jsx          # Главный компонент
│   └── main.jsx         # Entry point
├── public/              # Статические файлы
└── *.md                 # Документация
```

---

## 🔐 Первый запуск

### 1. Регистрация

Зарегистрируйтесь через `/register`. Первый пользователь автоматически получает роль `admin`.

### 2. Pending Approval

Следующие пользователи попадают в статус `pending` и требуют одобрения админом на странице `/users`.

### 3. Создание контента

После одобрения можно создавать:
- Доски (Boards)
- Команды (Teams)
- Курсы (Learning Portal)
- Спринты и Backlog

---

## 🧪 Разработка

### Важные команды

```bash
# Development
npm run dev              # Запуск dev сервера

# Build
npm run build            # Production build
npm run preview          # Preview build

# Linting
npm run lint             # ESLint проверка
```

### Соглашения

- **Компоненты:** PascalCase.jsx
- **Services:** camelCase.service.js
- **Mobile-first:** Всегда использовать responsive breakpoints
- **Grid containers:** Оборачивать в Box с overflow

Подробнее в [DEVELOPER_HANDOFF.md](./DEVELOPER_HANDOFF.md)

---

## 🚀 Деплой

### Development

```bash
npm run build
```

### Production (сервер 89.23.98.91)

```bash
# Build локально
npm run build

# Deploy на сервер
scp -r dist/* root@89.23.98.91:/var/www/agile-mind-pro/frontend/
```

Подробнее в [DEPLOY_MANUAL.md](./DEPLOY_MANUAL.md)

---

## 🐛 Известные проблемы

- Grid v1 deprecation warnings (нужна миграция на Grid v2)
- LearningPortalPage: invalid tab value "all"
- HTML nesting violations в некоторых компонентах

Полный список в [DEVELOPER_HANDOFF.md](./DEVELOPER_HANDOFF.md#известные-проблемы)

---

## 🗺️ Roadmap

### Ближайшие планы
- [ ] Миграция на Grid v2
- [ ] Unit тесты (Vitest)
- [ ] Email уведомления
- [ ] File attachments для задач

### В перспективе
- [ ] Real-time collaboration
- [ ] Gantt charts
- [ ] Mobile app
- [ ] API для интеграций

---

## 📞 Контакты

- **GitHub:** https://github.com/Zorar73/agile-mind-pro
- **Production:** http://89.23.98.91
- **Firebase:** https://console.firebase.google.com

---

## 📄 Лицензия

Проект создан для личного/коммерческого использования.

---

## 🤝 Вклад в проект

Для начала работы над проектом:

1. Прочитайте [DEVELOPER_HANDOFF.md](./DEVELOPER_HANDOFF.md)
2. Настройте локальное окружение
3. Создайте feature branch
4. Сделайте изменения
5. Создайте Pull Request

---

**Сделано с ❤️ и Claude Code**

*Последнее обновление: 21 декабря 2024*
