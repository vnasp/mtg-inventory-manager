'use client';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from 'flowbite-react';
import Image from 'next/image';
import ToastNotification from '@/components/ToastNotification';

type CardOffer = {
  id: string;
  card_id: string;
  finish: string;
  language: string;
  quantity: number;
  price_usd: number;
  active: boolean;
  cards: {
    id: string;
    name: string;
    set_code: string;
    collector_number: string;
    image_url: string | null;
  };
};

export default function CardInventory() {
  const [offers, setOffers] = useState<CardOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fxRate, setFxRate] = useState<number>(1000);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cards?admin=true');
      if (!res.ok) throw new Error('Error al cargar inventario');
      const data = await res.json();
      setOffers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();

    // Cargar fx rate
    (async () => {
      try {
        const res = await fetch(`/api/settings`);
        const body = await res.json().catch(() => ({}));
        if (body?.rate) setFxRate(Number(body.rate));
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleUpdateStock = async (offerId: string, newQuantity: number) => {
    try {
      const res = await fetch(`/api/cards/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!res.ok) throw new Error('Error al actualizar stock');

      // Actualizar localmente (incluyendo active=false si quantity=0)
      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === offerId
            ? {
                ...offer,
                quantity: newQuantity,
                active: newQuantity > 0 ? offer.active : false,
              }
            : offer
        )
      );

      setToast({ message: 'Stock actualizado', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error al actualizar stock', type: 'error' });
    }
  };

  const handleToggleActive = async (
    offerId: string,
    currentActive: boolean
  ) => {
    try {
      const res = await fetch(`/api/cards/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!res.ok) throw new Error('Error al cambiar estado');

      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === offerId ? { ...offer, active: !currentActive } : offer
        )
      );
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error al cambiar estado', type: 'error' });
    }
  };

  const filteredOffers = offers.filter(
    (offer) =>
      offer.cards.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.cards.set_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-slate-700">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h1>Inventario de Cartas</h1>
        <p className="backoffice-section-description mb-4">
          Listado completo de todas las cartas en stock
        </p>
        <div className="w-full md:w-64">
          <TextInput
            placeholder="Buscar por nombre o set..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell className="px-6 py-3">Imagen</TableHeadCell>
              <TableHeadCell className="px-6 py-3">Nombre</TableHeadCell>
              <TableHeadCell className="px-6 py-3">Set</TableHeadCell>
              <TableHeadCell className="px-6 py-3">Finish</TableHeadCell>
              <TableHeadCell className="px-6 py-3">Precio USD</TableHeadCell>
              <TableHeadCell className="px-6 py-3">Stock</TableHeadCell>
              <TableHeadCell className="px-6 py-3">Estado</TableHeadCell>
              <TableHeadCell className="px-6 py-3">Acciones</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y divide-gray-200">
            {filteredOffers.map((offer) => (
              <TableRow key={offer.id} className="bg-white hover:bg-gray-50">
                <TableCell className="px-6 py-4">
                  {offer.cards.image_url ? (
                    <Image
                      src={offer.cards.image_url}
                      alt={offer.cards.name}
                      width={50}
                      height={70}
                      className="rounded"
                    />
                  ) : (
                    <div className="h-[70px] w-[50px] rounded bg-gray-200" />
                  )}
                </TableCell>
                <TableCell className="px-6 py-4 font-medium text-gray-900">
                  {offer.cards.name}
                </TableCell>
                <TableCell className="px-6 py-4">
                  {offer.cards.set_code.toUpperCase()} #
                  {offer.cards.collector_number}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                    {offer.finish}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  ${offer.price_usd.toFixed(2)} USD
                  <br />
                  <span className="text-xs text-gray-500">
                    ${(offer.price_usd * fxRate).toFixed(0)} CLP
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <TextInput
                    type="number"
                    min={0}
                    defaultValue={offer.quantity}
                    onBlur={(e) => {
                      const newQty = Number(e.target.value);
                      if (newQty !== offer.quantity) {
                        handleUpdateStock(offer.id, newQty);
                      }
                    }}
                    className="w-20"
                  />
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      offer.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {offer.active ? 'Activo' : 'Inactivo'}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Button
                    size="xs"
                    color={offer.active ? 'failure' : 'success'}
                    onClick={() => handleToggleActive(offer.id, offer.active)}
                  >
                    {offer.active ? 'Desactivar' : 'Activar'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredOffers.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No se encontraron cartas
          </div>
        )}
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
