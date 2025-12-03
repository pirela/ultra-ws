import { NextRequest, NextResponse } from 'next/server';
import { ShopifyAbandonedCheckout } from '@/types';
import { verifyShopifyWebhook } from '@/lib/shopify';
import { normalizePhoneNumber, buildAbandonedCheckoutMessage } from '@/lib/message-builder';
import { UltraMsgClient } from '@/lib/ultramsg';
import { isCheckoutProcessed, markCheckoutAsProcessed } from '@/lib/checkout-tracker';
import { getProductImage } from '@/lib/product-mapping';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || '41fe5a71c6fc5c1f35b740fb678cedb236c346a0a613a0e4b288093bc79cb659';
const STORE_NAME = process.env.STORE_NAME || 'Mi Tienda';

/**
 * Webhook de Shopify para recibir carritos abandonados
 * POST /api/webhooks/shopify/abandoned-checkout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-shopify-hmac-sha256');

    // Verificar la firma
    if (signature && !verifyShopifyWebhook(body, signature, SHOPIFY_WEBHOOK_SECRET)) {
      console.error('Firma del webhook inválida');
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }

    // Parsear el checkout abandonado
    const checkout: ShopifyAbandonedCheckout = JSON.parse(body);
    
    console.log(`Carrito abandonado recibido: ${checkout.id}`);

    // Procesar el carrito abandonado
    await processAbandonedCheckout(checkout);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error procesando webhook de carrito abandonado:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

async function processAbandonedCheckout(checkout: ShopifyAbandonedCheckout) {
  try {
    // Verificar si ya procesamos este checkout (anti-spam)
    const checkoutId = checkout.id.toString();
    if (isCheckoutProcessed(checkoutId)) {
      console.log(`Checkout ${checkoutId} ya fue procesado, ignorando...`);
      return;
    }

    // IMPORTANTE: Marcar como procesado INMEDIATAMENTE para prevenir duplicados
    // si Shopify reenvía el webhook antes de que termine el procesamiento
    markCheckoutAsProcessed(checkoutId);
    console.log(`Checkout ${checkoutId} marcado como procesado para prevenir duplicados`);

    // Obtener información del cliente
    const customerName = checkout.customer?.first_name || 
                        checkout.billing_address?.first_name || 
                        'Cliente';
    
    // Obtener teléfono
    let customerPhone = normalizePhoneNumber(
      checkout.customer?.phone || 
      checkout.billing_address?.phone || 
      checkout.phone
    );

    // Validar que tengamos teléfono y productos
    if (!customerPhone) {
      console.log(`Checkout ${checkoutId} sin teléfono, no se puede enviar WhatsApp`);
      return;
    }

    if (!checkout.line_items || checkout.line_items.length === 0) {
      console.log(`Checkout ${checkoutId} sin productos, ignorando...`);
      return;
    }

    // Construir lista de productos
    const products = checkout.line_items.map(item => ({
      name: item.title,
      quantity: item.quantity,
    }));

    // Obtener el primer producto para la imagen
    const firstProduct = checkout.line_items[0];
    const productImage = getProductImage(
      firstProduct.title,
      firstProduct.sku,
      firstProduct.image
    );

    // Construir dirección de envío si está disponible
    let shippingAddress = 'No especificada';
    if (checkout.billing_address) {
      const addr = checkout.billing_address;
      const parts = [
        addr.address1,
        addr.address2,
        addr.city,
        addr.province,
        addr.country,
        addr.zip,
      ].filter(Boolean);
      
      if (parts.length > 0) {
        shippingAddress = parts.join(', ');
      }
    }

    // Construir mensaje (pasar también el objeto de dirección para validación)
    const message = buildAbandonedCheckoutMessage(
      customerName,
      products,
      checkout.total_price,
      checkout.currency,
      STORE_NAME,
      shippingAddress,
      checkout.billing_address
    );

    // Enviar mensaje de WhatsApp
    const ultramsgClient = new UltraMsgClient();
    // Para pruebas: descomentar la siguiente línea para usar número hardcodeado
    customerPhone = '3502235005';
    
    // Enviar mensaje con imagen si está disponible
    if (productImage) {
      console.log(`📤 Enviando mensaje con imagen a ${customerPhone}`);
      await ultramsgClient.sendImageMessage(
        customerPhone,
        productImage,
        message
      );
    } else {
      console.log(`📤 Enviando mensaje de texto a ${customerPhone}`);
      await ultramsgClient.sendTextMessage(customerPhone, message);
    }
    
    console.log(`✅ Mensaje de carrito abandonado enviado a ${customerPhone} para checkout ${checkoutId}`);
  } catch (error: any) {
    console.error('Error procesando carrito abandonado:', error);
    throw error;
  }
}

