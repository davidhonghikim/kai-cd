import React from 'react';

interface IconButtonProps {
  icon: React.FC<React.ComponentProps<'svg'>>;
  onClick?: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  title,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  ariaLabel
}) => {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const variantClasses = {
    primary: 'text-cyan-400 hover:bg-cyan-700 hover:text-white focus:ring-cyan-500',
    secondary: 'text-slate-400 hover:bg-slate-700 hover:text-white focus:ring-slate-500',
    danger: 'text-red-500 hover:bg-red-700 hover:text-white focus:ring-red-500',
    warning: 'text-amber-500 hover:bg-amber-700 hover:text-white focus:ring-amber-500',
    success: 'text-green-500 hover:bg-green-700 hover:text-white focus:ring-green-500',
    ghost: 'text-slate-400 hover:bg-slate-800 hover:text-white focus:ring-slate-500'
  };

  const baseClasses = 'rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
  const disabledClasses = 'opacity-50 cursor-not-allowed hover:bg-transparent';

  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${disabled ? disabledClasses : variantClasses[variant]}
        ${className}
      `.trim()}
    >
      <Icon className={iconSizeClasses[size]} />
    </button>
  );
};

export default IconButton; 