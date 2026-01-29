'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'glass' | 'solid' | 'gradient';
  padding?: 'sm' | 'md' | 'lg';
}

const variants = {
  glass: 'glass border border-white/5',
  solid: 'bg-white/5 border border-white/10',
  gradient: 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10',
};

const paddings = {
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-5 sm:p-8',
};

export function Card({
  children,
  className = '',
  variant = 'glass',
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={`
        ${variants[variant]}
        ${paddings[padding]}
        rounded-2xl sm:rounded-3xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  icon?: string;
  title: string;
  description?: string;
  className?: string;
}

export function CardHeader({ icon, title, description, className = '' }: CardHeaderProps) {
  return (
    <div className={`text-center mb-6 sm:mb-8 ${className}`}>
      {icon && (
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-3xl sm:text-4xl">
          {icon}
        </div>
      )}
      <h2 className="text-xl sm:text-2xl font-bold mb-2">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  );
}
