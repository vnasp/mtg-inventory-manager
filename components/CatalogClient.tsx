'use client';

import React, { useState } from 'react';
import LeftPanel from '@/components/LeftPanel';
import RightSheet from '@/components/RightSheet';

type Props = {
  offers: any[];
  fxRate?: number;
  minCardPriceClp?: number;
};

export type Filters = {
  language: string;
  foil: string;
  priceRange: [number, number];
  rarity: string;
  colors: string[];
};

export default function CatalogClient({
  offers,
  fxRate,
  minCardPriceClp,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);

  // Calcular rango de precios real
  const priceRange = React.useMemo(() => {
    if (!offers || offers.length === 0 || !fxRate)
      return { min: 0, max: 100000 };

    const minPrice = minCardPriceClp ?? 100;
    const prices = offers
      .map((o) => {
        const priceClp = Math.round(Number(o.price_usd ?? 0) * fxRate);
        return Math.max(priceClp, minPrice);
      })
      .filter((p) => p > 0);

    if (prices.length === 0) return { min: 0, max: 100000 };

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return {
      min: Math.floor(min / 1000) * 1000,
      max: Math.ceil(max / 1000) * 1000,
    };
  }, [offers, fxRate, minCardPriceClp]);

  const [filters, setFilters] = useState<Filters>({
    language: 'all',
    foil: 'all',
    priceRange: [priceRange.min, priceRange.max],
    rarity: 'all',
    colors: [],
  });

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <>
      {/* Layout moderno e-commerce */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar de filtros - Desktop */}
        <aside className="hidden lg:block lg:w-72 lg:shrink-0">
          <div className="sticky top-24">
            <LeftPanel
              onFilterChange={handleFilterChange}
              fxRate={fxRate}
              priceRange={priceRange}
            />
          </div>
        </aside>

        {/* Contenido principal */}
        <div className="flex-1">
          <RightSheet
            offers={offers}
            fxRate={fxRate}
            minCardPriceClp={minCardPriceClp}
            filters={filters}
            onOpenFilters={() => setShowFilters(true)}
          />
        </div>
      </div>

      {/* Mobile - Offcanvas Filtros */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm transform bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          showFilters ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header del panel */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
            <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Cerrar filtros"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Contenido del panel */}
          <div className="p-4">
            <LeftPanel
              onFilterChange={(newFilters) => {
                handleFilterChange(newFilters);
                setShowFilters(false);
              }}
              fxRate={fxRate}
              priceRange={priceRange}
            />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {showFilters && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}
    </>
  );
}
