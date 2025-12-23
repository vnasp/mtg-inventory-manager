// Script para verificar configuración de MercadoPago
// Ejecutar con: node scripts/testMercadoPago.mjs

import { MercadoPagoConfig, Preference } from 'mercadopago';

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

console.log('🔧 Verificando configuración de MercadoPago...\n');
console.log(
  'Access Token:',
  accessToken ? '✓ Configurado' : '✗ No configurado'
);

if (!accessToken || accessToken === 'TEST-tu-access-token-aqui') {
  console.log('');
  console.log('❌ Access Token no configurado');
  console.log('');
  console.log('Por favor:');
  console.log('1. Ve a: https://www.mercadopago.cl/developers/panel');
  console.log('2. Obtén tu Access Token (TEST-... para pruebas)');
  console.log('3. Actualiza el archivo .env.local con:');
  console.log('   MERCADOPAGO_ACCESS_TOKEN=tu-access-token');
  console.log('');
  console.log('Más info: COMO_OBTENER_CREDENCIALES_MERCADOPAGO.md');
  process.exit(1);
}

console.log('');

try {
  // Inicializar cliente
  const client = new MercadoPagoConfig({
    accessToken: accessToken,
  });

  console.log('✅ Cliente MercadoPago inicializado correctamente');

  // Crear preferencia de prueba
  const preference = new Preference(client);

  const testPreference = await preference.create({
    body: {
      items: [
        {
          title: 'Test Card',
          quantity: 1,
          unit_price: 1000,
          currency_id: 'CLP',
        },
      ],
      back_urls: {
        success: 'http://localhost:3000/success',
        failure: 'http://localhost:3000/failure',
        pending: 'http://localhost:3000/pending',
      },
      auto_return: 'approved',
    },
  });

  console.log('✅ Preferencia de prueba creada exitosamente');
  console.log('Preference ID:', testPreference.id);
  console.log('Init Point:', testPreference.init_point);
  console.log('');
  console.log('🎉 ¡MercadoPago está configurado correctamente!');
  console.log('');
  console.log('📝 Próximos pasos:');
  console.log('1. Inicia tu aplicación: npm run dev');
  console.log('2. Agrega productos al carrito');
  console.log('3. Completa el checkout');
  console.log('4. Serás redirigido a MercadoPago para pagar');
  console.log('');
  console.log('💳 Tarjetas de prueba:');
  console.log('Aprobada: 5031 7557 3453 0604');
  console.log('Rechazada: 5031 4332 1540 6351');
  console.log('Pendiente: 5031 4363 8825 5763');
  console.log('CVV: 123 | Vencimiento: Cualquier fecha futura');
} catch (error) {
  console.error('❌ Error al configurar MercadoPago:');
  console.error(error.message);
  console.log('');
  console.log('Verifica:');
  console.log('1. Que las credenciales sean correctas');
  console.log('2. Que tengas conexión a internet');
  console.log('3. Que el Client Secret sea válido');
}
