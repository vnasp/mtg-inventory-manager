'use client';
import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';

type BulkMarkupModalProps = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  value: number;
  onChange: (value: number) => void;
  isLoading?: boolean;
  popup?: boolean;
};

export default function BulkMarkupModal({
  show,
  onClose,
  onConfirm,
  count,
  value,
  onChange,
  isLoading = false,
  popup = true,
}: BulkMarkupModalProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(0);
      return;
    }
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      const clamped = Math.max(0, Math.min(100, numValue));
      const rounded = Math.round(clamped * 100) / 100;
      onChange(rounded);
    }
  };

  return (
    <Modal show={show} size="md" onClose={onClose} popup={popup}>
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Ajustar aumento de precio
        </h3>
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Aplicar aumento a {count} carta
            {count > 1 ? 's seleccionadas' : ' seleccionada'}
          </p>
          <div>
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
              value={value}
              onChange={handleChange}
              placeholder="Ejemplo: 15"
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500">
              El aumento se aplicará sobre el precio base en USD
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button color="secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button color="default" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Aplicando...' : 'Aplicar aumento'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
