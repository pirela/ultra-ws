/**
 * Espera un número determinado de minutos
 */
export function delay(minutes: number): Promise<void> {
  const milliseconds = minutes * 60 * 1000;
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Obtiene el delay configurado desde las variables de entorno
 * Por defecto: 2 minutos
 * Rango permitido: 1-3 minutos
 */
export function getConfiguredDelay(): number {
  const delayMinutes = parseInt(process.env.MESSAGE_DELAY_MINUTES || '2', 10);
  
  // Validar que esté en el rango permitido (1-3 minutos)
  if (delayMinutes < 1) return 1;
  if (delayMinutes > 3) return 3;
  
  return delayMinutes;
}

