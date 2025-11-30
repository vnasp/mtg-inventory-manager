'use client';
import React, { useState, useEffect } from 'react';
import { Button, Card, Label, TextInput, Textarea } from 'flowbite-react';

export default function GlobalSettings() {
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [instagram, setInstagram] = useState<string>('');
  const [facebook, setFacebook] = useState<string>('');
  const [x, setX] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    // Cargar configuración global actual
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/settings?game=global`);
        const body = await res.json().catch(() => ({}));
        if (body?.contact_info) {
          setEmail(body.contact_info.email || '');
          setPhone(body.contact_info.phone || '');
          setInstagram(body.contact_info.instagram || '');
          setFacebook(body.contact_info.facebook || '');
          setX(body.contact_info.x || '');
          setAddress(body.contact_info.address || '');
        }
      } catch (e) {
        console.error(e);
        setMessage({ type: 'error', text: 'Error al cargar configuración' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Guardar configuración global
      const globalRes = await fetch(`/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'global',
          value: {
            contact_info: {
              email,
              phone,
              instagram,
              facebook,
              x,
              address,
            },
          },
        }),
      });

      if (!globalRes.ok) {
        const body = await globalRes.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Error al guardar configuración global');
      }

      setMessage({
        type: 'success',
        text: 'Configuración global actualizada correctamente',
      });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message ?? 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-slate-700">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <Card>
      <div className="mb-6 flex flex-col items-start justify-center">
        <h1>Configuración Global</h1>
        <p className="backoffice-section-description">
          Información de contacto y datos generales
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <Label htmlFor="email" className="mb-2">
            Email
          </Label>
          <TextInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contacto@ejemplo.com"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="mb-2">
            Teléfono
          </Label>
          <TextInput
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+56 9 1234 5678"
          />
        </div>

        <div>
          <Label htmlFor="instagram" className="mb-2">
            Instagram
          </Label>
          <TextInput
            id="instagram"
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@usuario"
          />
        </div>

        <div>
          <Label htmlFor="facebook" className="mb-2">
            Facebook
          </Label>
          <TextInput
            id="facebook"
            type="text"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="facebook.com/pagina"
          />
        </div>

        <div>
          <Label htmlFor="x" className="mb-2">
            X (Twitter)
          </Label>
          <TextInput
            id="x"
            type="text"
            value={x}
            onChange={(e) => setX(e.target.value)}
            placeholder="@usuario"
          />
        </div>

        <div>
          <Label htmlFor="address" className="mb-2">
            Dirección
          </Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Dirección completa de la tienda"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving} className="bg-bo-primary">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>

          {message && (
            <div
              className={`rounded-lg px-4 py-2 text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 font-semibold text-slate-700">Información</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Esta información de contacto se utilizará en la página web.</li>
            <li>
              Todos los campos son opcionales. Completa solo los que desees
              mostrar públicamente.
            </li>
          </ul>
        </div>
      </form>
    </Card>
  );
}
