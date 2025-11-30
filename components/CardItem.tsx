'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from 'flowbite-react';
import { mapConditionToSpanish, mapFoilToSpanish } from '@/utils/cardHelpers';
import { calculatePriceClp } from '@/utils/priceCalculations';

type Props = {
  offer: any;
  fxRate?: number;
  minCardPriceClp?: number;
  onClick: () => void;
};

export default function CardItem({
  offer,
  fxRate,
  minCardPriceClp,
  onClick,
}: Props) {
  const card = offer.cards ?? offer.card ?? null;

  // Precio en USD desde la oferta (fallback a 0 si no existe)
  const priceUsd = Number(offer.price_usd ?? 0);
  const markupPercent = Number(offer.markup_percent ?? 0);

  // Calcular precio con markup
  let converted: number;
  if (fxRate) {
    // Si hay fxRate, calcular precio en CLP con markup y mínimo
    const minCardPrice = minCardPriceClp ?? 100;
    converted = calculatePriceClp(
      priceUsd,
      markupPercent,
      fxRate,
      minCardPrice
    );
  } else {
    // Si no hay fxRate, solo aplicar markup al USD
    converted = priceUsd * (1 + markupPercent / 100);
  }

  // Formatear: si hay fxRate asumimos CLP, si no mostramos USD
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
    <article
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Imagen de la carta */}
      <div className="relative aspect-5/7 overflow-hidden bg-linear-to-br from-purple-100 to-pink-100">
        {card?.image_url ? (
          <Image
            src={card.image_url}
            alt={card.name}
            width={200}
            height={280}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <svg
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Overlay con efecto hover */}
        <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10" />
      </div>

      {/* Info de la carta */}
      <div className="space-y-2 p-3">
        {/* Nombre de la carta */}
        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 lg:text-base">
          {card?.name || 'Sin nombre'}
        </h3>

        {/* Set */}
        {card?.set_name && (
          <p className="line-clamp-1 text-xs text-gray-500">{card.set_name}</p>
        )}

        {/* Badge de condición y foil */}
        <div className="flex flex-wrap gap-1.5">
          {offer.condition && (
            <Badge color="gray" size="xs">
              {mapConditionToSpanish(offer.condition)}
            </Badge>
          )}
          {offer.foil && (
            <Badge
              color={offer.foil === 'nonfoil' ? 'gray' : 'warning'}
              size="xs"
              className={
                offer.foil !== 'nonfoil'
                  ? 'bg-linear-to-r from-yellow-400 to-pink-400 text-white'
                  : ''
              }
            >
              {offer.foil !== 'nonfoil' && '✨ '}
              {mapFoilToSpanish(offer.foil)}
            </Badge>
          )}
        </div>

        {/* Precio */}
        <div className="pt-1">
          <span className="text-xl font-bold text-purple-600 lg:text-2xl">
            {formattedPrice}
          </span>
        </div>
      </div>
    </article>
  );
}
