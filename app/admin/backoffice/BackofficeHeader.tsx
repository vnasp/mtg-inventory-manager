'use client';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import LogoutClient from './LogoutClient';
import { Button } from 'flowbite-react';
import { HiExternalLink } from 'react-icons/hi';

interface BackofficeHeaderProps {
  user: {
    email: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      full_name?: string;
    };
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

  // Obtener nombre y apellido del usuario
  const firstName = user.user_metadata?.first_name || '';
  const lastName = user.user_metadata?.last_name || '';
  const fullName = user.user_metadata?.full_name || '';
  const displayName =
    fullName || `${firstName} ${lastName}`.trim() || 'Usuario';

  return (
    <div className="bg-panelLight flex w-full flex-col gap-4 rounded-2xl p-6 shadow-2xl">
      {/* Header principal */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        {/* Logo y bienvenida */}
        <div className="flex items-center gap-4">
          <Image
            src="/assets/img/logo.png"
            width={120}
            height={72}
            alt="Logo"
            className="block h-16 w-auto opacity-95 brightness-[0.85] contrast-[1.05]"
          />
          <div>
            <h1 className="text-textDark text-2xl font-bold">
              Bienvenido, {displayName}
            </h1>
            <p className="text-sm text-stone-600">{user.email}</p>
          </div>
        </div>

        {/* Fecha/Hora y Acciones */}
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <p className="text-sm font-medium text-stone-700">
            {currentDateTime}
          </p>
          <div className="flex gap-2">
            <Button
              color="light"
              size="sm"
              onClick={() => window.open('/', '_blank')}
            >
              <HiExternalLink className="mr-2 h-4 w-4" />
              Ver sitio
            </Button>
            <LogoutClient />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BackofficeHeader;
