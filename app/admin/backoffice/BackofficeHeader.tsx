import Image from 'next/image';
import React from 'react';
import LogoutClient from './LogoutClient';

function BackofficeHeader({ user }: { user: { email: string } }) {
  return (
    <div className="bg-panelLight flex w-full flex-col items-center justify-between gap-4 rounded-2xl p-6 shadow-2xl lg:flex-row">
      <div className="flex items-center gap-4">
        <Image
          src="/assets/img/logo.png"
          width={120}
          height={72}
          alt="Logo"
          className="block h-16 w-auto opacity-95 brightness-[0.85] contrast-[1.05]"
        />
        <div>
          <h1 className="text-textDark text-2xl font-bold">Backoffice</h1>
          <p className="text-sm text-stone-600">{user.email}</p>
        </div>
      </div>
      <LogoutClient />
    </div>
  );
}

export default BackofficeHeader;
