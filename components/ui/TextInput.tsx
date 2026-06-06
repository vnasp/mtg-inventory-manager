'use client';
import React from 'react';

type InputSizing = 'sm' | 'md' | 'lg';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  sizing?: InputSizing;
  shadow?: boolean;
}

const sizingMap: Record<InputSizing, string> = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

export function TextInput({
  sizing = 'md',
  shadow = false,
  className = '',
  ...props
}: TextInputProps) {
  const shadowClass = shadow ? 'shadow-sm' : '';
  return (
    <input
      className={`block w-full rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 ${sizingMap[sizing]} ${shadowClass} ${className}`}
      {...props}
    />
  );
}
