'use client';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
  Pagination,
  Select,
  Card,
} from 'flowbite-react';
import Image from 'next/image';
import ToastNotification from '@/components/ToastNotification';
import { mapConditionToSpanish, mapFoilToSpanish } from '@/utils/cardHelpers';

type CardOffer = {
  id: string;
  card_id: string;
  foil: string;
  language: string;
  condition: string;
  quantity: number;
  price_usd: number;
  markup_percent: number; // Siempre debe tener un valor (default 0)
  active: boolean;
  cards: {
    id: string;
    name: string;
    set_code: string;
    set_name: string;
    collector_number: string;
    image_url: string | null;
  };
};

export default function CardInventory() {
  const [offers, setOffers] = useState<CardOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fxRate, setFxRate] = useState<number>(1000);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [selectedOfferIds, setSelectedOfferIds] = useState<Set<string>>(
    new Set()
  );
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [editingMarkupId, setEditingMarkupId] = useState<string | null>(null);
  const [tempMarkupValue, setTempMarkupValue] = useState<number>(0);
  const [showBulkMarkupModal, setShowBulkMarkupModal] = useState(false);
  const [bulkMarkupValue, setBulkMarkupValue] = useState<number>(0);

  // Estados para filtros y ordenamiento
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterSetCode, setFilterSetCode] = useState<string>('');
  const [filterMinPrice, setFilterMinPrice] = useState<string>('');
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>('');

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cards?admin=true');
      if (!res.ok) throw new Error('Error al cargar inventario');
      const data = await res.json();
      // Asegurar que markup_percent siempre tenga un valor
      const offers = (data.data || []).map((offer: any) => ({
        ...offer,
        markup_percent: offer.markup_percent ?? 0,
      }));
      setOffers(offers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();

    // Cargar fx rate
    (async () => {
      try {
        const res = await fetch(`/api/settings?game=mtg`);
        const body = await res.json().catch(() => ({}));
        if (body?.fx_usdclp?.rate) {
          setFxRate(Number(body.fx_usdclp.rate));
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleUpdateStock = async (offerId: string, newQuantity: number) => {
    try {
      const res = await fetch(`/api/cards/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!res.ok) throw new Error('Error al actualizar stock');

      // Actualizar localmente (incluyendo active=false si quantity=0)
      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === offerId
            ? {
                ...offer,
                quantity: newQuantity,
                active: newQuantity > 0 ? offer.active : false,
              }
            : offer
        )
      );

      setToast({ message: 'Stock actualizado', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error al actualizar stock', type: 'error' });
    }
  };

  const handleUpdateMarkup = async (offerId: string, newMarkup: number) => {
    try {
      // Validar que el valor sea válido
      if (isNaN(newMarkup) || newMarkup < 0 || newMarkup > 100) {
        setToast({
          message: 'El aumento debe ser un número entre 0 y 100',
          type: 'error',
        });
        return;
      }

      // Redondear a 2 decimales para evitar overflow
      const roundedMarkup = Math.round(newMarkup * 100) / 100;

      const res = await fetch(`/api/cards/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markup_percent: roundedMarkup }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al actualizar el aumento');
      }

      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === offerId
            ? { ...offer, markup_percent: roundedMarkup }
            : offer
        )
      );

      setToast({
        message: 'Aumento actualizado correctamente',
        type: 'success',
      });
      setEditingMarkupId(null);
    } catch (err) {
      console.error(err);
      setToast({
        message:
          err instanceof Error ? err.message : 'Error al actualizar el aumento',
        type: 'error',
      });
    }
  };

  const handleStartEditMarkup = (offerId: string, currentMarkup: number) => {
    setEditingMarkupId(offerId);
    setTempMarkupValue(currentMarkup);
  };

  const handleCancelEditMarkup = () => {
    setEditingMarkupId(null);
    setTempMarkupValue(0);
  };

  const handleSaveMarkup = (offerId: string) => {
    handleUpdateMarkup(offerId, tempMarkupValue);
  };

  const handleOpenBulkMarkupModal = () => {
    if (selectedOfferIds.size === 0) {
      setToast({
        message: 'Selecciona al menos una carta',
        type: 'error',
      });
      return;
    }
    setBulkMarkupValue(0);
    setShowBulkMarkupModal(true);
  };

  const handleBulkUpdateMarkup = async () => {
    const markup = bulkMarkupValue;

    if (isNaN(markup) || markup < 0 || markup > 100) {
      setToast({
        message: 'El aumento debe ser un número entre 0 y 100',
        type: 'error',
      });
      return;
    }

    const roundedMarkup = Math.round(markup * 100) / 100;

    setIsBulkActionLoading(true);

    try {
      const updatePromises = Array.from(selectedOfferIds).map((offerId) =>
        fetch(`/api/cards/${offerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markup_percent: roundedMarkup }),
        })
      );

      const results = await Promise.all(updatePromises);
      const failedCount = results.filter((res) => !res.ok).length;

      if (failedCount > 0) {
        throw new Error(
          `${failedCount} carta${failedCount > 1 ? 's' : ''} no se pudieron actualizar`
        );
      }

      // Actualizar estado local
      setOffers((prev) =>
        prev.map((offer) =>
          selectedOfferIds.has(offer.id)
            ? { ...offer, markup_percent: roundedMarkup }
            : offer
        )
      );

      setToast({
        message: `Aumento de ${roundedMarkup}% aplicado a ${selectedOfferIds.size} carta${
          selectedOfferIds.size > 1 ? 's' : ''
        }`,
        type: 'success',
      });

      // Limpiar selección y cerrar modal
      setSelectedOfferIds(new Set());
      setShowBulkMarkupModal(false);
    } catch (err) {
      console.error(err);
      setToast({
        message:
          err instanceof Error ? err.message : 'Error al actualizar aumentos',
        type: 'error',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleToggleActive = async (
    offerId: string,
    currentActive: boolean
  ) => {
    try {
      const res = await fetch(`/api/cards/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!res.ok) throw new Error('Error al cambiar estado');

      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === offerId ? { ...offer, active: !currentActive } : offer
        )
      );
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error al cambiar estado', type: 'error' });
    }
  };

  const handleBulkToggleActive = async (newActiveState: boolean) => {
    if (selectedOfferIds.size === 0) {
      setToast({
        message: 'Selecciona al menos una carta',
        type: 'error',
      });
      return;
    }

    const action = newActiveState ? 'activar' : 'desactivar';
    const actionPast = newActiveState ? 'activadas' : 'desactivadas';
    const actionPastSingular = newActiveState ? 'activada' : 'desactivada';

    if (
      !confirm(
        `¿Estás seguro de ${action} ${selectedOfferIds.size} carta${
          selectedOfferIds.size > 1 ? 's' : ''
        }?`
      )
    ) {
      return;
    }

    setIsBulkActionLoading(true);

    try {
      const updatePromises = Array.from(selectedOfferIds).map((offerId) =>
        fetch(`/api/cards/${offerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: newActiveState }),
        })
      );

      const results = await Promise.all(updatePromises);
      const failedCount = results.filter((res) => !res.ok).length;

      if (failedCount > 0) {
        throw new Error(
          `${failedCount} carta${failedCount > 1 ? 's' : ''} no se pudieron ${action}`
        );
      }

      // Actualizar estado local
      setOffers((prev) =>
        prev.map((offer) =>
          selectedOfferIds.has(offer.id)
            ? { ...offer, active: newActiveState }
            : offer
        )
      );

      setToast({
        message: `${selectedOfferIds.size} carta${
          selectedOfferIds.size > 1
            ? `s ${actionPast}`
            : ` ${actionPastSingular}`
        } correctamente`,
        type: 'success',
      });

      // Limpiar selección
      setSelectedOfferIds(new Set());
    } catch (err) {
      console.error(err);
      setToast({
        message:
          err instanceof Error ? err.message : `Error al ${action} cartas`,
        type: 'error',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleSelectOffer = (offerId: string, checked: boolean) => {
    setSelectedOfferIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(offerId);
      } else {
        newSet.delete(offerId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean, items: CardOffer[]) => {
    if (checked) {
      setSelectedOfferIds(new Set(items.map((offer) => offer.id)));
    } else {
      setSelectedOfferIds(new Set());
    }
  };

  const filteredOffers = offers.filter(
    (offer) =>
      offer.cards.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterSetCode === '' ||
        offer.cards.set_code
          .toLowerCase()
          .includes(filterSetCode.toLowerCase()) ||
        offer.cards.set_name
          .toLowerCase()
          .includes(filterSetCode.toLowerCase())) &&
      (filterMinPrice === '' ||
        offer.price_usd >= parseFloat(filterMinPrice)) &&
      (filterMaxPrice === '' || offer.price_usd <= parseFloat(filterMaxPrice))
  );

  // Aplicar ordenamiento
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'name':
        aValue = a.cards.name.toLowerCase();
        bValue = b.cards.name.toLowerCase();
        break;
      case 'set':
        aValue = a.cards.set_code.toLowerCase();
        bValue = b.cards.set_code.toLowerCase();
        break;
      case 'price':
        aValue = a.price_usd * (1 + (a.markup_percent || 0) / 100);
        bValue = b.price_usd * (1 + (b.markup_percent || 0) / 100);
        break;
      case 'stock':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      case 'condition':
        aValue = a.condition;
        bValue = b.condition;
        break;
      case 'foil':
        aValue = a.foil;
        bValue = b.foil;
        break;
      case 'active':
        aValue = a.active ? 1 : 0;
        bValue = b.active ? 1 : 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Calcular paginación
  const totalPages = Math.ceil(sortedOffers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedOffers.slice(startIndex, endIndex);

  const isAllSelected =
    currentItems.length > 0 &&
    currentItems.every((offer) => selectedOfferIds.has(offer.id));
  const isSomeSelected =
    selectedOfferIds.size > 0 &&
    currentItems.some((offer) => selectedOfferIds.has(offer.id)) &&
    !isAllSelected;

  // Obtener cartas seleccionadas
  const selectedOffers = offers.filter((offer) =>
    selectedOfferIds.has(offer.id)
  );
  const hasActiveSelected = selectedOffers.some((offer) => offer.active);
  const hasInactiveSelected = selectedOffers.some((offer) => !offer.active);

  // Reset página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSetCode, filterMinPrice, filterMaxPrice]);

  // Reset página al cambiar items por página
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Si ya está ordenado por este campo, invertir dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nuevo campo, ordenar ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return (
        <svg
          className="ml-1 inline h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg
        className="ml-1 inline h-4 w-4 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="ml-1 inline h-4 w-4 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-slate-700">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <Card>
      <div className="mb-6 flex flex-col items-start justify-center">
        <h1>Inventario de Cartas</h1>
        <p className="backoffice-section-description mb-4">
          Listado completo de todas las cartas en stock ({sortedOffers.length}{' '}
          {sortedOffers.length === 1 ? 'carta' : 'cartas'})
        </p>
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-64">
              <TextInput
                placeholder="Buscar por nombre de carta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="itemsPerPage" className="text-sm text-slate-700">
                Mostrar:
              </label>
              <Select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-24"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </div>
          </div>

          {/* Filtros adicionales */}
          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label
                htmlFor="filterSet"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Filtrar por Set (nombre o código)
              </label>
              <TextInput
                id="filterSet"
                placeholder="Ej: MH3, Modern Horizons..."
                value={filterSetCode}
                onChange={(e) => setFilterSetCode(e.target.value)}
                sizing="sm"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="filterMinPrice"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Precio mínimo (USD)
              </label>
              <TextInput
                id="filterMinPrice"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={filterMinPrice}
                onChange={(e) => setFilterMinPrice(e.target.value)}
                sizing="sm"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="filterMaxPrice"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Precio máximo (USD)
              </label>
              <TextInput
                id="filterMaxPrice"
                type="number"
                min={0}
                step={0.01}
                placeholder="999.99"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
                sizing="sm"
              />
            </div>
            {(filterSetCode || filterMinPrice || filterMaxPrice) && (
              <Button
                size="sm"
                color="gray"
                onClick={() => {
                  setFilterSetCode('');
                  setFilterMinPrice('');
                  setFilterMaxPrice('');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Barra de acciones masivas */}
        {selectedOfferIds.size > 0 && (
          <div className="mt-4 flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedOfferIds.size} carta
              {selectedOfferIds.size > 1 ? 's seleccionadas' : ' seleccionada'}
            </span>
            <div className="flex gap-2">
              {hasInactiveSelected && (
                <Button
                  size="sm"
                  color="success"
                  onClick={() => handleBulkToggleActive(true)}
                  disabled={isBulkActionLoading}
                >
                  {isBulkActionLoading
                    ? 'Activando...'
                    : 'Activar seleccionadas'}
                </Button>
              )}
              {hasActiveSelected && (
                <Button
                  size="sm"
                  color="failure"
                  onClick={() => handleBulkToggleActive(false)}
                  disabled={isBulkActionLoading}
                >
                  {isBulkActionLoading
                    ? 'Desactivando...'
                    : 'Desactivar seleccionadas'}
                </Button>
              )}
              <Button
                size="sm"
                color="warning"
                onClick={handleOpenBulkMarkupModal}
                disabled={isBulkActionLoading}
              >
                Ajustar aumento
              </Button>
              <Button
                size="sm"
                color="gray"
                onClick={() => setSelectedOfferIds(new Set())}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = isSomeSelected;
                    }
                  }}
                  onChange={(e) =>
                    handleSelectAll(e.target.checked, currentItems)
                  }
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
              </TableHeadCell>
              <TableHeadCell className="px-6 py-3">Imagen</TableHeadCell>
              <TableHeadCell
                className="cursor-pointer px-6 py-3 hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Nombre <SortIcon field="name" />
              </TableHeadCell>
              <TableHeadCell
                className="cursor-pointer px-6 py-3 hover:bg-gray-100"
                onClick={() => handleSort('set')}
              >
                Set <SortIcon field="set" />
              </TableHeadCell>
              <TableHeadCell
                className="cursor-pointer px-6 py-3 hover:bg-gray-100"
                onClick={() => handleSort('foil')}
              >
                Foil <SortIcon field="foil" />
              </TableHeadCell>
              <TableHeadCell
                className="cursor-pointer px-6 py-3 hover:bg-gray-100"
                onClick={() => handleSort('condition')}
              >
                Condición <SortIcon field="condition" />
              </TableHeadCell>
              <TableHeadCell
                className="cursor-pointer px-6 py-3 hover:bg-gray-100"
                onClick={() => handleSort('price')}
              >
                Precio <SortIcon field="price" />
              </TableHeadCell>
              <TableHeadCell
                className="cursor-pointer px-6 py-3 hover:bg-gray-100"
                onClick={() => handleSort('stock')}
              >
                Stock <SortIcon field="stock" />
              </TableHeadCell>
              <TableHeadCell
                className="cursor-pointer px-6 py-3 hover:bg-gray-100"
                onClick={() => handleSort('active')}
              >
                Activa <SortIcon field="active" />
              </TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y divide-gray-200">
            {currentItems.map((offer) => {
              const markupPercent = offer.markup_percent || 0;
              const priceWithMarkup =
                offer.price_usd * (1 + markupPercent / 100);
              const finalPriceClp = Math.round(priceWithMarkup * fxRate);

              return (
                <TableRow key={offer.id} className="bg-white hover:bg-gray-50">
                  <TableCell className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOfferIds.has(offer.id)}
                      onChange={(e) =>
                        handleSelectOffer(offer.id, e.target.checked)
                      }
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {offer.cards.image_url ? (
                      <Image
                        src={offer.cards.image_url}
                        alt={offer.cards.name}
                        width={50}
                        height={70}
                        className="rounded"
                      />
                    ) : (
                      <div className="h-[70px] w-[50px] rounded bg-gray-200" />
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-gray-900">
                    {offer.cards.name}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {offer.cards.set_code.toUpperCase()} #
                    {offer.cards.collector_number}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {mapFoilToSpanish(offer.foil)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">
                      {mapConditionToSpanish(offer.condition)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {editingMarkupId === offer.id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Base:</span>
                            <span className="text-sm font-medium">
                              ${offer.price_usd.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              Aumento:
                            </span>
                            <TextInput
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              value={tempMarkupValue}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  setTempMarkupValue(0);
                                  return;
                                }
                                const numValue = parseFloat(value);
                                // Limitar a 2 decimales y rango válido
                                if (!isNaN(numValue)) {
                                  const clamped = Math.max(
                                    0,
                                    Math.min(100, numValue)
                                  );
                                  const rounded =
                                    Math.round(clamped * 100) / 100;
                                  setTempMarkupValue(rounded);
                                }
                              }}
                              onBlur={(e) => {
                                // Asegurar que al salir del campo esté redondeado
                                const rounded =
                                  Math.round(tempMarkupValue * 100) / 100;
                                setTempMarkupValue(rounded);
                              }}
                              className="w-16"
                              sizing="sm"
                            />
                            <span className="text-xs">%</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="xs"
                            color="success"
                            onClick={() => handleSaveMarkup(offer.id)}
                            title="Guardar"
                          >
                            ✓
                          </Button>
                          <Button
                            size="xs"
                            color="gray"
                            onClick={handleCancelEditMarkup}
                            title="Cancelar"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-900">
                              ${priceWithMarkup.toFixed(2)}
                            </span>
                            {markupPercent > 0 && (
                              <span className="text-xs font-medium text-green-600">
                                (+{markupPercent}%)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${finalPriceClp.toLocaleString('es-CL')} CLP
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleStartEditMarkup(offer.id, markupPercent)
                          }
                          className="text-gray-400 transition-colors hover:text-blue-600"
                          title="Editar aumento de precio"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <TextInput
                      type="number"
                      min={0}
                      defaultValue={offer.quantity}
                      onBlur={(e) => {
                        const newQty = Number(e.target.value);
                        if (newQty !== offer.quantity) {
                          handleUpdateStock(offer.id, newQty);
                        }
                      }}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={offer.active}
                        onChange={() =>
                          handleToggleActive(offer.id, offer.active)
                        }
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300 peer-focus:outline-none after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {offer.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </label>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredOffers.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No se encontraron cartas
          </div>
        )}

        {sortedOffers.length === 0 && filteredOffers.length > 0 && (
          <div className="py-8 text-center text-gray-500">
            No se encontraron cartas con los filtros aplicados
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showIcons
              previousLabel="Anterior"
              nextLabel="Siguiente"
            />
          </div>
        )}

        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Modal de ajuste masivo de aumento */}
        {showBulkMarkupModal && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Ajustar aumento de precio
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Aplicar aumento a {selectedOfferIds.size} carta
                {selectedOfferIds.size > 1
                  ? 's seleccionadas'
                  : ' seleccionada'}
              </p>
              <div className="mb-6">
                <label
                  htmlFor="bulkMarkup"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Porcentaje de aumento (0-100%)
                </label>
                <TextInput
                  id="bulkMarkup"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={bulkMarkupValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setBulkMarkupValue(0);
                      return;
                    }
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      const clamped = Math.max(0, Math.min(100, numValue));
                      const rounded = Math.round(clamped * 100) / 100;
                      setBulkMarkupValue(rounded);
                    }
                  }}
                  placeholder="Ejemplo: 15"
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500">
                  El aumento se aplicará sobre el precio base en USD
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  color="gray"
                  onClick={() => setShowBulkMarkupModal(false)}
                  disabled={isBulkActionLoading}
                >
                  Cancelar
                </Button>
                <Button
                  color="warning"
                  onClick={handleBulkUpdateMarkup}
                  disabled={isBulkActionLoading}
                >
                  {isBulkActionLoading ? 'Aplicando...' : 'Aplicar aumento'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
