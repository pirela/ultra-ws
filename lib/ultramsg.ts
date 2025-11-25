import axios from 'axios';
import { UltraMsgMessage } from '@/types';

const ULTRAMSG_INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID;
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN;
const ULTRAMSG_API_URL = 'https://api.ultramsg.com';

/**
 * Cliente para interactuar con la API de UltraMsg
 */
export class UltraMsgClient {
  private instanceId: string;
  private token: string;
  private apiUrl: string;

  constructor() {
    if (!ULTRAMSG_INSTANCE_ID || !ULTRAMSG_TOKEN) {
      throw new Error('ULTRAMSG_INSTANCE_ID y ULTRAMSG_TOKEN deben estar configurados');
    }
    
    this.instanceId = ULTRAMSG_INSTANCE_ID;
    this.token = ULTRAMSG_TOKEN;
    this.apiUrl = ULTRAMSG_API_URL;
  }

  /**
   * Envía un mensaje de texto
   */
  async sendTextMessage(to: string, body: string): Promise<any> {
    const url = `${this.apiUrl}/${this.instanceId}/messages/chat`;
    
    try {
      console.log('Enviando mensaje a UltraMsg...');
      console.log('URL:', url);
      console.log('To:', to);
      console.log('Body length:', body.length);
      
      // UltraMsg puede requerir el token como query parameter o en el body
      // Probamos primero con query parameter
      const response = await axios.post(
        url,
        {
          to : '3502235005',
          body,
        },
        {
          params: {
            token: this.token,
          },
        }
      );
      
      console.log('✅ Mensaje enviado exitosamente');
      console.log('Respuesta de UltraMsg:', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      console.error('❌ Error enviando mensaje de texto:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', JSON.stringify(error.response?.data));
      console.error('Error Message:', error.message);
      
      // Si falla con query param, intentar con token en el body
      if (error.response?.status === 401 || error.response?.status === 400) {
        console.log('Intentando con token en el body...');
        try {
          const retryResponse = await axios.post(url, {
            token: this.token,
            to,
            body,
          });
          console.log('✅ Mensaje enviado exitosamente (segundo intento)');
          return retryResponse.data;
        } catch (retryError: any) {
          console.error('❌ Error en segundo intento:', retryError.response?.data || retryError.message);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Envía un mensaje con imagen
   */
  async sendImageMessage(
    to: string,
    imageUrl: string,
    caption: string
  ): Promise<any> {
    const url = `${this.apiUrl}/${this.instanceId}/messages/image`;
    
    try {
      console.log('Enviando mensaje con imagen a UltraMsg...');
      console.log('URL:', url);
      console.log('To:', to);
      console.log('Image URL:', imageUrl);
      console.log('Caption length:', caption.length);
      
      // UltraMsg requiere el token como query parameter
      const response = await axios.post(
        url,
        {
          to,
          image: imageUrl,
          caption,
        },
        {
          params: {
            token: this.token,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      console.log('Respuesta de UltraMsg:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error enviando mensaje con imagen:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      throw error;
    }
  }

  /**
   * Envía un mensaje completo (texto + imagen si está disponible)
   */
  async sendMessage(message: UltraMsgMessage): Promise<any> {
    // Si hay imagen, enviar solo la imagen con caption (el caption contiene el mensaje completo)
    if (message.image) {
      return await this.sendImageMessage(message.to, message.image, message.caption || message.body);
    }
    
    // Si no hay imagen, enviar solo el mensaje de texto
    return await this.sendTextMessage(message.to, message.body);
  }

  /**
   * Verifica el estado de la instancia
   */
  async getInstanceStatus(): Promise<any> {
    const url = `${this.apiUrl}/${this.instanceId}/instance/status`;
    
    try {
      const response = await axios.get(url, {
        params: {
          token: this.token,
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo estado de instancia:', error.response?.data || error.message);
      throw error;
    }
  }
}

