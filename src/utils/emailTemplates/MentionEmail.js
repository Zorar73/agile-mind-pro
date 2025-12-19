// src/utils/emailTemplates/MentionEmail.js
// Email уведомление об упоминании (@mention)

import { BaseTemplate } from './BaseTemplate';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://agile-mind-pro.com';

/**
 * Email об упоминании пользователя
 * @param {Object} params
 * @param {Object} params.mentionedBy - Кто упомянул
 * @param {Object} params.recipient - Кого упомянули
 * @param {string} params.text - Текст комментария
 * @param {string} params.entityType - Тип сущности (task/sketch/news)
 * @param {Object} params.entity - Данные сущности
 * @param {string} params.url - Ссылка на сущность
 * @returns {string} - HTML письма
 */
export function MentionEmail({ mentionedBy, recipient, text, entityType, entity, url }) {
  const entityNames = {
    task: 'задаче',
    sketch: 'наброске',
    news: 'новости',
  };

  const entityName = entityNames[entityType] || 'комментарии';

  const content = `
    <h2>Вас упомянули</h2>
    <p>Здравствуйте, ${recipient.firstName}!</p>
    <p><strong>${mentionedBy.firstName} ${mentionedBy.lastName}</strong> упомянул вас в ${entityName}:</p>

    <div class="info-box">
      <h3 style="margin: 5px 0;">${entity.title || entity.name}</h3>
    </div>

    <div class="info-box">
      <strong>Сообщение:</strong>
      <p>${text}</p>
    </div>

    <p>
      <a href="${url}" class="button">Перейти к ${entityName}</a>
    </p>
  `;

  return BaseTemplate({
    title: 'Вас упомянули',
    content,
  });
}

export default MentionEmail;
