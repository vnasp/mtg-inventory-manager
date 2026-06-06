'use client';

import { useState } from 'react';
import type { Filters } from './CatalogClient';
import { Dropdown } from '@/components/ui/Dropdown';

type Props = {
  onFilterChange: (filters: Filters) => void;
  fxRate?: number;
  priceRange: { min: number; max: number };
  availableSets?: string[];
};

/* SVG icons — width/height as HTML attrs because Tailwind arbitrary sizes
   don't reliably apply to SVG elements; everything else uses Tailwind. */
function Svg({ d, children }: { d?: string; children?: React.ReactNode }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-amber-200"
    >
      {d ? <path d={d} /> : children}
    </svg>
  );
}

const IcoDroplet = () => <Svg d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />;
const IcoStar = () => (
  <Svg d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
);
const IcoShield = () => (
  <Svg d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
);
const IcoSparkle = () => (
  <Svg d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
);
const IcoGlobe = () => (
  <Svg d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
);
const IcoSet = () => (
  <Svg d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
);
const IcoCard = () => (
  <Svg d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
);

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-blue-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

const panelCls =
  'rounded-xl border border-white/10 bg-black/40 shadow-[0_6px_24px_rgba(0,0,0,0.55)]';

const Sep = () => <div className="mx-4 h-px bg-white/[0.07]" />;

function Row({
  ico,
  label,
  open,
  toggle,
  children,
}: {
  ico: React.ReactNode;
  label: string;
  open: boolean;
  toggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-white/4"
      >
        {ico}
        <span className="flex-1 text-[13px] font-semibold text-white">
          {label}
        </span>
        <Chevron open={open} />
      </button>
      {open && children && <div className="px-4 pt-1 pb-4">{children}</div>}
    </div>
  );
}

