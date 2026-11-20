import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  ADMIN_EMAIL,
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  isFirebaseConfigured,
} from '../firebase';
import { DEMO_USER_PROFILE } from '../data/catalog';
import { LucknowArea, UserProfile } from '../types';

export interface OnboardingPayload {
  fullName: string;
  phone: string;
  organization: string;
  area: LucknowArea;
  addressLine: string;
  referredBy?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  isDemoMode: boolean;
  isAdminUser: boolean;
  needsEmailVerification: boolean;
  emailProviderDisabled: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshVerification: () => Promise<boolean>;
  logout: () => Promise<void>;
  saveOnboardingProfile: (payload: OnboardingPayload) => Promise<void>;
  updateUserProfile: (payload: Omit<OnboardingPayload, 'referredBy'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_PROFILE_STORAGE_KEY = 'ecobite_demo_profile_v1';

export function buildReferralCode(fullName: string): string {
  const cleaned = fullName
    .trim()
    .split(/\s+/)[0]
    ?.replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6);
  const base = cleaned && cleaned.length >= 2 ? cleaned : 'FRIEND';
  return `ECO-${base}25`;
}

function serializeTimestamp(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (!isFirebaseConfigured) return true;
    return localStorage.getItem('ecobite_demo_mode') === 'true';
  });
  const [emailProviderDisabled, setEmailProviderDisabled] = useState<boolean>(false);

  const loadDemoProfile = useCallback((): UserProfile => {
    try {
      const saved = localStorage.getItem(DEMO_PROFILE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as UserProfile;
      }
    } catch {
      // ignore storage errors
    }
    return DEMO_USER_PROFILE;
  }, []);

  useEffect(() => {
    if (isDemoMode || !isFirebaseConfigured || !auth) {
      if (isDemoMode) {
        setProfile(loadDemoProfile());
      } else {
        setProfile(null);
      }
      setUser(null);
      setLoading(false);
      setProfileLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (!firebaseUser) {
        setProfile(null);
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isDemoMode, loadDemoProfile]);

  useEffect(() => {
    if (isDemoMode || !isFirebaseConfigured || !db || !user) {
      return;
    }

    if (!user.emailVerified) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const userPath = `users/${user.uid}`;
    const docRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            uid: data.uid,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            organization: data.organization,
            area: data.area,
            addressLine: data.addressLine,
            referralCode: data.referralCode,
            referredBy: data.referredBy,
            onboardingComplete: Boolean(data.onboardingComplete),
            createdAt: serializeTimestamp(data.createdAt),
            updatedAt: serializeTimestamp(data.updatedAt),
          });
        } else {
          setProfile(null);
        }
        setProfileLoading(false);
      },
      (error) => {
        setProfileLoading(false);
        handleFirestoreError(error, OperationType.GET, userPath);
      }
    );

    return () => unsubscribe();
  }, [isDemoMode, user]);

  const enableDemoMode = useCallback(() => {
    localStorage.setItem('ecobite_demo_mode', 'true');
    setIsDemoMode(true);
    setProfile(loadDemoProfile());
  }, [loadDemoProfile]);

  const disableDemoMode = useCallback(() => {
    localStorage.removeItem('ecobite_demo_mode');
    setIsDemoMode(false);
    setProfile(null);
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase is not configured yet. Switch to Demo Mode to preview.');
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/operation-not-allowed') {
        setEmailProviderDisabled(true);
        throw new Error(
          'Email/Password sign-in is not enabled in Firebase Console yet. Use Continue with Google, or enable Email/Password under Authentication → Sign-in method.'
        );
      }
      throw err;
    }
  };

  const signupWithEmail = async (email: string, password: string, fullName: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase is not configured yet. Switch to Demo Mode to preview.');
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (fullName.trim()) {
        await updateProfile(cred.user, { displayName: fullName.trim() });
      }
      await sendEmailVerification(cred.user);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/operation-not-allowed') {
        setEmailProviderDisabled(true);
        throw new Error(
          'Email/Password sign-up is not enabled in Firebase Console yet. Use Continue with Google, or enable Email/Password under Authentication → Sign-in method.'
        );
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      throw new Error('Firebase is not configured yet. Switch to Demo Mode to preview.');
    }
    await signInWithPopup(auth, googleProvider);
  };

  const sendPasswordReset = async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase is not configured yet.');
    }
    await sendPasswordResetEmail(auth, email.trim());
  };

  const resendVerificationEmail = async () => {
    if (!auth?.currentUser) return;
    await sendEmailVerification(auth.currentUser);
  };

  const refreshVerification = async (): Promise<boolean> => {
    if (!auth?.currentUser) return false;
    await auth.currentUser.reload();
    const verified = auth.currentUser.emailVerified;
    if (verified) {
      // Trigger state update with refreshed user reference
      setUser({ ...auth.currentUser } as User);
    }
    return verified;
  };

  const logout = async () => {
    if (isDemoMode) {
      disableDemoMode();
      return;
    }
    if (auth) {
      await signOut(auth);
    }
    setProfile(null);
  };

  const saveOnboardingProfile = async (payload: OnboardingPayload) => {
    const cleanName = payload.fullName.trim().slice(0, 100);
    const cleanPhone = payload.phone.trim().slice(0, 20);
    const cleanOrg = payload.organization.trim().slice(0, 120);
    const cleanAddr = payload.addressLine.trim().slice(0, 250);
    const cleanRef = payload.referredBy?.trim().toUpperCase().slice(0, 32);

    if (isDemoMode) {
      const nextProfile: UserProfile = {
        ...DEMO_USER_PROFILE,
        fullName: cleanName,
        phone: cleanPhone,
        organization: cleanOrg,
        area: payload.area,
        addressLine: cleanAddr,
        referralCode: buildReferralCode(cleanName),
        ...(cleanRef ? { referredBy: cleanRef } : {}),
        onboardingComplete: true,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
      setProfile(nextProfile);
      return;
    }

    if (!db || !user) throw new Error('Not authenticated.');
    const path = `users/${user.uid}`;
    const docData: Record<string, unknown> = {
      uid: user.uid,
      fullName: cleanName,
      email: (user.email || 'student@ecobite.in').slice(0, 150),
      phone: cleanPhone,
      organization: cleanOrg,
      area: payload.area,
      addressLine: cleanAddr,
      referralCode: buildReferralCode(cleanName),
      onboardingComplete: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (cleanRef) {
      docData.referredBy = cleanRef;
    }

    try {
      await setDoc(doc(db, 'users', user.uid), docData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateUserProfile = async (payload: Omit<OnboardingPayload, 'referredBy'>) => {
    const cleanName = payload.fullName.trim().slice(0, 100);
    const cleanPhone = payload.phone.trim().slice(0, 20);
    const cleanOrg = payload.organization.trim().slice(0, 120);
    const cleanAddr = payload.addressLine.trim().slice(0, 250);

    if (isDemoMode) {
      const current = profile || loadDemoProfile();
      const updated: UserProfile = {
        ...current,
        fullName: cleanName,
        phone: cleanPhone,
        organization: cleanOrg,
        area: payload.area,
        addressLine: cleanAddr,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(updated));
      setProfile(updated);
      return;
    }

    if (!db || !user) throw new Error('Not authenticated.');
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: cleanName,
        phone: cleanPhone,
        organization: cleanOrg,
        area: payload.area,
        addressLine: cleanAddr,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const isAdminUser = isDemoMode
    ? true
    : Boolean(user?.emailVerified && user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  const needsEmailVerification = Boolean(!isDemoMode && user && !user.emailVerified);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileLoading,
        isDemoMode,
        isAdminUser,
        needsEmailVerification,
        emailProviderDisabled,
        enableDemoMode,
        disableDemoMode,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        sendPasswordReset,
        resendVerificationEmail,
        refreshVerification,
        logout,
        saveOnboardingProfile,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
