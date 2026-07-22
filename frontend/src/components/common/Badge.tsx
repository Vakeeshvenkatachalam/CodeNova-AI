import React from 'react';

interface BadgeProps {
  variant?: 'brand' | 'ai' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'brand',
  children,
  className = '',
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans border transition-all duration-200';

  const variants: Record<string, string> = {
    brand: 'bg-primary/10 border-primary/20 text-primary',
    ai: 'bg-ai/10 border-ai/20 text-ai shadow-glow-ai/10',
    success: 'bg-success/10 border-success/20 text-success',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    danger: 'bg-danger/10 border-danger/20 text-danger',
    info: 'bg-info/10 border-info/20 text-info',
    secondary: 'bg-surface-light border-border-light text-content-secondary-light dark:bg-surface-dark dark:border-border-dark dark:text-content-secondary-dark',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
