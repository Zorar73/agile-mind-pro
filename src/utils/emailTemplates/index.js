// src/utils/emailTemplates/index.js
// Экспорт всех email шаблонов

export { BaseTemplate } from './BaseTemplate';
export { TaskAssignedEmail } from './TaskAssignedEmail';
export { TaskCommentEmail } from './TaskCommentEmail';
export { TaskDeadlineEmail } from './TaskDeadlineEmail';
export { TeamInviteEmail } from './TeamInviteEmail';
export { BoardSharedEmail } from './BoardSharedEmail';
export { MentionEmail } from './MentionEmail';

/**
 * Хелпер для генерации email шаблонов
 * Используется для удобного создания email уведомлений
 */
export const EmailTemplates = {
  taskAssigned: (params) => TaskAssignedEmail(params),
  taskComment: (params) => TaskCommentEmail(params),
  taskDeadline: (params) => TaskDeadlineEmail(params),
  teamInvite: (params) => TeamInviteEmail(params),
  boardShared: (params) => BoardSharedEmail(params),
  mention: (params) => MentionEmail(params),
};

export default EmailTemplates;
