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
    
    // TODO: Remover hardcode para producción
    to = '3502235005'; // Número hardcodeado para pruebas
    
    try {
      console.log('📤 Enviando mensaje a UltraMsg...');
      console.log('URL:', url);
      console.log('To (hardcodeado para pruebas):', to);
      console.log('Token:', this.token.substring(0, 10) + '...');
      console.log('Body length:', body.length);
      console.log('Body preview:', body.substring(0, 100) + '...');
      
      // UltraMsg requiere form-urlencoded según su documentación
      console.log('🔧 Construyendo parámetros...');
      const params = new URLSearchParams();
      params.append('token', this.token);
      params.append('to', to);
      params.append('body', body);
      const paramsString = params.toString();
      console.log('✅ Parámetros construidos, longitud:', paramsString.length);
      console.log('📋 Parámetros preview:', paramsString.substring(0, 200) + '...');
      
      console.log('🌐 Haciendo petición POST a UltraMsg...');
      const response = await axios.post(
        url,
        paramsString,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 50000, // 50 segundos de timeout (menos que el maxDuration de 60s)
          validateStatus: (status) => status < 500, // No lanzar error para códigos 4xx
        }
      );
      console.log('✅ Petición completada, status:', response.status);
      
      // Verificar si la respuesta indica éxito
      if (response.status >= 400) {
        throw new Error(`UltraMsg retornó status ${response.status}: ${JSON.stringify(response.data)}`);
      }
      
      console.log('✅ Mensaje enviado exitosamente');
      console.log('Respuesta de UltraMsg:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('❌❌❌ Error enviando mensaje de texto:');
      console.error('Error type:', error.constructor?.name || typeof error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      
      if (error.response) {
        console.error('HTTP Status:', error.response.status);
        console.error('Status Text:', error.response.statusText);
        console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor');
        console.error('Request config:', JSON.stringify({
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data?.substring(0, 200),
        }, null, 2));
      } else {
        console.error('Error al configurar la petición:', error.message);
      }
      
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
      
      // Si falla, intentar con formato JSON
      if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 500) {
        console.log('🔄 Intentando con formato JSON...');
        try {
          const retryResponse = await axios.post(
            url,
            {
              token: this.token,
              to,
              body,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          console.log('✅ Mensaje enviado exitosamente (segundo intento con JSON)');
          return retryResponse.data;
        } catch (retryError: any) {
          console.error('❌ Error en segundo intento:', JSON.stringify(retryError.response?.data, null, 2));
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
    
    // TODO: Remover hardcode para producción
    to = '3502235005'; // Número hardcodeado para pruebas
    
    try {
      console.log('📤 Enviando mensaje con imagen a UltraMsg...');
      console.log('URL:', url);
      console.log('To:', to);
      console.log('Image URL:', imageUrl);
      console.log('Caption length:', caption.length);
      
      // UltraMsg requiere form-urlencoded
      const params = new URLSearchParams();
      params.append('token', this.token);
      params.append('to', to);
      params.append('image', imageUrl);
      params.append('caption', caption);
      
      const response = await axios.post(
        url,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      console.log('✅ Mensaje con imagen enviado exitosamente');
      console.log('Respuesta de UltraMsg:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('❌ Error enviando mensaje con imagen:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error Message:', error.message);
      
      // Intentar con formato JSON
      if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 500) {
        console.log('🔄 Intentando con formato JSON...');
        try {
          const retryResponse = await axios.post(
            url,
            {
              token: this.token,
              to,
              image: imageUrl,
              caption,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          console.log('✅ Mensaje con imagen enviado exitosamente (segundo intento)');
          return retryResponse.data;
        } catch (retryError: any) {
          console.error('❌ Error en segundo intento:', JSON.stringify(retryError.response?.data, null, 2));
          throw retryError;
        }
      }
      
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

