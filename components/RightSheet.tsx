'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import { Button, Pagination } from 'flowbite-react';
import CardDetailModal from './CardDetailModal';
import type { Filters } from './CatalogClient';
import { mapConditionToSpanish, mapFoilToSpanish } from '@/utils/cardHelpers';

type Props = {
  offers: any[];
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
        setItemsPerPage(10);
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
    <div className="space-y-6">
      {/* Barra de búsqueda y acciones */}
      <div className="rounded-xl bg-white p-4 shadow-md lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* SearchBar */}
          <div className="flex-1">
            <SearchBar
              onSearch={doSearch}
              placeholder="Buscar cartas..."
              loading={loading}
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
            <span className="font-semibold">{displayed.length}</span>{' '}
            {displayed.length === 1 ? 'carta' : 'cartas'}
          </div>
        </div>

        {/* Resultados count - Mobile */}
        <div className="mt-3 text-center text-sm text-gray-600 lg:hidden">
          <span className="font-semibold text-purple-600">
            {displayed.length}
          </span>{' '}
          {displayed.length === 1 ? 'carta encontrada' : 'cartas encontradas'}
        </div>
      </div>

      {/* Grid de cartas */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12 text-center shadow-md">
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {currentItems.map((o) => {
              const card = o.cards ?? o.card ?? null;

              // Precio en USD desde la oferta (fallback a 0 si no existe)
              const priceUsd = Number(o.price_usd ?? 0);
              // Si fxRate está presente, convertir; si no, mostrar USD sin conversión
              const priceClp = fxRate
                ? Math.round(priceUsd * fxRate)
                : priceUsd;
              // Aplicar precio mínimo si hay fxRate
              const minCardPrice = minCardPriceClp ?? 100;
              const converted = fxRate
                ? Math.max(priceClp, minCardPrice)
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
                  className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  {/* Imagen de la carta */}
                  <div className="relative aspect-5/7 overflow-hidden bg-linear-to-br from-purple-100 to-pink-100">
                    {card?.image_url ? (
                      <Image
                        src={card.image_url}
                        alt={card.name}
                        width={300}
                        height={420}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <svg
                          className="h-16 w-16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Overlay con efecto hover */}
                    <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10" />
                  </div>

                  {/* Info de la carta */}
                  <div className="p-3">
                    {/* Nombre de la carta */}
                    <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 lg:text-base">
                      {card?.name || 'Sin nombre'}
                    </h3>

                    {/* Set */}
                    {card?.set_name && (
                      <p className="mb-2 line-clamp-1 text-xs text-gray-500">
                        {card.set_name}
                      </p>
                    )}

                    {/* Precio */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-600 lg:text-xl">
                        {formattedPrice}
                      </span>

                      {/* Badge de stock */}
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Stock: {o.quantity}
                      </span>
                    </div>

                    {/* Badge de condición y foil */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {o.condition && (
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {mapConditionToSpanish(o.condition)}
                        </span>
                      )}
                      {o.foil && o.foil !== 'nonfoil' && (
                        <span className="rounded-md bg-linear-to-r from-yellow-400 to-pink-400 px-2 py-0.5 text-xs font-medium text-white">
                          ✨ {mapFoilToSpanish(o.foil)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botón de acción rápida (aparece al hover) */}
                  <div className="absolute right-3 bottom-3 left-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <Button
                      onClick={() => openModal(o)}
                      className="w-full"
                      size="sm"
                    >
                      Ver detalles
                    </Button>
                  </div>
                </article>
              );
            })}
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
                className="rounded-lg bg-white px-4 py-2 shadow-md"
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
