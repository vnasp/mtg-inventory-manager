'use client';

import { Button } from 'flowbite-react';
import Image from 'next/image';
import { useState } from 'react';
import type { Filters } from './CatalogClient';

type Props = {
  onFilterChange: (filters: Filters) => void;
  fxRate?: number;
  priceRange: { min: number; max: number };
};

export default function LeftPanel({
  onFilterChange,
  fxRate = 1000,
  priceRange,
}: Props) {
  const [language, setLanguage] = useState('all');
  const [finish, setFinish] = useState('all');
  const [minPrice, setMinPrice] = useState(priceRange.min);
  const [maxPrice, setMaxPrice] = useState(priceRange.max);
  const [rarity, setRarity] = useState('all');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const handleFilter = () => {
    onFilterChange({
      language,
      finish,
      priceRange: [minPrice, maxPrice],
      rarity,
      colors: selectedColors,
    });
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const clearFilters = () => {
    setLanguage('all');
    setFinish('all');
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setRarity('all');
    setSelectedColors([]);
    onFilterChange({
      language: 'all',
      finish: 'all',
      priceRange: [priceRange.min, priceRange.max],
      rarity: 'all',
      colors: [],
    });
  };

  return (
    <aside className="flex w-full flex-col items-center justify-start gap-4 sm:gap-6 lg:mt-14 lg:gap-8">
      {/* Logo - solo en desktop */}
      <div className="hidden justify-center lg:flex">
        <Image
          src="/assets/img/logo.png"
          width={200}
          height={120}
          alt="Logo"
          className="block h-32 w-auto opacity-95 brightness-[0.85] contrast-[1.05] filter-[drop-shadow(-1px_-1px_1px_rgba(255,255,255,0.25))_drop-shadow(2px_2px_3px_rgba(0,0,0,0.8))]"
        />
      </div>

      {/* Panel exterior (base de cuero más oscuro) */}
      <div className="flex w-full flex-col items-center justify-center rounded-2xl bg-transparent p-4 shadow-[0_3px_6px_rgba(0,0,0,0.5)]">
        {/* Panel interior (más claro, elevado) */}
        <div className="bg-panelLight w-full rounded-xl border border-[#564630] p-4 text-stone-800 lg:p-6">
          <label className="text-textDark mb-2 block text-xs lg:text-sm">
            Idioma
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mb-3 w-full rounded-md border border-[#a38b6b] bg-[#f7f3ea] px-2 py-1.5 text-xs shadow-inner lg:mb-4 lg:px-3 lg:py-2 lg:text-sm"
          >
            <option value="all">Todos</option>
            <option value="en">Inglés</option>
            <option value="es">Español</option>
          </select>

          <label className="text-textDark mb-2 block text-xs lg:text-sm">
            Acabado (Foil)
          </label>
          <select
            value={finish}
            onChange={(e) => setFinish(e.target.value)}
            className="mb-3 w-full rounded-md border border-[#a38b6b] bg-[#f7f3ea] px-2 py-1.5 text-xs shadow-inner lg:mb-6 lg:px-3 lg:py-2 lg:text-sm"
          >
            <option value="all">Todos</option>
            <option value="nonfoil">No Foil</option>
            <option value="foil">Foil</option>
            <option value="etched">Etched</option>
          </select>

          <label className="text-textDark mb-2 block text-xs lg:text-sm">
            Rareza
          </label>
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            className="mb-3 w-full rounded-md border border-[#a38b6b] bg-[#f7f3ea] px-2 py-1.5 text-xs shadow-inner lg:mb-4 lg:px-3 lg:py-2 lg:text-sm"
          >
            <option value="all">Todas</option>
            <option value="common">Común</option>
            <option value="uncommon">Poco común</option>
            <option value="rare">Rara</option>
            <option value="mythic">Mítica</option>
          </select>

          <label className="text-textDark mb-2 block text-xs lg:text-sm">
            Colores
          </label>
          <div className="mb-3 flex flex-wrap gap-1.5 lg:mb-4 lg:gap-2">
            {[
              { code: 'W', name: 'Blanco', color: '#F0E68C' },
              { code: 'U', name: 'Azul', color: '#4682B4' },
              { code: 'B', name: 'Negro', color: '#2F4F4F' },
              { code: 'R', name: 'Rojo', color: '#CD5C5C' },
              { code: 'G', name: 'Verde', color: '#3CB371' },
              { code: 'C', name: 'Incoloro', color: '#A9A9A9' },
            ].map(({ code, name, color }) => (
              <button
                key={code}
                type="button"
                onClick={() => toggleColor(code)}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all lg:h-8 lg:w-8 ${
                  selectedColors.includes(code)
                    ? 'scale-110 border-orange-600 shadow-lg'
                    : 'border-stone-400 opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
                title={name}
              >
                {code}
              </button>
            ))}
          </div>

          <label className="text-textDark mb-2 block text-xs lg:text-sm">
            Rango de Precio (CLP)
          </label>
          <div className="mb-3 space-y-2 lg:mb-4 lg:space-y-3">
            <div className="flex items-center justify-between text-[10px] text-stone-600 lg:text-xs">
              <span>Mín: ${minPrice.toLocaleString('es-CL')}</span>
              <span>Máx: ${maxPrice.toLocaleString('es-CL')}</span>
            </div>
            <div className="relative h-2">
              <div className="absolute h-2 w-full rounded-lg bg-[#e5dcc8]" />
              <div
                className="bg-secondary absolute h-2 rounded-lg"
                style={{
                  left: `${((minPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                  right: `${100 - ((maxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                }}
              />
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                step={Math.max(
                  1000,
                  Math.ceil((priceRange.max - priceRange.min) / 100)
                )}
                value={minPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinPrice(Math.min(val, maxPrice - 1000));
                }}
                className="[&::-moz-range-thumb]:bg-secondary [&::-webkit-slider-thumb]:bg-secondary pointer-events-none absolute h-2 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
              />
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                step={Math.max(
                  1000,
                  Math.ceil((priceRange.max - priceRange.min) / 100)
                )}
                value={maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxPrice(Math.max(val, minPrice + 1000));
                }}
                className="[&::-moz-range-thumb]:bg-secondary [&::-webkit-slider-thumb]:bg-secondary pointer-events-none absolute h-2 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
              />
            </div>
          </div>

          <Button
            onClick={handleFilter}
            className="text-textLight bg-primary relative mt-2 w-full overflow-hidden rounded-lg px-3 py-1.5 text-xs font-bold uppercase shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.3)] transition after:absolute after:inset-0 after:rounded-lg after:bg-linear-to-t after:from-orange-300/20 after:to-transparent after:content-[''] hover:brightness-105 active:translate-y-px active:shadow-inner lg:px-4 lg:py-2 lg:text-sm"
          >
            Filtrar
          </Button>

          <Button
            onClick={clearFilters}
            className="text-textDark mt-2 w-full cursor-pointer text-center text-xs underline transition-colors hover:text-orange-600 lg:mt-3 lg:text-sm"
          >
            Limpiar filtros
          </Button>
        </div>
      </div>
    </aside>
  );
}
