import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

const COLLECTION = 'users';

export const authService = {
  subscribeToAuth: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  subscribeToProfile: (uid: string, callback: (profile: UserProfile | null) => void) => {
    const docRef = doc(db, COLLECTION, uid);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ uid: snapshot.id, ...snapshot.data() } as UserProfile);
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION}/${uid}`);
    });
  },

  signInWithGoogle: async () => {
    try {
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, googleProvider);
      return await authService.syncProfile(result.user);
    } catch (error: any) {
      if (error.code === 'auth/user-cancelled' || error.code === 'auth/popup-closed-by-user') {
        console.warn('Sign-in popup was closed or cancelled. This can happen if popups are blocked or the user closed the window.');
      } else {
        console.error('Google Sign In Error:', error);
      }
      throw error;
    }
  },

  signInWithPhone: async (phoneNumber: string, recaptchaVerifier: any) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('Phone Sign In Error:', error);
      throw error;
    }
  },

  signUpWithEmail: async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Create profile immediately
      const docRef = doc(db, COLLECTION, result.user.uid);
      const profile: Omit<UserProfile, 'uid'> = {
        email: email,
        displayName: displayName,
        role: 'user',
        createdAt: Date.now()
      };
      await setDoc(docRef, profile);
      
      // Send verification
      await sendEmailVerification(result.user);
      
      return result.user;
    } catch (error) {
      console.error('Email Sign Up Error:', error);
      throw error;
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Email Sign In Error:', error);
      throw error;
    }
  },

  sendVerification: async (user: FirebaseUser) => {
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error('Send Verification Error:', error);
      throw error;
    }
  },

  syncProfile: async (user: FirebaseUser) => {
    const docRef = doc(db, COLLECTION, user.uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      const profile: Omit<UserProfile, 'uid'> = {
        email: user.email || '',
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || undefined,
        role: 'user',
        createdAt: Date.now()
      };
      await setDoc(docRef, profile);
    }
    return user;
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  },

  updateProfile: async (uid: string, profile: Partial<UserProfile>) => {
    try {
      const docRef = doc(db, COLLECTION, uid);
      await setDoc(docRef, profile, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION}/${uid}`);
    }
  }
};
