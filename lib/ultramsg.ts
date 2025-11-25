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
      const response = await axios.post(url, {
        token: this.token,
        to,
        body,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error enviando mensaje de texto:', error.response?.data || error.message);
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
      const response = await axios.post(url, {
        token: this.token,
        to,
        image: imageUrl,
        caption,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error enviando mensaje con imagen:', error.response?.data || error.message);
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

