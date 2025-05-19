"use client";

import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { authService, RegisterData } from "../services/authService";

interface User {
  id: string;
  email: string;
  username?: string;
  rol?: string;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  register: (data: RegisterData) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("auth_token");

        if (!token) {
          setLoading(false);
          return;
        }

        console.log("Validating token...");
        const response = await axios.get("/api/auth/validate");
        console.log("Token validated:", response.data);

        setUser(response.data);
      } catch (err) {
        console.error("Error validating token:", err);
        Cookies.remove("auth_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post("/api/auth/login", { email, password });
      const { access_token, user: userData } = response.data;

      Cookies.set("auth_token", access_token, {
        expires: 7,
        sameSite: "lax",
      });

      setUser(userData);
      console.log("Login successful:", userData);

      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Error during login");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove("auth_token");
    setUser(null);
    window.location.href = "/login";
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      await authService.register(data);
      // Redirect to login page after successful registration
      window.location.href = "/login";
    } catch (err: any) {
      console.error("Registration failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error during registration";
      setError(errorMessage);
      throw err; // Re-throw so UI can handle it if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, setUser, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
