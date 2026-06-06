'use client';

import { useCallback, useEffect, useState } from 'react';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Dropdown } from '@/components/ui/Dropdown';
import CardDetailModal from './CardDetailModal';
import CardItem from './CardItem';
import type { Filters } from './CatalogClient';
import type { CardOffer } from '@/types/card';

type Props = {
  offers: CardOffer[];
  fxRate?: number;
  minCardPriceClp?: number;
  filters: Filters;
  onOpenFilters?: () => void;
};

export default function RightSheet({
  offers,
  fxRate,
  minCardPriceClp,
  filters,
  onOpenFilters,
}: Props) {
  const [displayed, setDisplayed] = useState<CardOffer[]>(offers ?? []);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOffer, setSelectedOffer] = useState<CardOffer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);

  const [sortBy, setSortBy] = useState('newest');

  const itemsPerPage = 8;

  // Aplicar filtros a las ofertas
  const applyFilters = useCallback(
    (offersList: CardOffer[]) => {
      let filtered = offersList;

      // Filtro de idioma
      if (filters.language !== 'all') {
        filtered = filtered.filter(
          (offer) =>
            offer.language?.toLowerCase() === filters.language.toLowerCase()
        );
      }

      // Filtro de acabado (foil)
      if (filters.foil !== 'all') {
        filtered = filtered.filter(
          (offer) => offer.foil?.toLowerCase() === filters.foil.toLowerCase()
        );
      }

      // Filtro de rango de precio
      if (filters.priceRange && fxRate) {
        const [minPrice, maxPrice] = filters.priceRange;
        const minCardPrice = minCardPriceClp ?? 100;
        filtered = filtered.filter((offer) => {
          const priceUsd = Number(offer.price_usd ?? 0);
          const priceClp = Math.round(priceUsd * fxRate);
          const finalPrice = Math.max(priceClp, minCardPrice);
          return finalPrice >= minPrice && finalPrice <= maxPrice;
        });
      }

      // Filtro de rareza
      if (filters.rarity && filters.rarity !== 'all') {
        filtered = filtered.filter((offer) => {
          const card = offer.mtg_cards ?? offer.cards ?? offer.card ?? null;
          return card?.rarity?.toLowerCase() === filters.rarity.toLowerCase();
        });
      }

      // Filtro de colores (coincide si la carta tiene TODOS los colores seleccionados)
      if (filters.colors && filters.colors.length > 0) {
        filtered = filtered.filter((offer) => {
          const card = offer.mtg_cards ?? offer.cards ?? offer.card ?? null;
          const cardColors = card?.color_identity || card?.colors || [];
          // Verificar que la carta contenga todos los colores seleccionados
          return filters.colors.every((selectedColor) =>
            cardColors.includes(selectedColor)
          );
        });
      }

      // Filtro de expansión/set
      if (filters.set_name && filters.set_name !== 'all') {
        filtered = filtered.filter((offer) => {
          const card = offer.mtg_cards ?? offer.cards ?? offer.card ?? null;
          return (
            card?.set_name?.toLowerCase() === filters.set_name.toLowerCase()
          );
        });
      }

      // Filtro de condición
      if (filters.condition && filters.condition !== 'all') {
        filtered = filtered.filter((offer) => {
          return (
            offer.condition?.toLowerCase() === filters.condition.toLowerCase()
          );
        });
      }

      // Filtro de tipo de carta
      if (filters.type_line && filters.type_line !== 'all') {
        filtered = filtered.filter((offer) => {
          const card = offer.mtg_cards ?? offer.cards ?? offer.card ?? null;
          const typeLine = card?.type_line || '';
          // Verificar si el tipo está incluido en type_line (ej: "Creature — Human" incluye "Creature")
          return typeLine.includes(filters.type_line);
        });
      }

      // Aplicar ordenamiento
      if (sortBy) {
        const minCardPrice = minCardPriceClp ?? 100;
        filtered = [...filtered].sort((a, b) => {
          const cardA = a.cards ?? a.card ?? null;
          const cardB = b.cards ?? b.card ?? null;

          switch (sortBy) {
            case 'newest':
              return (
                new Date(b.created_at ?? 0).getTime() -
                new Date(a.created_at ?? 0).getTime()
              );
            case 'oldest':
              return (
                new Date(a.created_at ?? 0).getTime() -
                new Date(b.created_at ?? 0).getTime()
              );
            case 'price_asc': {
              const priceA = fxRate
                ? Math.max(
                    Math.round(Number(a.price_usd ?? 0) * fxRate),
                    minCardPrice
                  )
                : 0;
              const priceB = fxRate
                ? Math.max(
                    Math.round(Number(b.price_usd ?? 0) * fxRate),
                    minCardPrice
                  )
                : 0;
              return priceA - priceB;
            }
            case 'price_desc': {
              const priceA = fxRate
                ? Math.max(
                    Math.round(Number(a.price_usd ?? 0) * fxRate),
                    minCardPrice
                  )
                : 0;
              const priceB = fxRate
                ? Math.max(
                    Math.round(Number(b.price_usd ?? 0) * fxRate),
                    minCardPrice
                  )
                : 0;
              return priceB - priceA;
            }
            case 'name_asc':
              return (cardA?.name || '').localeCompare(cardB?.name || '');
            case 'name_desc':
              return (cardB?.name || '').localeCompare(cardA?.name || '');
            case 'rarity_asc': {
              const rarityOrder: Record<string, number> = {
                common: 1,
                uncommon: 2,
                rare: 3,
                mythic: 4,
                special: 5,
                bonus: 6,
              };
              const rarityA =
                rarityOrder[cardA?.rarity?.toLowerCase() || ''] || 0;
              const rarityB =
                rarityOrder[cardB?.rarity?.toLowerCase() || ''] || 0;
              return rarityA - rarityB;
            }
            case 'rarity_desc': {
              const rarityOrder: Record<string, number> = {
                common: 1,
                uncommon: 2,
                rare: 3,
                mythic: 4,
                special: 5,
                bonus: 6,
              };
              const rarityA =
                rarityOrder[cardA?.rarity?.toLowerCase() || ''] || 0;
              const rarityB =
                rarityOrder[cardB?.rarity?.toLowerCase() || ''] || 0;
              return rarityB - rarityA;
            }
            default:
              return 0;
          }
        });
      }

      return filtered;
    },
    [filters, fxRate, minCardPriceClp, sortBy]
  );

  useEffect(() => {
    const filtered = applyFilters(offers ?? []);
    setDisplayed(filtered);
    setCurrentPage(1); // Reset a la primera página cuando cambien las ofertas o filtros
  }, [offers, applyFilters]);

  const doSearch = useCallback(
    async (q: string) => {
      // si cadena vacía, restaurar ofertas iniciales con filtros
      if (!q) {
        const filtered = applyFilters(offers ?? []);
        setDisplayed(filtered);
        return;
      }

      setLoading(true);
      try {
        const url = `/api/cards?q=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('search request failed');
        const json = await res.json();
        // endpoint devuelve { data: [...] }
        const items = (json.data ?? []) as CardOffer[];
        // Filtrar en cliente por seguridad: solo mostrar los items cuyo nombre de carta
        // contenga la query (case-insensitive). Manejar diferentes shapes (cards vs card)
        const qLower = q.toLowerCase();
        const searchFiltered = items.filter((it) => {
          const name =
            (it.cards && it.cards.name) ||
            (it.card && it.card.name) ||
            (it.name as string) ||
            '';
          return String(name).toLowerCase().includes(qLower);
        });

        // Aplicar filtros adicionales (idioma, foil)
        const filtered = applyFilters(searchFiltered);
        setDisplayed(filtered);
        setCurrentPage(1); // Reset a la primera página al buscar
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    },
    [offers, applyFilters]
  );

  // Calcular paginación
  const totalPages = Math.ceil(displayed.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = displayed.slice(startIndex, endIndex);

  const onPageChange = (page: number) => {
    setGridVisible(false);
    setTimeout(() => {
      setCurrentPage(page);
      setGridVisible(true);
    }, 200);
  };

  const openModal = (offer: CardOffer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOffer(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/40 px-4 py-2 shadow-[0_6px_24px_rgba(0,0,0,0.55)] lg:flex-row lg:items-center lg:justify-between">
          {/* SearchBar */}
          <div className="flex-1">
            <SearchBar
              onSearch={doSearch}
              placeholder="Buscar cartas por nombre..."
              loading={loading}
            />
          </div>

          {/* Ordenar por - Desktop */}
          <div className="hidden lg:block">
            <Dropdown
              value={sortBy}
              onChange={setSortBy}
              className="w-48"
              options={[
                { value: 'newest', label: 'Más recientes' },
                { value: 'oldest', label: 'Más antiguos' },
                { value: 'price_asc', label: 'Precio: ↑' },
                { value: 'price_desc', label: 'Precio: ↓' },
                { value: 'name_asc', label: 'Nombre: A-Z' },
                { value: 'name_desc', label: 'Nombre: Z-A' },
                { value: 'rarity_asc', label: 'Rareza: ↑' },
                { value: 'rarity_desc', label: 'Rareza: ↓' },
              ]}
            />
          </div>

          {/* Botón Filtrar - solo mobile */}
          {onOpenFilters && (
            <Button
              onClick={onOpenFilters}
              className="flex items-center justify-center gap-2 bg-linear-to-r from-purple-600 to-pink-600 font-semibold text-white shadow-lg transition-all hover:scale-105 lg:hidden"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filtros
            </Button>
          )}

          {/* Resultados count - Desktop */}
          <div className="hidden text-sm text-gray-600 lg:block">
            <span className="font-semiboldel">{displayed.length}</span>{' '}
            {displayed.length === 1 ? 'carta' : 'cartas'}
          </div>
        </div>
      </div>

      {/* Grid de cartas */}
      {displayed.length === 0 ? (
        <div className="m-auto flex flex-col items-center justify-center rounded-xl text-center">
          <svg
            className="mb-4 h-16 w-16 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            No se encontraron cartas
          </h3>
          <p className="text-sm text-gray-500">
            Intenta ajustar los filtros o realizar una nueva búsqueda
          </p>
        </div>
      ) : (
        <>
          {/* Grid de productos */}
          <div
            className={`grid gap-6 transition-all duration-200 ${gridVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}
            style={{
              gridTemplateColumns: 'repeat(4, 1fr)',
            }}
          >
            {currentItems.map((o) => (
              <CardItem
                key={o.id}
                offer={o}
                fxRate={fxRate}
                minCardPriceClp={minCardPriceClp}
                onClick={() => openModal(o)}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showIcons
                previousLabel="Anterior"
                nextLabel="Siguiente"
                className="rounded-lg bg-black/40 px-4 py-2 shadow-md"
              />
            </div>
          )}
        </>
      )}

      {/* Modal de detalles */}
      <CardDetailModal
        show={showModal}
        onClose={closeModal}
        offer={selectedOffer}
        fxRate={fxRate}
        minCardPriceClp={minCardPriceClp}
      />
    </div>
  );
}
