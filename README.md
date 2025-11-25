# Shopify WhatsApp Integration

Integración de Shopify con WhatsApp usando UltraMsg API para enviar mensajes de confirmación automáticos cuando se realiza una compra.

## Características

- ✅ Webhook de Shopify para recibir nuevas órdenes
- ✅ Envío automático de mensajes de WhatsApp con información del pedido
- ✅ Delay configurable (1-3 minutos) antes de enviar el mensaje
- ✅ Soporte para imágenes de productos
- ✅ Mapeo dinámico de productos a imágenes personalizadas
- ✅ Recepción de mensajes de WhatsApp mediante webhook

## Configuración

### 1. Variables de Entorno

Copia el archivo `.env.example` a `.env` y completa las siguientes variables:

```env
SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_WEBHOOK_SECRET=tu_webhook_secret
ULTRAMSG_INSTANCE_ID=tu_instance_id
ULTRAMSG_TOKEN=tu_token
STORE_NAME=Nombre de tu Tienda
MESSAGE_DELAY_MINUTES=2
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Configurar Webhook en Shopify

1. Ve a tu tienda Shopify Admin
2. Configuración → Notificaciones → Webhooks
3. Crea un nuevo webhook:
   - URL: `https://tu-dominio.com/api/webhooks/shopify`
   - Evento: `Orden creada`
   - Formato: `JSON`
4. Copia el secreto del webhook y añádelo a `.env` como `SHOPIFY_WEBHOOK_SECRET`

### 3. Configurar Webhook en UltraMsg

1. Ve a tu panel de UltraMsg
2. Configura el webhook para recibir mensajes:
   - URL: `https://tu-dominio.com/api/webhooks/ultramsg`
3. Guarda la configuración

## Instalación

```bash
npm install
npm run dev
```

## Estructura del Proyecto

```
├── api/
│   ├── webhooks/
│   │   ├── shopify/
│   │   │   └── route.ts      # Webhook de Shopify
│   │   └── ultramsg/
│   │       └── route.ts      # Webhook de UltraMsg
│   └── send-message/
│       └── route.ts          # Endpoint para enviar mensajes
├── lib/
│   ├── shopify.ts            # Utilidades de Shopify
│   ├── ultramsg.ts          # Cliente de UltraMsg API
│   ├── message-builder.ts   # Constructor de mensajes
│   └── product-mapping.ts   # Mapeo de productos a imágenes
├── types/
│   └── index.ts             # Tipos TypeScript
└── .env.example
```

## Uso

Una vez configurado, el sistema funcionará automáticamente:

1. Cuando un cliente realiza una compra en Shopify
2. Shopify envía un webhook a `/api/webhooks/shopify`
3. El sistema espera el tiempo configurado (delay)
4. Se envía un mensaje de WhatsApp al cliente con:
   - Confirmación de compra
   - Detalles del pedido
   - Imagen del producto principal
   - Dirección de envío

## Personalización

### Mapeo de Productos a Imágenes

Edita `lib/product-mapping.ts` para configurar qué imagen mostrar para cada producto:

```typescript
export const productImageMap: Record<string, string> = {
  'producto-1': 'https://url-de-imagen-1.jpg',
  'producto-2': 'https://url-de-imagen-2.jpg',
}
```

## Desarrollo

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

