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
  checkAuth: () => void;
  logout: () => void; // Added logout function
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate(); // Initialize useNavigate

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
      try {
        const res = await api.get('/api/auth/me');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['x-auth-token'];
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login'); // Redirect on failed auth check
      }
    } else {
      delete api.defaults.headers.common['x-auth-token'];
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
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