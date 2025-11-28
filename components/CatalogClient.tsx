'use client';

import React, { useState } from 'react';
import LeftPanel from '@/components/LeftPanel';
import RightSheet from '@/components/RightSheet';

type Props = {
  offers: any[];
  fxRate?: number;
};

export type Filters = {
  language: string;
  foil: string;
  priceRange: [number, number];
  rarity: string;
  colors: string[];
};

export default function CatalogClient({ offers, fxRate }: Props) {
  const [showFilters, setShowFilters] = useState(false);

  // Calcular rango de precios real
  const priceRange = React.useMemo(() => {
    if (!offers || offers.length === 0 || !fxRate)
      return { min: 0, max: 100000 };

    const prices = offers
      .map((o) => Math.round(Number(o.price_usd ?? 0) * fxRate))
      .filter((p) => p > 0);

    if (prices.length === 0) return { min: 0, max: 100000 };

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return {
      min: Math.floor(min / 1000) * 1000,
      max: Math.ceil(max / 1000) * 1000,
    };
  }, [offers, fxRate]);

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
      {/* Desktop Layout: Horizontal */}
      <div className="hidden h-full w-full items-center lg:grid lg:grid-cols-[25%_8%_62%]">
        <div className="h-full w-full overflow-y-auto lg:ms-8">
          <LeftPanel
            onFilterChange={handleFilterChange}
            fxRate={fxRate}
            priceRange={priceRange}
          />
        </div>

        <div className="h-full">{''}</div>

        <div className="overflow-y-auto lg:ms-8 lg:h-full">
          <RightSheet offers={offers} fxRate={fxRate} filters={filters} />
        </div>
      </div>

      {/* Mobile/Tablet Layout: Vertical */}
      <div className="flex h-full w-full flex-col overflow-y-auto lg:hidden">
        {/* Offcanvas - Panel de filtros */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm transform bg-black/95 backdrop-blur-sm transition-transform duration-300 ease-in-out ${
            showFilters ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col overflow-y-auto p-4">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowFilters(false)}
              className="text-textLight mb-4 self-end rounded-lg p-2 hover:bg-white/10"
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

        {/* Overlay */}
        {showFilters && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Panel de cartas */}
        <div className="w-full px-4 py-4">
          <RightSheet
            offers={offers}
            fxRate={fxRate}
            filters={filters}
            onOpenFilters={() => setShowFilters(true)}
          />
        </div>
      </div>
    </>
  );
}
