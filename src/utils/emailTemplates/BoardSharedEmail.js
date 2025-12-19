// src/utils/emailTemplates/BoardSharedEmail.js
// Email уведомление о предоставлении доступа к доске

import { BaseTemplate } from './BaseTemplate';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://agile-mind-pro.com';

/**
 * Email о предоставлении доступа к доске
 * @param {Object} params
 * @param {Object} params.board - Данные доски
 * @param {Object} params.sharedBy - Кто предоставил доступ
 * @param {Object} params.recipient - Получатель
 * @param {string} params.role - Роль (owner/admin/editor/viewer)
 * @returns {string} - HTML письма
 */
export function BoardSharedEmail({ board, sharedBy, recipient, role }) {
  const boardUrl = `${APP_URL}/board/${board.id}`;

  const roleNames = {
    owner: 'Владелец',
    admin: 'Администратор',
    editor: 'Редактор',
    viewer: 'Наблюдатель',
  };

  const content = `
    <h2>Доступ к доске</h2>
    <p>Здравствуйте, ${recipient.firstName}!</p>
    <p><strong>${sharedBy.firstName} ${sharedBy.lastName}</strong> предоставил вам доступ к доске:</p>

    <div class="info-box">
      <h3 style="margin: 5px 0;">${board.title}</h3>
      ${board.description ? `<p>${board.description}</p>` : ''}

      <p><strong>Ваша роль:</strong> ${roleNames[role] || role}</p>
    </div>

    <p>
      <a href="${boardUrl}" class="button">Перейти к доске</a>
    </p>
  `;

  return BaseTemplate({
    title: 'Доступ к доске предоставлен',
    content,
  });
}

export default BoardSharedEmail;
