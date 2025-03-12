"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "@/components/ui/UserMenu";
import { FaBell, FaSearch, FaChartLine } from "react-icons/fa";

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
      style={{ marginLeft: isSidebarOpen ? "16rem" : "0", width: isSidebarOpen ? "calc(100% - 16rem)" : "100%" }}
    >
      <div className="w-full px-6">
        <div className="max-w-7xl mx-auto flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            {/* Logo con icono */}
            <Link href="/" legacyBehavior>
              <a className="text-neutral-dark text-xl font-bold flex items-center transition-transform duration-200 hover:scale-105">
                <FaChartLine className="text-[#FFE600] mr-2 text-xl" />
                <span className="text-[#FFE600] mr-1">Fin</span>
                <span className="text-[#2c2a29]">Up</span>
              </a>
            </Link>
            
            {/* Enlace de Inicio con línea en hover */}
            <Link href="/" legacyBehavior>
              <a className="text-[#2c2a29] font-medium relative pb-1 group">
                Inicio
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFE600] transition-all duration-300 group-hover:w-full"></span>
              </a>
            </Link>
          </div>

          <div className="relative w-1/3 hidden md:block">
            <input 
              type="text" 
              placeholder="Busca aquí..." 
              className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFE600] focus:bg-white transition"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="flex items-center space-x-6">
            {user && (
              <div className="relative">
                <button 
                  className="bg-[#ffe474] px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-[#FFE600] transition shadow-sm" 
                  onClick={toggleNotificaciones}
                >
                  <FaBell className="text-[#2c2a29]" />
                  <span className="text-sm font-medium text-[#2c2a29]">Notificaciones</span>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
                </button>
                {notificacionesAbiertas && (
                  <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md p-4 border border-gray-200 z-50">
                    <h3 className="text-lg font-semibold mb-2">Alertas</h3>
                    <ul className="text-sm text-gray-700">
                      <li className="border-b py-2 flex items-center">
                        <span className="bg-[#ffe474] p-1 rounded-full mr-2">🔔</span>
                        Un proveedor ha superado el 30% del costo promedio.
                      </li>
                      <li className="border-b py-2 flex items-center">
                        <span className="bg-[#ffe474] p-1 rounded-full mr-2">⚠️</span>
                        La EVC 'Tech Solutions' ha gastado el 85% de su presupuesto.
                      </li>
                      <li className="py-2 flex items-center">
                        <span className="bg-[#ffe474] p-1 rounded-full mr-2">📊</span>
                        Revisión de presupuesto programada para mañana.
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex space-x-4">
                <Link href="/login" legacyBehavior>
                  <a className="bg-[#FFE600] hover:bg-[#F5DC00] text-black font-medium border-0 rounded-full px-8 py-2 shadow-md transition-all duration-300">
                    Iniciar sesión
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}