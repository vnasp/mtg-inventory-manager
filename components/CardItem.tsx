'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { mapConditionToSpanish, mapFoilToSpanish } from '@/utils/cardHelpers';
import { calculatePriceClp } from '@/utils/priceCalculations';
import type { CardOffer } from '@/types/card';

type Props = {
  offer: CardOffer;
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
  const card = offer.mtg_cards ?? offer.cards ?? offer.card ?? null;

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
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-zinc-800 shadow-md transition-all duration-300 hover:scale-105"
    >
      {/* Imagen de la carta */}
      <div className="relative aspect-5/7 w-full overflow-hidden">
        {card?.image_url && (
          <Image
            src={card.image_url}
            alt={card.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        )}
      </div>

      {/* Info de la carta */}
      <div className="absolute bottom-0 w-full translate-y-full space-y-1 bg-black/70 p-3 transition-transform duration-300 group-hover:translate-y-0">
        {/* Nombre de la carta */}
        <h3 className="line-clamp-1 text-sm font-semibold text-white lg:text-base">
          {card?.name || 'Sin nombre'}
        </h3>

        {/* Set */}
        {card?.set_name && (
          <p className="line-clamp-1 text-xs text-white">{card.set_name}</p>
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
          <span className="text-xl font-bold text-blue-500! lg:text-2xl">
            {formattedPrice}
          </span>
        </div>
      </div>
    </article>
  );
}
