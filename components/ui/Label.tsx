'use client';
import React from 'react';

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = '', children, ...props }: LabelProps) {
  return (
    <label
      className={`mb-2 block text-sm font-semibold text-zinc-700 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
