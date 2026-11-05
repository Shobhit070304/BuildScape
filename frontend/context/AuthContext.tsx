"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { api, AuthUser } from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  updateUsername: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session via cookie from backend on mount
  useEffect(() => {
    let isMounted = true;
    api
      .getMe()
      .then(({ user: me }) => {
        if (isMounted) setUser(me);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credential: string) => {
    const { user: me } = await api.googleLogin(credential);
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    // Keep the authenticated UI in place if the server could not clear its cookie.
    await api.logout();
    setUser(null);
  }, []);

  const updateUsername = useCallback(async (username: string) => {
    const result = await api.updateUsername(username);
    setUser((current) => current ? { ...current, username: result.username } : current);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
