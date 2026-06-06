'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { TextInput } from '@/components/ui/TextInput';
import { Dropdown } from '@/components/ui/Dropdown';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';
import Papa from 'papaparse';
import { HiDocumentText, HiSearch } from 'react-icons/hi';
import ToastNotification from '@/components/ToastNotification';

type CardData = {
  id?: string;
  oracle_id?: string;
  lang?: string;
  name: string;
  set_name: string;
  collector_number: string;
  type_line: string;
  image_uris?: { normal: string };
  prices: { usd?: string; usd_foil?: string };
};

type ManaboxRow = {
  Name: string;
  'Set code': string;
  'Set name': string;
  'Collector number': string;
  Foil: string;
  Rarity: string;
  Quantity: string;
  'ManaBox ID': string;
  'Scryfall ID': string;
  'Purchase price': string;
  Misprint: string;
  Altered: string;
  Condition: string;
  Language: string;
  'Purchase price currency': string;
};

type CardKingdomPrices = {
  price_retail_nonfoil_usd: number | null;
  price_retail_foil_usd: number | null;
  updated_at: string;
};

export default function CardSearch() {
  const [setName, setSetName] = useState('');
  const [collectorNumber, setCollectorNumber] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<CardData | null>(null);
  const [ckPrices, setCkPrices] = useState<CardKingdomPrices | null>(null);
  const [priceLastSync, setPriceLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setCard(null);
    setCkPrices(null);

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

      // Obtener precios de Card Kingdom usando scryfall_id y oracle_id
      const scryfallId = data.id;
      const scryfallOracleId = data.oracle_id;
      if (scryfallId || scryfallOracleId) {
        try {
          const pricesRes = await fetch('/api/cardkingdom-prices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scryfallId, scryfallOracleId }),
          });
          if (pricesRes.ok) {
            const pricesData = await pricesRes.json();
            setCkPrices(pricesData.prices || null);
            setPriceLastSync(pricesData.lastSync || null);
          }
        } catch (err) {
          console.warn('No se pudieron obtener precios de Card Kingdom:', err);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const [fxRate, setFxRate] = useState<number>(1000);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/settings?game=mtg`);
        const body = await res.json().catch(() => ({}));
        if (mounted && body?.fx_usdclp?.rate) {
          setFxRate(Number(body.fx_usdclp.rate));
        }
      } catch {
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
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Estado para importación CSV
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    total: number;
    current: number;
    errors: string[];
  } | null>(null);

  const handleAddCard = () => {
    if (!card || !version || stock <= 0) return;
    // Prepare payload
    (async () => {
      try {
        const scryfall_id = card.id ?? null;
        const scryfall_oracle_id = card.oracle_id ?? null;
        const payload = {
          scryfall_id,
          scryfall_oracle_id,
          name: card.name,
          set_code: setName,
          set_name: card.set_name,
          collector_number: card.collector_number,
          type_line: card.type_line,
          image_url: card.image_uris?.normal ?? null,
          json_raw: card,
          foil: version === 'normal' ? 'nonfoil' : 'foil',
          language: (card.lang ?? language) || 'en',
          condition: 'near_mint',
          quantity: stock,
          price_usd:
            version === 'normal'
              ? (ckPrices?.price_retail_nonfoil_usd ??
                formatPrice(card.prices.usd))
              : (ckPrices?.price_retail_foil_usd ??
                formatPrice(card.prices.usd_foil)),
          price_source: ckPrices ? 'cardkingdom' : 'scryfall',
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setToast({ message: msg, type: 'error' });
      }
    })();
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (rows: ManaboxRow[]) => {
    setImportProgress({ total: rows.length, current: 0, errors: [] });

    const errors: string[] = [];
    let successCount = 0;

    try {
      // Procesar en lotes de 50 para mejor rendimiento
      const batchSize = 25;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);

        const batchPromises = batch.map(async (row, batchIdx) => {
          const globalIdx = i + batchIdx;
          try {
            const res = await fetch('/api/import-manabox', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ rows: [row] }),
            });

            const result = await res.json();

            if (!res.ok || !result.ok) {
              const errorMsg =
                result?.error ||
                result?.results?.[0]?.error ||
                'Error desconocido';
              errors.push(`Fila ${globalIdx + 1} (${row.Name}): ${errorMsg}`);
            } else {
              successCount++;
            }
          } catch (err: unknown) {
            errors.push(`Fila ${globalIdx + 1} (${row.Name}): ${err instanceof Error ? err.message : String(err)}`);
          }
        });

        await Promise.all(batchPromises);

        // Actualizar progreso después de cada lote
        setImportProgress({
          total: rows.length,
          current: Math.min(i + batchSize, rows.length),
          errors: [...errors],
        });
      }

      setImporting(false);

      // Mostrar resumen
      if (errors.length === 0) {
        setToast({
          message: `${successCount} cartas importadas correctamente`,
          type: 'success',
        });
      } else {
        setToast({
          message: `Importación completada: ${successCount} éxito, ${errors.length} errores`,
          type: 'error',
        });
      }
    } catch (err: unknown) {
      setToast({
        message: `Error al importar: ${err instanceof Error ? err.message : String(err)}`,
        type: 'error',
      });
      setImporting(false);
    } finally {
      setImportProgress(null);
    }

    // Resetear el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea un archivo CSV
    if (!file.name.endsWith('.csv')) {
      setToast({ message: 'Solo se permiten archivos CSV', type: 'error' });
      return;
    }

    setImporting(true);
    setImportProgress({ total: 0, current: 0, errors: [] });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string) => value.trim(),
      complete: async (results) => {
        const data = results.data as ManaboxRow[];

        // Validar encabezados requeridos
        const requiredHeaders = [
          'Name',
          'Set code',
          'Set name',
          'Collector number',
          'Foil',
          'Rarity',
          'Quantity',
          'ManaBox ID',
          'Scryfall ID',
          'Purchase price',
          'Misprint',
          'Altered',
          'Condition',
          'Language',
          'Purchase price currency',
        ];

        const headers = Object.keys(data[0] || {});
        const missingHeaders = requiredHeaders.filter(
          (h) => !headers.includes(h)
        );

        if (missingHeaders.length > 0) {
          setToast({
            message: `Encabezados faltantes: ${missingHeaders.join(', ')}`,
            type: 'error',
          });
          setImporting(false);
          setImportProgress(null);
          return;
        }

        // Llamar a handleImport después de validar
        await handleImport(data);
      },
      error: (error) => {
        setToast({
          message: `Error al procesar CSV: ${error.message}`,
          type: 'error',
        });
        setImporting(false);
        setImportProgress(null);
      },
    });
  };

  return (
    <Card className="border-zinc-200 bg-white">
      <div className="mb-6 flex flex-col items-start justify-center">
        <h1>Agregar Cartas</h1>
        <p className="text-sm text-slate-500">
          Busca y agrega cartas al inventario.
        </p>
      </div>

      {/* Sección Importación CSV */}
      <div className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <HiDocumentText className="h-6 w-6 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">
            Importación CSV ManaBox
          </h2>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Importa múltiples cartas desde un archivo CSV exportado de ManaBox.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <Button
          onClick={handleImportCSV}
          disabled={importing}
          color="secondary"
          className="w-full md:w-auto"
        >
          {importing ? 'Importando...' : 'Importar archivo CSV'}
        </Button>

        {importProgress && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800">
              Progreso: {importProgress.current} / {importProgress.total}
            </p>
            {importProgress.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-700">Errores:</p>
                <ul className="mt-1 max-h-40 overflow-y-auto text-xs text-red-600">
                  {importProgress.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Separador visual */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm font-medium text-gray-500">
            O busca una carta individual
          </span>
        </div>
      </div>

      {/* Sección Buscar en Scryfall */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <HiSearch className="h-6 w-6 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">
            Buscar en Scryfall
          </h2>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Busca y agrega cartas individuales desde Scryfall.
        </p>

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
                Idioma (opcional)
              </Label>
              <Dropdown
                id="language"
                variant="light"
                value={language}
                onChange={setLanguage}
                options={[
                  { value: '', label: 'Default (EN)' },
                  { value: 'en', label: 'Inglés (en)' },
                  { value: 'es', label: 'Español (es)' },
                  { value: 'fr', label: 'Francés (fr)' },
                  { value: 'de', label: 'Alemán (de)' },
                  { value: 'it', label: 'Italiano (it)' },
                  { value: 'pt', label: 'Portugués (pt)' },
                  { value: 'ja', label: 'Japonés (ja)' },
                  { value: 'ko', label: 'Coreano (ko)' },
                  { value: 'ru', label: 'Ruso (ru)' },
                  { value: 'zhs', label: 'Chino simplificado (zhs)' },
                  { value: 'zht', label: 'Chino tradicional (zht)' },
                ]}
              />
            </div>
          </div>

          <div>
            <Button
              color="default"
              outline
              type="submit"
              disabled={loading || !setName || !collectorNumber}
            >
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
                  <p className="text-sm text-gray-600">
                    Tipo: {card.type_line}
                  </p>
                </div>

                {/* Información de fuentes de datos */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                  <p>
                    <strong>Información de carta:</strong> Scryfall
                  </p>
                  <p>
                    <strong>Precios:</strong>{' '}
                    {ckPrices
                      ? 'Card Kingdom vía MTGJSON'
                      : 'Scryfall (fallback)'}
                    {priceLastSync && ckPrices && (
                      <span className="ml-1">
                        (última actualización:{' '}
                        {new Date(priceLastSync).toLocaleDateString('es-CL')})
                      </span>
                    )}
                  </p>
                </div>

                {/* Precios */}
                <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                  <h4>Precios</h4>
                  {ckPrices?.price_retail_nonfoil_usd != null ||
                  formatPrice(card.prices.usd) != null ? (
                    (() => {
                      const usd =
                        ckPrices?.price_retail_nonfoil_usd ??
                        formatPrice(card.prices.usd)!;
                      const clp = usd * fxRate;
                      return (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Normal:</span> $
                          {usd.toFixed(2)} USD (${clp.toFixed(0)} CLP)
                        </p>
                      );
                    })()
                  ) : (
                    <p className="text-sm text-gray-500">Normal: -</p>
                  )}

                  {ckPrices?.price_retail_foil_usd != null ||
                  formatPrice(card.prices.usd_foil) != null ? (
                    (() => {
                      const usdF =
                        ckPrices?.price_retail_foil_usd ??
                        formatPrice(card.prices.usd_foil)!;
                      const clpF = usdF * fxRate;
                      return (
                        <p className="text-sm text-gray-700">
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
                      <Dropdown
                        id="version"
                        variant="light"
                        value={version}
                        onChange={(v) => setVersion(v as '' | 'normal' | 'foil')}
                        options={[
                          { value: '', label: 'Seleccionar versión' },
                          ...(ckPrices?.price_retail_nonfoil_usd != null || formatPrice(card.prices.usd) != null
                            ? [{
                                value: 'normal',
                                label: `Normal — $${(ckPrices?.price_retail_nonfoil_usd ?? formatPrice(card.prices.usd)!).toFixed(2)} USD ($${((ckPrices?.price_retail_nonfoil_usd ?? formatPrice(card.prices.usd)!) * fxRate).toFixed(0)} CLP)`,
                              }]
                            : []),
                          ...(ckPrices?.price_retail_foil_usd != null || formatPrice(card.prices.usd_foil) != null
                            ? [{
                                value: 'foil',
                                label: `Foil — $${(ckPrices?.price_retail_foil_usd ?? formatPrice(card.prices.usd_foil)!).toFixed(2)} USD ($${((ckPrices?.price_retail_foil_usd ?? formatPrice(card.prices.usd_foil)!) * fxRate).toFixed(0)} CLP)`,
                              }]
                            : []),
                        ]}
                      />
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
                    className="bg-zinc-900 hover:bg-zinc-800 w-full"
                  >
                    Agregar carta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Fin sección Scryfall */}

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
