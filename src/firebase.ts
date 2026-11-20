import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore, Firestore } from 'firebase/firestore';
import provisionedConfig from '../firebase-applet-config.json';

/**
 * EcoBite Firebase Configuration (Modular Firebase v10+ SDK)
 *
 * By default, EcoBite loads the provisioned AI Studio project from `firebase-applet-config.json`.
 * To connect your own standalone Firebase project, replace the values in `fallbackConfig` below
 * and switch `firebaseConfig` to use `fallbackConfig`.
 */
const fallbackConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
  firestoreDatabaseId: '(default)',
};

const activeConfig =
  provisionedConfig && provisionedConfig.apiKey && !provisionedConfig.apiKey.startsWith('YOUR_')
    ? provisionedConfig
    : fallbackConfig;

export const isFirebaseConfigured = Boolean(
  activeConfig.apiKey &&
    !activeConfig.apiKey.startsWith('YOUR_') &&
    activeConfig.projectId &&
    !activeConfig.projectId.startsWith('YOUR_') &&
    activeConfig.projectId !== 'remixed-project-id'
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(activeConfig);
  authInstance = getAuth(app);
  // Critical: bind to the provisioned Firestore databaseId when present
  dbInstance =
    'firestoreDatabaseId' in activeConfig && activeConfig.firestoreDatabaseId && activeConfig.firestoreDatabaseId !== '(default)'
      ? getFirestore(app, activeConfig.firestoreDatabaseId)
      : getFirestore(app);
  googleProviderInstance = new GoogleAuthProvider();
  googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
}

export const auth = authInstance as Auth;
export const db = dbInstance as Firestore;
export const googleProvider = googleProviderInstance as GoogleAuthProvider;
export const ADMIN_EMAIL = 'twrshivam001@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid ?? null,
      email: authInstance?.currentUser?.email ?? null,
      emailVerified: authInstance?.currentUser?.emailVerified ?? null,
      isAnonymous: authInstance?.currentUser?.isAnonymous ?? null,
      tenantId: authInstance?.currentUser?.tenantId ?? null,
      providerInfo:
        authInstance?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<void> {
  if (!isFirebaseConfigured || !dbInstance) return;
  try {
    await getDocFromServer(doc(dbInstance, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. Firestore client is offline.');
    }
  }
}

testConnection();
