import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createAdminClient } from '@/utils/supabase/admin';

// Inicializar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Webhook received:', body);

    // MercadoPago envía diferentes tipos de notificaciones
    const { type, data } = body;

    // Solo procesamos notificaciones de pagos
    if (type !== 'payment') {
      return NextResponse.json({ received: true });
    }

    const paymentId = data.id;

    // Obtener información completa del pago
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    console.log('Payment info:', paymentInfo);

    const orderNumber = paymentInfo.external_reference;
    const status = paymentInfo.status;
    const paymentMethod = paymentInfo.payment_method_id;

    if (!orderNumber) {
      console.error('No order number in payment');
      return NextResponse.json({ received: true });
    }

    // Usar cliente admin de Supabase para actualizar sin autenticación
    const supabase = createAdminClient();

    // Buscar la orden
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (fetchError || !order) {
      console.error('Order not found:', orderNumber);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Mapear estados de MercadoPago a nuestro sistema
    let paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' = 'pending';
    let orderStatus: 'pending' | 'processing' | 'cancelled' = 'pending';

    switch (status) {
      case 'approved':
        paymentStatus = 'paid';
        orderStatus = 'processing';
        break;
      case 'rejected':
      case 'cancelled':
        paymentStatus = 'failed';
        orderStatus = 'cancelled';
        break;
      case 'refunded':
      case 'charged_back':
        paymentStatus = 'refunded';
        orderStatus = 'cancelled';
        break;
      case 'in_process':
      case 'in_mediation':
      case 'pending':
        paymentStatus = 'pending';
        orderStatus = 'pending';
        break;
    }

    // Actualizar la orden
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        payment_reference: paymentInfo.id?.toString(),
        status: orderStatus,
        paid_at: status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Error updating order' },
        { status: 500 }
      );
    }

    console.log(
      `Order ${orderNumber} updated: payment=${paymentStatus}, order=${orderStatus}`
    );

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook error' },
      { status: 500 }
    );
  }
}
