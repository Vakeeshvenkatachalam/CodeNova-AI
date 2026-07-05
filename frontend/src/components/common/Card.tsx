import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverGlow = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'bg-surface-light border border-border-light rounded-xl p-6 transition-all duration-200 dark:bg-surface-dark dark:border-border-dark';
  
  const glowStyle = hoverGlow 
    ? 'hover:shadow-glow-brand hover:border-primary/30 dark:hover:shadow-glow-brand dark:hover:border-primary/20 hover:scale-[1.01]' 
    : '';

  return (
    <div className={`${baseStyle} ${glowStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};
