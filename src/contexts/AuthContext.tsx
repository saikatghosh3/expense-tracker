import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage, User } from '../data/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: {
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check this  for existing session
    const currentUser = storage.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // This condition Checks if user already exists
    const existingUser = storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser = storage.createUser({
      email,
      password,
      fullName,
      isAdmin: false,
    });

    setUser(newUser);
    storage.setCurrentUser(newUser);
  };

  const signIn = async (email: string, password: string) => {
    const user = storage.getUserByEmail(email);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.password !== password) {
      throw new Error('Invalid password');
    }

    setUser(user);
    storage.setCurrentUser(user);
  };

  const signOut = async () => {
    setUser(null);
    storage.setCurrentUser(null);
  };

  const updateProfile = async (updates: {
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    if (!user) throw new Error('Not authenticated');

    if (updates.email && updates.email !== user.email) {
      const existing = storage.getUserByEmail(updates.email);
      if (existing && existing.id !== user.id) {
        throw new Error('Email is already in use');
      }
    }

    if (updates.newPassword) {
      if (!updates.currentPassword || updates.currentPassword !== user.password) {
        throw new Error('Current password is incorrect');
      }
      if (updates.newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters');
      }
    }

    const updatedUser = storage.updateUser(user.id, {
      fullName: updates.fullName ?? user.fullName,
      email: updates.email ?? user.email,
      password: updates.newPassword ?? user.password,
    });

    if (updatedUser) {
      setUser(updatedUser);
      storage.setCurrentUser(updatedUser);
    }
  };

  const value = {
    user,
    loading,
    isAdmin: user?.isAdmin || false,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};