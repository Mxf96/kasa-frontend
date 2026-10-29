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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);

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

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider.");
  }

  return context;
}