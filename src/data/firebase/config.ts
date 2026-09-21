import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  setPersistence,
  type Auth
} from 'firebase/auth';
import {
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  terminate,
  clearIndexedDbPersistence,
  type Firestore
} from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Object.values(config).every(Boolean);
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

export function getFirebaseAuth() {
  if (!isFirebaseConfigured) return undefined;
  app ??= initializeApp(config);
  auth ??= getAuth(app);
  return auth;
}

export async function initializeDataStore(trusted: boolean) {
  if (!isFirebaseConfigured) return undefined;
  app ??= initializeApp(config);
  const currentAuth = getFirebaseAuth()!;
  await setPersistence(currentAuth, trusted ? browserLocalPersistence : browserSessionPersistence);
  firestore ??= initializeFirestore(app, {
    localCache: trusted
      ? persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      : memoryLocalCache()
  });
  return firestore;
}

export function getInitializedDataStore() {
  return firestore;
}

export async function clearLocalFirebaseData() {
  if (!firestore) return;
  const current = firestore;
  firestore = undefined;
  await terminate(current);
  await clearIndexedDbPersistence(current);
}
