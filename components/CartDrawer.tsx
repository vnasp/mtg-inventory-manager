'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Drawer,
  DrawerHeader,
  DrawerItems,
} from 'flowbite-react';
import { HiShoppingCart, HiTrash, HiMinus, HiPlus, HiX } from 'react-icons/hi';
import Image from 'next/image';
import { calculatePriceClp } from '@/utils/priceCalculations';
import type { CartItemWithOffer } from '@/utils/db/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  fxRate?: number;
  minCardPriceClp?: number;
};

export default function CartDrawer({
  isOpen,
  onClose,
  fxRate,
  minCardPriceClp,
}: Props) {
  const [cartItems, setCartItems] = useState<CartItemWithOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const handleRemoveItem = async (cartId: string) => {
    try {
      const response = await fetch(`/api/cart?id=${cartId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleDecrement = async (cartId: string) => {
    try {
      const response = await fetch(`/api/cart?id=${cartId}&decrement=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error decrementing item:', error);
    }
  };

  const handleIncrement = async (cartId: string, offerId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_offer_id: offerId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error incrementing item:', error);
    }
  };

  const calculateItemPrice = (item: CartItemWithOffer) => {
    const priceUsd = Number(item.card_offers.price_usd ?? 0);
    const markupPercent = Number(item.card_offers.markup_percent ?? 0);

    if (fxRate) {
      const minCardPrice = minCardPriceClp ?? 100;
      return calculatePriceClp(priceUsd, markupPercent, fxRate, minCardPrice);
    }
    return priceUsd * (1 + markupPercent / 100);
  };

  const formatPrice = (price: number) => {
    if (fxRate) {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      }).format(price);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + calculateItemPrice(item) * item.quantity;
  }, 0);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      position="right"
      className="w-[500px]"
    >
      <DrawerHeader title="Carrito de Compra" titleIcon={HiShoppingCart} />
      <DrawerItems>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
              <p className="text-sm text-gray-500">Cargando carrito...</p>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <HiShoppingCart className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-700">
              Tu carrito está vacío
            </h3>
            <p className="text-sm text-gray-500">
              Agrega algunas cartas para comenzar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Lista de items */}
            <div className="space-y-3">
              {cartItems.map((item) => {
                const card = item.card_offers.cards;
                const price = calculateItemPrice(item);
                const subtotal = price * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                  >
                    {/* Imagen */}
                    <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded">
                      {card.image_url ? (
                        <Image
                          src={card.image_url}
                          alt={card.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <HiShoppingCart className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col">
                      <h4 className="line-clamp-2 text-sm font-semibold text-gray-900">
                        {card.name}
                      </h4>
                      <p className="text-xs text-gray-500">{card.set_name}</p>

                      <div className="mt-auto flex items-center justify-between">
                        {/* Controles de cantidad */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="xs"
                            color="gray"
                            onClick={() => handleDecrement(item.id)}
                          >
                            <HiMinus className="h-3 w-3" />
                          </Button>
                          <span className="min-w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            size="xs"
                            color="gray"
                            onClick={() =>
                              handleIncrement(item.id, item.card_offer_id)
                            }
                          >
                            <HiPlus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Precio */}
                        <div className="text-right">
                          <p className="text-sm font-bold text-purple-600">
                            {formatPrice(subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="shrink-0 text-gray-400 transition-colors hover:text-red-500"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Total y Checkout */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-white pt-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  Total:
                </span>
                <span className="text-2xl font-bold text-purple-600">
                  {formatPrice(total)}
                </span>
              </div>

              <Button
                className="w-full bg-linear-to-r from-purple-600 to-pink-600 font-semibold text-white"
                size="lg"
                onClick={() => (window.location.href = '/checkout')}
              >
                Ir a Checkout
              </Button>

              <p className="mt-2 text-center text-xs text-gray-500">
                Checkout rápido con métodos de pago pendientes de integración
              </p>
            </div>
          </div>
        )}
      </DrawerItems>
    </Drawer>
  );
}
