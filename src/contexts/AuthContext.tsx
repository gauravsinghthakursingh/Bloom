import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendVerification: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = authService.subscribeToAuth((firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribeProfile = authService.subscribeToProfile(user.uid, (userProfile) => {
        setProfile(userProfile);
        setLoading(false);
      });
      return () => unsubscribeProfile();
    }
  }, [user]);

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    await authService.signUpWithEmail(email, password, name);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await authService.signInWithEmail(email, password);
  };

  const sendVerification = async () => {
    if (user) {
      await authService.sendVerification(user);
    }
  };

  const logout = async () => {
    await authService.logout();
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin, 
      signInWithGoogle, 
      signUpWithEmail,
      signInWithEmail,
      sendVerification,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
