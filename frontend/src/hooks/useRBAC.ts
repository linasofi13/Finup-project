"use client";

import { useAuth } from "@/hooks/useAuth";

// Definimos los roles disponibles en la aplicación
export const Roles = {
  ADMIN: "Admin",
  CONSULTOR: "Consultor"
};

// Función para verificar si un usuario tiene un rol específico
export const useRBAC = () => {
  const { user } = useAuth();

  // Función para comprobar si el usuario tiene un rol específico
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    console.log("Current user role:", user.rol); // Log para depuración
    return user.rol?.toLowerCase() === role.toLowerCase();
  };

  // Función para verificar si el usuario es administrador
  const isAdmin = (): boolean => {
    const isAdminUser = hasRole(Roles.ADMIN);
    console.log("Is admin check:", isAdminUser); // Log para depuración
    return isAdminUser;
  };

  // Función para verificar si el usuario es consultor
  const isConsultor = (): boolean => {
    return hasRole(Roles.CONSULTOR);
  };

  // Función para comprobar si el usuario puede realizar acciones de escritura/modificación
  // Solo los administradores pueden modificar datos
  const canModify = (): boolean => {
    const canModifyResult = isAdmin();
    console.log("Can modify check:", canModifyResult); // Log para depuración
    return canModifyResult;
  };

  // Función para comprobar si el usuario puede ver la configuración
  // Solo los administradores pueden acceder a configuración
  const canAccessConfig = (): boolean => {
    return isAdmin();
  };

  return {
    hasRole,
    isAdmin,
    isConsultor,
    canModify,
    canAccessConfig
  };
}; 