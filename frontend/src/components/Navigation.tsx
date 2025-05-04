"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <nav className="bg-gradient-to-r from-bancolombia-blue to-bancolombia-blue-dark shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 group"
              >
                <div className="bg-bancolombia-yellow rounded-full p-1.5 transform transition-all duration-300 group-hover:scale-110">
                  <span className="text-xl font-extrabold text-bancolombia-text">
                    F
                  </span>
                </div>
                <span className="text-xl font-bold text-white group-hover:text-bancolombia-yellow transition-colors duration-300">
                  FinUp
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className={`${
                  pathname === "/dashboard"
                    ? "border-bancolombia-yellow text-white"
                    : "border-transparent text-gray-200 hover:border-bancolombia-yellow-light hover:text-white"
                } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-all duration-300 hover:scale-105`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/profile"
                className={`${
                  pathname === "/profile"
                    ? "border-bancolombia-yellow text-white"
                    : "border-transparent text-gray-200 hover:border-bancolombia-yellow-light hover:text-white"
                } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-all duration-300 hover:scale-105`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Perfil
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center bg-bancolombia-blue-dark px-3 py-1.5 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-bancolombia-yellow mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-white font-medium">
                    Hola, {user.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/dashboard"
            className={`${
              pathname === "/dashboard"
                ? "bg-bancolombia-yellow text-bancolombia-text"
                : "text-gray-200 hover:bg-bancolombia-blue-dark hover:text-white"
            } block px-3 py-2 rounded-md text-base font-medium transition-all duration-300`}
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className={`${
              pathname === "/profile"
                ? "bg-bancolombia-yellow text-bancolombia-text"
                : "text-gray-200 hover:bg-bancolombia-blue-dark hover:text-white"
            } block px-3 py-2 rounded-md text-base font-medium transition-all duration-300`}
          >
            Perfil
          </Link>
        </div>
      </div>
    </nav>
  );
}
