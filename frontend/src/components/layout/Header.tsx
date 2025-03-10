"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "@/components/ui/UserMenu";
import { FaBell, FaSearch } from "react-icons/fa";

interface HeaderProps {
  isSidebarOpen: boolean;
}

export default function Header({ isSidebarOpen }: HeaderProps) {
  const { user } = useAuth();
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  
  const toggleNotificaciones = () => {
    setNotificacionesAbiertas(!notificacionesAbiertas);
  };

  return (
    <header 
      className="bg-white shadow-md border-b border-neutral-medium transition-all duration-300 z-40 fixed top-0 left-0 w-full"
      style={{ marginLeft: isSidebarOpen ? "16rem" : "5rem", width: isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 5rem)" }}
    >
      <div className="w-full px-6">
        <div className="max-w-7xl mx-auto flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-neutral-dark text-xl font-bold flex items-center transition-transform duration-200 hover:scale-105">
              <span className="text-secondary mr-1">Fin</span>
              <span className="text-neutral-dark">Up</span>
            </Link>
          </div>

          <div className="relative w-1/3 hidden md:block">
            <input 
              type="text" 
              placeholder="Busca aquí..." 
              className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:bg-white transition"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                className="bg-orange-100 px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-orange-200 transition" 
                onClick={toggleNotificaciones}
              >
                <FaBell className="text-orange-500" />
                <span className="text-sm font-medium text-orange-600">Notificaciones</span>
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1">3</span>
              </button>
              {notificacionesAbiertas && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">Alertas</h3>
                  <ul className="text-sm text-gray-700">
                    <li className="border-b py-2">🔔 Un proveedor ha superado el 30% del costo promedio.</li>
                    <li className="border-b py-2">⚠️ La EVC 'Tech Solutions' ha gastado el 85% de su presupuesto.</li>
                    <li className="py-2">📊 Revisión de presupuesto programada para mañana.</li>
                  </ul>
                </div>
              )}
            </div>

            {user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex space-x-4">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-neutral-dark px-4 py-2 rounded-md transition-all duration-300 hover:bg-neutral-light hover:text-secondary hover:shadow-sm transform hover:-translate-y-0.5"
                >
                  Iniciar sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
