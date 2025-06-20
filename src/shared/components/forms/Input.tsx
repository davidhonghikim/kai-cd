import React, { forwardRef } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

const variantClasses = {
  default: 'border border-slate-600 bg-slate-700 text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500',
  outlined: 'border-2 border-slate-600 bg-transparent text-slate-100 focus:border-cyan-500',
  filled: 'border-0 bg-slate-700 text-slate-100 focus:bg-slate-600',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'rounded-md transition-colors duration-200 placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  
  const inputClasses = `${baseClasses} ${sizeClass} ${variantClass} ${widthClass} ${errorClass} ${className}`.trim();

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-slate-400 w-5 h-5">{leftIcon}</div>
          </div>
        )}
        
        <input
          ref={ref}
          className={`${inputClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
          disabled={disabled}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="text-slate-400 w-5 h-5">{rightIcon}</div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      
      {hint && !error && (
        <p className="mt-1 text-sm text-slate-400">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input'; 