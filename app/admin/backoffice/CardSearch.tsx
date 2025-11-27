"use client";
import React, { useState, useEffect } from 'react';
import { Button, Label, TextInput, Select, Card } from 'flowbite-react';
import Image from 'next/image';
import ToastNotification from '@/components/ToastNotification';

type CardData = {
  name: string;
  set_name: string;
  collector_number: string;
  type_line: string;
  image_uris?: { normal: string };
  prices: { usd?: string; usd_foil?: string };
};

export default function CardSearch() {
  const [setName, setSetName] = useState('');
  const [collectorNumber, setCollectorNumber] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setCard(null);

    try {
      const q = new URLSearchParams({
        set: setName,
        num: collectorNumber,
        lang: language,
      });
      const res = await fetch(`/api/scryfall?${q.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? `Scryfall returned ${res.status}`);
        setLoading(false);
        return;
      }

      const data = (await res.json()) as CardData;
      setCard(data);
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const [fxRate, setFxRate] = useState<number>(1000);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/settings`);
        const body = await res.json().catch(() => ({}));
        if (mounted && body?.rate) setFxRate(Number(body.rate));
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const formatPrice = (p?: string) => {
    if (!p) return null;
    const n = Number(p);
    if (Number.isNaN(n)) return null;
    return n;
  };

  const [version, setVersion] = useState<'normal' | 'foil' | ''>('');
  const [stock, setStock] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleAddCard = () => {
    if (!card || !version || stock <= 0) return;
    // Prepare payload
    (async () => {
      try {
        const scryfall_id = (card as any).id ?? null;
        // Determine language from Scryfall data when available (card.lang)
        const detectedLang =
          (card as any)?.lang ?? (card as any)?._requested_language ?? null;
        const payload = {
          scryfall_id,
          name: card.name,
          set_code: setName,
          set_name: card.set_name,
          collector_number: card.collector_number,
          type_line: card.type_line,
          image_url: card.image_uris?.normal ?? null,
          json_raw: card,
          finish: version === 'normal' ? 'nonfoil' : 'foil',
          language: 'en',
          quantity: stock,
          price_usd:
            version === 'normal'
              ? formatPrice(card.prices.usd)
              : formatPrice(card.prices.usd_foil),
          price_source: 'scryfall',
        };

        const res = await fetch(`/api/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(body?.error ?? `Failed to add card (${res.status})`);
          return;
        }

        // success
        setToast({ message: 'Carta agregada correctamente', type: 'success' });
      } catch (err: any) {
        const msg = String(err ?? 'Error');
        setError(msg);
        setToast({ message: msg, type: 'error' });
      }
    })();
  };

  return (
    <Card>
      <h2>Agregar Carta</h2>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="setName" className="mb-2">
              Set Code
            </Label>
            <TextInput
              id="setName"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              placeholder="ej. m21 o KHM"
            />
          </div>

          <div>
            <Label htmlFor="collectorNumber" className="mb-2">
              Collector Number
            </Label>
            <TextInput
              id="collectorNumber"
              value={collectorNumber}
              onChange={(e) => setCollectorNumber(e.target.value)}
              placeholder="ej. 123"
            />
          </div>

          <div>
            <Label htmlFor="language" className="mb-2">
              Idioma
            </Label>
            <TextInput
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="ej. en"
            />
          </div>
        </div>

        <div>
          <Button type="submit" disabled={loading} className="bg-primary">
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {card && (
        <div className="mt-6 rounded-xl border border-stone-300 bg-white p-6">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Imagen de la carta */}
            <div className="shrink-0">
              {card.image_uris?.normal ? (
                <Image
                  src={card.image_uris.normal}
                  alt={card.name}
                  width={320}
                  height={445}
                  className="rounded-lg shadow-lg"
                />
              ) : (
                <div className="h-[445px] w-[320px] rounded-lg bg-gray-200" />
              )}
            </div>

            {/* Información de la carta */}
            <div className="flex-1 space-y-4">
              <div>
                <h3>{card.name}</h3>
                <p className="text-sm text-gray-600">
                  Set: {card.set_name} ({card.collector_number})
                </p>
                <p className="text-sm text-gray-600">Tipo: {card.type_line}</p>
              </div>

              {/* Precios */}
              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                <h4>Precios</h4>
                {formatPrice(card.prices.usd) != null ? (
                  (() => {
                    const usd = formatPrice(card.prices.usd)!;
                    const clp = usd * fxRate;
                    return (
                      <p className="text-sm">
                        <span className="font-medium">Normal:</span> $
                        {usd.toFixed(2)} USD (${clp.toFixed(0)} CLP)
                      </p>
                    );
                  })()
                ) : (
                  <p className="text-sm text-gray-500">Normal: -</p>
                )}

                {formatPrice(card.prices.usd_foil) != null ? (
                  (() => {
                    const usdF = formatPrice(card.prices.usd_foil)!;
                    const clpF = usdF * fxRate;
                    return (
                      <p className="text-sm">
                        <span className="font-medium">Foil:</span> $
                        {usdF.toFixed(2)} USD (${clpF.toFixed(0)} CLP)
                      </p>
                    );
                  })()
                ) : (
                  <p className="text-sm text-gray-500">Foil: -</p>
                )}
              </div>

              {/* Agregar carta */}
              <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4>Agregar al inventario</h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="version" className="mb-2">
                      Versión
                    </Label>
                    <Select
                      id="version"
                      value={version}
                      onChange={(e) => setVersion(e.target.value as any)}
                    >
                      <option value="">Seleccionar versión</option>
                      {formatPrice(card.prices.usd) != null && (
                        <option value="normal">
                          Normal — ${formatPrice(card.prices.usd)!.toFixed(2)}{' '}
                          USD ($
                          {(formatPrice(card.prices.usd)! * fxRate).toFixed(
                            0
                          )}{' '}
                          CLP)
                        </option>
                      )}
                      {formatPrice(card.prices.usd_foil) != null && (
                        <option value="foil">
                          Foil — $
                          {formatPrice(card.prices.usd_foil)!.toFixed(2)} USD ($
                          {(
                            formatPrice(card.prices.usd_foil)! * fxRate
                          ).toFixed(0)}{' '}
                          CLP)
                        </option>
                      )}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="stock" className="mb-2">
                      Stock
                    </Label>
                    <TextInput
                      id="stock"
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddCard}
                  disabled={!version || stock <= 0}
                  className="bg-primary w-full"
                >
                  Agregar carta
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Card>
  );
}
