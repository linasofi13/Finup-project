'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirige en useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-500 bg-cover bg-no-repeat">
      <div className="py-14">
        <header className="mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">{title}</h1>
          </div>
        </header>
        <main className="h-full">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
