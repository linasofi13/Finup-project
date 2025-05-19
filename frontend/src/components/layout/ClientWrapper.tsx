"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

const ClientLayout = dynamic(() => import("./ClientLayout"), {
  ssr: false,
});

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Función simple para asegurar que nunca se use el tema oscuro
  useEffect(() => {
    // Si se llega a aplicar accidentalmente una clase 'dark', la quitamos
    document.documentElement.classList.remove('dark');
  }, []);

  return <ClientLayout>{children}</ClientLayout>;
}
