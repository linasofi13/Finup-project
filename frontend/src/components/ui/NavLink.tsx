import React from 'react';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  currentPath: string;
  children: React.ReactNode;
}

export default function NavLink({ href, currentPath, children }: NavLinkProps) {
  const isActive = currentPath === href;
  
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-all duration-300 ${
        isActive
          ? 'border-primary text-secondary font-semibold'
          : 'border-transparent text-gray-600 hover:border-neutral-medium hover:text-secondary hover:bg-neutral-light rounded-t-md transform hover:-translate-y-0.5'
      }`}
    >
      {children}
    </Link>
  );
}