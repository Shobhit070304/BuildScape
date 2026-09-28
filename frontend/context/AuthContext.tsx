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
  token: string | null;
  isLoading: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("bs_token");
    if (!stored) {
      setIsLoading(false);
      return;
    }
    setToken(stored);
    api
      .getMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem("bs_token");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (credential: string) => {
    const { token: jwt, user: me } = await api.googleLogin(credential);
    localStorage.setItem("bs_token", jwt);
    setToken(jwt);
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("bs_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
