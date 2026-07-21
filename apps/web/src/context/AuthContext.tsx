import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User { id: string; email: string; fullName: string; bio: string; avatarUrl: string; isDemo?: boolean; }
interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (accessKey?: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const DEFAULT_USER: User = {
  id: 'engineer-01',
  email: 'engineer@nexus.dev',
  fullName: 'Nexus Workspace Engineer',
  bio: 'Local Workspace Mode (Auth Bypassed)',
  avatarUrl: '',
  isDemo: true,
};

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [token, setToken] = useState<string | null>('nexus-offline-mode-token');
  const [loading] = useState(false);

  useEffect(() => {
    if (!user) {
      setUser(DEFAULT_USER);
    }
  }, [user]);

  const login = async (_accessKey?: string) => {
    setUser(DEFAULT_USER);
    setToken('nexus-offline-mode-token');
  };

  const register = async (_email: string, _password: string, _fullName: string) => {
    setUser(DEFAULT_USER);
    setToken('nexus-offline-mode-token');
  };

  const logout = () => {
    setUser(DEFAULT_USER);
    setToken('nexus-offline-mode-token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};



