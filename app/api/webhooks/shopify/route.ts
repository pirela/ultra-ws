import { NextRequest, NextResponse } from 'next/server';
import { ShopifyOrder } from '@/types';
import { verifyShopifyWebhook, processShopifyOrder } from '@/lib/shopify';
import { buildWhatsAppMessage } from '@/lib/message-builder';
import { UltraMsgClient } from '@/lib/ultramsg';
import { delay, getConfiguredDelay } from '@/lib/delay';

// Configurar para evitar timeout en Vercel (máximo 60 segundos para funciones gratuitas)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const SHOPIFY_WEBHOOK_SECRET = '41fe5a71c6fc5c1f35b740fb678cedb236c346a0a613a0e4b288093bc79cb659'; // TODO: Mover a variable de entorno
const STORE_NAME = process.env.STORE_NAME || 'Mi Tienda';

/**
 * Webhook de Shopify para recibir nuevas órdenes
 * POST /api/webhooks/shopify
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que existe el secreto
    if (!SHOPIFY_WEBHOOK_SECRET) {
      console.error('SHOPIFY_WEBHOOK_SECRET no está configurado');
      return NextResponse.json(
        { error: 'Configuración faltante' },
        { status: 500 }
      );
    }
    console.log("111111")
    // Obtener el body como texto para verificar la firma
    const body = await request.text();
    const signature = request.headers.get('x-shopify-hmac-sha256');

    // Verificar la firma del webhook
    if (signature && !verifyShopifyWebhook(body, signature, SHOPIFY_WEBHOOK_SECRET)) {
      console.error('Firma del webhook inválida');
      return NextResponse.json(
        { error: 'Firma inválida' },
        { status: 401 }
      );
    }

    // Parsear la orden
    const order: ShopifyOrder = JSON.parse(body);
    console.log("111112")
    // Validar que sea una orden nueva
    if (!order.id || !order.line_items || order.line_items.length === 0) {
      return NextResponse.json(
        { error: 'Orden inválida' },
        { status: 400 }
      );
    }

    console.log(`Nueva orden recibida: ${order.name} (ID: ${order.id})`);

    // IMPORTANTE: En Vercel, si respondemos antes de completar la tarea asíncrona,
    // la función puede terminar y no completar el envío.
    // Por eso esperamos a que se complete el envío (sin delay para evitar timeout)
    try {
      await processOrderAsync(order);
      console.log('✅ Proceso completado, respondiendo a Shopify');
    } catch (error: any) {
      console.error('❌ Error en processOrderAsync, pero respondiendo a Shopify:', error);
      // Continuamos y respondemos a Shopify aunque haya error
    }

    // Responder a Shopify después de intentar enviar el mensaje
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error procesando webhook de Shopify:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Procesa la orden de forma asíncrona
 * Aplica el delay configurado y envía el mensaje de WhatsApp
 */
async function processOrderAsync(order: ShopifyOrder) {
  try {
    // Obtener el delay configurado
    const delayMinutes = getConfiguredDelay();
    console.log(`Esperando ${delayMinutes} minuto(s) antes de enviar el mensaje...`);

    // Aplicar delay
    //await delay(delayMinutes);

    // Procesar la orden
    const processedOrder = processShopifyOrder(order);

    if (!processedOrder) {
        console.log("11111300")
      console.error('No se pudo procesar la orden:', order.id);
      return;
    }

    // Construir el mensaje
    const messageText = buildWhatsAppMessage(processedOrder, STORE_NAME);
    
    // Inicializar cliente de UltraMsg
    console.log('🔧 Inicializando cliente UltraMsg...');
    const ultramsgClient = new UltraMsgClient();
    console.log('✅ Cliente UltraMsg inicializado');
    console.log('📱 Teléfono del cliente:', processedOrder.customerPhone);
    console.log('🖼️ Tiene imagen:', !!processedOrder.productImage);
    console.log('📝 Mensaje construido, longitud:', messageText.length);
    
    // Enviar mensaje con imagen si está disponible
    if (processedOrder.productImage) {
      console.log(`📤 Enviando mensaje con imagen a ${processedOrder.customerPhone}`);
      const result = await ultramsgClient.sendImageMessage(
        processedOrder.customerPhone,
        processedOrder.productImage,
        messageText
      );
      console.log('✅ Resultado del envío con imagen:', JSON.stringify(result, null, 2));
    } else {
      console.log(`📤 Enviando mensaje de texto a ${processedOrder.customerPhone}`);
      const result = await ultramsgClient.sendTextMessage(
        processedOrder.customerPhone,
        messageText
      );
      console.log('✅ Resultado del envío de texto:', JSON.stringify(result, null, 2));
    }

    console.log(`✅✅✅ Mensaje enviado exitosamente para la orden ${processedOrder.orderNumber}`);
  } catch (error: any) {
    console.error('❌ Error procesando orden asíncronamente:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data));
    }
    // Re-lanzar el error para que Vercel lo registre
    throw error;
  }
}

