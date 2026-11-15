"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthUser, LoginCredentials, RegisterData } from "@/types/auth";

/** Contrat public du contexte d'authentification utilisé par les composants. */
interface AuthContextValue {
  user: AuthUser | null;

  isLoading: boolean;

  isAuthenticated: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;

  register: (data: RegisterData) => Promise<void>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Fournit l'utilisateur connecté et les actions d'authentification à l'application.
 * La session est récupérée à l'initialisation depuis le cookie HttpOnly via
 * `/api/auth/session` : le token n'est jamais lu directement côté navigateur.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  /** Recharge la session au montage et après une éventuelle évolution du compte. */
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = (await response.json()) as {
        user: AuthUser | null;
      };

      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    async function initialize() {
      setIsLoading(true);

      await refreshUser();

      setIsLoading(false);
    }

    void initialize();
  }, [refreshUser]);

  /** Se connecte via la route Next.js puis synchronise l'utilisateur en mémoire. */
  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = (await response.json()) as {
      user?: AuthUser;
      message?: string;
    };

    if (!response.ok) {
      throw new Error(data.message ?? "Impossible de vous connecter.");
    }

    if (!data.user) {
      throw new Error("Aucun utilisateur n'a été retourné.");
    }

    setUser(data.user);
  }, []);

  /** Crée le compte puis ouvre automatiquement une session. */
  const register = useCallback(
    async ({ name, email, password }: RegisterData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "Impossible de créer le compte.");
      }

      await login({
        email,
        password,
      });
    },
    [login],
  );

  /** Déconnecte le compte et vide son état dans le contexte. */
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setUser(null); 
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,

      isLoading,

      isAuthenticated: Boolean(user),

      login,

      register,

      logout,

      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Accède au contexte d'authentification.
 * @returns L'utilisateur courant, l'état de chargement et les actions de session.
 * @throws {Error} Si le hook est utilisé hors de `AuthProvider`.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider.");
  }

  return context;
}