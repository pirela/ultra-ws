# Guía de Configuración Paso a Paso

Esta guía te ayudará a configurar la integración de Shopify con WhatsApp usando UltraMsg.

## 📋 Requisitos Previos

- Cuenta de Shopify con acceso de administrador
- Cuenta de UltraMsg con credenciales (Instance ID y Token)
- Proyecto Next.js desplegado (puede ser local con ngrok o en producción)

---

## 🔧 Paso 1: Configurar Variables de Entorno

1. Copia el archivo `.env.example` y créalo como `.env` en la raíz del proyecto
2. Completa las siguientes variables:

```env
# Shopify Configuration
SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_WEBHOOK_SECRET=tu_webhook_secret_aqui

# UltraMsg Configuration
ULTRAMSG_INSTANCE_ID=tu_instance_id
ULTRAMSG_TOKEN=tu_token

# App Configuration
STORE_NAME=Nombre de tu Tienda
MESSAGE_DELAY_MINUTES=2

# Webhook URLs
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
ULTRAMSG_WEBHOOK_URL=https://tu-dominio.com/api/webhooks/ultramsg
```

---

## 🛍️ Paso 2: Configurar Webhook en Shopify

### Opción A: Desde el Admin de Shopify (Recomendado)

1. **Accede a tu tienda Shopify:**
   - Ve a: `https://tu-tienda.myshopify.com/admin`

2. **Navega a Configuración:**
   - En el menú lateral izquierdo, haz clic en **Configuración** (Settings)
   - Al final de la lista, haz clic en **Notificaciones** (Notifications)

3. **Crear Webhook:**
   - Desplázate hasta la sección **Webhooks**
   - Haz clic en **Crear webhook** (Create webhook)

