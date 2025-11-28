'use client';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import LogoutClient from './LogoutClient';
import { Button } from 'flowbite-react';
import { HiExternalLink } from 'react-icons/hi';

interface BackofficeHeaderProps {
  user: {
    email: string;
    first_name?: string | null;
    last_name?: string | null;
  };
}

function BackofficeHeader({ user }: BackofficeHeaderProps) {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      setCurrentDateTime(now.toLocaleDateString('es-ES', options));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo y título */}
        <div className="flex items-center gap-4">
          <Image
            src="/assets/img/logo.png"
            width={50}
            height={50}
            alt="Logo"
            className="h-10 w-auto"
          />
          <div>
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
              color="light"
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
