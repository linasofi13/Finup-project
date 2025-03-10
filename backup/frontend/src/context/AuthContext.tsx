'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = Cookies.get('auth_token');
        if (token) {
          // Validate token with backend
          const response = await axios.get('/api/auth/validate', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setUser(response.data.user);
        }
      } catch (err) {
        Cookies.remove('auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/login', { 
        email, 
        password 
      });
      
      // Store token in cookie with enhanced security
      Cookies.set('auth_token', response.data.token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' // Helps prevent CSRF attacks
      });
      
      setUser(response.data.user);
      
      router.push('/dashboard');
    } catch (err: any) {
      // Extract error message properly
      const errorMessage = err.response?.data?.detail;
      setError(Array.isArray(errorMessage) ? errorMessage[0].msg : errorMessage || 'Error al iniciar sesión');
      throw err;
    }
  };

  // Similar changes for register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/register', { 
        name,
        email, 
        password 
      });
      
      // Store token in cookie with enhanced security
      Cookies.set('auth_token', response.data.access_token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      setUser({
        id: response.data.id,
        email: response.data.email,
        name: response.data.username // Note: backend returns username, not name
      });
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
      throw err;
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};