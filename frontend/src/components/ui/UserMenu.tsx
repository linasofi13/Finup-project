"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-4">
      {/* User greeting */}
      <span className="text-sm text-bancolombia-text">Hola, {user.name}</span>

      {/* Dashboard link */}
      <Link
        href="/dashboard"
        className={`text-sm font-medium transition-colors duration-300 p-2 rounded-md ${
          pathname === "/dashboard"
            ? "text-bancolombia-blue bg-yellow-400"
            : "text-bancolombia-text hover:text-bancolombia-blue hover:bg-yellow-400"
        }`}
      >
        Dashboard
      </Link>

      {/* Profile link */}
      <Link
        href="/profile"
        className={`text-sm font-medium transition-colors duration-300 p-2 rounded-md ${
          pathname === "/profile"
            ? "text-bancolombia-blue bg-yellow-400"
            : "text-bancolombia-text hover:text-bancolombia-blue hover:bg-yellow-400"
        }`}
      >
        Mi Perfil
      </Link>

      {/* Logout button */}
      <button
        onClick={logout}
        className="text-sm font-medium text-bancolombia-text hover:text-bancolombia-blue hover:bg-yellow-400 p-2 rounded-md transition-colors duration-300"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
