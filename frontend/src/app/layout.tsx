'use client';
import { useState } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import { metadata } from "./metadata"; 

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <div className="flex">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Contenedor principal con margen dinámico */}
            <div className="flex flex-col flex-grow min-h-screen transition-all duration-300"
              style={{ marginLeft: isSidebarOpen ? "16rem" : "5rem" }} // ✅ Solo deja espacio para el botón
            >
              <Header isSidebarOpen={isSidebarOpen} /> {/* ✅ Pasamos la prop */}
              <main className="flex-grow p-6">{children}</main>
              <Footer />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
