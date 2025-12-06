'use client';
import React from 'react';
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
} from 'flowbite-react';
import Image from 'next/image';
import { mapConditionToSpanish, mapFoilToSpanish } from '@/utils/cardHelpers';

// Helper para mapear foil a siglas
const mapFoilToAbbrev = (foil: string): string => {
  switch (foil) {
    case 'nonfoil':
      return 'NF';
    case 'foil':
      return 'F';
    case 'etched':
      return 'E';
    default:
      return foil.toUpperCase();
  }
};

// Helper para mapear price_source a siglas
const mapPriceSourceToAbbrev = (source: string): string => {
  switch (source) {
    case 'scryfall':
      return 'SF';
    case 'cardkingdom':
      return 'CK';
    case 'manabox_csv':
      return 'MB';
    case 'manual':
      return 'MAN';
    default:
      return source.substring(0, 3).toUpperCase();
  }
};

// Helper para obtener el nombre completo de la fuente
const getPriceSourceFullName = (source: string): string => {
  switch (source) {
    case 'scryfall':
      return 'Scryfall';
    case 'cardkingdom':
      return 'Card Kingdom';
    case 'manabox_csv':
      return 'Manabox CSV';
    case 'manual':
      return 'Manual';
    default:
      return source;
  }
};

// Helper para mapear condición a siglas
const mapConditionToAbbrev = (condition: string): string => {
  switch (condition) {
    case 'mint':
      return 'M';
    case 'near_mint':
      return 'NM';
    case 'lightly_played':
      return 'LP';
    case 'moderately_played':
      return 'MP';
    case 'heavily_played':
      return 'HP';
    case 'damaged':
      return 'D';
    default:
      return condition.substring(0, 2).toUpperCase();
  }
};

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

type InventoryTableProps = {
  items: CardOffer[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedOfferIds: Set<string>;
  onSelectOffer: (offerId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean, items: CardOffer[]) => void;
  onUpdateStock: (offerId: string, newQuantity: number) => void;
  onToggleActive: (offerId: string, currentActive: boolean) => void;
  onStartEditMarkup: (offerId: string, currentMarkup: number) => void;
  onDeleteCard: (offerId: string) => void;
  editingMarkupId: string | null;
  tempMarkupValue: number;
  setTempMarkupValue: (value: number) => void;
  onSaveMarkup: (offerId: string) => void;
  onCancelEditMarkup: () => void;
  fxRate: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  hasResults: boolean;
  hasFilteredResults: boolean;
};

export default function InventoryTable({
  items,
  currentPage,
  totalPages,
  onPageChange,
  selectedOfferIds,
  onSelectOffer,
  onSelectAll,
  onUpdateStock,
  onToggleActive,
  onStartEditMarkup,
  onDeleteCard,
  editingMarkupId,
  tempMarkupValue,
  setTempMarkupValue,
  onSaveMarkup,
  onCancelEditMarkup,
  fxRate,
  sortField,
  sortDirection,
  onSort,
  hasResults,
  hasFilteredResults,
}: InventoryTableProps) {
  const isAllSelected =
    items.length > 0 && items.every((offer) => selectedOfferIds.has(offer.id));
  const isSomeSelected =
    selectedOfferIds.size > 0 &&
    items.some((offer) => selectedOfferIds.has(offer.id)) &&
    !isAllSelected;

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
        className="ml-1 inline h-4 w-4 text-zinc-900"
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
        className="ml-1 inline h-4 w-4 text-zinc-900"
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

  return (
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
                onChange={(e) => onSelectAll(e.target.checked, items)}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-zinc-900 focus:ring-2 focus:ring-zinc-500"
              />
            </TableHeadCell>
            <TableHeadCell className="px-6 py-3">Imagen</TableHeadCell>
            <TableHeadCell
              className="cursor-pointer px-6 py-3 hover:bg-gray-100"
              onClick={() => onSort('name')}
            >
              Nombre <SortIcon field="name" />
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer px-6 py-3 hover:bg-gray-100"
              onClick={() => onSort('set')}
            >
              Set <SortIcon field="set" />
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer px-6 py-3 hover:bg-gray-100"
              onClick={() => onSort('foil')}
            >
              Foil <SortIcon field="foil" />
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer px-6 py-3 hover:bg-gray-100"
              onClick={() => onSort('condition')}
            >
              Condición <SortIcon field="condition" />
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer px-6 py-3 hover:bg-gray-100"
              onClick={() => onSort('price')}
            >
              Precio <SortIcon field="price" />
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer px-6 py-3 hover:bg-gray-100"
              onClick={() => onSort('price_source')}
            >
              Fuente <SortIcon field="price_source" />
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer px-6 py-3 hover:bg-gray-100"
              onClick={() => onSort('stock')}
            >
              Stock <SortIcon field="stock" />
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer px-6 py-3 hover:bg-gray-100"
              onClick={() => onSort('active')}
            >
              Activa <SortIcon field="active" />
            </TableHeadCell>
            <TableHeadCell className="px-6 py-3">Acciones</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y divide-gray-200">
          {items.map((offer) => {
            const markupPercent = offer.markup_percent || 0;
            const priceWithMarkup = offer.price_usd * (1 + markupPercent / 100);
            const finalPriceClp = Math.round(priceWithMarkup * fxRate);

            return (
              <TableRow key={offer.id} className="bg-white hover:bg-gray-50">
                <TableCell className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedOfferIds.has(offer.id)}
                    onChange={(e) => onSelectOffer(offer.id, e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-zinc-900 focus:ring-2 focus:ring-zinc-500"
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
                  <span
                    className="cursor-help rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-800"
                    title={mapFoilToSpanish(offer.foil)}
                  >
                    {mapFoilToAbbrev(offer.foil)}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className="cursor-help rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800"
                    title={mapConditionToSpanish(offer.condition)}
                  >
                    {mapConditionToAbbrev(offer.condition)}
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
                              if (!isNaN(numValue)) {
                                const clamped = Math.max(
                                  0,
                                  Math.min(100, numValue)
                                );
                                const rounded = Math.round(clamped * 100) / 100;
                                setTempMarkupValue(rounded);
                              }
                            }}
                            onBlur={() => {
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
                          color="secondary"
                          onClick={() => onSaveMarkup(offer.id)}
                          title="Guardar"
                        >
                          ✓
                        </Button>
                        <Button
                          size="xs"
                          color="secondary"
                          onClick={onCancelEditMarkup}
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
                          onStartEditMarkup(offer.id, markupPercent)
                        }
                        className="text-gray-400 transition-colors hover:text-zinc-900"
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
                  <span
                    className="cursor-help rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                    title={getPriceSourceFullName(offer.price_source)}
                  >
                    {mapPriceSourceToAbbrev(offer.price_source)}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <TextInput
                    type="number"
                    min={0}
                    defaultValue={offer.quantity}
                    onBlur={(e) => {
                      const newQty = Number(e.target.value);
                      if (newQty !== offer.quantity) {
                        onUpdateStock(offer.id, newQty);
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
                      onChange={() => onToggleActive(offer.id, offer.active)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-indigo-900 peer-focus:ring-4 peer-focus:ring-indigo-300 peer-focus:outline-none after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {offer.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </label>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Button
                    size="xs"
                    color="default"
                    outline
                    onClick={() => onDeleteCard(offer.id)}
                    title="Eliminar carta"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {!hasResults && (
        <div className="py-8 text-center text-gray-500">
          No se encontraron cartas
        </div>
      )}

      {hasResults && !hasFilteredResults && (
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
    </div>
  );
}
