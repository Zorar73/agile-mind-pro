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
  increment,
  deleteField,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import notificationService from './notification.service';

class TeamService {
  async createTeam(teamData, userId) {
    try {
      console.log('🔵 [TeamService] Creating team:', teamData, 'for user:', userId);
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      console.log('🔵 [TeamService] User data:', userData);
      
      if ((userData.teamsCount || 0) >= (userData.teamLimit || 10)) {
        console.error('🔴 [TeamService] Team limit reached');
        return { success: false, message: 'Достигнут лимит команд' };
      }

      console.log('🔵 [TeamService] Adding document to teams collection...');
      
      const teamRef = await addDoc(collection(db, 'teams'), {
        name: teamData.name,
        description: teamData.description || '',
        image: teamData.image || null,
        leaderId: userId,
        members: {
          [userId]: 'leader'
        },
        createdAt: serverTimestamp(),
        createdBy: userId
      });

      console.log('✅ [TeamService] Team created with ID:', teamRef.id);

      await updateDoc(doc(db, 'users', userId), {
        teamsCount: increment(1)
      });

      console.log('✅ [TeamService] User teamsCount incremented');
      
      return { success: true, id: teamRef.id };
    } catch (error) {
      console.error('🔴 [TeamService] Create team error:', error);
      console.error('🔴 [TeamService] Error details:', error.code, error.message);
      return { success: false, message: error.message };
    }
  }

  async getUserTeams(userId) {
    try {
      console.log('🔵 [TeamService] Getting teams for user:', userId);
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const teams = [];
      
      teamsSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.members && data.members[userId]) {
          teams.push({
            id: docSnap.id,
            ...data,
            role: data.members[userId]
          });
        }
      });

      console.log('✅ [TeamService] Found teams:', teams.length);
      return { success: true, teams };
    } catch (error) {
      console.error('🔴 [TeamService] Get teams error:', error);
      return { success: false, message: error.message };
    }
  }

  subscribeToUserTeams(userId, callback) {
    return onSnapshot(collection(db, 'teams'), (snapshot) => {
      const teams = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.members && data.members[userId]) {
          teams.push({
            id: docSnap.id,
            ...data,
            role: data.members[userId]
          });
        }
      });
      callback(teams);
    });
  }

  subscribeToTeam(teamId, callback) {
    return onSnapshot(doc(db, 'teams', teamId), (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      }
    });
  }

  async inviteUser(teamId, userId, invitedBy) {
    try {
      console.log('🔵 [TeamService] Inviting user:', userId, 'to team:', teamId);
      
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      const team = teamDoc.data();

      if (team.leaderId !== invitedBy) {
        return { success: false, message: 'Только лидер может приглашать' };
      }

      if (team.members[userId]) {
        return { success: false, message: 'Пользователь уже в команде' };
      }

      const invitationRef = await addDoc(collection(db, 'teams', teamId, 'invitations'), {
        teamId,
        userId,
        invitedBy,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      await notificationService.create({
        type: 'team_invitation',
        userId,
        title: 'Приглашение в команду',
        message: `Вас пригласили в команду "${team.name}"`,
        link: `/team/${teamId}`,
        actorId: invitedBy,
        teamId
      });

      console.log('✅ [TeamService] User invited, invitation ID:', invitationRef.id);
      return { success: true, id: invitationRef.id };
    } catch (error) {
      console.error('🔴 [TeamService] Invite user error:', error);
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
            ...invDoc.data()
          });
        });
      }

      return { success: true, invitations };
    } catch (error) {
      console.error('🔴 [TeamService] Get invitations error:', error);
      return { success: false, message: error.message };
    }
  }

  async acceptInvitation(teamId, invitationId, userId) {
    try {
      await updateDoc(doc(db, 'teams', teamId, 'invitations', invitationId), {
        status: 'accepted'
      });

      await updateDoc(doc(db, 'teams', teamId), {
        [`members.${userId}`]: 'member'
      });

      await updateDoc(doc(db, 'users', userId), {
        teamsCount: increment(1)
      });

      return { success: true };
    } catch (error) {
      console.error('🔴 [TeamService] Accept invitation error:', error);
      return { success: false, message: error.message };
    }
  }

  async rejectInvitation(teamId, invitationId) {
    try {
      await updateDoc(doc(db, 'teams', teamId, 'invitations', invitationId), {
        status: 'rejected'
      });

      return { success: true };
    } catch (error) {
      console.error('🔴 [TeamService] Reject invitation error:', error);
      return { success: false, message: error.message };
    }
  }

  async leaveTeam(teamId, userId) {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      const team = teamDoc.data();

      if (team.leaderId === userId) {
        return { success: false, message: 'Лидер не может выйти из команды' };
      }

      await updateDoc(doc(db, 'teams', teamId), {
        [`members.${userId}`]: deleteField()
      });

      await updateDoc(doc(db, 'users', userId), {
        teamsCount: increment(-1)
      });

      return { success: true };
    } catch (error) {
      console.error('🔴 [TeamService] Leave team error:', error);
      return { success: false, message: error.message };
    }
  }

  async removeMember(teamId, userId, removedBy) {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      const team = teamDoc.data();

      if (team.leaderId !== removedBy) {
        return { success: false, message: 'Только лидер может удалять участников' };
      }

      if (userId === team.leaderId) {
        return { success: false, message: 'Нельзя удалить лидера' };
      }

      await updateDoc(doc(db, 'teams', teamId), {
        [`members.${userId}`]: deleteField()
      });

      await updateDoc(doc(db, 'users', userId), {
        teamsCount: increment(-1)
      });

      return { success: true };
    } catch (error) {
      console.error('🔴 [TeamService] Remove member error:', error);
      return { success: false, message: error.message };
    }
  }

  async deleteTeam(teamId, userId) {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      const team = teamDoc.data();

      if (team.leaderId !== userId) {
        return { success: false, message: 'Только лидер может удалить команду' };
      }

      const memberIds = Object.keys(team.members);
      for (const memberId of memberIds) {
        await updateDoc(doc(db, 'users', memberId), {
          teamsCount: increment(-1)
        });
      }

      await deleteDoc(doc(db, 'teams', teamId));

      return { success: true };
    } catch (error) {
      console.error('🔴 [TeamService] Delete team error:', error);
      return { success: false, message: error.message };
    }
  }

  async sendMessage(teamId, userId, text, mentions = [], attachments = []) {
    try {
      const messageRef = await addDoc(collection(db, 'teams', teamId, 'chat'), {
        userId,
        text,
        mentions,
        attachments,
        createdAt: serverTimestamp()
      });

      for (const mentionedUserId of mentions) {
        await notificationService.create({
          type: 'team_mention',
          userId: mentionedUserId,
          title: 'Вас упомянули в чате',
          message: `В чате команды`,
          link: `/team/${teamId}`,
          actorId: userId,
          teamId
        });
      }

      return { success: true, id: messageRef.id };
    } catch (error) {
      console.error('🔴 [TeamService] Send message error:', error);
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
        messages.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      callback(messages);
    });
  }
}

export default new TeamService();
