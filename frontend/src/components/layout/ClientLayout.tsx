"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const ClientLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setRouteLoading(true);
    const timeout = setTimeout(() => setRouteLoading(false), 600); // Show spinner for at least 600ms
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <div className="flex">
      {user && (
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      )}
      <div
        className="flex flex-col flex-grow min-h-screen transition-all duration-300"
        style={{ marginLeft: user ? (isSidebarOpen ? "16rem" : "5rem") : "0" }}
      >
        <Header isSidebarOpen={!!user && isSidebarOpen} />
        {(loading || routeLoading) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-60">
            <LoadingSpinner size="lg" color="border-yellow-500" />
          </div>
        )}
        <main className="flex-grow p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default ClientLayout; 