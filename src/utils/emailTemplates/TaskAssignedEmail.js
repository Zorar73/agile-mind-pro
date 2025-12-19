// src/utils/emailTemplates/TaskAssignedEmail.js
// Email уведомление о назначении задачи

import { BaseTemplate } from './BaseTemplate';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://agile-mind-pro.com';

/**
 * Email о назначении задачи
 * @param {Object} params
 * @param {Object} params.task - Данные задачи
 * @param {Object} params.assignedBy - Кто назначил
 * @param {Object} params.assignee - Кому назначено
 * @returns {string} - HTML письма
 */
export function TaskAssignedEmail({ task, assignedBy, assignee }) {
  const taskUrl = `${APP_URL}/board/${task.boardId}?task=${task.id}`;

  const priorityBadge = task.priority === 'urgent'
    ? '<span class="badge badge-urgent">Срочная</span>'
    : task.priority === 'normal'
    ? '<span class="badge badge-normal">Обычная</span>'
    : '<span class="badge badge-low">Низкая</span>';

  const content = `
    <h2>Вам назначена новая задача</h2>
    <p>Здравствуйте, ${assignee.firstName}!</p>
    <p><strong>${assignedBy.firstName} ${assignedBy.lastName}</strong> назначил вам задачу:</p>

    <div class="info-box">
      <strong>Задача:</strong>
      <h3 style="margin: 5px 0;">${task.title}</h3>
      ${task.description ? `<p>${task.description}</p>` : ''}

      <p><strong>Приоритет:</strong> ${priorityBadge}</p>

      ${task.dueDate ? `<p><strong>Срок:</strong> ${new Date(task.dueDate).toLocaleDateString('ru-RU')}</p>` : ''}

      ${task.tags && task.tags.length > 0 ? `<p><strong>Теги:</strong> ${task.tags.join(', ')}</p>` : ''}
    </div>

    <p>
      <a href="${taskUrl}" class="button">Перейти к задаче</a>
    </p>
  `;

  return BaseTemplate({
    title: 'Вам назначена задача',
    content,
  });
}

export default TaskAssignedEmail;
