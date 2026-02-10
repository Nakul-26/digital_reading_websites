import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { api } from './api';
import { useNavigate } from 'react-router-dom';

interface IUser {
  _id: string;
  username: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  user: IUser | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate(); // Initialize useNavigate

  const checkAuth = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
    }
    setLoading(false);
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore logout API failures and clear local auth state regardless.
    }
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, loading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
