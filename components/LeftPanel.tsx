'use client';

import { Button } from 'flowbite-react';
import { useState } from 'react';
import type { Filters } from './CatalogClient';

type Props = {
  onFilterChange: (filters: Filters) => void;
  fxRate?: number;
  priceRange: { min: number; max: number };
};

export default function LeftPanel({ onFilterChange, priceRange }: Props) {
  const [language, setLanguage] = useState('all');
  const [foil, setFoil] = useState('all');
  const [minPrice, setMinPrice] = useState(priceRange.min);
  const [maxPrice, setMaxPrice] = useState(priceRange.max);
  const [rarity, setRarity] = useState('all');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const handleFilter = () => {
    onFilterChange({
      language,
      foil,
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
    setFoil('all');
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setRarity('all');
    setSelectedColors([]);
    onFilterChange({
      language: 'all',
      foil: 'all',
      priceRange: [priceRange.min, priceRange.max],
      rarity: 'all',
      colors: [],
    });
  };

  return (
    <aside className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
        <p className="text-sm text-gray-500">Refina tu búsqueda</p>
      </div>

      {/* Panel de filtros moderno */}
      <div className="space-y-6 rounded-2xl bg-white p-6 shadow-lg">
        {/* Idioma */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Idioma
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">Todos</option>
            <option value="en">Inglés</option>
            <option value="es">Español</option>
          </select>
        </div>

        {/* Acabado */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Acabado
          </label>
          <select
            value={foil}
            onChange={(e) => setFoil(e.target.value)}
            className="w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">Todos</option>
            <option value="nonfoil">No Foil</option>
            <option value="foil">Foil</option>
            <option value="etched">Etched</option>
          </select>
        </div>

        {/* Rareza */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Rareza
          </label>
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            className="w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">Todas</option>
            <option value="common">Común</option>
            <option value="uncommon">Poco común</option>
            <option value="rare">Rara</option>
            <option value="mythic">Mítica</option>
          </select>
        </div>

        {/* Colores */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-gray-700">
            Colores
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              {
                code: 'W',
                name: 'Blanco',
                color: 'bg-yellow-100 border-yellow-400 text-yellow-900',
              },
              {
                code: 'U',
                name: 'Azul',
                color: 'bg-blue-100 border-blue-400 text-blue-900',
              },
              {
                code: 'B',
                name: 'Negro',
                color: 'bg-gray-800 border-gray-600 text-white',
              },
              {
                code: 'R',
                name: 'Rojo',
                color: 'bg-red-100 border-red-400 text-red-900',
              },
              {
                code: 'G',
                name: 'Verde',
                color: 'bg-green-100 border-green-400 text-green-900',
              },
              {
                code: 'C',
                name: 'Incoloro',
                color: 'bg-gray-100 border-gray-400 text-gray-900',
              },
            ].map(({ code, name, color }) => (
              <button
                key={code}
                type="button"
                onClick={() => toggleColor(code)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${color} ${
                  selectedColors.includes(code)
                    ? 'scale-110 shadow-lg ring-2 ring-purple-500 ring-offset-2'
                    : 'opacity-60 hover:scale-105 hover:opacity-100'
                }`}
                title={name}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Rango de Precio */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-gray-700">
            Rango de Precio (CLP)
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-gray-600">
              <span className="rounded-md bg-purple-50 px-2 py-1">
                ${minPrice.toLocaleString('es-CL')}
              </span>
              <span className="rounded-md bg-purple-50 px-2 py-1">
                ${maxPrice.toLocaleString('es-CL')}
              </span>
            </div>
            <div className="relative h-2">
              <div className="absolute h-2 w-full rounded-lg bg-gray-200" />
              <div
                className="absolute h-2 rounded-lg bg-linear-to-r from-purple-500 to-pink-500"
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
                className="pointer-events-none absolute h-2 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:shadow-lg [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-lg"
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
                className="pointer-events-none absolute h-2 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:shadow-lg [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2 border-t border-gray-200 pt-4">
          <Button
            onClick={handleFilter}
            className="w-full bg-linear-to-r from-purple-600 to-pink-600 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            Aplicar Filtros
          </Button>
          <button
            onClick={clearFilters}
            className="w-full rounded-lg py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </aside>
  );
}
