import crypto from 'crypto';
import { ShopifyOrder, ProcessedOrder } from '@/types';
import { getProductImage } from './product-mapping';
import { normalizePhoneNumber } from './message-builder';

/**
 * Procesa una orden de Shopify y extrae la información necesaria
 */
export function processShopifyOrder(order: ShopifyOrder): ProcessedOrder | null {

  // Obtener nombre del cliente
  const customerName = order.customer?.first_name || 
                      order.shipping_address?.first_name || 
                      'Cliente';

  // Obtener teléfono del cliente
  const customerPhone = normalizePhoneNumber(
    order.customer?.phone || 
    order.shipping_address?.phone || 
    order.phone
  );

  if (!customerPhone) {
    console.error('No se encontró número de teléfono para la orden:', order.id);
    return null;
  }

  // Procesar productos
  const products = order.line_items.map(item => ({
    name: item.title,
    quantity: item.quantity,
    price: item.price,
  }));

  // Obtener el primer producto para la imagen
  const firstProduct = order.line_items[0];
  const productImage = getProductImage(
    firstProduct.title,
    firstProduct.sku,
    firstProduct.image
  );

  // Construir dirección de envío
  let shippingAddress = 'No especificada';
  if (order.shipping_address) {
    const addr = order.shipping_address;
    const parts = [
      addr.address1,
      addr.address2,
      addr.city,
      addr.province,
      //addr.country,
      //addr.zip,
    ].filter(Boolean);
    
    shippingAddress = parts.join(', ');
  }

  return {
    orderNumber: order.name,
    customerName,
    customerPhone,
    total: order.total_price,
    currency: order.currency,
    products,
    shippingAddress,
    productImage,
  };
}

/**
 * Valida la firma del webhook de Shopify
 */
export function verifyShopifyWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const hash = hmac.update(body, 'utf8').digest('base64');
  return hash === signature;
}

