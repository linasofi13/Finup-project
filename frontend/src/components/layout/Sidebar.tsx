"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

// Carga diferida de los iconos para evitar errores en SSR
const FaChartPie = dynamic(
  () => import("react-icons/fa").then((mod) => mod.FaChartPie),
  { ssr: false },
);
const FaUser = dynamic(
  () => import("react-icons/fa").then((mod) => mod.FaUser),
  { ssr: false },
);
const FaFileAlt = dynamic(
  () => import("react-icons/fa").then((mod) => mod.FaFileAlt),
  { ssr: false },
);
const FaUsers = dynamic(
  () => import("react-icons/fa").then((mod) => mod.FaUsers),
  { ssr: false },
);
const FaMoneyBill = dynamic(
  () => import("react-icons/fa").then((mod) => mod.FaMoneyBill),
  { ssr: false },
);
const FaCog = dynamic(() => import("react-icons/fa").then((mod) => mod.FaCog), {
  ssr: false,
});
const FaSignOutAlt = dynamic(
  () => import("react-icons/fa").then((mod) => mod.FaSignOutAlt),
  { ssr: false },
);
const FaBars = dynamic(
  () => import("react-icons/fa").then((mod) => mod.FaBars),
  { ssr: false },
);
const FaHome = dynamic(
  () => import("react-icons/fa").then((mod) => mod.FaHome),
  { ssr: false },
);

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) return null;

  return (
    <div
      className={clsx(
        "h-screen fixed left-0 top-0 bg-white shadow-lg p-5 flex flex-col transition-all duration-300 overflow-y-auto z-50",
        { "w-64": mounted && isOpen, "w-20": mounted && !isOpen },
      )}
    >
      <button
        onClick={toggleSidebar}
        className="mb-5 flex items-center text-gray-700 hover:text-primary transition-all"
      >
        <FaBars className="w-6 h-6" />
      </button>

      <div className="flex items-center mb-10">
        <Image src="/images/logo.png" alt="FinUp Logo" width={40} height={40} />
        {mounted && isOpen && (
          <span className="text-xl font-bold ml-3">Menú</span>
        )}
      </div>

      <nav className="flex flex-col space-y-4 flex-grow">
        <Link
          href="/dashboard"
          className="sidebar-link flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 transition-all"
        >
          <FaChartPie className="sidebar-icon" />
          {mounted && isOpen && <span>Dashboard</span>}
        </Link>
        <Link
          href="/proveedores"
          className="sidebar-link flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 transition-all"
        >
          <FaUser className="sidebar-icon" />
          {mounted && isOpen && <span>Proveedores</span>}
        </Link>
        <Link
          href="/documentos"
          className="sidebar-link flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 transition-all"
        >
          <FaFileAlt className="sidebar-icon" />
          {mounted && isOpen && <span>Documentos</span>}
        </Link>
        <Link
          href="/evcs"
          className="sidebar-link flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 transition-all"
        >
          <FaUsers className="sidebar-icon" />
          {mounted && isOpen && <span>EVCs</span>}
        </Link>
        <Link
          href="/asignacion-presupuestal"
          className="sidebar-link flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 transition-all"
        >
          <FaMoneyBill className="sidebar-icon" />
          {mounted && isOpen && <span>Asignación Presupuestal</span>}
        </Link>
      </nav>

      <div className="mt-auto flex flex-col space-y-4">
        <Link
          href="/configuracion"
          className="sidebar-link flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 transition-all"
        >
          <FaCog className="sidebar-icon" />
          {mounted && isOpen && <span>Configuración</span>}
        </Link>
        <Link
          href="/logout"
          className="sidebar-link flex items-center gap-3 p-2 rounded-md hover:bg-red-100 text-red-500 transition-all"
        >
          <FaSignOutAlt className="sidebar-icon" />
          {mounted && isOpen && <span>Cerrar Sesión</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
