'use client';

import React, { useState, useEffect } from 'react';
import { Button, Label, TextInput, Textarea, Card } from 'flowbite-react';
import { HiShoppingCart, HiCheck, HiTruck, HiCreditCard } from 'react-icons/hi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { calculatePriceClp } from '@/utils/priceCalculations';
import type { CartItemWithOffer } from '@/utils/db/types';
import { createClient } from '@/utils/supabase/client';

type Props = {
  fxRate?: number;
  minCardPriceClp?: number;
};

export default function CheckoutClient({ fxRate, minCardPriceClp }: Props) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Chile',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Obtener usuario y perfil si está autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFormData({
            email: profileData.email || user.email || '',
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            city: profileData.city || '',
            postalCode: profileData.postal_code || '',
            country: profileData.country || 'Chile',
            notes: '',
          });
        } else {
          setFormData((prev) => ({ ...prev, email: user.email || '' }));
        }
      }

      // Obtener carrito
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

    fetchData();
  }, []);

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

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + calculateItemPrice(item) * item.quantity;
  }, 0);

  const shippingCost = 0; // Pendiente integración
  const tax = 0; // Pendiente cálculo de impuestos
  const total = subtotal + shippingCost + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validaciones básicas
      if (!formData.email || !formData.address || !formData.city) {
        alert('Por favor completa todos los campos requeridos');
        setSubmitting(false);
        return;
      }

      // Crear orden
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: formData,
          items: cartItems.map((item) => ({
            card_offer_id: item.card_offer_id,
            quantity: item.quantity,
            unit_price: calculateItemPrice(item),
          })),
          subtotal,
          tax,
          shipping_cost: shippingCost,
          total,
          currency: fxRate ? 'CLP' : 'USD',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear la orden');
      }

      const { order } = await response.json();

      // Redirigir a página de confirmación
      router.push(`/order-confirmation/${order.order_number}`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(
        error.message ||
          'Error al procesar la orden. Por favor intenta nuevamente.'
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <HiShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Tu carrito está vacío
          </h2>
          <p className="mb-4 text-gray-600">
            Agrega algunas cartas antes de hacer checkout
          </p>
          <Button onClick={() => router.push('/')} color="purple">
            Ir al catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">
            {user ? 'Completa tu compra' : 'Completa tu compra como invitado'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Columna izquierda - Formulario */}
            <div className="space-y-6">
              {/* Información de contacto */}
              <Card>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <HiCheck className="h-6 w-6 text-purple-600" />
                  Información de contacto
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <TextInput
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      disabled={!!user}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <TextInput
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido</Label>
                      <TextInput
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        placeholder="Pérez"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <TextInput
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>
              </Card>

              {/* Dirección de envío */}
              <Card>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <HiTruck className="h-6 w-6 text-purple-600" />
                  Dirección de envío
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">
                      Dirección <span className="text-red-500">*</span>
                    </Label>
                    <TextInput
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                      placeholder="Calle Ejemplo 123, Depto 4B"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="city">
                        Ciudad <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        required
                        placeholder="Santiago"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Código Postal</Label>
                      <TextInput
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postalCode: e.target.value,
                          })
                        }
                        placeholder="8320000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">País</Label>
                    <TextInput
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      placeholder="Chile"
                    />
                  </div>
                </div>
              </Card>

              {/* Método de envío - Placeholder */}
              <Card>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <HiTruck className="h-6 w-6 text-purple-600" />
                  Método de envío
                </h2>
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    Integración de transportistas pendiente
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    El costo de envío se calculará al implementar la integración
                  </p>
                </div>
              </Card>

              {/* Método de pago - Placeholder */}
              <Card>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <HiCreditCard className="h-6 w-6 text-purple-600" />
                  Método de pago
                </h2>
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    Integración de pasarela de pagos pendiente
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Webpay, Transbank u otra pasarela se integrará próximamente
                  </p>
                </div>
              </Card>

              {/* Notas adicionales */}
              <Card>
                <div>
                  <Label htmlFor="notes">Notas del pedido (opcional)</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Instrucciones especiales de entrega..."
                  />
                </div>
              </Card>
            </div>

            {/* Columna derecha - Resumen */}
            <div>
              <div className="sticky top-24">
                <Card>
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    Resumen del pedido
                  </h2>

                  {/* Items del carrito */}
                  <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
                    {cartItems.map((item) => {
                      const card = item.card_offers.cards;
                      const price = calculateItemPrice(item);
                      const itemSubtotal = price * item.quantity;

                      return (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-lg border border-gray-200 p-3"
                        >
                          <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded">
                            {card.image_url ? (
                              <Image
                                src={card.image_url}
                                alt={card.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                <HiShoppingCart className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="line-clamp-1 text-sm font-semibold text-gray-900">
                              {card.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {card.set_name}
                            </p>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Cantidad: {item.quantity}
                              </span>
                              <span className="text-sm font-semibold text-purple-600">
                                {formatPrice(itemSubtotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totales */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Envío</span>
                        <span className="font-semibold text-gray-400">
                          Pendiente
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impuestos</span>
                        <span className="font-semibold">
                          {formatPrice(tax)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-purple-600">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-lg font-semibold"
                      size="lg"
                    >
                      {submitting ? 'Procesando...' : 'Confirmar pedido'}
                    </Button>

                    <p className="mt-4 text-center text-xs text-gray-500">
                      Al confirmar, aceptas nuestros términos y condiciones
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
