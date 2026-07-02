"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getCurrentUser } from "@/lib/api/auth";
import type { CurrentUserResponse } from "@/types/auth";

type AuthContextValue = {
  currentUser: CurrentUserResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshCurrentUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_TOKEN_KEY = "authToken";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(
    null,
  );
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async (savedToken: string) => {
    try {
      setIsLoading(true);

      const user = await getCurrentUser(savedToken);

      setCurrentUser(user);
      setToken(savedToken);
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setCurrentUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!savedToken) {
      setCurrentUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    await loadCurrentUser(savedToken);
  }, [loadCurrentUser]);

  function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setCurrentUser(null);
    setToken(null);
  }

  useEffect(() => {
    void Promise.resolve().then(() => refreshCurrentUser());
  }, [refreshCurrentUser]);

  const value: AuthContextValue = {
    currentUser,
    token,
    isLoading,
    isAuthenticated: currentUser !== null,
    logout,
    refreshCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
