import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cxo_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('cxo_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync current user from server on boot
  useEffect(() => {
    const initAuth = async () => {
      const currentToken = localStorage.getItem('cxo_token');
      if (currentToken) {
        try {
          const res = await authService.getMe();
          if (res.data && res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('cxo_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session invalid or expired.');
          localStorage.removeItem('cxo_token');
          localStorage.removeItem('cxo_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginWithToken = (newToken, userData) => {
    localStorage.setItem('cxo_token', newToken);
    localStorage.setItem('cxo_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('cxo_user', JSON.stringify(merged));
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = !!user && user.role === 'admin' && user.status === 'accepted';
  const isMainAdmin = !!user && user.role === 'admin' && !!user.isMainAdmin;
  const status = user ? user.status : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isMainAdmin,
        status,
        loginWithToken,
        updateUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
