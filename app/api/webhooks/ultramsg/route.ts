import { NextRequest, NextResponse } from 'next/server';
import { UltraMsgWebhook } from '@/types';

/**
 * Webhook de UltraMsg para recibir mensajes de WhatsApp
 * POST /api/webhooks/ultramsg
 */
export async function POST(request: NextRequest) {
  try {
    const body: UltraMsgWebhook = await request.json();

    console.log('Mensaje recibido de UltraMsg:', {
      event: body.event,
      from: body.data?.from,
      to: body.data?.to,
      body: body.data?.body,
      type: body.data?.type,
    });

    // Aquí puedes agregar lógica adicional para procesar los mensajes recibidos
    // Por ejemplo: guardar en base de datos, responder automáticamente, etc.

    // Por ahora solo logueamos el mensaje
    if (body.event === 'message') {
      const messageData = body.data;
      
      if (messageData) {
        console.log(`Mensaje de ${messageData.from} a ${messageData.to}: ${messageData.body}`);
        
        // TODO: En futuras versiones, aquí se puede:
        // - Guardar el mensaje en base de datos
        // - Implementar respuestas automáticas
        // - Actualizar estadísticas del dashboard
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error procesando webhook de UltraMsg:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET para verificar que el endpoint está funcionando
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Webhook de UltraMsg está funcionando',
    timestamp: new Date().toISOString(),
  });
}

