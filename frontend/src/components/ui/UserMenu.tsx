"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  email: string;
  name: string;
  rol: string;
}

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-4">
      {/* Badge de rol más grande */}
      <span className="ml-2 px-3 py-1 rounded-full bg-gray-200 text-sm font-semibold text-gray-700 border border-gray-300 uppercase tracking-wide">
        {user.rol}
      </span>

      {/* Mi Perfil link con barrita abajo */}
      <Link
        href="/profile"
        className={`relative text-sm font-medium px-2 py-2 transition-colors duration-300
          ${
            pathname === "/profile"
              ? "text-bancolombia-blue after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-1 after:bg-[#FFE600] after:rounded-t"
              : "text-bancolombia-text hover:text-bancolombia-blue after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-1 after:bg-[#FFE600] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
          }
        `}
        style={{ minWidth: 80, textAlign: "center" }}
      >
        Mi Perfil
      </Link>

      {/* Cerrar sesión con barrita en hover */}
      <button
        onClick={logout}
        className="relative text-sm font-medium text-bancolombia-text px-2 py-2 transition-colors duration-300
          hover:text-bancolombia-blue
          after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-1 after:bg-[#FFE600] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
        style={{ minWidth: 80, textAlign: "center" }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
