// src/services/team.service.js
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import notificationService from './notification.service';

class TeamService {
  // =====================
  // КОМАНДЫ
  // =====================

  async createTeam(name, description, leaderId) {
    try {
      // Проверяем лимит команд для пользователя
      const userTeams = await this.getUserTeams(leaderId);
      if (userTeams.teams?.length >= 5) {
        return { success: false, message: 'Достигнут лимит команд' };
      }

      const teamRef = await addDoc(collection(db, 'teams'), {
        name,
        description: description || '',
        image: null,
        members: {
          [leaderId]: 'leader'
        },
        boards: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, id: teamRef.id };
    } catch (error) {
      console.error('Create team error:', error);
      return { success: false, message: error.message };
    }
  }

  async getTeam(teamId) {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      
      if (!teamDoc.exists()) {
        return { success: false, message: 'Команда не найдена' };
      }

      return {
        success: true,
        team: { id: teamDoc.id, ...teamDoc.data() }
      };
    } catch (error) {
      console.error('Get team error:', error);
      return { success: false, message: error.message };
    }
  }

  async getUserTeams(userId) {
    try {
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const teams = [];

      teamsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.members && data.members[userId]) {
          teams.push({
            id: doc.id,
            ...data,
            userRole: data.members[userId]
          });
        }
      });

      return { success: true, teams };
    } catch (error) {
      console.error('Get user teams error:', error);
      return { success: false, message: error.message, teams: [] };
    }
  }

  subscribeToUserTeams(userId, callback) {
    return onSnapshot(collection(db, 'teams'), (snapshot) => {
      const teams = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.members && data.members[userId]) {
          teams.push({
            id: doc.id,
            ...data,
            userRole: data.members[userId]
          });
        }
      });
      callback(teams);
    });
  }

  async updateTeam(teamId, data, currentUserId) {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        return { success: false, message: 'Команда не найдена' };
      }

      const oldData = teamDoc.data();

      await updateDoc(doc(db, 'teams', teamId), {
        ...data,
        updatedAt: serverTimestamp()
      });

      // Отправляем уведомления об изменениях
      if (currentUserId && oldData.members) {
        const memberIds = Object.keys(oldData.members);
        const changes = [];

        if (data.name && data.name !== oldData.name) {
          changes.push('изменено название');
        }
        if (data.description !== undefined && data.description !== oldData.description) {
          changes.push('изменено описание');
        }
        if (data.image !== undefined && data.image !== oldData.image) {
          changes.push('изменено изображение');
        }

        if (changes.length > 0) {
          await notificationService.notifyTeamUpdated(
            teamId,
            data.name || oldData.name,
            memberIds,
            currentUserId,
            changes
          );
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Update team error:', error);
      return { success: false, message: error.message };
    }
  }

  async deleteTeam(teamId) {
    try {
      const batch = writeBatch(db);

      // Удаляем сообщения чата
      const chatSnapshot = await getDocs(collection(db, 'teams', teamId, 'chat'));
      chatSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Удаляем приглашения
      const invitationsSnapshot = await getDocs(collection(db, 'teams', teamId, 'invitations'));
      invitationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Удаляем команду
      batch.delete(doc(db, 'teams', teamId));

      await batch.commit();

      return { success: true };
    } catch (error) {
      console.error('Delete team error:', error);
      return { success: false, message: error.message };
    }
  }

  // =====================
  // УЧАСТНИКИ
  // =====================

  // Прямое добавление участника (без приглашения)
  async addMember(teamId, userId, role = 'member') {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        return { success: false, message: 'Команда не найдена' };
      }

      const team = teamDoc.data();

      if (team.members[userId]) {
        return { success: false, message: 'Пользователь уже в команде' };
      }

      await updateDoc(doc(db, 'teams', teamId), {
        [`members.${userId}`]: role,
        updatedAt: serverTimestamp()
      });

      // Отправляем уведомление используя правильный тип
      await notificationService.create({
        type: notificationService.TYPES.TEAM_ADDED,
        userId,
        title: 'Добавление в команду',
        message: `Вас добавили в команду "${team.name}"`,
        link: `/team`,
        teamId
      });

      return { success: true };
    } catch (error) {
      console.error('Add member error:', error);
      return { success: false, message: error.message };
    }
  }

  async inviteUser(teamId, userId, invitedBy) {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      const team = teamDoc.data();

      if (team.members[invitedBy] !== 'leader' && team.members[invitedBy] !== 'admin') {
        return { success: false, message: 'Недостаточно прав для приглашения' };
      }

      if (team.members[userId]) {
        return { success: false, message: 'Пользователь уже в команде' };
      }

      // Проверяем, нет ли активного приглашения
      const existingInvitation = await getDocs(
        query(
          collection(db, 'teams', teamId, 'invitations'),
          where('userId', '==', userId),
          where('status', '==', 'pending')
        )
      );

      if (!existingInvitation.empty) {
        return { success: false, message: 'Приглашение уже отправлено' };
      }

      const invitationRef = await addDoc(collection(db, 'teams', teamId, 'invitations'), {
        teamId,
        userId,
        invitedBy,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Отправляем уведомление
      await notificationService.create({
        type: 'team_invitation',
        userId,
        title: 'Приглашение в команду',
        message: `Вас пригласили в команду "${team.name}"`,
        link: `/team`,
        actorId: invitedBy,
        teamId
      });

      return { success: true, id: invitationRef.id };
    } catch (error) {
      console.error('Invite user error:', error);
      return { success: false, message: error.message };
    }
  }

  async getUserInvitations(userId) {
    try {
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const invitations = [];

      for (const teamDoc of teamsSnapshot.docs) {
        const invitationsSnapshot = await getDocs(
          query(
            collection(db, 'teams', teamDoc.id, 'invitations'),
            where('userId', '==', userId),
            where('status', '==', 'pending')
          )
        );

        invitationsSnapshot.forEach(invDoc => {
          invitations.push({
            id: invDoc.id,
            teamId: teamDoc.id,
            teamName: teamDoc.data().name,
            teamImage: teamDoc.data().image,
            ...invDoc.data()
          });
        });
      }

      return { success: true, invitations };
    } catch (error) {
      console.error('Get invitations error:', error);
      return { success: false, message: error.message, invitations: [] };
    }
  }

  async acceptInvitation(teamId, invitationId, userId) {
    try {
      await updateDoc(doc(db, 'teams', teamId, 'invitations', invitationId), {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'teams', teamId), {
        [`members.${userId}`]: 'member',
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Accept invitation error:', error);
      return { success: false, message: error.message };
    }
  }

  async declineInvitation(teamId, invitationId) {
    try {
      await updateDoc(doc(db, 'teams', teamId, 'invitations', invitationId), {
        status: 'declined',
        declinedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Decline invitation error:', error);
      return { success: false, message: error.message };
    }
  }

  async removeMember(teamId, userId, removedBy) {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      const team = teamDoc.data();

      if (team.members[userId] === 'leader') {
        return { success: false, message: 'Лидер не может выйти из команды. Передайте права или удалите команду.' };
      }

      const updates = {};
      updates[`members.${userId}`] = null;

      await updateDoc(doc(db, 'teams', teamId), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Отправляем уведомление об удалении
      if (removedBy && userId !== removedBy) {
        await notificationService.notifyTeamMemberRemoved(
          teamId,
          team.name,
          userId,
          removedBy
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Remove member error:', error);
      return { success: false, message: error.message };
    }
  }

  async updateMemberRole(teamId, userId, newRole, changedBy) {
    try {
      // Получаем данные команды для уведомления
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      const team = teamDoc.data();

      await updateDoc(doc(db, 'teams', teamId), {
        [`members.${userId}`]: newRole,
        updatedAt: serverTimestamp()
      });

      // Отправляем уведомление об изменении роли
      if (changedBy && userId !== changedBy && team) {
        await notificationService.notifyTeamMemberRoleChanged(
          teamId,
          team.name,
          userId,
          newRole,
          changedBy
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Update member role error:', error);
      return { success: false, message: error.message };
    }
  }

  // =====================
  // ДОСКИ КОМАНДЫ
  // =====================

  async addTeamBoard(teamId, boardId) {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      const team = teamDoc.data();
      const boards = team.boards || [];
      
      if (!boards.includes(boardId)) {
        boards.push(boardId);
        await updateDoc(doc(db, 'teams', teamId), {
          boards,
          updatedAt: serverTimestamp()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Add team board error:', error);
      return { success: false, message: error.message };
    }
  }

  async removeTeamBoard(teamId, boardId) {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      const team = teamDoc.data();
      const boards = (team.boards || []).filter(id => id !== boardId);
      
      await updateDoc(doc(db, 'teams', teamId), {
        boards,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Remove team board error:', error);
      return { success: false, message: error.message };
    }
  }

  async getTeamBoards(teamId) {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        return { success: false, message: 'Команда не найдена', boards: [] };
      }
      
      const team = teamDoc.data();
      return { success: true, boardIds: team.boards || [] };
    } catch (error) {
      console.error('Get team boards error:', error);
      return { success: false, message: error.message, boards: [] };
    }
  }

  // =====================
  // ЧАТ
  // =====================

  async sendMessage(teamId, userId, text, mentions = [], attachments = [], entityLinks = [], parentId = null) {
    try {
      const messageData = {
        userId,
        text,
        mentions,
        attachments,
        entityLinks,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Если это ответ, добавляем parentId
      if (parentId) {
        messageData.parentId = parentId;
      }

      const messageRef = await addDoc(collection(db, 'teams', teamId, 'chat'), messageData);

      // Отправляем уведомления упомянутым
      for (const mentionedUserId of mentions) {
        if (mentionedUserId !== userId) {
          await notificationService.create({
            type: 'team_mention',
            userId: mentionedUserId,
            title: 'Вас упомянули в чате',
            message: 'В чате команды',
            link: `/team/${teamId}/chat`,
            actorId: userId,
            teamId
          });
        }
      }

      return { success: true, id: messageRef.id };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, message: error.message };
    }
  }

  async updateMessage(teamId, messageId, data) {
    try {
      await updateDoc(
        doc(db, 'teams', teamId, 'chat', messageId),
        {
          ...data,
          updatedAt: serverTimestamp(),
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Update message error:', error);
      return { success: false, message: error.message };
    }
  }

  subscribeToChat(teamId, callback) {
    const q = query(
      collection(db, 'teams', teamId, 'chat')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        messages.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
        });
      });
      
      // Сортируем по времени
      messages.sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateA - dateB;
      });
      
      callback(messages);
    });
  }

  async deleteMessage(teamId, messageId, userId) {
    try {
      const messageDoc = await getDoc(doc(db, 'teams', teamId, 'chat', messageId));
      
      if (messageDoc.data().userId !== userId) {
        return { success: false, message: 'Можно удалять только свои сообщения' };
      }

      await deleteDoc(doc(db, 'teams', teamId, 'chat', messageId));

      return { success: true };
    } catch (error) {
      console.error('Delete message error:', error);
      return { success: false, message: error.message };
    }
  }
}

export default new TeamService();
