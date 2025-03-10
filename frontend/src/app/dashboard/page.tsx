'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card title="Bienvenido a FinUp">
            <p className="text-sm text-gray-500 mb-4">Tu plataforma financiera personal</p>
            
            <div className="mt-4 border-t border-bancolombia-gray-dark pt-4">
              <dl>
                <div className="bg-bancolombia-gray px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-md">
                  <dt className="text-sm font-medium text-bancolombia-text">
                    Nombre completo
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.name}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 mt-2 rounded-md border border-bancolombia-gray-dark">
                  <dt className="text-sm font-medium text-bancolombia-text">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.email}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button variant="primary" size="sm">
                Actualizar perfil
              </Button>
            </div>
          </Card>
        </div>
        
        <div>
          <Card title="Acciones rápidas">
            <div className="space-y-4">
              <Button variant="primary" className="w-full">
                Ver mis finanzas
              </Button>
              <Button variant="secondary" className="w-full">
                Configurar alertas
              </Button>
              <Button variant="secondary" className="w-full">
                Soporte
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}