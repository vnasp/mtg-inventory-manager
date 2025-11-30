'use client';
import React from 'react';
import { TextInput, Select, Button } from 'flowbite-react';

type InventoryFiltersProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterSetCode: string;
  setFilterSetCode: (value: string) => void;
  filterMinPrice: string;
  setFilterMinPrice: (value: string) => void;
  filterMaxPrice: string;
  setFilterMaxPrice: (value: string) => void;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  onClearFilters: () => void;
};

export default function InventoryFilters({
  searchQuery,
  setSearchQuery,
  filterSetCode,
  setFilterSetCode,
  filterMinPrice,
  setFilterMinPrice,
  filterMaxPrice,
  setFilterMaxPrice,
  itemsPerPage,
  setItemsPerPage,
  onClearFilters,
}: InventoryFiltersProps) {
  const hasActiveFilters =
    searchQuery || filterSetCode || filterMinPrice || filterMaxPrice;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex-1">
          <label
            htmlFor="searchQuery"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            Buscar por nombre
          </label>
          <TextInput
            id="searchQuery"
            placeholder="Nombre de carta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sizing="sm"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="filterSet"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            Set (nombre o código)
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
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label
            htmlFor="itemsPerPage"
            className="text-xs font-medium text-gray-700"
          >
            Mostrar:
          </label>
          <Select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="w-20"
            sizing="sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>
        </div>
        {hasActiveFilters && (
          <Button size="sm" color="gray" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
