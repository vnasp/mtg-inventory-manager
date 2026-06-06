'use client';
import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Card({ className = '', children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-6 shadow-sm ${onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
