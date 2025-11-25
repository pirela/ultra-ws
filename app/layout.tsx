import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shopify WhatsApp Integration',
  description: 'Integración de Shopify con WhatsApp usando UltraMsg API',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

