// src/utils/emailTemplates/TaskDeadlineEmail.js
// Email уведомление о приближающемся дедлайне задачи

import { BaseTemplate } from './BaseTemplate';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://agile-mind-pro.com';

/**
 * Email о приближающемся дедлайне
 * @param {Object} params
 * @param {Object} params.task - Данные задачи
 * @param {Object} params.assignee - Исполнитель
 * @param {number} params.hoursLeft - Осталось часов до дедлайна
 * @returns {string} - HTML письма
 */
export function TaskDeadlineEmail({ task, assignee, hoursLeft }) {
  const taskUrl = `${APP_URL}/board/${task.boardId}?task=${task.id}`;

  const urgencyMessage = hoursLeft <= 24
    ? '<p style="color: #f44336; font-weight: bold;">⚠️ Дедлайн через менее чем 24 часа!</p>'
    : `<p>Напоминаем, что до дедлайна осталось ${Math.floor(hoursLeft / 24)} дней.</p>`;

  const content = `
    <h2>Напоминание о дедлайне</h2>
    <p>Здравствуйте, ${assignee.firstName}!</p>

    ${urgencyMessage}

    <div class="info-box">
      <strong>Задача:</strong>
      <h3 style="margin: 5px 0;">${task.title}</h3>
      ${task.description ? `<p>${task.description}</p>` : ''}

      <p><strong>Дедлайн:</strong> ${new Date(task.dueDate).toLocaleString('ru-RU')}</p>

      <p><strong>Статус:</strong> ${task.status === 'todo' ? 'К выполнению' : task.status === 'in-progress' ? 'В работе' : 'Завершено'}</p>
    </div>

    <p>
      <a href="${taskUrl}" class="button">Перейти к задаче</a>
    </p>
  `;

  return BaseTemplate({
    title: 'Напоминание о дедлайне',
    content,
  });
}

export default TaskDeadlineEmail;
