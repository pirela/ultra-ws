import { NextRequest, NextResponse } from 'next/server';
import { ShopifyOrder } from '@/types';
import { verifyShopifyWebhook, processShopifyOrder } from '@/lib/shopify';
import { buildWhatsAppMessage } from '@/lib/message-builder';
import { UltraMsgClient } from '@/lib/ultramsg';
import { delay, getConfiguredDelay } from '@/lib/delay';

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
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

    // Validar que sea una orden nueva
    if (!order.id || !order.line_items || order.line_items.length === 0) {
      return NextResponse.json(
        { error: 'Orden inválida' },
        { status: 400 }
      );
    }

    console.log(`Nueva orden recibida: ${order.name} (ID: ${order.id})`);

    // Procesar la orden de forma asíncrona
    // No esperamos a que se complete para responder a Shopify
    processOrderAsync(order);

    // Responder inmediatamente a Shopify
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
    await delay(delayMinutes);

    // Procesar la orden
    const processedOrder = processShopifyOrder(order);

    if (!processedOrder) {
      console.error('No se pudo procesar la orden:', order.id);
      return;
    }

    // Construir el mensaje
    const messageText = buildWhatsAppMessage(processedOrder, STORE_NAME);

    // Inicializar cliente de UltraMsg
    const ultramsgClient = new UltraMsgClient();

    // Enviar mensaje con imagen si está disponible
    if (processedOrder.productImage) {
      console.log(`Enviando mensaje con imagen a ${processedOrder.customerPhone}`);
      await ultramsgClient.sendImageMessage(
        processedOrder.customerPhone,
        processedOrder.productImage,
        messageText
      );
    } else {
      console.log(`Enviando mensaje de texto a ${processedOrder.customerPhone}`);
      await ultramsgClient.sendTextMessage(
        processedOrder.customerPhone,
        messageText
      );
    }

    console.log(`Mensaje enviado exitosamente para la orden ${processedOrder.orderNumber}`);
  } catch (error: any) {
    console.error('Error procesando orden asíncronamente:', error);
  }
}

