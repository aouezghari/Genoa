import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/auth-api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const data = await authApi.verifySession();
      console.log("DONNÉES REÇUES DU BACK :", data);
      if (data.status) {
        setUser(data); 
      } else {
        setUser(null);
      }
    } catch (_error) {
      setUser(null); 
    } finally {
      setIsLoading(false); 
    }
  };

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    if (data.status) {
      await checkSession(); 
    }
    return data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};