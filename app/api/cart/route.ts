import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET: Obtener todos los items del carrito del usuario
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('cart')
      .select(
        `
        *,
        card_offers (
          *,
          cards (*)
        )
      `
      )
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ items: data ?? [] });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: error.message ?? 'Error al obtener el carrito' },
      { status: 500 }
    );
  }
}

// POST: Agregar item al carrito o incrementar cantidad
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { card_offer_id, quantity = 1 } = body;

    if (!card_offer_id) {
      return NextResponse.json(
        { error: 'card_offer_id es requerido' },
        { status: 400 }
      );
    }

    // Verificar si el item ya existe en el carrito
    const { data: existing } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('card_offer_id', card_offer_id)
      .single();

    if (existing) {
      // Si existe, incrementar la cantidad
      const { data, error } = await supabase
        .from('cart')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select(
          `
          *,
          card_offers (
            *,
            cards (*)
          )
        `
        )
        .single();

      if (error) throw error;

      return NextResponse.json({ item: data, updated: true });
    } else {
      // Si no existe, crear nuevo item
      const { data, error } = await supabase
        .from('cart')
        .insert({
          user_id: userData.user.id,
          card_offer_id,
          quantity,
        })
        .select(
          `
          *,
          card_offers (
            *,
            cards (*)
          )
        `
        )
        .single();

      if (error) throw error;

      return NextResponse.json({ item: data, created: true });
    }
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: error.message ?? 'Error al agregar al carrito' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar item del carrito o decrementar cantidad
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cart_id = searchParams.get('id');
    const decrementOnly = searchParams.get('decrement') === 'true';

    if (!cart_id) {
      return NextResponse.json(
        { error: 'ID del carrito es requerido' },
        { status: 400 }
      );
    }

    if (decrementOnly) {
      // Decrementar cantidad
      const { data: existing } = await supabase
        .from('cart')
        .select('*')
        .eq('id', cart_id)
        .eq('user_id', userData.user.id)
        .single();

      if (!existing) {
        return NextResponse.json(
          { error: 'Item no encontrado' },
          { status: 404 }
        );
      }

      if (existing.quantity <= 1) {
        // Si la cantidad es 1 o menos, eliminar el item
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('id', cart_id)
          .eq('user_id', userData.user.id);

        if (error) throw error;

        return NextResponse.json({ deleted: true });
      } else {
        // Si hay más de 1, decrementar
        const { data, error } = await supabase
          .from('cart')
          .update({ quantity: existing.quantity - 1 })
          .eq('id', cart_id)
          .eq('user_id', userData.user.id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ item: data, decremented: true });
      }
    } else {
      // Eliminar item completamente
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cart_id)
        .eq('user_id', userData.user.id);

      if (error) throw error;

      return NextResponse.json({ deleted: true });
    }
  } catch (error: any) {
    console.error('Error deleting from cart:', error);
    return NextResponse.json(
      { error: error.message ?? 'Error al eliminar del carrito' },
      { status: 500 }
    );
  }
}
