"use client";

import { createContext, useContext, useState } from "react";
import { SessionProvider } from "next-auth/react";

type AuthContextType = {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within Providers");
  }
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const login = (email: string, _password: string) => {
    setUser({ name: email.split("@")[0], email });
    setIsLoggedIn(true);
    setIsLoginOpen(false);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <SessionProvider>
      <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoginOpen, setIsLoginOpen }}>
        {children}
      </AuthContext.Provider>
    </SessionProvider>
  );
}
