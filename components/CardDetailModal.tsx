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

type Props = {
  show: boolean;
  onClose: () => void;
  offer: any | null;
  fxRate?: number;
};

export default function CardDetailModal({
  show,
  onClose,
  offer,
  fxRate,
}: Props) {
  if (!offer) return null;

  const card = offer.cards ?? offer.card ?? null;
  const priceUsd = Number(offer.price_usd ?? 0);
  const converted = fxRate ? Math.round(priceUsd * fxRate) : priceUsd;
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
      <ModalHeader>{card?.name || 'Detalles de la carta'}</ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Imagen de la carta */}
          <div className="flex justify-center">
            {card?.image_url ? (
              <Image
                src={card.image_url}
                alt={card.name}
                width={300}
                height={418}
                className="rounded-lg shadow-lg"
              />
            ) : (
              <div className="h-[418px] w-[300px] rounded-lg bg-stone-200" />
            )}
          </div>

          {/* Detalles de la carta */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Información
              </h3>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-700">Set:</dt>
                  <dd className="uppercase">{card?.set_code || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-700">Número:</dt>
                  <dd className="uppercase">
                    {card?.collector_number || 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-700">SKU:</dt>
                  <dd className="uppercase">{card?.sku || 'N/A'}</dd>
                </div>
              </dl>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900">Oferta</h3>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-700">Acabado:</dt>
                  <dd className="uppercase">{offer.foil || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-700">Condición:</dt>
                  <dd className="uppercase">{offer.condition || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-700">Idioma:</dt>
                  <dd className="uppercase">
                    {offer.language === 'EN' ? 'Inglés' : 'Español'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-700">Cantidad:</dt>
                  <dd className="uppercase">{offer.quantity || 0}</dd>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <dt className="text-lg font-semibold text-gray-900">
                    Precio:
                  </dt>
                  <dd className="text-xl font-bold text-green-600">
                    {formattedPrice}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </ModalBody>
      {/* Footer con botón de comprar 
      <ModalFooter>
        <Button
          onClick={onClose}
          className="text-textLight bg-primary relative mt-2 w-full overflow-hidden rounded-lg px-4 py-2 font-bold uppercase shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.3)] transition after:absolute after:inset-0 after:rounded-lg after:bg-linear-to-t after:from-orange-300/20 after:to-transparent after:content-[''] hover:brightness-105 active:translate-y-px active:shadow-inner"
        >
          Comprar
        </Button>
      </ModalFooter>*/}
    </Modal>
  );
}
