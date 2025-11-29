'use client';

import React from 'react';
import Image from 'next/image';
import {
  Modal,
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'flowbite-react';
import { mapConditionToSpanish, mapFoilToSpanish } from '@/utils/cardHelpers';

type Props = {
  show: boolean;
  onClose: () => void;
  offer: any | null;
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

  const card = offer.cards ?? offer.card ?? null;
  const priceUsd = Number(offer.price_usd ?? 0);
  const priceClp = fxRate ? Math.round(priceUsd * fxRate) : priceUsd;
  const minCardPrice = minCardPriceClp ?? 100;
  const converted = fxRate ? Math.max(priceClp, minCardPrice) : priceUsd;
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
    <Modal show={show} onClose={onClose} size="4xl" dismissible>
      <ModalHeader className="border-b border-gray-200 bg-linear-to-r from-purple-50 to-pink-50">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {card?.name || 'Detalles de la carta'}
          </h2>
          {card?.set_name && (
            <p className="text-sm text-gray-600">{card.set_name}</p>
          )}
        </div>
      </ModalHeader>
      <ModalBody className="bg-gray-50">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Imagen de la carta */}
          <div className="flex justify-center">
            {card?.image_url ? (
              <div className="relative">
                <Image
                  src={card.image_url}
                  alt={card.name}
                  width={300}
                  height={418}
                  className="rounded-2xl shadow-2xl ring-4 ring-purple-100"
                />
                {/* Badge decorativo */}
                {card?.rarity && (
                  <div className="absolute -top-3 -right-3 rounded-full bg-linear-to-r from-purple-600 to-pink-600 px-4 py-2 shadow-lg">
                    <span className="text-xs font-bold text-white uppercase">
                      {card.rarity}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[418px] w-[300px] rounded-2xl bg-linear-to-br from-purple-100 to-pink-100" />
            )}
          </div>

          {/* Detalles de la carta */}
          <div className="space-y-6">
            {/* Información del Set */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <svg
                  className="h-5 w-5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Información de la Carta
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <dt className="font-semibold text-gray-700">Set:</dt>
                  <dd className="font-medium text-gray-900">
                    {card?.set_name || 'N/A'}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <dt className="font-semibold text-gray-700">Código:</dt>
                  <dd className="font-mono font-medium text-gray-900 uppercase">
                    {card?.set_code || 'N/A'}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <dt className="font-semibold text-gray-700">Número:</dt>
                  <dd className="font-mono font-medium text-gray-900">
                    {card?.collector_number || 'N/A'}
                  </dd>
                </div>
                {card?.sku && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <dt className="font-semibold text-gray-700">SKU:</dt>
                    <dd className="font-mono text-xs font-medium text-gray-900 uppercase">
                      {card.sku}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Detalles de la Oferta */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <svg
                  className="h-5 w-5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Detalles de Venta
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <dt className="font-semibold text-gray-700">Acabado:</dt>
                  <dd className="flex items-center gap-2">
                    {offer.foil && offer.foil !== 'nonfoil' ? (
                      <span className="rounded-full bg-linear-to-r from-yellow-400 to-pink-400 px-3 py-1 text-xs font-bold text-white">
                        ✨ {mapFoilToSpanish(offer.foil)}
                      </span>
                    ) : (
                      <span className="font-medium text-gray-900 uppercase">
                        {mapFoilToSpanish(offer.foil)}
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <dt className="font-semibold text-gray-700">Condición:</dt>
                  <dd className="font-medium text-gray-900">
                    {mapConditionToSpanish(offer.condition)}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <dt className="font-semibold text-gray-700">Idioma:</dt>
                  <dd className="font-medium text-gray-900">
                    {offer.language?.toLowerCase() === 'en'
                      ? '🇬🇧 Inglés'
                      : '🇪🇸 Español'}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 ring-2 ring-green-200">
                  <dt className="font-semibold text-green-700">
                    Stock Disponible:
                  </dt>
                  <dd className="text-lg font-bold text-green-600">
                    {offer.quantity || 0} unidades
                  </dd>
                </div>
              </dl>
            </div>

            {/* Precio destacado */}
            <div className="rounded-xl bg-linear-to-r from-purple-600 to-pink-600 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Precio</p>
                  <p className="mt-1 text-4xl font-bold text-white">
                    {formattedPrice}
                  </p>
                </div>
                <div className="rounded-full bg-white/20 p-3">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="border-t border-gray-200 bg-gray-50">
        <Button
          onClick={onClose}
          className="w-full bg-linear-to-r from-purple-600 to-pink-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
