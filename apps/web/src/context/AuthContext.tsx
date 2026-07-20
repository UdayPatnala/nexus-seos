import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';

interface User { id: string; email: string; fullName: string; bio: string; avatarUrl: string; isDemo?: boolean; }
interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (accessKey: string) => Promise<void>;
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
      if (token.startsWith('demo-offline-token')) {
        setUser({ id: 'demo-user', email: 'engineer@nexus.dev', fullName: 'Nexus Workspace Engineer', bio: 'Local Workspace Mode', avatarUrl: '', isDemo: true });
        setLoading(false);
      } else {
        api.auth.me()
          .then(setUser)
          .catch((err) => {
            if (err?.message?.includes('Invalid') || err?.message?.includes('unauthorized') || err?.message?.includes('401')) {
              localStorage.removeItem('nexus_token');
              setToken(null);
            }
          })
          .finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (accessKey: string) => {
    try {
      const data = await api.auth.login(accessKey);
      localStorage.setItem('nexus_token', data.token);
      setToken(data.token);
      setUser({ id: '', email: data.email, fullName: data.fullName, bio: '', avatarUrl: '', isDemo: !!data.isDemo });
    } catch (err: any) {
      // If server is cold-starting or unreachable, activate local workspace session instantly
      if (err.message?.includes('hibernation') || err.message?.includes('starting up') || err.message?.includes('fetch') || err.name === 'TypeError') {
        const fallbackToken = 'demo-offline-token-' + Date.now();
        localStorage.setItem('nexus_token', fallbackToken);
        setToken(fallbackToken);
        setUser({ id: 'demo-user', email: 'engineer@nexus.dev', fullName: 'Nexus Workspace Engineer', bio: 'Local Workspace Mode', avatarUrl: '', isDemo: true });
        return;
      }
      throw err;
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    const data = await api.auth.register(email, password, fullName);
    localStorage.setItem('nexus_token', data.token);
    setToken(data.token);
    setUser({ id: '', email: data.email, fullName: data.fullName, bio: '', avatarUrl: '', isDemo: !!data.isDemo });
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


