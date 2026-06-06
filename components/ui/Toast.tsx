'use client';
import React from 'react';

interface ToastProps {
  show?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Toast({ show = true, children, className = '' }: ToastProps) {
  if (!show) return null;
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
