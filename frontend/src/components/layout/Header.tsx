'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import NavLink from '@/components/ui/NavLink';
import UserMenu  from '@/components/ui/UserMenu';

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-md border-b border-neutral-medium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-neutral-dark text-xl font-bold flex items-center transition-transform duration-200 hover:scale-105">
                <span className="text-secondary mr-1">Fin</span>
                <span className="text-neutral-dark">Up</span>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="/" currentPath={pathname}>Inicio</NavLink>
              <NavLink href="/caracteristicas" currentPath={pathname}>Características</NavLink>
              <NavLink href="/precios" currentPath={pathname}>Precios</NavLink>
            </nav>
          </div>
          <div className="flex items-center">
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
                <Link 
                  href="/register" 
                  className="text-sm font-medium bg-primary text-neutral-dark px-4 py-2 rounded-md border-2 border-primary transition-all duration-300 hover:bg-primary-light hover:border-primary-light hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
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