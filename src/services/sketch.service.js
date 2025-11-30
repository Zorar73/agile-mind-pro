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
  orderBy,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../config/firebase';

class SketchService {
  async createSketch(sketchData, userId) {
    try {
      console.log('🔵 [SketchService] Creating sketch:', sketchData, 'for user:', userId);
      
      const sketchRef = await addDoc(collection(db, 'sketches'), {
        title: sketchData.title,
        description: sketchData.description || '',
        authorId: userId,
        sharedWith: {
          users: [],
          teams: []
        },
        attachments: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [SketchService] Sketch created with ID:', sketchRef.id);
      return { success: true, id: sketchRef.id };
    } catch (error) {
      console.error('🔴 [SketchService] Create sketch error:', error);
      console.error('🔴 [SketchService] Error details:', error.code, error.message);
      return { success: false, message: error.message };
    }
  }

  async getUserSketches(userId) {
    try {
      console.log('🔵 [SketchService] Getting sketches for user:', userId);
      
      const q = query(
        collection(db, 'sketches'),
        where('authorId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const sketches = [];

      snapshot.forEach(doc => {
        sketches.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [SketchService] Found sketches:', sketches.length);
      return { success: true, sketches };
    } catch (error) {
      console.error('🔴 [SketchService] Get sketches error:', error);
      return { success: false, message: error.message };
    }
  }

  async getAccessibleSketches(userId, userTeams = []) {
    try {
      console.log('🔵 [SketchService] Getting accessible sketches for user:', userId, 'teams:', userTeams);
      
      const allSketches = await getDocs(collection(db, 'sketches'));
      const sketches = [];

      allSketches.forEach(doc => {
        const data = doc.data();
        
        // Автор видит всегда
        if (data.authorId === userId) {
          sketches.push({ id: doc.id, ...data });
          return;
        }

        // Shared с пользователем
        if (data.sharedWith?.users?.includes(userId)) {
          sketches.push({ id: doc.id, ...data });
          return;
        }

        // Shared с командой
        const sharedTeamIds = data.sharedWith?.teams || [];
        if (sharedTeamIds.some(teamId => userTeams.includes(teamId))) {
          sketches.push({ id: doc.id, ...data });
        }
      });

      console.log('✅ [SketchService] Found accessible sketches:', sketches.length);
      return { success: true, sketches };
    } catch (error) {
      console.error('🔴 [SketchService] Get accessible sketches error:', error);
      return { success: false, message: error.message };
    }
  }

  subscribeToSketch(sketchId, callback) {
    return onSnapshot(doc(db, 'sketches', sketchId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
  }

  async updateSketch(sketchId, updates) {
    try {
      console.log('🔵 [SketchService] Updating sketch:', sketchId, updates);
      
      await updateDoc(doc(db, 'sketches', sketchId), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [SketchService] Sketch updated');
      return { success: true };
    } catch (error) {
      console.error('🔴 [SketchService] Update sketch error:', error);
      return { success: false, message: error.message };
    }
  }

  async shareWithUser(sketchId, userId) {
    try {
      console.log('🔵 [SketchService] Sharing sketch', sketchId, 'with user:', userId);
      
      await updateDoc(doc(db, 'sketches', sketchId), {
        'sharedWith.users': arrayUnion(userId)
      });

      console.log('✅ [SketchService] Sketch shared with user');
      return { success: true };
    } catch (error) {
      console.error('🔴 [SketchService] Share sketch error:', error);
      return { success: false, message: error.message };
    }
  }

  async shareWithTeam(sketchId, teamId) {
    try {
      console.log('🔵 [SketchService] Sharing sketch', sketchId, 'with team:', teamId);
      
      await updateDoc(doc(db, 'sketches', sketchId), {
        'sharedWith.teams': arrayUnion(teamId)
      });

      console.log('✅ [SketchService] Sketch shared with team');
      return { success: true };
    } catch (error) {
      console.error('🔴 [SketchService] Share sketch error:', error);
      return { success: false, message: error.message };
    }
  }

  async addComment(sketchId, userId, text, mentions = []) {
    try {
      console.log('🔵 [SketchService] Adding comment to sketch:', sketchId);
      
      const commentRef = await addDoc(collection(db, 'sketches', sketchId, 'comments'), {
        userId,
        text,
        mentions,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [SketchService] Comment added, ID:', commentRef.id);
      return { success: true, id: commentRef.id };
    } catch (error) {
      console.error('🔴 [SketchService] Add comment error:', error);
      return { success: false, message: error.message };
    }
  }

  async updateComment(sketchId, commentId, text) {
    try {
      await updateDoc(doc(db, 'sketches', sketchId, 'comments', commentId), {
        text,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('🔴 [SketchService] Update comment error:', error);
      return { success: false, message: error.message };
    }
  }

  async deleteComment(sketchId, commentId) {
    try {
      await deleteDoc(doc(db, 'sketches', sketchId, 'comments', commentId));
      return { success: true };
    } catch (error) {
      console.error('🔴 [SketchService] Delete comment error:', error);
      return { success: false, message: error.message };
    }
  }

  subscribeToComments(sketchId, callback) {
    const q = query(
      collection(db, 'sketches', sketchId, 'comments'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const comments = [];
      snapshot.forEach(doc => {
        comments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(comments);
    });
  }

  async deleteSketch(sketchId) {
    try {
      console.log('🔵 [SketchService] Deleting sketch:', sketchId);
      
      await deleteDoc(doc(db, 'sketches', sketchId));

      console.log('✅ [SketchService] Sketch deleted');
      return { success: true };
    } catch (error) {
      console.error('🔴 [SketchService] Delete sketch error:', error);
      return { success: false, message: error.message };
    }
  }
}

export default new SketchService();
