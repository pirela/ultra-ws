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

*¿Nos confirma su pedido?*`;

  return message;
}

/**
 * Normaliza el número de teléfono agregando el código de país +57
 */
export function normalizePhoneNumber(phone: string | null): string | null {
  if (!phone) return null;
  
  // Remover espacios, guiones y paréntesis
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si ya tiene código de país, removerlo
  if (cleaned.startsWith('57')) {
    cleaned = cleaned.substring(2);
  }
  
  // Agregar +57 al inicio
  return `+57${cleaned}`;
}

