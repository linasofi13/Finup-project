"use client";

import { ReactNode } from "react";
import { useRBAC } from "@/hooks/useRBAC";

interface ProtectedContentProps {
  children: ReactNode;
  requiredPermission: "modify" | "accessConfig" | "admin" | "consultor";
  fallback?: ReactNode;
}

export default function ProtectedContent({
  children,
  requiredPermission,
  fallback = null,
}: ProtectedContentProps) {
  const { isAdmin, isConsultor, canModify, canAccessConfig } = useRBAC();

  // Determinar si el usuario tiene el permiso requerido
  const hasPermission = () => {
    switch (requiredPermission) {
      case "modify":
        return canModify();
      case "accessConfig":
        return canAccessConfig();
      case "admin":
        return isAdmin();
      case "consultor":
        return isConsultor();
      default:
        return false;
    }
  };

  // Renderizar el contenido solo si tiene permiso, de lo contrario mostrar el fallback
  return hasPermission() ? <>{children}</> : <>{fallback}</>;
}
