'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/context/AuthContext';
// Remove Navigation import if it exists
// import Navigation from '@/components/Navigation';

// Form validation schema
const schema = yup.object({
  name: yup.string().required('Nombre es requerido'),
  email: yup.string().email('Email inválido').required('Email es requerido'),
  currentPassword: yup.string().required('Contraseña actual es requerida'),
  newPassword: yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-zA-Z]/, 'La contraseña debe contener al menos una letra')
    .matches(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Las contraseñas deben coincidir')
}).required();

type FormData = yup.InferType<typeof schema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setMessage(null);
      
      // Here you would call your API to update the user profile
      // For example:
      // await axios.put('/api/auth/profile', data);
      
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al actualizar el perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Remove Navigation component from here if it exists */}
      
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Mi Perfil</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                {message && (
                  <div className={message.type === 'success' ? 'alert-success' : 'alert-error'} role="alert">
                    <span className="block sm:inline">{message.text}</span>
                  </div>
                )}
                
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nombre completo
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        type="text"
                        {...register('name')}
                        className="form-input"
                      />
                      {errors.name && <p className="error-message">{errors.name.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className="form-input"
                      />
                      {errors.email && <p className="error-message">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Contraseña actual
                    </label>
                    <div className="mt-1">
                      <input
                        id="currentPassword"
                        type="password"
                        {...register('currentPassword')}
                        className="form-input"
                      />
                      {errors.currentPassword && <p className="error-message">{errors.currentPassword.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      Nueva contraseña (opcional)
                    </label>
                    <div className="mt-1">
                      <input
                        id="newPassword"
                        type="password"
                        {...register('newPassword')}
                        className="form-input"
                      />
                      {errors.newPassword && <p className="error-message">{errors.newPassword.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirmar nueva contraseña
                    </label>
                    <div className="mt-1">
                      <input
                        id="confirmPassword"
                        type="password"
                        {...register('confirmPassword')}
                        className="form-input"
                      />
                      {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? 'Actualizando...' : 'Actualizar perfil'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}