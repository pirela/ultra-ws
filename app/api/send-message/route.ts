import { NextRequest, NextResponse } from 'next/server';
import { UltraMsgClient } from '@/lib/ultramsg';

/**
 * Endpoint para enviar mensajes de prueba manualmente
 * POST /api/send-message
 * 
 * Body:
 * {
 *   "to": "+573001234567",
 *   "message": "Mensaje de prueba",
 *   "image": "https://url-de-imagen.jpg" // opcional
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, image } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Se requieren los campos "to" y "message"' },
        { status: 400 }
      );
    }

    const ultramsgClient = new UltraMsgClient();

    if (image) {
      const result = await ultramsgClient.sendImageMessage(to, image, message);
      return NextResponse.json({ 
        success: true, 
        result,
        message: 'Mensaje con imagen enviado exitosamente' 
      });
    } else {
      const result = await ultramsgClient.sendTextMessage(to, message);
      return NextResponse.json({ 
        success: true, 
        result,
        message: 'Mensaje de texto enviado exitosamente' 
      });
    }
  } catch (error: any) {
    console.error('Error enviando mensaje:', error);
    return NextResponse.json(
      { 
        error: 'Error enviando mensaje',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

