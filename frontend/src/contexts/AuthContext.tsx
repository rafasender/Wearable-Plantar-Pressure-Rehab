import React, { createContext, useContext, useMemo, useState } from "react";
import { AuthUser } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "gaitvision.auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const persisted = localStorage.getItem(STORAGE_KEY);
    if (!persisted) return null;
    try {
      return JSON.parse(persisted) as AuthUser;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Informe email e senha.");
    }

    const displayName = email.split("@")[0] || "fisioterapeuta";
    const authUser: AuthUser = { email, name: displayName };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
