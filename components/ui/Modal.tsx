'use client';
import React, { useEffect } from 'react';
import { HiX } from 'react-icons/hi';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

interface ModalProps {
  show?: boolean;
  onClose?: () => void;
  size?: ModalSize;
  dismissible?: boolean;
  popup?: boolean;
  children: React.ReactNode;
  className?: string;
}

const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

export function Modal({
  show = false,
  onClose,
  size = 'md',
  dismissible = true,
  popup = false,
  children,
  className = '',
}: ModalProps) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        className={`relative w-full rounded-xl bg-white shadow-xl ${sizeMap[size]} ${popup ? '' : ''} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!popup && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            aria-label="Cerrar modal"
          >
            <HiX className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function ModalBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function ModalFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}
