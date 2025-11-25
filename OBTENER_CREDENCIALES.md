# Cómo Obtener las Credenciales Necesarias

Esta guía te ayudará a obtener todas las credenciales necesarias para configurar la integración.

---

## 🔑 Credenciales de Shopify

### 1. SHOPIFY_SHOP_DOMAIN

Este es simplemente el dominio de tu tienda Shopify.

**Formato:** `tu-tienda.myshopify.com`

**Ejemplo:** Si tu tienda es `https://mi-tienda.myshopify.com`, entonces:
```
SHOPIFY_SHOP_DOMAIN=mi-tienda.myshopify.com
```

### 2. SHOPIFY_WEBHOOK_SECRET

Este secreto se genera cuando creas un webhook en Shopify.

**Pasos para obtenerlo:**

1. Ve a tu Admin de Shopify: `https://tu-tienda.myshopify.com/admin`
2. Navega a: **Configuración** → **Notificaciones**
3. Desplázate hasta la sección **Webhooks**
4. Si ya tienes un webhook creado:
   - Haz clic en el webhook
   - Verás el **Secreto del webhook** (Webhook secret)
   - Cópialo y úsalo como `SHOPIFY_WEBHOOK_SECRET`

5. Si aún no has creado el webhook:
   - Sigue los pasos en `GUIA_CONFIGURACION.md` para crear el webhook
   - Una vez creado, el secreto aparecerá en los detalles del webhook

**Nota:** El secreto del webhook es diferente para cada webhook que crees. Asegúrate de usar el secreto del webhook que apunta a tu aplicación.

---

## 📱 Credenciales de UltraMsg

### 1. ULTRAMSG_INSTANCE_ID

Este es el ID de tu instancia de WhatsApp en UltraMsg.

**Pasos para obtenerlo:**

1. Inicia sesión en tu cuenta de UltraMsg: `https://ultramsg.com/`
2. Ve a tu panel de control o dashboard
3. Busca la sección de **Instancias** o **Instances**
4. Verás una lista de tus instancias de WhatsApp
5. El **Instance ID** generalmente se muestra como un número o código único
6. Cópialo y úsalo como `ULTRAMSG_INSTANCE_ID`

**Ejemplo:**
```
ULTRAMSG_INSTANCE_ID=12345678
```

### 2. ULTRAMSG_TOKEN

Este es el token de autenticación para acceder a la API de UltraMsg.

**Pasos para obtenerlo:**

1. En tu panel de UltraMsg, ve a la sección de **API** o **Tokens**
2. Busca la opción para generar o ver tu token
3. Si no tienes un token, genera uno nuevo
4. Cópialo y úsalo como `ULTRAMSG_TOKEN`

**Ejemplo:**
```
ULTRAMSG_TOKEN=abc123def456ghi789
```

**⚠️ Importante:** 
- Mantén tu token seguro y no lo compartas públicamente
- Si sospechas que tu token ha sido comprometido, genera uno nuevo

---

## 🔍 Verificar que las Credenciales Funcionan

### Verificar UltraMsg

Puedes usar el endpoint de prueba para verificar tus credenciales:

```bash
curl -X POST https://tu-dominio.com/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+573058376058",
    "message": "Mensaje de prueba"
  }'
```

Si recibes una respuesta exitosa, tus credenciales están correctas.

### Verificar Shopify

1. Realiza una compra de prueba en tu tienda
2. Revisa los logs de tu aplicación
3. Deberías ver: `Nueva orden recibida: #1001 (ID: 123456)`

Si ves este mensaje, el webhook de Shopify está funcionando correctamente.

---

## 📝 Resumen de Variables de Entorno

Una vez que tengas todas las credenciales, tu archivo `.env` debería verse así:

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

## ❓ Preguntas Frecuentes

### ¿Dónde encuentro el Instance ID en UltraMsg?

El Instance ID generalmente se muestra en:
- El dashboard principal de UltraMsg
- La sección de configuración de la instancia
- En la URL cuando accedes a los detalles de tu instancia

### ¿Qué hago si no puedo encontrar el Token de UltraMsg?

1. Revisa la documentación de UltraMsg
2. Contacta al soporte de UltraMsg
3. Busca en la sección de "API" o "Desarrolladores" en tu panel

### ¿El webhook secret de Shopify es necesario?

Sí, es muy importante para la seguridad. Shopify usa este secreto para verificar que las solicitudes realmente vienen de Shopify y no de un atacante.

### ¿Puedo usar el mismo token de UltraMsg para múltiples instancias?

No, cada instancia tiene su propio token. Asegúrate de usar el token correspondiente a la instancia que estás usando.

---

Si tienes problemas para obtener alguna credencial, revisa la documentación oficial de cada servicio o contacta a su soporte.

