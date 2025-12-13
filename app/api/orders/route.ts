import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST: Crear nueva orden
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user ?? null;

    const body = await request.json();
    const { customer, items, subtotal, tax, shipping_cost, total, currency } =
      body;

    // Validaciones
    if (!customer.email || !customer.address || !customer.city) {
      return NextResponse.json(
        { error: 'Datos de cliente incompletos' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      );
    }

    // Crear orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        customer_email: customer.email,
        customer_first_name: customer.firstName || null,
        customer_last_name: customer.lastName || null,
        customer_phone: customer.phone || null,
        shipping_address: customer.address,
        shipping_city: customer.city,
        shipping_postal_code: customer.postalCode || null,
        shipping_country: customer.country || 'Chile',
        shipping_method: null, // Pendiente integración
        shipping_cost: shipping_cost || 0,
        payment_method: null, // Pendiente integración
        payment_status: 'pending',
        subtotal,
        tax: tax || 0,
        total,
        currency: currency || 'CLP',
        status: 'pending',
        customer_notes: customer.notes || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Obtener detalles completos de los items para el snapshot
    const itemsWithDetails = await Promise.all(
      items.map(async (item: any) => {
        const { data: offer } = await supabase
          .from('card_offers')
          .select('*, cards(*)')
          .eq('id', item.card_offer_id)
          .single();

        if (!offer) {
          throw new Error(`Card offer ${item.card_offer_id} not found`);
        }

        return {
          order_id: order.id,
          card_offer_id: item.card_offer_id,
          card_name: offer.cards.name,
          card_set_name: offer.cards.set_name,
          card_image_url: offer.cards.image_url,
          unit_price: item.unit_price,
          quantity: item.quantity,
          subtotal: item.unit_price * item.quantity,
          condition: offer.condition,
          foil: offer.foil,
          language: offer.language,
        };
      })
    );

    // Crear items de la orden
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithDetails);

    if (itemsError) throw itemsError;

    // Si el usuario está autenticado, limpiar su carrito
    if (user) {
      await supabase.from('cart').delete().eq('user_id', user.id);
    }

    return NextResponse.json({ order, message: 'Orden creada exitosamente' });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message ?? 'Error al crear la orden' },
      { status: 500 }
    );
  }
}

// GET: Obtener órdenes del usuario
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user ?? null;

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items (*)
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ orders: data ?? [] });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message ?? 'Error al obtener las órdenes' },
      { status: 500 }
    );
  }
}
