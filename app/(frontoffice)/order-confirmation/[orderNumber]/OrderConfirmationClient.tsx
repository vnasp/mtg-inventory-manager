'use client';

import React from 'react';
import { Button, Card } from 'flowbite-react';
import {
  HiCheckCircle,
  HiMail,
  HiTruck,
  HiShoppingBag,
  HiClock,
  HiXCircle,
} from 'react-icons/hi';
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

  // Determinar estado del pago y mensaje
  const getPaymentStatus = () => {
    switch (order.payment_status) {
      case 'paid':
        return {
          icon: <HiCheckCircle className="h-16 w-16 text-green-600" />,
          bgColor: 'bg-green-100',
          title: '¡Pago confirmado!',
          message: 'Tu pago ha sido procesado exitosamente',
        };
      case 'pending':
        return {
          icon: <HiClock className="h-16 w-16 text-yellow-600" />,
          bgColor: 'bg-yellow-100',
          title: 'Pago pendiente',
          message: 'Estamos esperando la confirmación de tu pago',
        };
      case 'failed':
        return {
          icon: <HiXCircle className="h-16 w-16 text-red-600" />,
          bgColor: 'bg-red-100',
          title: 'Pago rechazado',
          message: 'Hubo un problema con tu pago',
        };
      default:
        return {
          icon: <HiCheckCircle className="h-16 w-16 text-green-600" />,
          bgColor: 'bg-green-100',
          title: '¡Pedido confirmado!',
          message: 'Recibimos tu pedido correctamente',
        };
    }
  };

  const paymentStatus = getPaymentStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header de confirmación */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className={`rounded-full p-4 ${paymentStatus.bgColor}`}>
                {paymentStatus.icon}
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {paymentStatus.title}
            </h1>
            <p className="text-lg text-gray-600">{paymentStatus.message}</p>
            <p className="mt-2 text-lg text-gray-600">
              Número de orden:{' '}
              <span className="font-semibold">{order.order_number}</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Recibimos tu pedido el {formatDate(order.created_at)}
            </p>
          </div>

          {/* Estado de pago */}
          {order.payment_status === 'paid' && (
            <Card className="mb-6 border-2 border-green-200 bg-green-50">
              <div className="flex items-center gap-3">
                <HiCheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    Pago procesado exitosamente
                  </h3>
                  <p className="text-sm text-green-700">
                    Tu pago ha sido confirmado. ¡Gracias por tu compra!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {order.payment_status === 'pending' && (
            <Card className="mb-6 border-2 border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-3">
                <HiClock className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">
                    Esperando confirmación de pago
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Tu pago está siendo procesado. Te notificaremos cuando se
                    confirme.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {order.payment_status === 'failed' && (
            <Card className="mb-6 border-2 border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <HiXCircle className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">
                    Problema con el pago
                  </h3>
                  <p className="text-sm text-red-700">
                    No pudimos procesar tu pago. Por favor, contacta con soporte
                    para más información.
                  </p>
                </div>
              </div>
            </Card>
          )}

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
              {order.shipping_method === 'store_pickup'
                ? 'Información de Retiro'
                : 'Dirección de envío'}
            </h2>

            {/* Método de envío */}
            <div className="mb-4 rounded-lg bg-purple-50 p-3">
              <p className="text-sm font-semibold text-purple-900">
                Método:{' '}
                {order.shipping_method === 'store_pickup'
                  ? '🏪 Retiro en Tienda'
                  : order.shipping_method || 'A definir'}
              </p>
              {order.shipping_cost > 0 && (
                <p className="text-sm text-purple-700">
                  Costo: {formatPrice(order.shipping_cost, order.currency)}
                </p>
              )}
            </div>

            {order.shipping_method === 'store_pickup' ? (
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="font-semibold text-blue-900">
                  Tu pedido estará disponible para retiro en nuestra tienda
                </p>
                <p className="mt-2 text-sm text-blue-800">
                  Te notificaremos por email a{' '}
                  <strong>{order.customer_email}</strong> cuando esté listo para
                  retiro.
                </p>
                {order.customer_phone && (
                  <p className="mt-1 text-sm text-blue-700">
                    También te contactaremos al {order.customer_phone}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-gray-700">
                {order.customer_first_name || order.customer_last_name ? (
                  <p className="font-semibold">
                    {order.customer_first_name} {order.customer_last_name}
                  </p>
                ) : null}
                <p>{order.shipping_address}</p>
                {order.shipping_comuna && (
                  <p>Comuna: {order.shipping_comuna}</p>
                )}
                <p>{order.shipping_city}</p>
                {order.shipping_region && <p>{order.shipping_region}</p>}
                <p>{order.shipping_country}</p>
                {order.customer_phone && (
                  <p className="mt-2 text-sm">Tel: {order.customer_phone}</p>
                )}
              </div>
            )}
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
