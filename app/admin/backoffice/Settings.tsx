'use client';
import React, { useState, useEffect } from 'react';
import { Button, Card, Label, TextInput, Tooltip } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';

export default function Settings() {
  const [fxRate, setFxRate] = useState<string>('');
  const [minCardPrice, setMinCardPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [priceUpdateMessage, setPriceUpdateMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    // Cargar configuración actual
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/settings?game=mtg`);
        const body = await res.json().catch(() => ({}));

        // La estructura esperada es: { fx_usdclp: { rate: number }, min_card_price_clp: { amount: number } }
        if (body?.fx_usdclp?.rate !== undefined) {
          setFxRate(String(body.fx_usdclp.rate));
        }
        if (body?.min_card_price_clp?.amount !== undefined) {
          setMinCardPrice(String(body.min_card_price_clp.amount));
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

      // Guardar ambos valores bajo la clave 'mtg'
      const mtgRes = await fetch(`/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'mtg',
          value: {
            fx_usdclp: { rate },
            min_card_price_clp: { amount: minPrice },
          },
        }),
      });

      if (!mtgRes.ok) {
        const body = await mtgRes.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Error al guardar configuración');
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

  const handleUpdatePrices = async () => {
    setUpdatingPrices(true);
    setPriceUpdateMessage(null);
    setProgressMessages([]);

    try {
      const res = await fetch('/api/cardkingdom-prices/update', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Error al conectar con el servidor');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No se pudo leer la respuesta del servidor');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.complete) {
              setPriceUpdateMessage({
                type: 'success',
                text: `Actualización completa: ${data.stats.pricesImported} precios importados, ${data.stats.offersUpdated} ofertas actualizadas`,
              });
            } else if (data.message) {
              setProgressMessages((prev) => [...prev, data.message]);
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setPriceUpdateMessage({
        type: 'error',
        text: err.message || 'Error al actualizar precios',
      });
    } finally {
      setUpdatingPrices(false);
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
          <div className="mb-2 flex flex-row items-center gap-2">
            <Label htmlFor="fxRate" className="mb-0">
              Tipo de Cambio USD/CLP
            </Label>
            <Tooltip content="El tipo de cambio se utiliza para convertir los precios de USD a CLP en el catálogo público.">
              <HiInformationCircle className="h-4 w-4 cursor-help text-slate-400" />
            </Tooltip>
          </div>
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
          <div className="mb-2 flex items-center gap-2">
            <Label htmlFor="minCardPrice" className="mb-0">
              Precio Mínimo de Carta (CLP)
            </Label>
            <Tooltip content="El precio mínimo en CLP se aplica cuando el precio USD multiplicado por el tipo de cambio es inferior a este valor, garantizando un precio mínimo por carta.">
              <HiInformationCircle className="h-4 w-4 cursor-help text-slate-400" />
            </Tooltip>
          </div>
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
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving} color="default">
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
      </form>

      {/* Sección de actualización de precios de CardKingdom */}
      <div className="mt-8 border-t border-slate-200 pt-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Actualización de Precios
        </h2>

        <Card>
          <div className="space-y-4">
            <p className="mb-4 text-sm text-slate-600">
              Actualiza los precios de las cartas desde CardKingdom mediante
              MTGJson AllPricesToday. Este proceso actualizará el precio en USD
              y es irreversible. Puede tardar unos minutos dependiendo de la
              cantidad de cartas.
            </p>
            <p className="mb-4 text-sm text-slate-600">
              La actualización también se ejecuta automáticamente los Lunes a
              las 3 AM.
            </p>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleUpdatePrices}
                disabled={updatingPrices}
                color="default"
                outline
              >
                {updatingPrices
                  ? 'Actualizando...'
                  : 'Actualizar Precios de CardKingdom'}
              </Button>

              {priceUpdateMessage && (
                <div
                  className={`rounded-lg px-4 py-2 text-sm ${
                    priceUpdateMessage.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {priceUpdateMessage.text}
                </div>
              )}
            </div>

            {/* Mensajes de progreso */}
            {updatingPrices && progressMessages.length > 0 && (
              <div className="bg-blue-30 rounded-lg border border-blue-200 p-4">
                <h4 className="mb-2 font-semibold text-blue-800">Progreso:</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  {progressMessages.map((msg, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 text-blue-500">✓</span>
                      <span>{msg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Card>
  );
}
