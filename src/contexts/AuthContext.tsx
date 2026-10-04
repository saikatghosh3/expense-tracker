import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { storage, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../data/storage';
import type { User } from '../types';
import { generateSalt, hashPassword, verifyPassword } from '../utils/hash';

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
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/** Deliberately vague so the form never reveals whether an email is registered. */
const GENERIC_AUTH_ERROR = 'Incorrect email or password.';

/**
 * Creates the default admin account once, with a hashed password.
 * Runs asynchronously because hashing is async, so it cannot happen during seed construction.
 */
async function ensureSeedAdmin(): Promise<void> {
  if (storage.isSeeded()) return;

  const existing = storage.getUserByEmail(DEFAULT_ADMIN_EMAIL);
  if (!existing) {
    const salt = generateSalt();
    const password = await hashPassword(DEFAULT_ADMIN_PASSWORD, salt);
    storage.createUser({
      email: DEFAULT_ADMIN_EMAIL,
      fullName: 'Administrator',
      password,
      passwordSalt: salt,
    });
    storage.updateUser(
      storage.getUserByEmail(DEFAULT_ADMIN_EMAIL)?.id ?? '',
      { isAdmin: true },
    );
  }

  storage.markSeeded();
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        await ensureSeedAdmin();
        if (active) setUser(storage.getCurrentUser());
      } catch (error) {
        console.error('Auth initialisation failed:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void init();

    return () => {
      active = false;
    };
  }, []);

  // Keep other tabs in sync with sign-in / sign-out.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'expense-tracker-data') setUser(storage.getCurrentUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const refreshUser = useCallback(() => {
    setUser(storage.getCurrentUser());
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (storage.getUserByEmail(normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const salt = generateSalt();
    const hashed = await hashPassword(password, salt);

    const newUser = storage.createUser({
      email: normalizedEmail,
      fullName,
      password: hashed,
      passwordSalt: salt,
    });

    storage.setCurrentUser(newUser.id);
    setUser(newUser);
  };

  const signIn = async (email: string, password: string) => {
    const found = storage.getUserByEmail(email.trim().toLowerCase());

    // Always run a hash so a missing account and a wrong password take
    // comparable time, and always report the same message.
    if (!found) {
      await hashPassword(password, generateSalt());
      throw new Error(GENERIC_AUTH_ERROR);
    }

    if (found.passwordSalt) {
      const valid = await verifyPassword(password, found.passwordSalt, found.password);
      if (!valid) throw new Error(GENERIC_AUTH_ERROR);
    } else if (found.password !== password) {
      // Legacy account created before passwords were hashed.
      throw new Error(GENERIC_AUTH_ERROR);
    } else {
      // Upgrade the stored credential to a hash on first successful login.
      const salt = generateSalt();
      const hashed = await hashPassword(password, salt);
      storage.updateUser(found.id, { password: hashed, passwordSalt: salt });
    }

    storage.setCurrentUser(found.id);
    setUser(storage.getCurrentUser());
  };

  const signOut = async () => {
    storage.setCurrentUser(null);
    setUser(null);
  };

  const updateProfile = async (updates: {
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    if (!user) throw new Error('You must be signed in to update your profile.');

    const patches: Parameters<typeof storage.updateUser>[1] = {};

    if (updates.fullName?.trim()) {
      patches.fullName = updates.fullName.trim();
    }

    if (updates.email && updates.email.trim().toLowerCase() !== user.email) {
      patches.email = updates.email.trim().toLowerCase();
    }

    if (updates.newPassword) {
      if (updates.newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters.');
      }
      if (updates.newPassword === updates.currentPassword) {
        throw new Error('New password must be different from your current password.');
      }

      const currentValid = user.passwordSalt
        ? await verifyPassword(updates.currentPassword ?? '', user.passwordSalt, user.password)
        : user.password === updates.currentPassword;

      if (!currentValid) {
        throw new Error('Current password is incorrect.');
      }

      const salt = generateSalt();
      patches.password = await hashPassword(updates.newPassword, salt);
      patches.passwordSalt = salt;
    }

    if (Object.keys(patches).length === 0) {
      throw new Error('Nothing to update.');
    }

    const updated = storage.updateUser(user.id, patches);
    if (!updated) throw new Error('Could not save your changes.');

    setUser(updated);
  };

  const value = {
    user,
    loading,
    isAdmin: user?.isAdmin ?? false,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
