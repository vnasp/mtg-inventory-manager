'use client';
import React, { useState, useEffect } from 'react';
import { Button, Card, Label, TextInput, Tooltip } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi2';

export default function PokemonSettings() {
  const [fxRate, setFxRate] = useState<string>('');
  const [minCardPrice, setMinCardPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    // Cargar configuración actual de Pokemon
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/settings?game=pokemon`);
        const body = await res.json().catch(() => ({}));
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

      // Guardar configuración de Pokemon
      const pokemonRes = await fetch(`/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'pokemon',
          value: {
            fx_usdclp: { rate },
            min_card_price_clp: { amount: minPrice },
          },
        }),
      });

      if (!pokemonRes.ok) {
        const body = await pokemonRes.json().catch(() => ({}));
        throw new Error(
          body?.error ?? 'Error al guardar configuración de Pokémon'
        );
      }

      setMessage({
        type: 'success',
        text: 'Configuración de Pokémon actualizada correctamente',
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
        <h1>Configuración de Pokémon TCG</h1>
        <p className="backoffice-section-description">
          Ajustes de precios para cartas de Pokémon
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
            placeholder="ej. 1000"
            required
          />
          <p className="mt-1 text-xs text-slate-600">
            1 USD = {fxRate || '0'} CLP para cartas de Pokémon
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
            placeholder="ej. 499"
            required
          />
          <p className="mt-1 text-xs text-slate-600">
            Si el precio USD × Tipo de Cambio es menor a este valor, se usará
            este mínimo
          </p>
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
    </Card>
  );
}
