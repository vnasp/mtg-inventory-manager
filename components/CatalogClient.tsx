'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import FilterPanel from '@/components/FilterPanel';
import RightSheet from '@/components/RightSheet';
import { calculatePriceClp } from '@/utils/priceCalculations';
import type { CardOffer } from '@/types/card';

type Props = {
  offers: CardOffer[];
  fxRate?: number;
  minCardPriceClp?: number;
};

export type Filters = {
  language: string;
  foil: string;
  priceRange: [number, number];
  rarity: string;
  colors: string[];
  set_name: string;
  condition: string;
  type_line: string;
  sortBy: string;
};

export default function CatalogClient({
  offers,
  fxRate,
  minCardPriceClp,
}: Props) {
  const priceRange = React.useMemo(() => {
    if (!offers || offers.length === 0 || !fxRate)
      return { min: 0, max: 100000 };

    const minPrice = minCardPriceClp ?? 100;
    const prices = offers
      .map((o) => {
        const priceUsd = Number(o.price_usd ?? 0);
        const markupPercent = Number(o.markup_percent ?? 0);
        return calculatePriceClp(priceUsd, markupPercent, fxRate, minPrice);
      })
      .filter((p) => p > 0);

    if (prices.length === 0) return { min: 0, max: 100000 };

    return {
      min: Math.floor(Math.min(...prices) / 1000) * 1000,
      max: Math.ceil(Math.max(...prices) / 1000) * 1000,
    };
  }, [offers, fxRate, minCardPriceClp]);

  const availableSets = React.useMemo(() => {
    if (!offers || offers.length === 0) return [];
    const sets = new Set<string>();
    offers.forEach((offer) => {
      const card = offer.mtg_cards ?? offer.cards ?? offer.card ?? null;
      if (card?.set_name) sets.add(card.set_name);
    });
    return Array.from(sets).sort();
  }, [offers]);

  const [filters, setFilters] = useState<Filters>({
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

  const handleFilterChange = (newFilters: Filters) => setFilters(newFilters);

  return (
    /* Binder layout: left page | spine | right page */
    <div
      className="grid h-screen w-screen overflow-hidden bg-black bg-[url(/assets/img/bg_desktop.png)] bg-size-[auto_100%] bg-center bg-no-repeat"
      style={{
        gridTemplateColumns: '27% 9% 1fr',
        paddingLeft: 'max(0px, calc((100vw - 100vh * 1672 / 941) / 1.4))',
        paddingRight: 'max(0px, calc((100vw - 100vh * 1672 / 941) / 1.4))',
        paddingTop: '2.5rem',
      }}
    >
      {/* ── Left page: logo + filtros ── */}
      <div className="flex flex-col overflow-y-auto">
        <div className="mb-12 flex justify-center">
          <Image
            src="/assets/img/logo.png"
            width={200}
            height={80}
            alt="MTG Inventory Manager"
            className="h-auto w-full"
            priority
          />
        </div>
        <FilterPanel
          onFilterChange={handleFilterChange}
          fxRate={fxRate}
          priceRange={priceRange}
          availableSets={availableSets}
        />
      </div>

      {/* ── Spine (sin contenido, solo espacio visual del cuadernillo) ── */}
      <div />

      {/* ── Right page: buscador + cartas ── */}
      <div className="flex min-w-0 flex-col overflow-hidden pl-2">
        <RightSheet
          offers={offers}
          fxRate={fxRate}
          minCardPriceClp={minCardPriceClp}
          filters={filters}
        />
      </div>
    </div>
  );
}
