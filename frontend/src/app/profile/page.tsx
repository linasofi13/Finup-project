"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Esquema de validación
const schema = yup.object({
  name: yup.string().required("Nombre es requerido"),
  email: yup.string().email("Email inválido").required("Email es requerido"),
  currentPassword: yup.string().required("Contraseña actual requerida"),
  newPassword: yup
    .string()
    .min(8, "Mínimo 8 caracteres")
    .matches(/[a-zA-Z]/, "Al menos una letra")
    .matches(/[0-9]/, "Al menos un número")
    .notRequired(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "No coinciden")
    .when("newPassword", {
      is: (val: string) => !!val,
      then: yup.string().required("Confirma la nueva contraseña"),
    }),
});

type FormData = yup.InferType<typeof schema>;

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.username || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Llama a tu API (asegúrate de tener el endpoint proxy en /api/users/[userId])
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.name,
          email: data.email,
          password: data.newPassword || undefined,
          rol: user.rol,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar perfil");

      const updatedUser = await res.json();
      setUser && setUser(updatedUser); // Actualiza el usuario global si tienes setUser
      setSuccess(true);
      setShowEdit(false);
      setTimeout(() => setSuccess(false), 2000);
      reset({ ...data, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert("Error al actualizar el perfil");
    }
  };

  // SVGs inline
  const Svg = {
    user: (
      <svg className="w-6 h-6 text-secondary-dark" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.386 0 4.614.622 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    mail: (
      <svg className="w-5 h-5 text-neutral-medium" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12l-4-4-4 4m0 0l4 4 4-4M4 6h16M4 18h16" />
      </svg>
    ),
    shield: (
      <svg className="w-4 h-4 text-neutral-medium" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2L3 5v6c0 5 4 7 7 7s7-2 7-7V5l-7-3z" />
      </svg>
    ),
    lock: (
      <svg className="w-5 h-5 text-neutral-medium" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect width="16" height="11" x="4" y="11" rx="2" ry="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0v4" />
      </svg>
    ),
    edit: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6m0 0l3.536 3.536a2 2 0 010 2.828L12.828 18.536a2 2 0 01-2.828 0L6 14m3-3l6-6" />
      </svg>
    ),
    close: (
      <svg className="w-6 h-6 text-neutral-medium" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    check: (
      <svg className="w-5 h-5 text-neutral-medium" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  };

  return (
    <div className="min-h-[calc(100vh-220px)] flex flex-col justify-center items-center py-16 px-4 bg-[#fafafa]">
      {/* --- Info Card --- */}
      <Card className="bg-gradient-to-tr from-primary to-primary-light text-bancolombia-text shadow-bancolombia p-8 max-w-lg w-full rounded-xl">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg mb-4">
            <span className="text-4xl font-extrabold text-secondary-dark">
              {user?.username?.[0] || user?.email?.[0]}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold flex items-center space-x-2">
            {Svg.user}
            <span>{user?.username}</span>
          </h2>
          <p className="mt-1 text-base flex items-center space-x-2 text-neutral-dark">
            {Svg.mail}
            <span>{user?.email}</span>
          </p>
          <div className="mt-3 inline-flex items-center bg-neutral-light text-neutral-dark text-xs font-semibold px-3 py-1 rounded-full border border-neutral-medium space-x-1">
            {Svg.shield}
            <span className="uppercase">{user?.rol}</span>
          </div>
          <Button
            className="mt-6 flex items-center space-x-2 bg-secondary text-white font-semibold px-5 py-2 rounded-full shadow hover:bg-secondary-dark transition"
            onClick={() => setShowEdit(true)}
          >
            {Svg.edit}
            <span>Editar perfil</span>
          </Button>
        </div>
      </Card>

      {success && (
        <div className="mt-6 px-6 py-3 bg-green-100 border border-green-300 text-green-800 rounded-lg text-center font-semibold transition">
          ¡Perfil actualizado correctamente!
        </div>
      )}

      {/* --- Modal de edición --- */}
      {showEdit && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowEdit(false)}
              className="absolute top-4 right-4 hover:text-red-500"
            >
              {Svg.close}
            </button>
            <div className="px-6 pt-6 pb-8">
              <h3 className="text-xl font-bold text-bancolombia-blue mb-4 flex items-center space-x-2">
                {Svg.edit}
                <span>Editar Perfil</span>
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  id="name"
                  label="Nombre completo"
                  type="text"
                  icon={Svg.user}
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  icon={Svg.mail}
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  id="currentPassword"
                  label="Contraseña actual"
                  type="password"
                  icon={Svg.lock}
                  error={errors.currentPassword?.message}
                  {...register("currentPassword")}
                />
                <Input
                  id="newPassword"
                  label="Nueva contraseña"
                  type="password"
                  icon={Svg.check}
                  error={errors.newPassword?.message}
                  {...register("newPassword")}
                />
                <Input
                  id="confirmPassword"
                  label="Confirmar contraseña"
                  type="password"
                  icon={Svg.check}
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center space-x-2 bg-bancolombia-yellow text-bancolombia-text font-bold rounded-full py-2 hover:bg-primary-light transition"
                >
                  {isSubmitting ? "Actualizando..." : (
                    <>
                      {Svg.edit}
                      <span>Guardar cambios</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
