'use client';

import React, { useState, useEffect } from 'react';
import { Button, Label, TextInput, Textarea, Card } from 'flowbite-react';
import { HiShoppingCart, HiCheck, HiTruck, HiCreditCard } from 'react-icons/hi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { calculatePriceClp } from '@/utils/priceCalculations';
import type { CartItemWithOffer } from '@/utils/db/types';
import { createClient } from '@/utils/supabase/client';
import { regionesComunas, regiones } from '@/utils/regionesComunas';

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

  const [shippingMethod, setShippingMethod] = useState('store_pickup');

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    rut: '',
    address: '',
    comuna: '',
    city: '',
    region: '',
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
            rut: profileData.rut || '',
            address: profileData.address || '',
            comuna: profileData.comuna || '',
            city: profileData.city || '',
            region: profileData.region || '',
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
        } else if (response.status === 401) {
          // Usuario no autenticado, leer del localStorage
          const guestCart = JSON.parse(
            localStorage.getItem('guestCart') || '[]'
          );
          setCartItems(guestCart as CartItemWithOffer[]);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        // En caso de error, intentar leer del localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCartItems(guestCart as CartItemWithOffer[]);
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

  const shippingCost = shippingMethod === 'store_pickup' ? 0 : 0; // Retiro en tienda sin costo
  // Calcular IVA (19% incluido en precios)
  // Si precio con IVA = X, entonces precio neto = X / 1.19 y IVA = X * (0.19/1.19)
  const tax = subtotal * (0.19 / 1.19);
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validaciones básicas
      if (!formData.email) {
        alert('Por favor ingresa tu email');
        setSubmitting(false);
        return;
      }

      // Si NO es retiro en tienda, validar dirección
      if (shippingMethod !== 'store_pickup') {
        if (
          !formData.address ||
          !formData.comuna ||
          !formData.city ||
          !formData.region
        ) {
          alert(
            'Por favor completa la dirección de envío (Dirección, Comuna, Ciudad y Región son requeridos)'
          );
          setSubmitting(false);
          return;
        }
      }

      // Crear orden
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: formData,
          shipping_method: shippingMethod,
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

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || 'Error al crear la orden');
      }

      const { order } = await orderResponse.json();

      // Crear preferencia de pago en MercadoPago
      const preferenceResponse = await fetch(
        '/api/mercadopago/create-preference',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id,
            orderNumber: order.order_number,
            items: order.order_items,
            total: order.total,
            currency: order.currency,
            customer: formData,
          }),
        }
      );

      if (!preferenceResponse.ok) {
        const error = await preferenceResponse.json();
        throw new Error(error.error || 'Error al crear preferencia de pago');
      }

      const { initPoint } = await preferenceResponse.json();

      // Redirigir a MercadoPago
      window.location.href = initPoint;
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
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Columna izquierda - Formulario */}
            <div className="space-y-6 lg:col-span-2">
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
                </div>
              </Card>

              {/* Dirección de envío o datos de retiro */}
              <Card>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <HiTruck className="h-6 w-6 text-purple-600" />
                  {shippingMethod === 'store_pickup'
                    ? 'Datos para retiro en tienda'
                    : 'Dirección de envío'}
                </h2>

                <div className="space-y-4">
                  {/* Nombre, Apellido y Teléfono para ambos casos */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">
                        Nombre <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        required
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">
                        Apellido <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                        placeholder="Pérez"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="phone">
                        Teléfono <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                    {shippingMethod === 'store_pickup' && (
                      <div>
                        <Label htmlFor="rut">
                          RUT <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          id="rut"
                          value={formData.rut}
                          onChange={(e) =>
                            setFormData({ ...formData, rut: e.target.value })
                          }
                          required
                          placeholder="12.345.678-9"
                        />
                      </div>
                    )}
                  </div>

                  {/* Campos de dirección solo si NO es retiro */}
                  {shippingMethod !== 'store_pickup' && (
                    <>
                      <div>
                        <Label htmlFor="address">
                          Dirección{' '}
                          {shippingMethod !== 'store_pickup' && (
                            <span className="text-red-500">*</span>
                          )}
                        </Label>
                        <TextInput
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          required={shippingMethod !== 'store_pickup'}
                          placeholder="Calle Ejemplo 123, Depto 4B"
                        />
                      </div>

                      <div>
                        <Label htmlFor="comuna">
                          Comuna{' '}
                          {shippingMethod !== 'store_pickup' && (
                            <span className="text-red-500">*</span>
                          )}
                        </Label>
                        <TextInput
                          id="comuna"
                          value={formData.comuna}
                          onChange={(e) =>
                            setFormData({ ...formData, comuna: e.target.value })
                          }
                          required={shippingMethod !== 'store_pickup'}
                          placeholder="Ej: Providencia, Las Condes, Maipú"
                        />
                      </div>

                      <div>
                        <Label htmlFor="region">
                          Región{' '}
                          {shippingMethod !== 'store_pickup' && (
                            <span className="text-red-500">*</span>
                          )}
                        </Label>
                        <select
                          id="region"
                          value={formData.region}
                          onChange={(e) => {
                            const newRegion = e.target.value;
                            setFormData({
                              ...formData,
                              region: newRegion,
                              city: '',
                            });
                          }}
                          required={shippingMethod !== 'store_pickup'}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-purple-500 focus:ring-purple-500"
                        >
                          <option value="">Selecciona una región</option>
                          {regiones.map((region) => (
                            <option key={region} value={region}>
                              {region}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="city">
                            Ciudad
                            {shippingMethod !== 'store_pickup' && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          <select
                            id="city"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                            required={shippingMethod !== 'store_pickup'}
                            disabled={!formData.region}
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-purple-500 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">
                              {formData.region
                                ? 'Selecciona una ciudad/comuna'
                                : 'Primero selecciona una región'}
                            </option>
                            {formData.region &&
                              regionesComunas[
                                formData.region as keyof typeof regionesComunas
                              ]
                                ?.slice()
                                .sort((a, b) => a.localeCompare(b, 'es'))
                                .map((ciudad) => (
                                  <option key={ciudad} value={ciudad}>
                                    {ciudad}
                                  </option>
                                ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="country">País</Label>
                        <TextInput
                          id="country"
                          value={formData.country}
                          disabled
                          placeholder="Chile"
                        />
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Método de envío */}
              <Card>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <HiTruck className="h-6 w-6 text-purple-600" />
                  Método de envío
                </h2>

                <div className="space-y-3">
                  {/* Retiro en tienda */}
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all ${
                      shippingMethod === 'store_pickup'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value="store_pickup"
                        checked={shippingMethod === 'store_pickup'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="h-4 w-4 text-purple-600"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Retiro en Tienda
                        </p>
                        <p className="text-sm text-gray-500">
                          Retira tu pedido en nuestra tienda
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-green-600">Gratis</span>
                  </label>

                  {/* Nota informativa */}
                  {shippingMethod === 'store_pickup' && (
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Dirección:</strong> Te notificaremos cuando tu
                        pedido esté listo para retiro.
                      </p>
                    </div>
                  )}

                  {/* Placeholder para otros métodos de envío */}
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-center">
                    <p className="text-xs text-gray-500">
                      Otros métodos de envío estarán disponibles próximamente
                    </p>
                  </div>
                </div>
              </Card>

              {/* Método de pago - MercadoPago */}
              <Card>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <HiCreditCard className="h-6 w-6 text-purple-600" />
                  Método de pago
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <HiCreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">MercadoPago</p>
                      <p className="text-sm text-gray-600">
                        Paga con tarjetas, Webpay y más
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-600">
                      ✓ Pago 100% seguro
                      <br />
                      ✓ Todos los métodos de pago disponibles
                      <br />✓ Serás redirigido a MercadoPago para completar el
                      pago
                    </p>
                  </div>
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

              {/* Botón de pago */}
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-lg font-semibold"
                  size="lg"
                >
                  {submitting ? 'Procesando...' : 'Pagar ahora'}
                </Button>

                <p className="text-center text-xs text-gray-500">
                  Al continuar, aceptas nuestros términos y condiciones
                </p>
              </div>
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
                          {shippingMethod === 'store_pickup'
                            ? 'No aplica'
                            : 'Pendiente'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-purple-600">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>
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
