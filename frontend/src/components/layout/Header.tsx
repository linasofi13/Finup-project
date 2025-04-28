"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "@/components/ui/UserMenu";
import { FaBell, FaSearch } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast"; // Si usas react-hot-toast

interface HeaderProps {
  isSidebarOpen: boolean;
}

interface Notification {
  id: number;
  message: string;
  type: "info" | "warning" | "alert";
  read: boolean;
  created_at: string;
}

export default function Header({ isSidebarOpen }: HeaderProps) {
  const { user } = useAuth();
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const toggleNotificaciones = () => {
    setNotificacionesAbiertas(!notificacionesAbiertas);
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/notifications/notifications/",
      );
      const nuevas = res.data.filter(
        (n: Notification) => !notifications.find((prev) => prev.id === n.id),
      );
      if (nuevas.length > 0) {
        nuevas.forEach((n) => {
          toast.custom(
            <div className="bg-white border-l-4 border-yellow-400 shadow-lg rounded-md px-4 py-2">
              <p className="font-semibold">
                {mapIcon(n.type)} {n.message}
              </p>
            </div>,
          );
        });
        setNotifications([...nuevas, ...notifications]);
      }
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const mapIcon = (type: string) => {
    switch (type) {
      case "info":
        return "ℹ️";
      case "warning":
        return "⚠️";
      case "alert":
        return "❗";
      default:
        return "🔔";
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await axios.patch(
        `http://localhost:8000/notifications/notifications/${id}/read`,
      );
      // Eliminar del estado al marcar como leída
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error al marcar notificación como leída:", err);
    }
  };

  return (
    <header
      className="bg-white shadow-md border-b border-neutral-medium transition-all duration-300 z-40 fixed top-0 left-0 w-full"
      style={{
        marginLeft: isSidebarOpen ? "16rem" : "0",
        width: isSidebarOpen ? "calc(100% - 16rem)" : "100%",
      }}
    >
      <div className="w-full px-6">
        <div className="max-w-7xl mx-auto flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <Image
                src="/images/logoBancolombia.svg"
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-auto mr-2"
              />
            </Link>
            <Link
              href="/"
              className="text-[#2c2a29] font-medium relative pb-1 group"
            >
              Inicio
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFE600] transition-all duration-300 group-hover:w-full"></span>
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
                  <span className="text-sm font-medium text-[#2c2a29]">
                    Notificaciones
                  </span>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {notificacionesAbiertas && (
                  <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md p-4 border border-gray-200 z-50">
                    <h3 className="text-lg font-semibold mb-2">Alertas</h3>
                    <ul className="text-sm text-gray-700 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <li>No hay nuevas notificaciones.</li>
                      ) : (
                        notifications.map((n) => (
                          <li
                            key={n.id}
                            className="border-b py-2 flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <span className="bg-yellow-200 p-1 rounded-full mr-2">
                                {mapIcon(n.type)}
                              </span>
                              {n.message}
                            </div>
                            <button
                              className="text-xs text-blue-600 hover:underline"
                              onClick={() => markAsRead(n.id)}
                            >
                              Marcar como leída
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link
                href="/login"
                className="bg-[#FFE600] hover:bg-[#F5DC00] text-black font-medium border-0 rounded-full px-8 py-2 shadow-md transition-all duration-300"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
