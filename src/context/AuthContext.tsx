"use client";

// ============================================================
// Lummen Elite — AuthContext
// Gerencia estado de autenticação, perfil do usuário e RBAC
// ============================================================

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  type UserProfile,
  type UserRole,
  DEFAULT_USER_PROFILE,
  translateFirebaseError,
} from "@/lib/types";

// ============================================================
// Interface do Contexto
// ============================================================

interface AuthContextValue {
  /** Usuário Firebase autenticado (null se não logado) */
  user: FirebaseUser | null;
  /** Perfil completo do Firestore (null se não carregado) */
  profile: UserProfile | null;
  /** true enquanto carrega estado inicial de auth */
  loading: boolean;
  /** true enquanto carrega perfil do Firestore */
  profileLoading: boolean;
  /** Último erro traduzido para português */
  error: string | null;

  /** Login com e-mail e senha */
  loginWithEmail: (email: string, password: string) => Promise<void>;
  /** Cadastro com e-mail, senha e nome */
  registerWithEmail: (
    nome: string,
    email: string,
    password: string,
    creci?: string,
  ) => Promise<void>;
  /** Login/cadastro via Google OAuth */
  loginWithGoogle: () => Promise<void>;
  /** Encerrar sessão */
  logout: () => Promise<void>;
  /** Enviar e-mail de redefinição de senha */
  resetPassword: (email: string) => Promise<void>;
  /** Limpar mensagem de erro */
  clearError: () => void;
  /** Forçar recarregamento do perfil */
  refreshProfile: () => Promise<void>;
  /** Verifica se o usuário tem uma role específica */
  hasRole: (role: UserRole) => boolean;
}

// ============================================================
// Contexto
// ============================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Limpar erro ──
  const clearError = useCallback(() => setError(null), []);

  // ── Buscar/criar perfil no Firestore ──
  const fetchOrCreateProfile = useCallback(
    async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
      try {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          return snap.data() as UserProfile;
        }

        // Provisionamento: criar perfil padrão se não existe
        const newProfile: UserProfile = {
          ...DEFAULT_USER_PROFILE,
          uid: firebaseUser.uid,
          nome: firebaseUser.displayName ?? "Corretor",
          email: firebaseUser.email ?? "",
          criado_em: serverTimestamp() as any,
          atualizado_em: serverTimestamp() as any,
        };

        await setDoc(ref, newProfile);
        return { ...newProfile, criado_em: new Date() as any, atualizado_em: new Date() as any };
      } catch (err) {
        console.error("[Auth] Erro ao buscar/criar perfil:", err);
        return null;
      }
    },
    [],
  );

  // ── Listener de autenticação ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        setProfileLoading(true);
        const profileData = await fetchOrCreateProfile(firebaseUser);
        setProfile(profileData);
        setProfileLoading(false);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchOrCreateProfile]);

  // ── Login com e-mail/senha ──
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      clearError();
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: unknown) {
        const message = translateFirebaseError(err as { code?: string; message?: string });
        setError(message);
        throw new Error(message);
      }
    },
    [clearError],
  );

  // ── Cadastro com e-mail/senha ──
  const registerWithEmail = useCallback(
    async (nome: string, email: string, password: string, creci?: string) => {
      clearError();
      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        // Atualiza display name no Firebase Auth
        await updateProfile(credential.user, { displayName: nome });

        // Cria perfil no Firestore
        const ref = doc(db, "users", credential.user.uid);
        const newProfile: UserProfile = {
          ...DEFAULT_USER_PROFILE,
          uid: credential.user.uid,
          nome,
          email,
          creci: creci || undefined,
          criado_em: serverTimestamp() as any,
          atualizado_em: serverTimestamp() as any,
        };
        await setDoc(ref, newProfile);
      } catch (err: unknown) {
        const message = translateFirebaseError(err as { code?: string; message?: string });
        setError(message);
        throw new Error(message);
      }
    },
    [clearError],
  );

  // ── Login via Google OAuth ──
  const loginWithGoogle = useCallback(async () => {
    clearError();
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);

      // Verificar se é novo usuário e criar perfil se necessário
      const ref = doc(db, "users", credential.user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        const newProfile: UserProfile = {
          ...DEFAULT_USER_PROFILE,
          uid: credential.user.uid,
          nome: credential.user.displayName ?? "Corretor",
          email: credential.user.email ?? "",
          criado_em: serverTimestamp() as any,
          atualizado_em: serverTimestamp() as any,
        };
        await setDoc(ref, newProfile);
      }
    } catch (err: unknown) {
      const message = translateFirebaseError(err as { code?: string; message?: string });
      setError(message);
      throw new Error(message);
    }
  }, [clearError]);

  // ── Logout ──
  const logout = useCallback(async () => {
    clearError();
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err: unknown) {
      const message = translateFirebaseError(err as { code?: string; message?: string });
      setError(message);
    }
  }, [clearError]);

  // ── Reset de senha ──
  const resetPassword = useCallback(
    async (email: string) => {
      clearError();
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (err: unknown) {
        const message = translateFirebaseError(err as { code?: string; message?: string });
        setError(message);
        throw new Error(message);
      }
    },
    [clearError],
  );

  // ── Refresh do perfil ──
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    const data = await fetchOrCreateProfile(user);
    setProfile(data);
    setProfileLoading(false);
  }, [user, fetchOrCreateProfile]);

  // ── RBAC: verificar role ──
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return profile?.role === role;
    },
    [profile],
  );

  // ── Valor do contexto (memoizado) ──
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      profileLoading,
      error,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
      resetPassword,
      clearError,
      refreshProfile,
      hasRole,
    }),
    [
      user,
      profile,
      loading,
      profileLoading,
      error,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
      resetPassword,
      clearError,
      refreshProfile,
      hasRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export type { AuthContextValue };
