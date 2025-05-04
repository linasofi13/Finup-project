"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { FaUser, FaLock } from "react-icons/fa";

interface FormData {
  email: string;
  password: string;
}

const schema = yup
  .object({
    email: yup.string().email("Email inválido").required("Email es requerido"),
    password: yup.string().required("Contraseña es requerida"),
  })
  .required();

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  // Simplificamos la lógica de observación para el estado del botón
  const emailValue = watch("email");
  const passwordValue = watch("password");

  // Actualizamos la validez simplemente verificando que los campos tengan contenido
  useEffect(() => {
    // Permitimos intentar el inicio de sesión si hay cualquier contenido en ambos campos
    const hasEmailContent = !!emailValue && emailValue.trim() !== "";
    const hasPasswordContent = !!passwordValue && passwordValue.trim() !== "";
    setIsFormValid(hasEmailContent && hasPasswordContent);
  }, [emailValue, passwordValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail;
      setError(
        Array.isArray(errorMessage)
          ? errorMessage[0].msg
          : errorMessage || authError || "Error al iniciar sesión",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8fa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-100">
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
            Iniciar sesión
          </h2>

          <p className="text-center text-sm text-gray-600 mb-8">
            Accede a tu cuenta para gestionar tu presupuesto
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-100 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Campo de email con placeholder que solo aparece la primera vez */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className={`block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-[#FFE600] focus:border-[#FFE600] ${
                    errors.email ? "border-red-300" : ""
                  }`}
                  placeholder={emailFocused ? "" : "tu@email.com"}
                  onFocus={() => setEmailFocused(true)}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo de contraseña con placeholder que solo aparece la primera vez */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  className={`block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-[#FFE600] focus:border-[#FFE600] ${
                    errors.password ? "border-red-300" : ""
                  }`}
                  placeholder={passwordFocused ? "" : "••••••••"}
                  onFocus={() => setPasswordFocused(true)}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-[#FFE600] focus:ring-[#FFE600] border-gray-300 rounded"
                />
                <label
                  htmlFor="remember_me"
                  className="ml-2 block text-gray-700"
                >
                  Recordarme
                </label>
              </div>
              <div className="text-sm">
                {/* Enlace con sombreado gris */}
                <Link
                  href="/forgot-password"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {/* Botón con lógica simplificada - se habilita cuando hay contenido */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full py-2 px-4 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors mt-6
                ${
                  isFormValid && !isLoading
                    ? "bg-[#FFE600] hover:bg-[#F5DC00] text-black focus:ring-[#FFE600] cursor-pointer"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} FinUp. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
