'use client';
import React, { useState, useEffect } from 'react';
import { Button, Card, Label, TextInput } from 'flowbite-react';

export default function Settings() {
  const [fxRate, setFxRate] = useState<string>('');
  const [minCardPrice, setMinCardPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    // Cargar configuración actual
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/settings`);
        const body = await res.json().catch(() => ({}));
        if (body?.rate) {
          setFxRate(String(body.rate));
        }
        if (body?.minCardPrice !== undefined) {
          setMinCardPrice(String(body.minCardPrice));
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
          text: 'El tipo de cambio debe ser un número mayor a 0',
        });
        setSaving(false);
        return;
      }

      const minPrice = Number(minCardPrice);
      if (isNaN(minPrice) || minPrice < 0) {
        setMessage({
          type: 'error',
          text: 'El precio mínimo debe ser un número mayor o igual a 0',
        });
        setSaving(false);
        return;
      }

      // Guardar tipo de cambio
      const fxRes = await fetch(`/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'fx_usdclp',
          value: { rate },
        }),
      });

      if (!fxRes.ok) {
        const body = await fxRes.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Error al guardar tipo de cambio');
      }

      // Guardar precio mínimo
      const minPriceRes = await fetch(`/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'min_card_price_clp',
          value: { amount: minPrice },
        }),
      });

      if (!minPriceRes.ok) {
        const body = await minPriceRes.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Error al guardar precio mínimo');
      }

      setMessage({
        type: 'success',
        text: 'Configuración actualizada correctamente',
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
        <h1>Configuración</h1>
        <p className="backoffice-section-description">
          Ajustes generales del sistema
        </p>
      </div>

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
          <p className="mt-1 text-xs text-slate-600">
            1 USD = {fxRate || '0'} CLP
          </p>
        </div>

        <div>
          <Label htmlFor="minCardPrice" className="mb-2">
            Precio Mínimo de Carta (CLP)
          </Label>
          <TextInput
            id="minCardPrice"
            type="number"
            step="1"
            min="0"
            value={minCardPrice}
            onChange={(e) => setMinCardPrice(e.target.value)}
            placeholder="ej. 100"
            required
          />
          <p className="mt-1 text-xs text-slate-600">
            Si precio USD por Tasa de Cambio es menor a este valor, se usará
            este mínimo
          </p>
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
            <li>
              El <strong>tipo de cambio</strong> se utiliza para convertir los
              precios de USD a CLP en el catálogo público.
            </li>
            <li>
              El <strong>precio mínimo en CLP</strong> se aplica cuando el
              precio USD multiplicado por el tipo de cambio es inferior a este
              valor, garantizando un precio mínimo por carta.
            </li>
          </ul>
        </div>
      </form>
    </Card>
  );
}
