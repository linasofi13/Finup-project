'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-blue-600 text-xl font-bold">
                FinUp
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Inicio
              </Link>
              <Link
                href="/caracteristicas"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/caracteristicas'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Características
              </Link>
              <Link
                href="/precios"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/precios'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Precios
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* User greeting */}
                <span className="text-sm text-gray-700">Hola, {user.name}</span>
                
                {/* Dashboard link */}
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium ${
                    pathname === '/dashboard'
                      ? 'text-blue-700'
                      : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  Dashboard
                </Link>
                
                {/* Profile link */}
                <Link
                  href="/profile"
                  className={`text-sm font-medium ${
                    pathname === '/profile'
                      ? 'text-blue-700'
                      : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  Mi Perfil
                </Link>
                
                {/* Logout button */}
                <div>
                  <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:text-red-500"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Iniciar sesión
                </Link>
                <Link 
                  href="/register" 
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}