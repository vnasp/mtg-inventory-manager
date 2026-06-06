'use client';
import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full text-left text-sm text-zinc-700 ${className}`}>{children}</table>
    </div>
  );
}

export function TableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={`bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 ${className}`}>
      {children}
    </thead>
  );
}

export function TableHeadCell({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <th onClick={onClick} className={`px-4 py-3 ${onClick ? 'cursor-pointer select-none' : ''} ${className}`}>
      {children}
    </th>
  );
}

export function TableBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <tbody className={`divide-y divide-zinc-100 ${className}`}>{children}</tbody>;
}

export function TableRow({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={`bg-white hover:bg-zinc-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
