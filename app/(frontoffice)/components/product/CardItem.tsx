'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Badge, Button } from 'flowbite-react';
import { HiShoppingCart } from 'react-icons/hi';
import { MdImage } from 'react-icons/md';
import { mapConditionToSpanish, mapFoilToSpanish } from '@/utils/cardHelpers';
import { calculatePriceClp } from '@/utils/priceCalculations';

type Props = {
  offer: any;
  fxRate?: number;
  minCardPriceClp?: number;
  onClick: () => void;
  onAddToCart?: () => void;
};

export default function CardItem({
  offer,
  fxRate,
  minCardPriceClp,
  onClick,
  onAddToCart,
}: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const card = offer.cards ?? offer.card ?? null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar abrir el modal al hacer clic en el botón
    setIsAdding(true);
    if (onAddToCart) {
      await onAddToCart();
    }
    setIsAdding(false);
  };

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
            <MdImage className="h-16 w-16" />
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

        {/* Precio y botón de agregar */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-slate-800 lg:text-xl">
            {formattedPrice}
          </span>
          <Button
            size="xs"
            color="purple"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="transition-all hover:scale-105"
          >
            <HiShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
