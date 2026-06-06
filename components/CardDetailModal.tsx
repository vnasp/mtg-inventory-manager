'use client';

import React from 'react';
import Image from 'next/image';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { mapConditionToSpanish, mapFoilToSpanish } from '@/utils/cardHelpers';
import { calculatePriceClp } from '@/utils/priceCalculations';
import type { CardOffer } from '@/types/card';

type Props = {
  show: boolean;
  onClose: () => void;
  offer: CardOffer | null;
  fxRate?: number;
  minCardPriceClp?: number;
};

export default function CardDetailModal({
  show,
  onClose,
  offer,
  fxRate,
  minCardPriceClp,
}: Props) {
  if (!offer) return null;

  const card = offer.mtg_cards ?? offer.cards ?? offer.card ?? null;
  const priceUsd = Number(offer.price_usd ?? 0);
  const markupPercent = Number(offer.markup_percent ?? 0);

  // Calcular precio con markup
  let converted: number;
  if (fxRate) {
    const minCardPrice = minCardPriceClp ?? 100;
    converted = calculatePriceClp(
      priceUsd,
      markupPercent,
      fxRate,
      minCardPrice
    );
  } else {
    converted = priceUsd * (1 + markupPercent / 100);
  }

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
    <Modal show={show} onClose={onClose} size="3xl" dismissible>
      <div className="flex w-full items-center justify-between rounded-t border-b border-gray-200 bg-linear-to-r from-purple-50 to-pink-50 px-6 py-4">
        <div className="flex flex-col items-start">
          <h2 className="text-xl font-bold text-gray-900">
            {card?.name || 'Detalles de la carta'}
          </h2>
          {card?.set_name && (
            <p className="text-sm text-gray-600">{card.set_name}</p>
          )}
        </div>
        <div className="text-3xl font-bold text-purple-600">
          {formattedPrice}
        </div>
      </div>
      <ModalBody className="bg-gray-50">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Imagen de la carta */}
          <div className="flex justify-center">
            {card?.image_url ? (
              <div className="relative">
                <Image
                  src={card.image_url}
                  alt={card.name}
                  width={300}
                  height={418}
                  className="rounded-xl shadow-xl ring-2 ring-purple-100"
                />
              </div>
            ) : (
              <div className="h-[418px] w-[300px] rounded-xl bg-linear-to-br from-purple-100 to-pink-100" />
            )}
          </div>

          {/* Detalles de la carta */}
          <div className="space-y-4">
            {/* Información del Set */}
            <div className="rounded-lg bg-white p-4 shadow-md">
              <h3 className="mb-3 text-base font-bold text-gray-900">
                Información de la Carta
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <dt className="font-semibold text-gray-700">Set:</dt>
                  <dd className="font-medium text-gray-900">
                    {card?.set_name || 'N/A'}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <dt className="font-semibold text-gray-700">Código:</dt>
                  <dd className="font-mono font-medium text-gray-900 uppercase">
                    {card?.set_code || 'N/A'}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <dt className="font-semibold text-gray-700">Número:</dt>
                  <dd className="font-mono font-medium text-gray-900">
                    {card?.collector_number || 'N/A'}
                  </dd>
                </div>
                {card?.rarity && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <dt className="font-semibold text-gray-700">Rareza:</dt>
                    <dd className="font-medium text-gray-900 uppercase">
                      {card.rarity}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Detalles de la Oferta */}
            <div className="rounded-lg bg-white p-4 shadow-md">
              <h3 className="mb-3 text-base font-bold text-gray-900">
                Detalles de Venta
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <dt className="font-semibold text-gray-700">Acabado:</dt>
                  <dd className="flex items-center gap-2">
                    {offer.foil !== 'nonfoil' && '✨ '}
                    {mapFoilToSpanish(offer.foil)}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <dt className="font-semibold text-gray-700">Condición:</dt>
                  <dd>{mapConditionToSpanish(offer.condition)}</dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <dt className="font-semibold text-gray-700">Idioma:</dt>
                  <dd className="font-medium text-gray-900">
                    {offer.language?.toLowerCase() === 'en'
                      ? '🇬🇧 Inglés'
                      : '🇪🇸 Español'}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2">
                  <dt className="font-semibold text-orange-700">
                    Stock Disponible:
                  </dt>
                  <dd className="text-lg font-bold text-orange-600">
                    {offer.quantity || 0}{' '}
                    {(offer.quantity || 0) === 1 ? 'unidad' : 'unidades'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="flex w-full flex-row items-center justify-end">
          <Button color="default" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
