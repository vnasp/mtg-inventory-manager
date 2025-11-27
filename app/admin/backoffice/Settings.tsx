'use client';
import React, { useState, useEffect } from 'react';
import { Button, Card, Label, TextInput } from 'flowbite-react';

export default function Settings() {
  const [fxRate, setFxRate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    // Cargar fx rate actual
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/settings`);
        const body = await res.json().catch(() => ({}));
        if (body?.rate) {
          setFxRate(String(body.rate));
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
      const rate = Number(fxRate);
      if (isNaN(rate) || rate <= 0) {
        setMessage({
          type: 'error',
          text: 'El valor debe ser un número mayor a 0',
        });
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'fx_usdclp',
          value: { rate },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Error al guardar');
      }

      setMessage({
        type: 'success',
        text: 'Tipo de cambio actualizado correctamente',
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
      <div className="bg-panelLight rounded-2xl p-6 text-center shadow-2xl">
        <p className="text-textDark">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <Card>
      <h2>Configuración</h2>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <Label htmlFor="fxRate" className="mb-2">
            Tipo de Cambio USD/CLP
          </Label>
          <TextInput
            id="fxRate"
            type="number"
            step="0.01"
            min="0"
            value={fxRate}
            onChange={(e) => setFxRate(e.target.value)}
            placeholder="ej. 950.50"
            required
          />
          <p className="mt-1 text-xs">1 USD = {fxRate || '0'} CLP</p>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving} className="bg-primary">
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

        <div className="bg-panelLight text-textDark rounded-lg border border-gray-200 p-4">
          <h3>Información</h3>
          <p className="text-sm">
            Este valor se utiliza para convertir los precios de USD a CLP en el
            catálogo público. Actualízalo regularmente para mantener los precios
            precisos.
          </p>
        </div>
      </form>
    </Card>
  );
}