4. **Configurar el Webhook:**
   - **URL del webhook:** 
     ```
     https://tu-proyecto.vercel.app/api/webhooks/shopify
     ```
     ⚠️ **Importante:** 
     - Reemplaza `tu-proyecto.vercel.app` con el dominio real que Vercel te dio al desplegar
     - Ejemplo: Si tu proyecto en Vercel es `shopify-whatsapp-abc123.vercel.app`, entonces la URL sería:
       ```
       https://shopify-whatsapp-abc123.vercel.app/api/webhooks/shopify
       ```
     - Si configuraste un dominio personalizado en Vercel, usa ese dominio
     - Si estás desarrollando localmente, usa [ngrok](https://ngrok.com/) para exponer tu servidor local:
       ```
       https://tu-id-ngrok.ngrok.io/api/webhooks/shopify
       ```
   
   - **Formato:** Selecciona **JSON**
   
   - **Evento:** Selecciona **Pedido creado** (Order created)
   
   - **Versión de API:** Deja la versión por defecto o selecciona la más reciente

5. **Guardar:**
   - Haz clic en **Guardar webhook** (Save webhook)

6. **Obtener el Secreto del Webhook:**
   - Una vez creado, Shopify mostrará el webhook en la lista
   - Haz clic en el webhook para ver los detalles
   - Copia el **Secreto del webhook** (Webhook secret)
   - Pégalo en tu archivo `.env` como `SHOPIFY_WEBHOOK_SECRET`

### Opción B: Usando la API de Shopify (Avanzado)

Si prefieres usar la API directamente, puedes usar este comando cURL:

```bash
curl -X POST "https://tu-tienda.myshopify.com/admin/api/2024-01/webhooks.json" \
  -H "X-Shopify-Access-Token: TU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "topic": "orders/create",
      "address": "https://tu-dominio.com/api/webhooks/shopify",
      "format": "json"
    }
  }'
```

---

## 📱 Paso 3: Configurar Webhook en UltraMsg

1. **Accede a tu panel de UltraMsg:**
   - Ve a: `https://ultramsg.com/`
   - Inicia sesión en tu cuenta

2. **Configurar Webhook:**
   - Ve a la sección de **Webhooks** o **Configuración**
   - Busca la opción para configurar webhooks de mensajes entrantes
   - Ingresa la siguiente URL (usa el dominio de Vercel donde desplegaste tu app):
     ```
     https://tu-proyecto.vercel.app/api/webhooks/ultramsg
     ```
     ⚠️ **Importante:** 
     - Reemplaza `tu-proyecto.vercel.app` con el dominio real que Vercel te dio
     - Ejemplo: Si tu proyecto en Vercel es `shopify-whatsapp-abc123.vercel.app`, entonces la URL sería:
       ```
       https://shopify-whatsapp-abc123.vercel.app/api/webhooks/ultramsg
       ```
     - Si configuraste un dominio personalizado en Vercel, usa ese dominio en su lugar
   - Guarda la configuración

3. **Verificar Instancia:**
   - Asegúrate de que tu instancia de WhatsApp esté conectada
   - Escanea el código QR si es necesario
   - Verifica que el estado de la instancia sea "Conectado"

---

## 🧪 Paso 4: Probar la Integración

### 4.1 Probar el Webhook de Shopify

1. **Realiza una compra de prueba en tu tienda Shopify**
2. **Verifica los logs del servidor:**
   - Deberías ver un mensaje como: `Nueva orden recibida: #1001 (ID: 123456)`
   - Después del delay configurado, deberías ver: `Mensaje enviado exitosamente`

### 4.2 Probar el Envío Manual de Mensajes

Puedes usar el endpoint de prueba para enviar mensajes manualmente:

```bash
curl -X POST https://tu-dominio.com/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+573001234567",
    "message": "Mensaje de prueba",
    "image": "https://ejemplo.com/imagen.jpg"
  }'
```

### 4.3 Verificar el Webhook de UltraMsg

1. **Envía un mensaje de WhatsApp a tu número conectado**
2. **Verifica los logs del servidor:**
   - Deberías ver: `Mensaje recibido de UltraMsg: ...`

---

## 🔍 Paso 5: Configurar Mapeo de Productos a Imágenes

Si quieres usar imágenes personalizadas para ciertos productos:

1. Abre el archivo `lib/product-mapping.ts`
2. Edita el objeto `productImageMap`:

```typescript
export const productImageMap: Record<string, string> = {
  'SKU-DEL-PRODUCTO-1': 'https://url-de-imagen-1.jpg',
  'NOMBRE-DEL-PRODUCTO-2': 'https://url-de-imagen-2.jpg',
  // Agrega más productos según necesites
}
```

**Nota:** Puedes usar el SKU del producto o el nombre del producto como clave.

---

## 🚀 Paso 6: Desplegar la Aplicación

### Opción A: Vercel (Recomendado)

1. **Conecta tu repositorio a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu proyecto desde GitHub/GitLab/Bitbucket
   - Configura las variables de entorno en el dashboard de Vercel (Settings → Environment Variables)

2. **Obtén la URL de producción:**
   - Después del despliegue, Vercel te dará una URL automáticamente
   - La encontrarás en el dashboard de tu proyecto, algo como: `https://tu-proyecto-abc123.vercel.app`
   - **Esta es la URL que debes usar** en los webhooks de Shopify y UltraMsg
   - Ejemplo completo:
     - Webhook de Shopify: `https://tu-proyecto-abc123.vercel.app/api/webhooks/shopify`
     - Webhook de UltraMsg: `https://tu-proyecto-abc123.vercel.app/api/webhooks/ultramsg`
   
   ⚠️ **Nota:** Si configuraste un dominio personalizado en Vercel, usa ese dominio en lugar del `.vercel.app`

### Opción B: Otra Plataforma

Si usas otra plataforma (Railway, Render, etc.), sigue sus instrucciones de despliegue y asegúrate de:
- Configurar las variables de entorno
- Exponer el puerto correcto
- Configurar HTTPS (requerido para webhooks)

### Opción C: Desarrollo Local con ngrok

1. **Instala ngrok:**
   ```bash
   npm install -g ngrok
   # o descarga desde https://ngrok.com/
   ```

2. **Inicia tu servidor Next.js:**
   ```bash
   npm run dev
   ```

3. **Expone tu servidor local:**
   ```bash
   ngrok http 3000
   ```

4. **Copia la URL HTTPS que ngrok te da:**
   - Ejemplo: `https://abc123.ngrok.io`
   - Úsala en tus webhooks de Shopify y UltraMsg

---

## ⚙️ Configuración del Delay

Para cambiar el tiempo de espera antes de enviar el mensaje:

1. Edita la variable `MESSAGE_DELAY_MINUTES` en tu archivo `.env`
2. Valores permitidos: `1`, `2`, o `3` minutos
3. Reinicia tu servidor para aplicar los cambios

---

## 🐛 Solución de Problemas

### El webhook de Shopify no está llegando

- ✅ Verifica que la URL del webhook sea accesible públicamente
- ✅ Verifica que uses HTTPS (no HTTP)
- ✅ Revisa los logs de Shopify en: Configuración > Notificaciones > Webhooks > Ver eventos
- ✅ Verifica que `SHOPIFY_WEBHOOK_SECRET` esté correctamente configurado

### Los mensajes de WhatsApp no se envían

- ✅ Verifica que `ULTRAMSG_INSTANCE_ID` y `ULTRAMSG_TOKEN` sean correctos
- ✅ Verifica que tu instancia de WhatsApp esté conectada en UltraMsg
- ✅ Revisa los logs del servidor para ver errores específicos
- ✅ Verifica que el número de teléfono tenga el formato correcto (+57...)

### El delay no funciona

- ✅ Verifica que `MESSAGE_DELAY_MINUTES` esté entre 1 y 3
- ✅ Revisa los logs para ver si el delay se está aplicando
- ✅ Asegúrate de que el servidor no se esté reiniciando durante el delay

---

## 📞 Soporte

Si tienes problemas, revisa:
- Los logs del servidor
- La documentación de [Shopify Webhooks](https://shopify.dev/docs/api/admin-rest/2024-01/resources/webhook)
- La documentación de [UltraMsg API](https://ultramsg.com/)

---

## ✅ Checklist Final

- [ ] Variables de entorno configuradas
- [ ] Webhook de Shopify creado y funcionando
- [ ] Webhook de UltraMsg configurado
- [ ] Instancia de WhatsApp conectada
- [ ] Mapeo de productos configurado (opcional)
- [ ] Aplicación desplegada y accesible
- [ ] Prueba de compra realizada exitosamente
- [ ] Mensaje de WhatsApp recibido correctamente

¡Listo! Tu integración debería estar funcionando correctamente. 🎉

