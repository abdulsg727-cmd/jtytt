"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, getSessionId } from './firebase';
import { updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync user profile to Firestore & attach to active visitor session
  const syncUserProfile = async (authUser: User) => {
    try {
      const userRef = doc(db, 'users', authUser.uid);
      const userSnap = await getDoc(userRef);
      const now = new Date().toISOString();

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: authUser.uid,
          email: authUser.email || '',
          displayName: authUser.displayName || 'Traveler',
          photoURL: authUser.photoURL || '',
          createdAt: now,
          lastLoginAt: now,
        });
      } else {
        await updateDoc(userRef, {
          lastLoginAt: now,
          ...(authUser.displayName ? { displayName: authUser.displayName } : {}),
          ...(authUser.photoURL ? { photoURL: authUser.photoURL } : {}),
        });
      }

      // Sync with current visitor session for live dashboard tracking
      const sessionId = getSessionId();
      const sessionRef = doc(db, 'visitor_sessions', sessionId);
      await updateDoc(sessionRef, {
        userId: authUser.uid,
        userEmail: authUser.email || '',
        userName: authUser.displayName || '',
        lastActiveAt: now,
      });
    } catch (err) {
      console.warn('Could not sync user profile to Firestore:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        await syncUserProfile(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const res = await signInWithPopup(auth, provider);
    if (res.user) {
      await syncUserProfile(res.user);
    }
    setIsAuthModalOpen(false);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await syncUserProfile(res.user);
    }
    setIsAuthModalOpen(false);
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      if (name) {
        await updateProfile(res.user, { displayName: name });
      }
      await syncUserProfile(res.user);
    }
    setIsAuthModalOpen(false);
  };

  const signOut = async () => {
    await fbSignOut(auth);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
