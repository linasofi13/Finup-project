"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// Form validation schema
const schema = yup
  .object({
    name: yup.string().required("Nombre es requerido"),
    email: yup.string().email("Email inválido").required("Email es requerido"),
    currentPassword: yup.string().required("Contraseña actual es requerida"),
    newPassword: yup
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .matches(/[a-zA-Z]/, "La contraseña debe contener al menos una letra")
      .matches(/[0-9]/, "La contraseña debe contener al menos un número"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], "Las contraseñas deben coincidir"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name || "",  // This will now work with the updated User interface
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setMessage(null);

      // Here you would call your API to update the user profile
      // For example:
      // await axios.put('/api/auth/profile', data);

      setMessage({ type: "success", text: "Perfil actualizado correctamente" });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Error al actualizar el perfil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Mi Perfil">
      <Card>
        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            id="name"
            label="Nombre completo"
            type="text"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            id="email"
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            id="currentPassword"
            label="Contraseña actual"
            type="password"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />

          <Input
            id="newPassword"
            label="Nueva contraseña (opcional)"
            type="password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          <Input
            id="confirmPassword"
            label="Confirmar nueva contraseña"
            type="password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" disabled={isLoading} variant="primary">
            {isLoading ? "Actualizando..." : "Actualizar perfil"}
          </Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}
