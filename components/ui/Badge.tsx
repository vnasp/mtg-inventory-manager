'use client';
import React from 'react';

type BadgeColor = 'gray' | 'warning' | 'green' | 'red' | 'blue' | 'purple';
type BadgeSize = 'xs' | 'sm';

interface BadgeProps {
  color?: BadgeColor;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
}

const colorMap: Record<BadgeColor, string> = {
  gray: 'bg-zinc-100 text-zinc-700',
  warning: 'bg-amber-100 text-amber-800',
  green: 'bg-emerald-100 text-emerald-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
};

const sizeMap: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-sm',
};

export function Badge({ color = 'gray', size = 'xs', className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorMap[color]} ${sizeMap[size]} ${className}`}
    >
      {children}
    </span>
  );
}
