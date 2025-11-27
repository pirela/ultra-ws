// Set en memoria para trackear checkouts procesados
// Nota: Se reinicia al reiniciar el servidor, pero es suficiente para evitar spam en la misma sesión
const processedCheckouts = new Set<string>();

// Límite máximo para evitar uso excesivo de memoria
const MAX_CHECKOUTS = 10000;

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
  if (processedCheckouts.size >= MAX_CHECKOUTS) {
    // Si alcanzamos el límite, limpiar los primeros 1000
    const toDelete = Array.from(processedCheckouts).slice(0, 1000);
    toDelete.forEach(id => processedCheckouts.delete(id));
  }
  
  processedCheckouts.add(checkoutId);
}

