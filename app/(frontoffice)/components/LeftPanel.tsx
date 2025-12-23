'use client';

import { Button } from 'flowbite-react';
import { useState } from 'react';
import type { Filters } from './CatalogClient';
import { MdExpandMore } from 'react-icons/md';

type Props = {
  onFilterChange: (filters: Filters) => void;
  fxRate?: number;
  priceRange: { min: number; max: number };
  availableSets?: string[];
};

export default function LeftPanel({
  onFilterChange,
  priceRange,
  availableSets,
}: Props) {
  const [language, setLanguage] = useState('all');
  const [foil, setFoil] = useState('all');
  const [minPrice, setMinPrice] = useState(priceRange.min);
  const [maxPrice, setMaxPrice] = useState(priceRange.max);
  const [rarity, setRarity] = useState('all');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [setName, setSetName] = useState('all');
  const [condition, setCondition] = useState('all');
  const [typeLine, setTypeLine] = useState('all');

  const [accordionOpen, setAccordionOpen] = useState({
    price: true,
    colors: true,
    rarity: false,
    foil: false,
    language: false,
    condition: false,
    set: false,
    type: false,
  });

  const toggleAccordion = (key: keyof typeof accordionOpen) => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFilter = () => {
    onFilterChange({
      language,
      foil,
      priceRange: [minPrice, maxPrice],
      rarity,
      colors: selectedColors,
      set_name: setName,
      condition,
      type_line: typeLine,
      sortBy: 'newest', // Valor por defecto, se maneja en RightSheet
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
    setSetName('all');
    setCondition('all');
    setTypeLine('all');
    onFilterChange({
      language: 'all',
      foil: 'all',
      priceRange: [priceRange.min, priceRange.max],
      rarity: 'all',
      colors: [],
      set_name: 'all',
      condition: 'all',
      type_line: 'all',
      sortBy: 'newest',
    });
  };

  return (
    <aside className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
      </div>

      {/* Panel de filtros moderno con acordeón */}
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-lg">
        {/* 1. Rango de Precio - PRIORIDAD ALTA */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleAccordion('price')}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-700">
              Precio (CLP)
            </span>
            <MdExpandMore
              className={`h-5 w-5 transform transition-transform ${accordionOpen.price ? 'rotate-180' : ''}`}
            />
          </button>
          {accordionOpen.price && (
            <div className="mt-3 space-y-3">
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
          )}
        </div>

        {/* 2. Colores - PRIORIDAD ALTA */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleAccordion('colors')}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-700">Colores</span>
            <MdExpandMore
              className={`h-5 w-5 transform transition-transform ${accordionOpen.colors ? 'rotate-180' : ''}`}
            />
          </button>
          {accordionOpen.colors && (
            <div className="mt-3 flex flex-wrap gap-1.5">
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
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${color} ${
                    selectedColors.includes(code)
                      ? 'scale-110 shadow-md ring-2 ring-purple-500 ring-offset-1'
                      : 'opacity-60 hover:scale-105 hover:opacity-100'
                  }`}
                  title={name}
                >
                  {code}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Rareza */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleAccordion('rarity')}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-700">Rareza</span>
            <MdExpandMore
              className={`h-5 w-5 transform transition-transform ${accordionOpen.rarity ? 'rotate-180' : ''}`}
            />
          </button>
          {accordionOpen.rarity && (
            <div className="mt-2">
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
                className="w-full rounded-lg border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="all">Todas</option>
                <option value="common">Común</option>
                <option value="uncommon">Poco común</option>
                <option value="rare">Rara</option>
                <option value="mythic">Mítica</option>
              </select>
            </div>
          )}
        </div>

        {/* 4. Condición */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleAccordion('condition')}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-700">
              Condición
            </span>
            <MdExpandMore
              className={`h-5 w-5 transform transition-transform ${accordionOpen.condition ? 'rotate-180' : ''}`}
            />
          </button>
          {accordionOpen.condition && (
            <div className="mt-2">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-lg border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="all">Todas</option>
                <option value="mint">Mint (M)</option>
                <option value="near_mint">Near Mint (NM)</option>
                <option value="lightly_played">Lightly Played (LP)</option>
                <option value="moderately_played">
                  Moderately Played (MP)
                </option>
                <option value="heavily_played">Heavily Played (HP)</option>
                <option value="damaged">Damaged (D)</option>
              </select>
            </div>
          )}
        </div>

        {/* 5. Acabado */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleAccordion('foil')}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-700">Acabado</span>
            <MdExpandMore
              className={`h-5 w-5 transform transition-transform ${accordionOpen.foil ? 'rotate-180' : ''}`}
            />
          </button>
          {accordionOpen.foil && (
            <div className="mt-2">
              <select
                value={foil}
                onChange={(e) => setFoil(e.target.value)}
                className="w-full rounded-lg border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="all">Todos</option>
                <option value="nonfoil">No Foil</option>
                <option value="foil">Foil</option>
                <option value="etched">Etched</option>
              </select>
            </div>
          )}
        </div>

        {/* 6. Idioma */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleAccordion('language')}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-700">Idioma</span>
            <MdExpandMore
              className={`h-5 w-5 transform transition-transform ${accordionOpen.language ? 'rotate-180' : ''}`}
            />
          </button>
          {accordionOpen.language && (
            <div className="mt-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="all">Todos</option>
                <option value="en">Inglés</option>
                <option value="es">Español</option>
              </select>
            </div>
          )}
        </div>

        {/* 7. Expansión/Set */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleAccordion('set')}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-700">
              Expansión
            </span>
            <MdExpandMore
              className={`h-5 w-5 transform transition-transform ${accordionOpen.set ? 'rotate-180' : ''}`}
            />
          </button>
          {accordionOpen.set && (
            <div className="mt-2">
              <select
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                className="w-full rounded-lg border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="all">Todas</option>
                {availableSets?.map((set) => (
                  <option key={set} value={set}>
                    {set}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 8. Tipo de Carta */}
        <div className="pb-3">
          <button
            onClick={() => toggleAccordion('type')}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-700">
              Tipo de Carta
            </span>
            <MdExpandMore
              className={`h-5 w-5 transform transition-transform ${accordionOpen.type ? 'rotate-180' : ''}`}
            />
          </button>
          {accordionOpen.type && (
            <div className="mt-2">
              <select
                value={typeLine}
                onChange={(e) => setTypeLine(e.target.value)}
                className="w-full rounded-lg border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="all">Todos</option>
                <option value="Creature">Criatura</option>
                <option value="Instant">Instantáneo</option>
                <option value="Sorcery">Conjuro</option>
                <option value="Enchantment">Encantamiento</option>
                <option value="Artifact">Artefacto</option>
                <option value="Planeswalker">Planeswalker</option>
                <option value="Land">Tierra</option>
                <option value="Battle">Batalla</option>
              </select>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
          <Button
            color="secondary"
            onClick={handleFilter}
            className="w-full"
            size="md"
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
