// src/utils/emailTemplates/TaskCommentEmail.js
// Email уведомление о новом комментарии к задаче

import { BaseTemplate } from './BaseTemplate';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://agile-mind-pro.com';

/**
 * Email о комментарии к задаче
 * @param {Object} params
 * @param {Object} params.task - Данные задачи
 * @param {Object} params.comment - Данные комментария
 * @param {Object} params.author - Автор комментария
 * @param {Object} params.recipient - Получатель
 * @returns {string} - HTML письма
 */
export function TaskCommentEmail({ task, comment, author, recipient }) {
  const taskUrl = `${APP_URL}/board/${task.boardId}?task=${task.id}`;

  const content = `
    <h2>Новый комментарий к задаче</h2>
    <p>Здравствуйте, ${recipient.firstName}!</p>
    <p><strong>${author.firstName} ${author.lastName}</strong> оставил комментарий к задаче:</p>

    <div class="info-box">
      <strong>Задача:</strong>
      <h3 style="margin: 5px 0;">${task.title}</h3>
    </div>

    <div class="info-box">
      <strong>Комментарий:</strong>
      <p>${comment.text}</p>
      <p style="color: #666; font-size: 12px; margin-top: 10px;">
        ${new Date(comment.createdAt).toLocaleString('ru-RU')}
      </p>
    </div>

    <p>
      <a href="${taskUrl}" class="button">Перейти к задаче</a>
    </p>
  `;

  return BaseTemplate({
    title: 'Новый комментарий к задаче',
    content,
  });
}

export default TaskCommentEmail;
