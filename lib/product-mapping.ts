/**
 * Mapeo dinámico de productos a imágenes personalizadas
 * 
 * Si un producto tiene una entrada aquí, se usará esa imagen.
 * Si no, se usará la imagen del producto desde Shopify.
 * 
 * Ejemplo:
 * export const productImageMap: Record<string, string> = {
 *   'producto-1': 'https://ejemplo.com/imagen-producto-1.jpg',
 *   'producto-2': 'https://ejemplo.com/imagen-producto-2.jpg',
 * }
 */

export const productImageMap: Record<string, string> = {
  // Ejemplo: 'SKU-DEL-PRODUCTO': 'https://url-de-la-imagen.jpg',
  // Ejemplo: 'NOMBRE-DEL-PRODUCTO': 'https://url-de-la-imagen.jpg',
}

/**
 * Obtiene la imagen para un producto
 * @param productTitle - Título del producto
 * @param productSku - SKU del producto
 * @param shopifyImage - Imagen desde Shopify
 * @returns URL de la imagen a usar
 */
export function getProductImage(
  productTitle: string,
  productSku: string | null,
  shopifyImage: string | null
): string | null {
  // Primero buscar por SKU
  if (productSku && productImageMap[productSku]) {
    return productImageMap[productSku];
  }
  
  // Luego buscar por título
  if (productImageMap[productTitle]) {
    return productImageMap[productTitle];
  }
  
  // Si no hay mapeo, usar la imagen de Shopify
  return shopifyImage;
}

