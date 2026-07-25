'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants = {
  primary:   'bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-400',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:bg-gray-50',
  danger:    'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
  ghost:     'text-gray-700 hover:bg-gray-100 disabled:text-gray-400',
  outline:   'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-base rounded-lg',
};

export default function Button({
  variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon,
  children, className, disabled, ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors',
        'disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 size={14} className="animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
