'use client';
import React, { useState, useEffect } from 'react';
import { Button, Card, Select } from 'flowbite-react';
import ToastNotification from '@/components/ToastNotification';
import InventoryFilters from './InventoryFilters';
import InventoryTable from './InventoryTable';
import DeleteCardModal from './DeleteCardModal';
import BulkMarkupModal from './BulkMarkupModal';

type CardOffer = {
  id: string;
  card_id: string;
  foil: string;
  language: string;
  condition: string;
  quantity: number;
  price_usd: number;
  markup_percent: number;
  price_source: string;
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
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  // Estados para filtros y ordenamiento
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterSetCode, setFilterSetCode] = useState<string>('');
  const [filterMinPrice, setFilterMinPrice] = useState<string>('');
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>('');

  const fetchOffers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        admin: 'true',
        page: String(page),
        pageSize: String(itemsPerPage),
      });

      // Agregar parámetros de ordenamiento si existen
      if (sortField) {
        params.append('sortField', sortField);
        params.append('sortDirection', sortDirection);
      }

      const res = await fetch(`/api/cards?${params.toString()}`);
      if (!res.ok) throw new Error('Error al cargar inventario');
      const data = await res.json();
      // Asegurar que markup_percent siempre tenga un valor
      const offers = (data.data || []).map((offer: any) => ({
        ...offer,
        markup_percent: offer.markup_percent ?? 0,
      }));
      setOffers(offers);
      setTotalItems(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 0);
      setCurrentPage(data.pagination?.page ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar ofertas y fx rate al montar (una sola vez)
    fetchOffers(currentPage);

    (async () => {
      try {
        const res = await fetch(`/api/settings?game=mtg`);
        const body = await res.json().catch(() => ({}));
        if (body?.fx_usdclp?.rate) setFxRate(Number(body.fx_usdclp.rate));
      } catch (e) {
        // ignore
      }
    })();
  }, [currentPage, itemsPerPage, sortField, sortDirection]);

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

  const handleDeleteCard = async (offerId: string) => {
    try {
      const res = await fetch(`/api/cards/${offerId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error al eliminar la carta');

      setToast({
        message: 'Carta eliminada correctamente',
        type: 'success',
      });

      setShowDeleteModal(false);
      setCardToDelete(null);

      // Recargar datos y ajustar página si es necesario
      const newTotal = totalItems - 1;
      const maxPage = Math.ceil(newTotal / itemsPerPage);
      const pageToLoad =
        currentPage > maxPage ? Math.max(1, maxPage) : currentPage;

      if (pageToLoad !== currentPage) {
        setCurrentPage(pageToLoad);
      } else {
        await fetchOffers(currentPage);
      }
    } catch (err) {
      console.error(err);
      setToast({
        message:
          err instanceof Error ? err.message : 'Error al eliminar la carta',
        type: 'error',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOfferIds.size === 0) {
      setToast({
        message: 'Selecciona al menos una carta',
        type: 'error',
      });
      return;
    }

    setIsBulkActionLoading(true);

    try {
      const deletePromises = Array.from(selectedOfferIds).map((offerId) =>
        fetch(`/api/cards/${offerId}`, {
          method: 'DELETE',
        })
      );

      const results = await Promise.all(deletePromises);
      const failedCount = results.filter((res) => !res.ok).length;

      if (failedCount > 0) {
        throw new Error(
          `${failedCount} carta${failedCount > 1 ? 's' : ''} no se pudieron eliminar`
        );
      }

      const deletedCount = selectedOfferIds.size;

      setToast({
        message: `${deletedCount} carta${
          deletedCount > 1 ? 's eliminadas' : ' eliminada'
        } correctamente`,
        type: 'success',
      });

      // Limpiar selección y cerrar modal
      setSelectedOfferIds(new Set());
      setShowBulkDeleteModal(false);

      // Recargar datos y ajustar página si es necesario
      const newTotal = totalItems - deletedCount;
      const maxPage = Math.ceil(newTotal / itemsPerPage);
      const pageToLoad =
        currentPage > maxPage ? Math.max(1, maxPage) : currentPage;

      if (pageToLoad !== currentPage) {
        setCurrentPage(pageToLoad);
      } else {
        await fetchOffers(currentPage);
      }
    } catch (err) {
      console.error(err);
      setToast({
        message:
          err instanceof Error ? err.message : 'Error al eliminar cartas',
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

  // Ya no necesitamos ordenar del lado del cliente porque el API lo hace
  const sortedOffers = filteredOffers;

  // Para paginación del lado del cliente solo en filtros locales
  const clientTotalPages = Math.ceil(sortedOffers.length / itemsPerPage);
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
    // Resetear a la primera página al cambiar el orden
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterSetCode('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Card>
      <div className="mb-6 flex flex-col items-start justify-center">
        <h1>Inventario de Cartas</h1>
        <p className="backoffice-section-description mb-4">
          Listado completo de todas las cartas en stock ({sortedOffers.length}{' '}
          {sortedOffers.length === 1 ? 'carta' : 'cartas'})
        </p>
        <div className="flex w-full flex-col gap-3">
          {/* Fila 1: Filtros */}
          <InventoryFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterSetCode={filterSetCode}
            setFilterSetCode={setFilterSetCode}
            filterMinPrice={filterMinPrice}
            setFilterMinPrice={setFilterMinPrice}
            filterMaxPrice={filterMaxPrice}
            setFilterMaxPrice={setFilterMaxPrice}
          />

          {/* Fila 2: Controles de paginación y acciones */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label
                htmlFor="itemsPerPage"
                className="text-sm font-medium text-gray-700"
              >
                Mostrar:
              </label>
              <Select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-24"
                sizing="sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {(searchQuery ||
                filterSetCode ||
                filterMinPrice ||
                filterMaxPrice) && (
                <Button
                  size="sm"
                  color="secondary"
                  onClick={handleClearFilters}
                >
                  Limpiar filtros
                </Button>
              )}
              <Button
                size="sm"
                color="secondary"
                onClick={() => fetchOffers(currentPage)}
                disabled={loading}
                aria-label="Refrescar inventario"
              >
                {loading ? 'Refrescando...' : 'Refrescar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Barra de acciones masivas */}
        {selectedOfferIds.size > 0 && (
          <div className="mt-4 flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <span className="text-sm font-medium text-zinc-900">
              {selectedOfferIds.size} carta
              {selectedOfferIds.size > 1 ? 's seleccionadas' : ' seleccionada'}
            </span>
            <div className="flex gap-2">
              {hasInactiveSelected && (
                <Button
                  size="sm"
                  color="default"
                  outline
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
                  color="default"
                  outline
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
                color="default"
                outline
                onClick={handleOpenBulkMarkupModal}
                disabled={isBulkActionLoading}
              >
                Ajustar aumento
              </Button>
              <Button
                size="sm"
                color="default"
                outline
                onClick={() => setShowBulkDeleteModal(true)}
                disabled={isBulkActionLoading}
              >
                Eliminar seleccionadas
              </Button>
              <Button
                size="sm"
                color="secondary"
                onClick={() => setSelectedOfferIds(new Set())}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      <InventoryTable
        items={currentItems}
        currentPage={currentPage}
        totalPages={
          searchQuery || filterSetCode || filterMinPrice || filterMaxPrice
            ? clientTotalPages
            : totalPages
        }
        onPageChange={onPageChange}
        selectedOfferIds={selectedOfferIds}
        onSelectOffer={handleSelectOffer}
        onSelectAll={handleSelectAll}
        onUpdateStock={handleUpdateStock}
        onToggleActive={handleToggleActive}
        onStartEditMarkup={handleStartEditMarkup}
        onDeleteCard={(offerId) => {
          setCardToDelete(offerId);
          setShowDeleteModal(true);
        }}
        editingMarkupId={editingMarkupId}
        tempMarkupValue={tempMarkupValue}
        setTempMarkupValue={setTempMarkupValue}
        onSaveMarkup={handleSaveMarkup}
        onCancelEditMarkup={handleCancelEditMarkup}
        fxRate={fxRate}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        hasResults={filteredOffers.length > 0}
        hasFilteredResults={sortedOffers.length > 0}
        loading={loading}
      />

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <BulkMarkupModal
        show={showBulkMarkupModal}
        onClose={() => setShowBulkMarkupModal(false)}
        onConfirm={handleBulkUpdateMarkup}
        count={selectedOfferIds.size}
        value={bulkMarkupValue}
        onChange={setBulkMarkupValue}
        isLoading={isBulkActionLoading}
        popup={true}
      />

      <DeleteCardModal
        show={showDeleteModal && cardToDelete !== null}
        onClose={() => {
          setShowDeleteModal(false);
          setCardToDelete(null);
        }}
        onConfirm={() => cardToDelete && handleDeleteCard(cardToDelete)}
        popup={true}
      />

      <DeleteCardModal
        show={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        count={selectedOfferIds.size}
        isLoading={isBulkActionLoading}
        popup={true}
      />
    </Card>
  );
}
