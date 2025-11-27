import { ProcessedOrder } from '@/types';

/**
 * Construye el mensaje de WhatsApp con el formato especificado
 */
export function buildWhatsAppMessage(order: ProcessedOrder, storeName: string): string {
  // Construir lista de productos
  const productsList = order.products
    .map(p => `*${p.quantity} x ${p.name}*`)
    .join('\n');

  // Construir dirección completa
  const address = order.shippingAddress || 'No especificada';

  // Construir mensaje
  const message = `👋 Hola ${order.customerName}, gracias por tu compra en *${storeName}*

Este mensaje es para confirmar tu pedido con nosotros y consta de:
${productsList} por un valor de: *${order.total} ${order.currency}*

Tus datos de envío son los siguientes:
${address}

*¿Te gustaría completar tu compra? Estamos aquí para ayudarte 😊*`;

  return message;
}

/**
 * Normaliza el número de teléfono agregando el código de país +57
 * Valida si ya tiene +57 o empieza con 57 para no duplicarlo
 */
export function normalizePhoneNumber(phone: string | null): string | null {
  if (!phone) return null;
  
  // Remover espacios, guiones y paréntesis
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si ya tiene +57, retornar tal cual (solo limpiado)
  if (cleaned.startsWith('+57')) {
    return cleaned;
  }
  
  // Si ya empieza con 57 (sin el +), agregar solo el +
  if (cleaned.startsWith('57')) {
    return `+${cleaned}`;
  }
  
  // Si no tiene código de país, agregar +57
  return `+57${cleaned}`;
}

/**
 * Construye el mensaje de WhatsApp para carrito abandonado
 */
export function buildAbandonedCheckoutMessage(
  customerName: string,
  products: { name: string; quantity: number }[],
  total: string,
  currency: string,
  storeName: string,
  shippingAddress?: string | null
): string {
  // Construir lista de productos
  const productsList = products
    .map(p => `*${p.quantity} x ${p.name}*`)
    .join('\n');

  // Construir mensaje base
  let message = `👋 Hola ${customerName}, vimos que dejaste productos en tu carrito en *${storeName}*

${productsList}

Total: *${total} ${currency}*`;

  // Agregar dirección si está disponible
  if (shippingAddress && shippingAddress !== 'No especificada') {
    message += `\n\nTus datos de envío son los siguientes:\n${shippingAddress}`;
  }

  message += `\n\n*¿Te gustaría completar tu compra? Estamos aquí para ayudarte 😊*`;

  return message;
}

