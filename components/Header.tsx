'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Badge, Button } from 'flowbite-react';
import { HiShoppingCart } from 'react-icons/hi';
import Menu from './Menu';
import CartDrawer from './CartDrawer';
import { createClient } from '@/utils/supabase/client';

type Props = {
  fxRate?: number;
  minCardPriceClp?: number;
};

export default function Header({ fxRate, minCardPriceClp }: Props) {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        const count =
          data.items?.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
          ) || 0;
        setCartCount(count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    // Obtener usuario actual
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchCartCount();
      }
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCartCount();
      } else {
        setCartCount(0);
      }
    });

    // Escuchar actualizaciones del carrito
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo a la izquierda */}
            <div className="shrink-0">
              <a href="/" className="block">
                <Image
                  src="/assets/img/logo.png"
                  width={220}
                  height={90}
                  alt="VuduGaming Logo"
                  className="h-24 w-auto sm:h-16"
                  priority
                />
              </a>
            </div>

            {/* Menú y carrito a la derecha */}
            <div className="flex items-center gap-4">
              <Menu />

              {/* Botón del carrito (solo visible si hay usuario) */}
              {user && (
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative rounded-lg p-2 text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
                >
                  <HiShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <Badge
                      color="failure"
                      size="sm"
                      className="absolute -top-1 -right-1 min-w-5 rounded-full px-1"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Drawer del carrito */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        fxRate={fxRate}
        minCardPriceClp={minCardPriceClp}
      />
    </>
  );
}
