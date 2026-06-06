'use client';
import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { HiExclamationCircle } from 'react-icons/hi';

type DeleteCardModalProps = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count?: number;
  isLoading?: boolean;
  popup?: boolean;
};

export default function DeleteCardModal({
  show,
  onClose,
  onConfirm,
  count = 1,
  isLoading = false,
  popup = true,
}: DeleteCardModalProps) {
  const isMultiple = count > 1;

  return (
    <Modal show={show} size="md" onClose={onClose} popup={popup}>
      <div className="p-6">
        <div className="text-center">
          <HiExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-600" />
          <h3 className="mb-5 text-lg font-semibold text-gray-900">
            Eliminar {isMultiple ? `${count} cartas` : 'carta'}
          </h3>
          <p className="mb-5 text-sm text-gray-600">
            <strong>Esta acción es irreversible.</strong>
            <br />
            {isMultiple ? (
              <>
                Estás a punto de eliminar {count} cartas del inventario. Una vez
                eliminadas, no podrán ser recuperadas.
              </>
            ) : (
              <>
                ¿Estás seguro de que deseas eliminar esta carta del inventario?
                Una vez eliminada, no podrá ser recuperada.
              </>
            )}
          </p>
          <div className="flex justify-center gap-4">
            <Button color="secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button color="default" onClick={onConfirm} disabled={isLoading}>
              {isLoading
                ? 'Eliminando...'
                : `Sí, eliminar ${isMultiple ? `${count} cartas` : 'carta'}`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
