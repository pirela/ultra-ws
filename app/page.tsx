export default function Home() {
  return (
    <main style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Shopify WhatsApp Integration</h1>
      <p>El sistema está funcionando correctamente.</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Endpoints disponibles:</h2>
        <ul>
          <li><strong>POST /api/webhooks/shopify</strong> - Recibe órdenes de Shopify</li>
          <li><strong>POST /api/webhooks/ultramsg</strong> - Recibe mensajes de WhatsApp</li>
          <li><strong>POST /api/send-message</strong> - Envía mensajes de prueba</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#e8f5e9', borderRadius: '8px' }}>
        <h2>Estado del sistema:</h2>
        <p>✅ Webhook de Shopify configurado</p>
        <p>✅ Webhook de UltraMsg configurado</p>
        <p>✅ Sistema de delay configurado</p>
        <p>✅ Mapeo de productos configurado</p>
      </div>
    </main>
  );
}

