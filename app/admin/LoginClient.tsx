'use client';
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { TextInput } from '@/components/ui/TextInput';
import Image from 'next/image';

const supabase = createClient();

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      // On success redirect to backoffice so the server page can validate the session
      window.location.href = '/admin/backoffice';
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/assets/img/logo.png"
            width={200}
            height={120}
            alt="Logo"
            className="block opacity-95 brightness-[0.85] contrast-[1.05] filter-[drop-shadow(-1px_-1px_1px_rgba(255,255,255,0.25))_drop-shadow(2px_2px_3px_rgba(0,0,0,0.8))]"
          />
        </div>

        {/* Título */}
        <div className="text-center">
          <h2 className="text-textDark text-2xl font-bold">
            Acceso Administrador
          </h2>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-textDark mb-2">
              Correo electrónico
            </Label>
            <TextInput
              id="email"
              type="email"
              placeholder="admin@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              shadow
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-textDark mb-2">
              Contraseña
            </Label>
            <TextInput
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              shadow
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-zinc-900 hover:bg-zinc-800 w-full"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>

          {message && (
            <div className="rounded-lg bg-red-100 p-3 text-center text-sm text-red-700">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
