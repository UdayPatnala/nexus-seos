import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';

interface User { id: string; email: string; fullName: string; bio: string; avatarUrl: string; }
interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.auth.me()
        .then(setUser)
        .catch(() => { localStorage.removeItem('nexus_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem('nexus_token', data.token);
    setToken(data.token);
    setUser({ id: '', email: data.email, fullName: data.fullName, bio: '', avatarUrl: '' });
  };

  const register = async (email: string, password: string, fullName: string) => {
    const data = await api.auth.register(email, password, fullName);
    localStorage.setItem('nexus_token', data.token);
    setToken(data.token);
    setUser({ id: '', email: data.email, fullName: data.fullName, bio: '', avatarUrl: '' });
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    setToken(null);
    setUser(null);
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


