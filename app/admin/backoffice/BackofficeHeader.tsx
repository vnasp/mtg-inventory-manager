'use client';
import Image from 'next/image';
import React from 'react';
import LogoutClient from './LogoutClient';
import { Button } from '@/components/ui/Button';
import { HiExternalLink } from 'react-icons/hi';

interface BackofficeHeaderProps {
  user: {
    email: string;
    first_name?: string | null;
    last_name?: string | null;
  };
}

function BackofficeHeader({ user }: BackofficeHeaderProps) {

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo y título */}
        <div className="flex items-center gap-4">
          <Image
            src="/assets/img/logo.png"
            width={200}
            height={96}
            alt="Logo"
            className="h-24 w-auto"
          />
          <div className="flex flex-col items-start">
            <h1 className="text-lg font-bold text-slate-900">Backoffice</h1>
            <p className="text-xs text-slate-500">Panel de administración</p>
          </div>
        </div>

        {/* Info usuario y acciones */}
        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-900">
              {`${user.first_name || ''} ${user.last_name || ''}`.trim() ||
                'Usuario'}
            </p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              color="secondary"
              size="sm"
              onClick={() => window.open('/', '_blank')}
            >
              <HiExternalLink className="h-4 w-4" />
            </Button>
            <LogoutClient />
          </div>
        </div>
      </div>
    </header>
  );
}

export default BackofficeHeader;
