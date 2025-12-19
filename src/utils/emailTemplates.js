// src/utils/emailTemplates.js
// Email templates for notifications
// Generates HTML for various notification types

const APP_NAME = 'Agile Mind Pro';
const APP_URL = window.location.origin;

// Базовый HTML шаблон для всех email
const baseTemplate = (content, title) => `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #1976d2;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1976d2;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #1976d2;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 12px;
    }
    .task-info {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
    .task-info strong {
      display: block;
      margin-bottom: 5px;
      color: #1976d2;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Это автоматическое уведомление от ${APP_NAME}</p>
      <p>Вы получили это письмо, так как включены email уведомления в настройках</p>
      <p><a href="${APP_URL}/settings" style="color: #1976d2;">Управление настройками</a></p>
    </div>
  </div>
</body>
</html>
`;

// Новая задача назначена
export const taskAssignedEmail = ({ taskTitle, taskDescription, boardTitle, assignedBy, taskUrl }) => {
  const content = `
    <h2>Вам назначена новая задача</h2>
    <p>Пользователь <strong>${assignedBy}</strong> назначил вам задачу:</p>

    <div class="task-info">
      <strong>Задача:</strong>
      <p>${taskTitle}</p>
      ${taskDescription ? `<p style="color: #666;">${taskDescription}</p>` : ''}
      <strong>Доска:</strong>
      <p>${boardTitle}</p>
    </div>

    <p style="text-align: center;">
      <a href="${taskUrl}" class="button">Открыть задачу</a>
    </p>

    <p style="color: #666; font-size: 14px;">
      Приступайте к выполнению задачи в удобное для вас время. Не забудьте обновить статус!
    </p>
  `;

  return baseTemplate(content, `Новая задача: ${taskTitle}`);
};

// Новый комментарий к задаче
export const taskCommentEmail = ({ taskTitle, commentText, commenter, taskUrl }) => {
  const content = `
    <h2>Новый комментарий к задаче</h2>
    <p>Пользователь <strong>${commenter}</strong> оставил комментарий к задаче <strong>${taskTitle}</strong>:</p>

    <div class="task-info">
      <p style="font-style: italic;">"${commentText}"</p>
    </div>

    <p style="text-align: center;">
      <a href="${taskUrl}" class="button">Открыть задачу</a>
    </p>
  `;

  return baseTemplate(content, `Комментарий к задаче: ${taskTitle}`);
};

// Упоминание в комментарии
export const taskMentionEmail = ({ taskTitle, commentText, mentionedBy, taskUrl }) => {
  const content = `
    <h2>Вас упомянули в комментарии</h2>
    <p>Пользователь <strong>${mentionedBy}</strong> упомянул вас в комментарии к задаче <strong>${taskTitle}</strong>:</p>

    <div class="task-info">
      <p style="font-style: italic;">"${commentText}"</p>
    </div>

    <p style="text-align: center;">
      <a href="${taskUrl}" class="button">Открыть задачу</a>
    </p>
  `;

  return baseTemplate(content, `Вас упомянули в ${taskTitle}`);
};

// Приближается дедлайн
export const taskDeadlineEmail = ({ taskTitle, dueDate, taskUrl, daysLeft }) => {
  const content = `
    <h2>⚠️ Приближается дедлайн</h2>
    <p>Срок выполнения задачи <strong>${taskTitle}</strong> ${daysLeft === 0 ? 'истекает сегодня' : `истекает через ${daysLeft} ${daysLeft === 1 ? 'день' : 'дня'}`}!</p>

    <div class="task-info">
      <strong>Задача:</strong>
      <p>${taskTitle}</p>
      <strong>Дедлайн:</strong>
      <p>${dueDate}</p>
    </div>

    <p style="text-align: center;">
      <a href="${taskUrl}" class="button">Открыть задачу</a>
    </p>

    <p style="color: #d32f2f; font-size: 14px; font-weight: 600;">
      Обратите внимание на приближающийся срок и завершите работу вовремя!
    </p>
  `;

  return baseTemplate(content, `Дедлайн: ${taskTitle}`);
};

// Регистрация одобрена
export const userApprovedEmail = ({ userName, loginUrl }) => {
  const content = `
    <h2>🎉 Регистрация одобрена!</h2>
    <p>Здравствуйте, <strong>${userName}</strong>!</p>

    <p>Ваша учетная запись в ${APP_NAME} была одобрена администратором.</p>

    <p>Теперь вы можете:</p>
    <ul>
      <li>Создавать и управлять задачами</li>
      <li>Участвовать в командах и досках</li>
      <li>Использовать все возможности системы</li>
    </ul>

    <p style="text-align: center;">
      <a href="${loginUrl}" class="button">Войти в систему</a>
    </p>

    <p style="color: #666; font-size: 14px;">
      Добро пожаловать в ${APP_NAME}! Начните работу с создания своей первой задачи или присоединитесь к существующей доске.
    </p>
  `;

  return baseTemplate(content, 'Регистрация одобрена');
};

// Приглашение на доску
export const boardInvitationEmail = ({ boardTitle, inviter, boardUrl, role }) => {
  const roleText = {
    owner: 'владелец',
    editor: 'редактор',
    viewer: 'наблюдатель',
  }[role] || 'участник';

  const content = `
    <h2>Приглашение на доску</h2>
    <p>Пользователь <strong>${inviter}</strong> пригласил вас на доску <strong>${boardTitle}</strong> с ролью <strong>${roleText}</strong>.</p>

    <div class="task-info">
      <strong>Доска:</strong>
      <p>${boardTitle}</p>
      <strong>Ваша роль:</strong>
      <p>${roleText}</p>
    </div>

    <p style="text-align: center;">
      <a href="${boardUrl}" class="button">Открыть доску</a>
    </p>

    <p style="color: #666; font-size: 14px;">
      Начните совместную работу с командой прямо сейчас!
    </p>
  `;

  return baseTemplate(content, `Приглашение: ${boardTitle}`);
};

// Еженедельная сводка
export const weeklyDigestEmail = ({ userName, completedTasks, activeTasks, newComments, weekStart, weekEnd }) => {
  const content = `
    <h2>📊 Ваша еженедельная сводка</h2>
    <p>Здравствуйте, <strong>${userName}</strong>!</p>

    <p>Вот что произошло за неделю (${weekStart} - ${weekEnd}):</p>

    <div class="task-info">
      <strong>✅ Завершено задач:</strong>
      <p>${completedTasks}</p>

      <strong>📋 Активных задач:</strong>
      <p>${activeTasks}</p>

      <strong>💬 Новых комментариев:</strong>
      <p>${newComments}</p>
    </div>

    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="button">Открыть дашборд</a>
    </p>

    <p style="color: #666; font-size: 14px;">
      Продолжайте в том же духе! Следующая сводка придет через неделю.
    </p>
  `;

  return baseTemplate(content, 'Еженедельная сводка');
};

// Экспорт всех шаблонов
export default {
  taskAssigned: taskAssignedEmail,
  taskComment: taskCommentEmail,
  taskMention: taskMentionEmail,
  taskDeadline: taskDeadlineEmail,
  userApproved: userApprovedEmail,
  boardInvitation: boardInvitationEmail,
  weeklyDigest: weeklyDigestEmail,
};
