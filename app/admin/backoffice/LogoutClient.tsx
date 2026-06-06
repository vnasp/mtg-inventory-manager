'use client';
import React from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';

const supabase = createClient();

export default function LogoutClient() {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    // redirect to login
    window.location.href = '/admin';
  };

  return (
    <Button color="secondary" size="sm" onClick={handleLogout}>
      Cerrar sesión
    </Button>
  );
}
