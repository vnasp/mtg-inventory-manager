import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST: Crear nueva orden
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Obtener usuario si está autenticado (no falla si no lo está)
    let user = null;
    try {
      const { data: userData, error: authError } =
        await supabase.auth.getUser();
      if (!authError && userData?.user) {
        user = userData.user;
      }
    } catch (authError) {
      // Usuario no autenticado, continuar como invitado
      console.log('Guest checkout - no authenticated user');
    }

    const body = await request.json();
    const {
      customer,
      shipping_method,
      items,
      subtotal,
      tax,
      shipping_cost,
      total,
      currency,
    } = body;

    // Validaciones
    if (!customer.email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Si no es retiro en tienda, validar dirección
    if (shipping_method !== 'store_pickup') {
      if (
        !customer.address ||
        !customer.comuna ||
        !customer.city ||
        !customer.region
      ) {
        return NextResponse.json(
          {
            error:
              'Dirección de envío completa es requerida (Dirección, Comuna, Ciudad, Región)',
          },
          { status: 400 }
        );
      }
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
        shipping_address: customer.address || 'Retiro en tienda',
        shipping_comuna: customer.comuna || null,
        shipping_city: customer.city || 'N/A',
        shipping_region: customer.region || null,
        shipping_country: customer.country || 'Chile',
        shipping_method: shipping_method || 'store_pickup',
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

    // Devolver orden con items
    const orderWithItems = {
      ...order,
      order_items: itemsWithDetails,
    };

    return NextResponse.json({
      order: orderWithItems,
      message: 'Orden creada exitosamente',
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json(
      {
        error: error.message ?? 'Error al crear la orden',
        details: error.details ?? null,
        hint: error.hint ?? null,
      },
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
