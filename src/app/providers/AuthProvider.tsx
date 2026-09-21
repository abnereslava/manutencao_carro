import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '../../data/firebase/config';

const ALLOWED_EMAILS = ['abner.eslava@gmail.com', 'mariner.eslava@gmail.com'];
interface AppUser {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  demo?: boolean;
}
interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  denied: boolean;
  configured: boolean;
  signIn: () => Promise<void>;
  enterDemo: () => void;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(user: User): AppUser {
  return {
    uid: user.uid,
    email: user.email ?? '',
    name: user.displayName ?? user.email ?? 'Usuário',
    photoURL: user.photoURL ?? undefined
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [denied, setDenied] = useState(false);
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setDenied(false);
        setLoading(false);
        return;
      }
      const allowed =
        firebaseUser.emailVerified &&
        firebaseUser.email &&
        ALLOWED_EMAILS.includes(firebaseUser.email);
      setDenied(!allowed);
      setUser(allowed ? mapUser(firebaseUser) : null);
      setLoading(false);
    });
  }, []);
  const signIn = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } finally {
      setLoading(false);
    }
  };
  const enterDemo = () =>
    setUser({ uid: 'demo', email: 'demo@carango.local', name: 'Modo demonstração', demo: true });
  const logout = async () => {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    setUser(null);
  };
  const value = useMemo(
    () => ({ user, loading, denied, configured: isFirebaseConfigured, signIn, enterDemo, logout }),
    [user, loading, denied]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return value;
}
