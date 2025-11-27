'use client';

import React from 'react';

type Props = {
  size?: number;
  className?: string;
  role?: string;
};

export default function Spinner({
  size = 16,
  className = '',
  role = 'status',
}: Props) {
  const s = size;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin text-stone-700 ${className}`}
      role={role}
      aria-label="Cargando"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-20"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  );
}
