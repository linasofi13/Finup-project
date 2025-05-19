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
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  register: (data: RegisterData) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para validar el token actual
  const validateToken = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("auth_token");

      if (!token) {
        setLoading(false);
        return false;
      }

      console.log("Validating token...");
      const response = await axios.get("/api/auth/validate");
      console.log("Token validated, user data:", response.data);

      // Asegurarnos de que el rol esté en el formato correcto
      const userData = {
        ...response.data,
        rol: response.data.rol || response.data.role, // Intentar ambos formatos
      };

      console.log("Setting user with role:", userData.rol);
      setUser(userData);
      return true;
    } catch (err) {
      console.error("Error validating token:", err);

      // Limpiar la cookie y el estado de usuario
      Cookies.remove("auth_token", { path: "/" });
      Cookies.remove("auth_token");

      setUser(null);

      // Si estamos en una ruta protegida, redirigir al login
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register") &&
        window.location.pathname !== "/"
      ) {
        console.log("Redirecting to login due to invalid token");
        window.location.href = "/login";
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar la sesión del usuario
  const refreshSession = async () => {
    await validateToken();
  };

  useEffect(() => {
    validateToken();

    // Configurar un intervalo para validar el token cada hora
    const intervalId = setInterval(
      () => {
        if (Cookies.get("auth_token")) {
          validateToken();
        }
      },
      60 * 60 * 1000,
    ); // 1 hora

    return () => clearInterval(intervalId);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post("/api/auth/login", { email, password });
      const { access_token, user: userData } = response.data;

      // Configurar cookie con expiración de 7 días
      Cookies.set("auth_token", access_token, {
        expires: 7, // 7 días en lugar de la expiración predeterminada
        sameSite: "strict", // Mejor seguridad
        secure: window.location.protocol === "https:", // Solo en HTTPS en producción
        path: "/",
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

  const logout = async () => {
    try {
      // Llamar al endpoint de logout
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Ejecutar siempre estas acciones, incluso si falla la llamada al API

      // Eliminar la cookie de múltiples formas para garantizar que se elimine
      Cookies.remove("auth_token", { path: "/" });
      Cookies.remove("auth_token");
      document.cookie =
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Limpiar el estado
      setUser(null);

      // Forzar una redirección completa para asegurar que se refresque el estado
      window.location.replace("/login");
    }
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
      value={{
        user,
        loading,
        error,
        login,
        logout,
        refreshSession,
        setUser,
        register,
      }}
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
