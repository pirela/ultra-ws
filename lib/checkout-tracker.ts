// Set en memoria para trackear checkouts y órdenes procesados
// Nota: Se reinicia al reiniciar el servidor, pero es suficiente para evitar spam en la misma sesión
const processedCheckouts = new Set<string>();
const processedOrders = new Set<string>();

// Límite máximo para evitar uso excesivo de memoria
const MAX_ITEMS = 10000;

/**
 * Verifica si un checkout ya fue procesado
 */
export function isCheckoutProcessed(checkoutId: string): boolean {
  return processedCheckouts.has(checkoutId);
}

/**
 * Marca un checkout como procesado
 */
export function markCheckoutAsProcessed(checkoutId: string): void {
  // Limitar el tamaño del Set para evitar uso excesivo de memoria
  if (processedCheckouts.size >= MAX_ITEMS) {
    // Si alcanzamos el límite, limpiar los primeros 1000
    const toDelete = Array.from(processedCheckouts).slice(0, 1000);
    toDelete.forEach(id => processedCheckouts.delete(id));
  }
  
  processedCheckouts.add(checkoutId);
}

/**
 * Verifica si una orden ya fue procesada
 */
export function isOrderProcessed(orderId: string): boolean {
  return processedOrders.has(orderId);
}

/**
 * Marca una orden como procesada
 */
export function markOrderAsProcessed(orderId: string): void {
  // Limitar el tamaño del Set para evitar uso excesivo de memoria
  if (processedOrders.size >= MAX_ITEMS) {
    // Si alcanzamos el límite, limpiar los primeros 1000
    const toDelete = Array.from(processedOrders).slice(0, 1000);
    toDelete.forEach(id => processedOrders.delete(id));
  }
  
  processedOrders.add(orderId);
}

