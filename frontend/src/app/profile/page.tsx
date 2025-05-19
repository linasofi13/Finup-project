"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";

export default function ProfilePage() {
  const { user } = useAuth();

  // SVGs inline
  const Svg = {
    user: (
      <svg
        className="w-6 h-6 text-secondary-dark"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.121 17.804A13.937 13.937 0 0112 15c2.386 0 4.614.622 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    mail: (
      <svg
        className="w-5 h-5 text-neutral-medium"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 12l-4-4-4 4m0 0l4 4 4-4M4 6h16M4 18h16"
        />
      </svg>
    ),
    shield: (
      <svg
        className="w-4 h-4 text-neutral-medium"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 2L3 5v6c0 5 4 7 7 7s7-2 7-7V5l-7-3z" />
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
        </div>
      </Card>
    </div>
  );
}
