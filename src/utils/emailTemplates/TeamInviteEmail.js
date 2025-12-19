// src/utils/emailTemplates/TeamInviteEmail.js
// Email уведомление о приглашении в команду

import { BaseTemplate } from './BaseTemplate';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://agile-mind-pro.com';

/**
 * Email о приглашении в команду
 * @param {Object} params
 * @param {Object} params.team - Данные команды
 * @param {Object} params.invitedBy - Кто пригласил
 * @param {Object} params.invitee - Кого пригласили
 * @returns {string} - HTML письма
 */
export function TeamInviteEmail({ team, invitedBy, invitee }) {
  const teamUrl = `${APP_URL}/team/${team.id}`;

  const content = `
    <h2>Приглашение в команду</h2>
    <p>Здравствуйте, ${invitee.firstName}!</p>
    <p><strong>${invitedBy.firstName} ${invitedBy.lastName}</strong> приглашает вас в команду:</p>

    <div class="info-box">
      <h3 style="margin: 5px 0;">${team.name}</h3>
      ${team.description ? `<p>${team.description}</p>` : ''}

      <p><strong>Участников:</strong> ${Object.keys(team.members || {}).length}</p>
    </div>

    <p>
      <a href="${teamUrl}" class="button">Перейти к команде</a>
    </p>

    <p style="color: #666; font-size: 14px;">
      Присоединяйтесь к команде, чтобы начать совместную работу над проектами.
    </p>
  `;

  return BaseTemplate({
    title: 'Приглашение в команду',
    content,
  });
}

export default TeamInviteEmail;
