import React from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  children,
  className = "",
  icon,
  fullWidth = false,
}: ButtonProps) {
  const baseClasses =
    "font-medium rounded-md focus:outline-none transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-primary";

  const variantClasses = {
    primary:
      "bg-primary text-neutral-dark hover:bg-primary-light border-2 border-primary hover:border-primary-light hover:shadow-lg",
    secondary:
      "bg-secondary text-white hover:bg-secondary-dark border-2 border-secondary hover:border-secondary-dark hover:shadow-lg",
    danger:
      "bg-red-600 text-white hover:bg-red-700 border-2 border-red-600 hover:border-red-700 hover:shadow-lg",
    outline:
      "bg-transparent text-secondary hover:bg-secondary/10 border-2 border-secondary hover:text-secondary-dark hover:shadow-lg",
  };

  const sizeClasses = {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-4 text-sm",
    lg: "py-3 px-6 text-base",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none"
    : "";
  const widthClass = fullWidth ? "w-full" : "";

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClass} ${className}`;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      <div className="flex items-center justify-center">
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </div>
    </button>
  );
}
