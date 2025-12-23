'use client';
import React from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from 'flowbite-react';

const supabase = createClient();

export default function LogoutClient() {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    // redirect to home
    window.location.href = '/';
  };

  return (
    <Button color="secondary" size="sm" onClick={handleLogout}>
      Cerrar sesión
    </Button>
  );
}
