import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  backgroundImage?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  clickable?: boolean;
  onClick?: () => void;
}

export default function Card({ 
  title, 
  children, 
  className = '', 
  backgroundImage,
  variant = 'default',
  clickable = false,
  onClick
}: CardProps) {
  const backgroundStyle = backgroundImage ? 
    { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : 
    {};
  
  const variantClasses = {
    default: 'bg-white border border-neutral-medium',
    primary: 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30',
    secondary: 'bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30',
    outline: 'bg-white border-2 border-secondary/20'
  };

  const clickableClasses = clickable ? 
    'cursor-pointer transform transition-all duration-300 hover:scale-102 hover:-translate-y-1 active:scale-98' : 
    '';
    
  return (
    <div 
      className={`shadow-lg overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl ${variantClasses[variant]} ${clickableClasses} ${className}`}
      style={backgroundStyle}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg pointer-events-none"></div>
      {title && (
        <div className={`px-4 py-5 sm:px-6 border-b relative z-10 ${variant === 'primary' ? 'border-primary/30 bg-primary/10' : variant === 'secondary' ? 'border-secondary/30 bg-secondary/10' : 'border-neutral-medium bg-neutral-light'}`}>
          <h3 className="text-lg leading-6 font-medium text-neutral-dark">{title}</h3>
        </div>
      )}
      <div className="px-4 py-5 sm:p-6 relative z-10">{children}</div>
    </div>
  );
}