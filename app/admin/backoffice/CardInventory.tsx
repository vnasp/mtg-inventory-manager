"use client";
import React, { useState, useEffect } from 'react';
import { Button, TextInput } from 'flowbite-react';
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cards');
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

      // Actualizar localmente
      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === offerId ? { ...offer, quantity: newQuantity } : offer
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
      <div className="bg-panelLight rounded-2xl p-6 text-center shadow-2xl">
        <p className="text-textDark">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="bg-panelLight rounded-2xl p-6 shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-textDark text-xl font-bold">
          Inventario de Cartas
        </h2>
        <div className="w-64">
          <TextInput
            placeholder="Buscar por nombre o set..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Imagen</th>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Set</th>
              <th className="px-6 py-3">Finish</th>
              <th className="px-6 py-3">Precio USD</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOffers.map((offer) => (
              <tr key={offer.id} className="bg-white hover:bg-gray-50">
                <td className="px-6 py-4">
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
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {offer.cards.name}
                </td>
                <td className="px-6 py-4">
                  {offer.cards.set_code.toUpperCase()} #
                  {offer.cards.collector_number}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                    {offer.finish}
                  </span>
                </td>
                <td className="px-6 py-4">
                  ${offer.price_usd.toFixed(2)} USD
                  <br />
                  <span className="text-xs text-gray-500">
                    ${(offer.price_usd * fxRate).toFixed(0)} CLP
                  </span>
                </td>
                <td className="px-6 py-4">
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
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      offer.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {offer.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Button
                    size="xs"
                    color={offer.active ? 'failure' : 'success'}
                    onClick={() => handleToggleActive(offer.id, offer.active)}
                  >
                    {offer.active ? 'Desactivar' : 'Activar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
