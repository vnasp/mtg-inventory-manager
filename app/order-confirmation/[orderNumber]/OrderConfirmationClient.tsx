'use client';

import React from 'react';
import { Button, Card } from 'flowbite-react';
import { HiCheckCircle, HiMail, HiTruck, HiShoppingBag } from 'react-icons/hi';
import Image from 'next/image';
import Link from 'next/link';
import type { OrderWithItems } from '@/utils/db/types';

type Props = {
  order: OrderWithItems;
};

export default function OrderConfirmationClient({ order }: Props) {
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'CLP') {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header de confirmación */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <HiCheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              ¡Pedido confirmado!
            </h1>
            <p className="text-lg text-gray-600">
              Número de orden:{' '}
              <span className="font-semibold">{order.order_number}</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Recibimos tu pedido el {formatDate(order.created_at)}
            </p>
          </div>

          {/* Información importante */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <Card>
              <div className="flex items-start gap-3">
                <HiMail className="mt-1 h-6 w-6 shrink-0 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Confirmación enviada
                  </h3>
                  <p className="text-sm text-gray-600">
                    Te enviamos los detalles a {order.customer_email}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start gap-3">
                <HiTruck className="mt-1 h-6 w-6 shrink-0 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Estado del envío
                  </h3>
                  <p className="text-sm text-gray-600">
                    Te notificaremos cuando se despache
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Detalles de la orden */}
          <Card className="mb-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Detalles del pedido
            </h2>

            {/* Items */}
            <div className="mb-6 space-y-3">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded">
                    {item.card_image_url ? (
                      <Image
                        src={item.card_image_url}
                        alt={item.card_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <HiShoppingBag className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {item.card_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.card_set_name}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Cantidad: {item.quantity}
                      </span>
                      <span className="font-semibold text-purple-600">
                        {formatPrice(item.subtotal, order.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen de costos */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    {formatPrice(order.subtotal, order.currency)}
                  </span>
                </div>
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-semibold">
                      {formatPrice(order.shipping_cost, order.currency)}
                    </span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Impuestos</span>
                    <span className="font-semibold">
                      {formatPrice(order.tax, order.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-purple-600">
                    {formatPrice(order.total, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Información de envío */}
          <Card className="mb-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Dirección de envío
            </h2>
            <div className="text-gray-700">
              {order.customer_first_name || order.customer_last_name ? (
                <p className="font-semibold">
                  {order.customer_first_name} {order.customer_last_name}
                </p>
              ) : null}
              <p>{order.shipping_address}</p>
              <p>
                {order.shipping_city}
                {order.shipping_postal_code &&
                  `, ${order.shipping_postal_code}`}
              </p>
              <p>{order.shipping_country}</p>
              {order.customer_phone && (
                <p className="mt-2 text-sm">Tel: {order.customer_phone}</p>
              )}
            </div>
          </Card>

          {/* Acciones */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              as={Link}
              href="/"
              color="purple"
              className="flex-1"
              size="lg"
            >
              Volver al catálogo
            </Button>
            <Button
              as="a"
              href={`mailto:${order.customer_email}?subject=Consulta sobre orden ${order.order_number}`}
              color="gray"
              className="flex-1"
              size="lg"
            >
              Contactar soporte
            </Button>
          </div>

          {/* Nota informativa */}
          <div className="mt-8 rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El pago y envío están pendientes de
              integración. Nos pondremos en contacto contigo para coordinar los
              detalles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
