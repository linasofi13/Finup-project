import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
}

export default function Alert({ type, message, className = '' }: AlertProps) {
  const typeClasses = {
    success: 'bg-green-50 text-green-700',
    error: 'bg-red-50 text-red-700',
    warning: 'bg-yellow-50 text-yellow-700',
    info: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className={`p-4 rounded-md ${typeClasses[type]} ${className}`}>
      {message}
    </div>
  );
}