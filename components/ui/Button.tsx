'use client';
import React from 'react';

type ButtonColor =
  | 'cta'
  | 'default'
  | 'secondary'
  | 'light'
  | 'link'
  | 'menu'
  | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonColor;
  size?: ButtonSize;
  outline?: boolean;
  isProcessing?: boolean;
  processingLabel?: string;
}

const colorMap: Record<ButtonColor, { solid: string; outline: string }> = {
  cta: {
    solid: 'bg-blue-900 text-white hover:bg-zinc-800 focus:ring-zinc-500',
    outline:
      'border border-zinc-900 text-zinc-900 hover:bg-zinc-100 focus:ring-zinc-500',
  },
  default: {
    solid: 'bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-500',
    outline:
      'border border-zinc-900 text-zinc-900 hover:bg-zinc-100 focus:ring-zinc-500',
  },
  secondary: {
    solid: 'bg-zinc-600 text-white hover:bg-zinc-700 focus:ring-zinc-400',
    outline:
      'border border-zinc-600 text-zinc-600 hover:bg-zinc-50 focus:ring-zinc-400',
  },
  light: {
    solid: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus:ring-zinc-300',
    outline:
      'border border-zinc-300 text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-300',
  },
  link: {
    solid: 'text-zinc-900 underline hover:text-zinc-700 focus:ring-zinc-300',
    outline: 'text-zinc-900 underline hover:text-zinc-700 focus:ring-zinc-300',
  },
  menu: {
    solid: 'bg-transparent text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-300',
    outline:
      'bg-transparent text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-300',
  },
  danger: {
    solid: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
    outline:
      'border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-400',
  },
};

const sizeMap: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  xl: 'px-6 py-3 text-base',
};

export function Button({
  color = 'default',
  size = 'md',
  outline = false,
  disabled,
  isProcessing,
  processingLabel,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const colorClass = colorMap[color][outline ? 'outline' : 'solid'];
  const sizeClass = sizeMap[size];
  const disabledClass =
    disabled || isProcessing
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : '';

  return (
    <button
      type={type}
      disabled={disabled || isProcessing}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none ${colorClass} ${sizeClass} ${disabledClass} ${className}`}
      {...props}
    >
      {isProcessing ? (processingLabel ?? children) : children}
    </button>
  );
}
