
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Logo } from '@/components/logo';

export interface Address {
  id: string;
  name: string;
  details: string;
}

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: any;
  loyaltyPoints: number;
  isAdmin?: boolean;
  favoriteRestaurants?: string[];
  favoriteMeals?: string[];
  addresses?: Address[];
  ownedRestaurants?: string[];
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null; 
  loading: boolean;
  setUserData: Dispatch<SetStateAction<UserData | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  setUserData: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onIdTokenChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        // Post the token to the API route
        const token = await user.getIdToken();
        await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          } else {
            setUserData(null);
          }
          setLoading(false);
        });
        return () => unsubscribeFirestore();
      } else {
        await fetch('/api/auth/session', { method: 'DELETE' });
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <Logo />
                <p className="text-muted-foreground">Initializing secure connection...</p>
            </div>
        </div>
     )
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, setUserData }}>
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
