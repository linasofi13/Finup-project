'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface FormData {
  email: string;
  password: string;
}

const schema = yup
  .object({
    email: yup.string().email('Email inválido').required('Email es requerido'),
    password: yup.string().required('Contraseña es requerida'),
  })
  .required();

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
    } catch (err: any) {
      // Manejo de error como string
      const errorMessage = err.response?.data?.detail;
      setError(
        Array.isArray(errorMessage)
          ? errorMessage[0].msg
          : errorMessage || authError || 'Error al iniciar sesión'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/5 to-primary/10 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/20 rounded-full filter blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10 mx-auto">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3 shadow-lg transform transition-all duration-500 hover:scale-110">
              <span className="text-3xl font-extrabold text-neutral-dark">F</span>
            </div>
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-neutral-dark">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede a tu cuenta para gestionar tus finanzas personales
          </p>
        </div>

        <Card variant="primary" className="shadow-xl">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="font-medium text-secondary hover:text-secondary-dark">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