export default function FilterPanel({
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
  const [open, setOpen] = useState({
    price: true,
    colors: false,
    rarity: false,
    condition: false,
    foil: false,
    language: false,
    set: false,
    type: false,
  });

  const toggle = (k: keyof typeof open) =>
    setOpen((p) => ({ ...p, [k]: !p[k] }));
  const toggleColor = (c: string) =>
    setSelectedColors((p) =>
      p.includes(c) ? p.filter((x) => x !== c) : [...p, c]
    );

  const applyFilters = () =>
    onFilterChange({
      language,
      foil,
      priceRange: [minPrice, maxPrice],
      rarity,
      colors: selectedColors,
      set_name: setName,
      condition,
      type_line: typeLine,
      sortBy: 'newest',
    });

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

  const range = priceRange.max - priceRange.min || 1;
  const pct = (v: number) => ((v - priceRange.min) / range) * 100;
  const step = Math.max(1000, Math.ceil(range / 100));

  /* Dual-range thumbs need pointer-events management via CSS — kept as <style> tag
     because pseudo-elements (::-webkit-slider-thumb) can't be targeted with Tailwind */
  return (
    <div className="flex flex-col gap-2.5">
      {/* Precio */}
      <div className={`${panelCls} p-4`}>
        <button
          type="button"
          onClick={() => toggle('price')}
          className="flex w-full items-center justify-between"
        >
          <span className="text-[13px] font-bold text-white">Precio (CLP)</span>
          <Chevron open={open.price} />
        </button>

        {open.price && (
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-xs text-slate-400">
              <span>${minPrice.toLocaleString('es-CL')}</span>
              <span>${maxPrice.toLocaleString('es-CL')}</span>
            </div>
            <div className="relative flex h-5 items-center">
              <div className="absolute h-1.5 w-full rounded-full bg-white/10" />
              <div
                className="absolute h-1.5 rounded-full bg-blue-500"
                style={{
                  left: `${pct(minPrice)}%`,
                  right: `${100 - pct(maxPrice)}%`,
                }}
              />
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                step={step}
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(Math.min(Number(e.target.value), maxPrice - step))
                }
                className="slider-thumb absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                step={step}
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(Math.max(Number(e.target.value), minPrice + step))
                }
                className="slider-thumb absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Filtros agrupados */}
      <div className={`${panelCls} overflow-hidden`}>
        <Row
          ico={<IcoDroplet />}
          label="Colores"
          open={open.colors}
          toggle={() => toggle('colors')}
        >
          <div className="flex flex-wrap gap-2">
            {(
              [
                { code: 'W', bg: 'bg-yellow-100', text: 'text-yellow-900' },
                { code: 'U', bg: 'bg-blue-200', text: 'text-blue-900' },
                { code: 'B', bg: 'bg-zinc-800', text: 'text-zinc-200' },
                { code: 'R', bg: 'bg-red-200', text: 'text-red-900' },
                { code: 'G', bg: 'bg-green-200', text: 'text-green-900' },
                { code: 'C', bg: 'bg-slate-300', text: 'text-slate-800' },
              ] as const
            ).map(({ code, bg, text }) => (
              <button
                key={code}
                type="button"
                onClick={() => toggleColor(code)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${bg} ${text} ${
                  selectedColors.includes(code)
                    ? 'opacity-100 ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950'
                    : 'opacity-60 hover:opacity-90'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </Row>
        <Sep />
        <Row
          ico={<IcoStar />}
          label="Rareza"
          open={open.rarity}
          toggle={() => toggle('rarity')}
        >
          <Dropdown
            value={rarity}
            onChange={setRarity}
            options={[
              { value: 'all', label: 'Todas' },
              { value: 'common', label: 'Común' },
              { value: 'uncommon', label: 'Poco común' },
              { value: 'rare', label: 'Rara' },
              { value: 'mythic', label: 'Mítica' },
            ]}
          />
        </Row>
        <Sep />
        <Row
          ico={<IcoShield />}
          label="Condición"
          open={open.condition}
          toggle={() => toggle('condition')}
        >
          <Dropdown
            value={condition}
            onChange={setCondition}
            options={[
              { value: 'all', label: 'Todas' },
              { value: 'mint', label: 'Mint (M)' },
              { value: 'near_mint', label: 'Near Mint (NM)' },
              { value: 'lightly_played', label: 'Lightly Played (LP)' },
              { value: 'moderately_played', label: 'Moderately Played (MP)' },
              { value: 'heavily_played', label: 'Heavily Played (HP)' },
              { value: 'damaged', label: 'Damaged (D)' },
            ]}
          />
        </Row>
        <Sep />
        <Row
          ico={<IcoSparkle />}
          label="Acabado"
          open={open.foil}
          toggle={() => toggle('foil')}
        >
          <Dropdown
            value={foil}
            onChange={setFoil}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'nonfoil', label: 'No Foil' },
              { value: 'foil', label: 'Foil' },
              { value: 'etched', label: 'Etched' },
            ]}
          />
        </Row>
        <Sep />
        <Row
          ico={<IcoGlobe />}
          label="Idioma"
          open={open.language}
          toggle={() => toggle('language')}
        >
          <Dropdown
            value={language}
            onChange={setLanguage}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'en', label: 'Inglés' },
              { value: 'es', label: 'Español' },
            ]}
          />
        </Row>
        <Sep />
        <Row
          ico={<IcoSet />}
          label="Expansión"
          open={open.set}
          toggle={() => toggle('set')}
        >
          <Dropdown
            value={setName}
            onChange={setSetName}
            options={[
              { value: 'all', label: 'Todas' },
              ...(availableSets?.map((s) => ({ value: s, label: s })) ?? []),
            ]}
          />
        </Row>
        <Sep />
        <Row
          ico={<IcoCard />}
          label="Tipo de carta"
          open={open.type}
          toggle={() => toggle('type')}
        >
          <Dropdown
            value={typeLine}
            onChange={setTypeLine}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'Creature', label: 'Criatura' },
              { value: 'Instant', label: 'Instantáneo' },
              { value: 'Sorcery', label: 'Conjuro' },
              { value: 'Enchantment', label: 'Encantamiento' },
              { value: 'Artifact', label: 'Artefacto' },
              { value: 'Planeswalker', label: 'Planeswalker' },
              { value: 'Land', label: 'Tierra' },
              { value: 'Battle', label: 'Batalla' },
            ]}
          />
        </Row>
      </div>

      {/* Botones */}

      <div className="mt-6 flex flex-col gap-4">
        <button
          type="button"
          onClick={applyFilters}
          className="mx-auto flex w-3/4 items-center justify-center gap-2 rounded-xl bg-linear-to-b from-blue-600 to-[#0f2a7a] py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="w-full py-2 text-[13px] font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
