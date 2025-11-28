'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import { Button, Pagination } from 'flowbite-react';
import CardDetailModal from './CardDetailModal';
import type { Filters } from './CatalogClient';

type Props = {
  offers: any[];
  fxRate?: number;
  filters: Filters;
  onOpenFilters?: () => void;
};

export default function RightSheet({
  offers,
  fxRate,
  filters,
  onOpenFilters,
}: Props) {
  const [displayed, setDisplayed] = useState<any[]>(offers ?? []);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Calcular items por página según el tamaño de pantalla
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        // Mobile: 2 columnas × 2 filas = 4 items
        setItemsPerPage(2);
      } else if (window.innerWidth < 768) {
        // SM: 3 columnas × 2 filas = 6 items
        setItemsPerPage(6);
      } else if (window.innerWidth < 1024) {
        // MD: 4 columnas × 2 filas = 8 items
        setItemsPerPage(8);
      } else {
        // LG+: 5 columnas × 3 filas = 15 items
        setItemsPerPage(15);
      }
    };

    handleResize(); // Calcular al montar
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Aplicar filtros a las ofertas
  const applyFilters = useCallback(
    (offersList: any[]) => {
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
        filtered = filtered.filter((offer) => {
          const priceUsd = Number(offer.price_usd ?? 0);
          const priceClp = Math.round(priceUsd * fxRate);
          return priceClp >= minPrice && priceClp <= maxPrice;
        });
      }

      // Filtro de rareza
      if (filters.rarity && filters.rarity !== 'all') {
        filtered = filtered.filter((offer) => {
          const card = offer.cards ?? offer.card ?? null;
          return card?.rarity?.toLowerCase() === filters.rarity.toLowerCase();
        });
      }

      // Filtro de colores (coincide si la carta tiene TODOS los colores seleccionados)
      if (filters.colors && filters.colors.length > 0) {
        filtered = filtered.filter((offer) => {
          const card = offer.cards ?? offer.card ?? null;
          const cardColors = card?.color_identity || card?.colors || [];
          // Verificar que la carta contenga todos los colores seleccionados
          return filters.colors.every((selectedColor) =>
            cardColors.includes(selectedColor)
          );
        });
      }

      return filtered;
    },
    [filters, fxRate]
  );

  useEffect(() => {
    const filtered = applyFilters(offers ?? []);
    setDisplayed(filtered);
    setCurrentPage(1); // Reset a la primera página cuando cambien las ofertas o filtros
  }, [offers, applyFilters]);

  const doSearch = useCallback(
    async (q: string) => {
      setSearchQuery(q);
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
        const items = (json.data ?? []) as any[];
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
    setCurrentPage(page);
    // Scroll suave al inicio de la sección
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openModal = (offer: any) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOffer(null);
  };

  return (
    <main className="mt-[5%] space-y-4 p-1 sm:space-y-6 lg:mt-[10%] lg:space-y-8 lg:p-0">
      <section>
        <div className="bg-panelLight flex w-full flex-col items-center justify-center gap-3 rounded-xl p-3 shadow-[0_3px_6px_rgba(0,0,0,0.5)] lg:mt-0">
          {/* SearchBar */}
          <div className="w-full">
            <SearchBar
              onSearch={doSearch}
              placeholder="Buscar cartas..."
              loading={loading}
            />
          </div>
        </div>
        {/* Botón Filtrar - solo mobile */}
        {onOpenFilters && (
          <Button
            onClick={onOpenFilters}
            className="bg-primary text-textLight mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-bold uppercase shadow-md transition-all hover:brightness-110 active:scale-95 lg:hidden"
          >
            Filtrar
          </Button>
        )}
      </section>
      <section>
        {displayed.length === 0 ? (
          <p className="text-white">No hay cartas disponibles.</p>
        ) : (
          <>
            <div className="mt-[30%] grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:mt-0 lg:grid-cols-5 lg:gap-6">
              {currentItems.map((o) => {
                const card = o.cards ?? o.card ?? null;

                // Precio en USD desde la oferta (fallback a 0 si no existe)
                const priceUsd = Number(o.price_usd ?? 0);
                // Si fxRate está presente, convertir; si no, mostrar USD sin conversión
                const converted = fxRate
                  ? Math.round(priceUsd * fxRate)
                  : priceUsd;

                // Formatear: si hay fxRate asumimos CLP, si no mostramos USD
                const formattedPrice = fxRate
                  ? new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      maximumFractionDigits: 0,
                    }).format(converted)
                  : new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(converted);

                return (
                  <article
                    key={o.id}
                    onClick={() => openModal(o)}
                    className="relative cursor-pointer rounded-xl bg-transparent px-2 py-3 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.4),0_2px_2px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-[1.02]"
                  >
                    {/* Badge de precio en la esquina superior derecha */}
                    <div className="bg-secondary absolute top-2 right-2 z-10 rounded-md px-2 py-0.5 text-xs font-semibold text-white shadow-sm lg:top-3 lg:right-3 lg:px-3 lg:py-1 lg:text-sm">
                      {formattedPrice}
                    </div>

                    {card?.image_url ? (
                      <Image
                        src={card.image_url}
                        alt={card.name}
                        width={180}
                        height={251}
                        className="mx-auto aspect-5/7 w-full rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                      />
                    ) : (
                      <div className="mx-auto aspect-5/7 w-full rounded-lg bg-stone-200" />
                    )}
                  </article>
                );
              })}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center lg:mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                  showIcons
                  previousLabel="Anterior"
                  nextLabel="Siguiente"
                  className="text-xs lg:text-sm"
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal de detalles de la carta */}
      <CardDetailModal
        show={showModal}
        onClose={closeModal}
        offer={selectedOffer}
        fxRate={fxRate}
      />
    </main>
  );
}
