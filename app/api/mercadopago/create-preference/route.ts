import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Inicializar MercadoPago con las credenciales
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const body = await request.json();
    const { orderId, orderNumber, items, total, currency, customer } = body;

    // Validar datos requeridos
    if (!orderId || !orderNumber || !items || !total) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Crear preferencia de pago en MercadoPago
    const preference = new Preference(client);

    const preferenceData = {
      items: items.map((item: any) => ({
        title: item.card_name,
        description:
          `${item.card_set_name || ''} - ${item.condition || ''} ${item.foil || ''}`.trim(),
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: currency === 'CLP' ? 'CLP' : 'USD',
      })),
      payer: {
        name: customer.firstName || undefined,
        surname: customer.lastName || undefined,
        email: customer.email,
        phone: customer.phone
          ? {
              number: customer.phone,
            }
          : undefined,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation/${orderNumber}?payment=success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation/${orderNumber}?payment=failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation/${orderNumber}?payment=pending`,
      },
      auto_return: 'approved' as const,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`,
      external_reference: orderNumber,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
      },
      statement_descriptor: 'VUDUGAMING.CL',
    };

    const result = await preference.create({ body: preferenceData });

    // Guardar preference_id en la orden
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_reference: result.id,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
    }

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (error: any) {
    console.error('Error creating preference:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear preferencia de pago' },
      { status: 500 }
    );
  }
}
