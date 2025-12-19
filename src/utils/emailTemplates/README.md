# Email Templates

Компонентные email шаблоны для уведомлений Agile Mind Pro.

## Архитектура

Каждый шаблон - это отдельный файл, что обеспечивает:
- **Модульность**: легко добавлять новые шаблоны
- **Переиспользование**: базовый шаблон используется всеми
- **Тестируемость**: каждый шаблон можно тестировать отдельно
- **Поддержка**: легко находить и редактировать нужный шаблон

## Структура

```
emailTemplates/
├── BaseTemplate.js          # Базовый шаблон (header, footer, стили)
├── TaskAssignedEmail.js     # Назначение задачи
├── TaskCommentEmail.js      # Комментарий к задаче
├── TaskDeadlineEmail.js     # Напоминание о дедлайне
├── TeamInviteEmail.js       # Приглашение в команду
├── BoardSharedEmail.js      # Доступ к доске
├── MentionEmail.js          # Упоминание (@mention)
├── index.js                 # Экспорт всех шаблонов
└── README.md                # Документация
```

## Использование

### Импорт

```javascript
import { TaskAssignedEmail, TaskCommentEmail } from './utils/emailTemplates';

// Или все вместе
import EmailTemplates from './utils/emailTemplates';
```

### Пример использования

```javascript
// Генерация HTML для email о назначении задачи
const html = TaskAssignedEmail({
  task: {
    id: 'task123',
    title: 'Исправить баг авторизации',
    description: 'Пользователи не могут войти через Google',
    boardId: 'board456',
    priority: 'urgent',
    dueDate: new Date('2025-12-20'),
    tags: ['bug', 'auth'],
  },
  assignedBy: {
    firstName: 'Иван',
    lastName: 'Петров',
  },
  assignee: {
    firstName: 'Мария',
    lastName: 'Сидорова',
    email: 'maria@example.com',
  },
});

// Отправка через email сервис
await emailService.send({
  to: 'maria@example.com',
  subject: 'Вам назначена задача',
  html,
});
```

### Доступные шаблоны

#### 1. TaskAssignedEmail
Уведомление о назначении задачи

**Параметры:**
- `task` - объект задачи (id, title, description, priority, dueDate, tags, boardId)
- `assignedBy` - кто назначил (firstName, lastName)
- `assignee` - кому назначено (firstName, lastName, email)

#### 2. TaskCommentEmail
Уведомление о комментарии к задаче

**Параметры:**
- `task` - объект задачи
- `comment` - объект комментария (text, createdAt)
- `author` - автор комментария (firstName, lastName)
- `recipient` - получатель (firstName)

#### 3. TaskDeadlineEmail
Напоминание о дедлайне

**Параметры:**
- `task` - объект задачи
- `assignee` - исполнитель (firstName)
- `hoursLeft` - часов до дедлайна

#### 4. TeamInviteEmail
Приглашение в команду

**Параметры:**
- `team` - объект команды (id, name, description, members)
- `invitedBy` - кто пригласил (firstName, lastName)
- `invitee` - кого пригласили (firstName)

#### 5. BoardSharedEmail
Предоставление доступа к доске

**Параметры:**
- `board` - объект доски (id, title, description)
- `sharedBy` - кто предоставил (firstName, lastName)
- `recipient` - получатель (firstName)
- `role` - роль (owner/admin/editor/viewer)

#### 6. MentionEmail
Упоминание пользователя

**Параметры:**
- `mentionedBy` - кто упомянул (firstName, lastName)
- `recipient` - кого упомянули (firstName)
- `text` - текст комментария
- `entityType` - тип сущности (task/sketch/news)
- `entity` - объект сущности (title/name)
- `url` - ссылка на сущность

## Добавление нового шаблона

1. Создайте новый файл `NewTemplateEmail.js`
2. Импортируйте `BaseTemplate`
3. Создайте функцию, генерирующую HTML контент
4. Оберните контент в `BaseTemplate`
5. Экспортируйте в `index.js`

```javascript
// NewTemplateEmail.js
import { BaseTemplate } from './BaseTemplate';

export function NewTemplateEmail({ param1, param2 }) {
  const content = `
    <h2>Заголовок</h2>
    <p>Контент...</p>
  `;

  return BaseTemplate({
    title: 'Заголовок email',
    content,
  });
}
```

## Стилизация

Все стили определены в `BaseTemplate.js`. Доступные классы:

- `.container` - основной контейнер
- `.header` - заголовок письма
- `.content` - контент
- `.footer` - футер
- `.button` - кнопка действия
- `.info-box` - информационный блок
- `.badge` - бейдж (urgent/normal/low)

## Backend интеграция

Для отправки email потребуется backend (Firebase Cloud Functions или отдельный сервер).

### Пример с Firebase Cloud Functions

```javascript
// functions/index.js
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

exports.sendEmail = functions.https.onCall(async (data, context) => {
  const { to, subject, html } = data;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: 'Agile Mind Pro <noreply@agilemindpro.com>',
    to,
    subject,
    html,
  });

  return { success: true };
});
```

## TODO

- [ ] Добавить шаблоны для спринтов
- [ ] Добавить шаблоны для набросков
- [ ] Добавить шаблоны для новостей
- [ ] Добавить поддержку inline изображений
- [ ] Добавить поддержку темной темы
- [ ] Создать preview компонент для тестирования шаблонов
