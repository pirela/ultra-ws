import { ProcessedOrder } from '@/types';

/**
 * Formatea un valor monetario con separadores de miles (punto) y sin decimales
 * @param value - Valor como string (ej: "50000.00")
 * @returns Valor formateado (ej: "50.000")
 */
export function formatCurrency(value: string): string {
  // Convertir a número y redondear (eliminar decimales)
  const numValue = Math.round(parseFloat(value));
  
  // Formatear con separadores de miles usando punto
  return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

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

  // Formatear el total con separadores de miles
  const formattedTotal = formatCurrency(order.total);

  // Construir mensaje
  const message = `👋 Hola ${order.customerName}, gracias por tu compra en *${storeName}*

Este mensaje es para confirmar tu pedido con nosotros y consta de:
${productsList} por un valor de: *${formattedTotal} ${order.currency}*

Tus datos de envío son los siguientes:
${address}

*¿Nos confirma su pedido?*`;

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
 * Valida si una dirección está completa (tiene todos los campos necesarios)
 * Nota: Ignora country, zip y address2 (address2 es opcional)
 * Solo valida address1, city y province
 */
function isAddressComplete(address: {
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  zip?: string | null;
} | null): boolean {
  if (!address) return false;
  
  // Validar solo los campos principales (ignorando country, zip y address2)
  // address2 es opcional y no se valida
  return !!(
    address.address1 &&
    address.city &&
    address.province
  );
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
  shippingAddress?: string | null,
  addressObject?: {
    address1?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
    zip?: string | null;
  } | null
): string {
  // Construir lista de productos
  const productsList = products
    .map(p => `*${p.quantity} x ${p.name}*`)
    .join('\n');

  // Formatear el total con separadores de miles
  const formattedTotal = formatCurrency(total);

  // Construir mensaje base
  let message = `👋 Hola ${customerName}, vimos que dejaste productos en tu carrito en *${storeName}*

${productsList}

Total: *${formattedTotal} ${currency}*`;

  // Agregar dirección solo si está completa (todos los campos)
  if (shippingAddress && 
      shippingAddress !== 'No especificada' && 
      addressObject && 
      isAddressComplete(addressObject)) {
    message += `\n\nTus datos de envío son los siguientes:\n${shippingAddress}`;
  }

  message += `\n\n*¿Te gustaría completar tu compra? Estamos aquí para ayudarte 😊*`;

  return message;
}

