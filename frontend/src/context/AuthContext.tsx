'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { authService, User, LoginCredentials, RegisterData } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          const data = await authService.validateToken(token);
          setUser(data.user);
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
      const data = await authService.login({ email, password });
      
      // Store token in cookie with enhanced security
      Cookies.set('auth_token', data.token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' // Helps prevent CSRF attacks
      });
      
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      // Extract error message properly
      const errorMessage = err.response?.data?.detail;
      setError(Array.isArray(errorMessage) ? errorMessage[0].msg : errorMessage || 'Error al iniciar sesión');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const data = await authService.register({ name, email, password });
      
      // Store token in cookie with enhanced security
      Cookies.set('auth_token', data.access_token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      setUser({
        id: data.id,
        email: data.email,
        name: data.username
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