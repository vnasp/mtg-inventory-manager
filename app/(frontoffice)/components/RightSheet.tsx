'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import SearchBar from './SearchBar';
import { Button, Card, Pagination, Select, Toast } from 'flowbite-react';
import { HiCheck } from 'react-icons/hi';
import { MdFilterList, MdDescription } from 'react-icons/md';
import CardDetailModal from './product/CardDetailModal';
import CardItem from './product/CardItem';
import type { Filters } from './CatalogClient';
import { mapConditionToSpanish, mapFoilToSpanish } from '@/utils/cardHelpers';

type Props = {
  offers: any[];
  fxRate?: number;
  minCardPriceClp?: number;
  filters: Filters;
  onOpenFilters?: () => void;
  onCartUpdate?: () => void;
};

export default function RightSheet({
  offers,
  fxRate,
  minCardPriceClp,
  filters,
  onOpenFilters,
  onCartUpdate,
}: Props) {
  const [displayed, setDisplayed] = useState<any[]>(offers ?? []);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showToast, setShowToast] = useState(false);

  // Calcular items por página según el tamaño de pantalla
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        // Mobile: 1 columna × 6 filas = 6 items
        setItemsPerPage(6);
      } else if (window.innerWidth < 768) {
        // SM: 2 columnas × 3 filas = 6 items
        setItemsPerPage(6);
      } else if (window.innerWidth < 1024) {
        // MD: 3 columnas × 3 filas = 9 items
        setItemsPerPage(9);
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

      // Filtro de expansión/set
      if (filters.set_name && filters.set_name !== 'all') {
        filtered = filtered.filter((offer) => {
          const card = offer.cards ?? offer.card ?? null;
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
          const card = offer.cards ?? offer.card ?? null;
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
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
              );
            case 'oldest':
              return (
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
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

  const handleAddToCart = async (offer: any) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_offer_id: offer.id,
          quantity: 1,
        }),
      });

      if (response.status === 401) {
        // Usuario no autenticado, usar localStorage con información completa
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingIndex = guestCart.findIndex(
          (item: any) => item.id === offer.id
        );

        if (existingIndex >= 0) {
          guestCart[existingIndex].quantity += 1;
        } else {
          // Guardar toda la información necesaria
          // El objeto offer ya tiene la estructura correcta de card_offers
          guestCart.push({
            id: offer.id,
            card_offer_id: offer.id,
            quantity: 1,
            user_id: 'guest',
            card_offers: offer, // El offer completo ya contiene price_usd, markup_percent, cards, etc.
            created_at: new Date().toISOString(),
          });
        }

        localStorage.setItem('guestCart', JSON.stringify(guestCart));

        // Disparar evento para actualizar el contador del carrito
        window.dispatchEvent(new Event('cartUpdated'));

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        // Notificar al padre que el carrito se actualizó
        if (onCartUpdate) {
          onCartUpdate();
        }
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al agregar al carrito');
      }

      // Disparar evento para actualizar el contador del carrito
      window.dispatchEvent(new Event('cartUpdated'));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Notificar al padre que el carrito se actualizó
      if (onCartUpdate) {
        onCartUpdate();
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      alert(
        error.message ||
          'Error al agregar al carrito. Por favor intenta nuevamente.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
            <Select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
              }}
              className="w-48"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="price_asc">Precio: ↑</option>
              <option value="price_desc">Precio: ↓</option>
              <option value="name_asc">Nombre: A-Z</option>
              <option value="name_desc">Nombre: Z-A</option>
              <option value="rarity_asc">Rareza: ↑</option>
              <option value="rarity_desc">Rareza: ↓</option>
            </Select>
          </div>

          {/* Botón Filtrar - solo mobile */}
          {onOpenFilters && (
            <Button
              onClick={onOpenFilters}
              className="flex items-center justify-center gap-2 bg-linear-to-r from-purple-600 to-pink-600 font-semibold text-white shadow-lg transition-all hover:scale-105 lg:hidden"
            >
              <MdFilterList className="h-5 w-5" />
              Filtros
            </Button>
          )}

          {/* Resultados count - Desktop */}
          <div className="hidden text-sm text-gray-600 lg:block">
            <span className="font-semiboldel">{displayed.length}</span>{' '}
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
      </Card>

      {/* Grid de cartas */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12 text-center shadow-md">
          <MdDescription className="mb-4 h-16 w-16 text-gray-300" />
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
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            }}
          >
            {currentItems.map((o) => (
              <CardItem
                key={o.id}
                offer={o}
                fxRate={fxRate}
                minCardPriceClp={minCardPriceClp}
                onClick={() => openModal(o)}
                onAddToCart={() => handleAddToCart(o)}
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

      {/* Toast de confirmación */}
      {showToast && (
        <div className="fixed right-4 bottom-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">
              Carta agregada al carrito
            </div>
          </Toast>
        </div>
      )}
    </div>
  );
}
