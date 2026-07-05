import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ai' | 'danger' | 'ghost';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-sans font-medium rounded-lg text-sm px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary/50',
    secondary: 'bg-surface-light border border-border-light text-content-primary-light hover:bg-brand-light dark:bg-surface-dark dark:border-border-dark dark:text-content-primary-dark dark:hover:bg-brand-dark focus:ring-border-dark',
    ai: 'bg-ai text-white hover:bg-ai-hover shadow-glow-ai focus:ring-ai/50',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-danger/50',
    ghost: 'bg-transparent text-content-primary-light border border-transparent hover:border-border-light dark:text-content-primary-dark dark:hover:border-border-dark',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
};
