// Tipos para Shopify
export interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  total_price: string;
  currency: string;
  created_at: string;
  line_items: ShopifyLineItem[];
  shipping_address: ShopifyAddress | null;
  billing_address: ShopifyAddress | null;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  } | null;
}

export interface ShopifyLineItem {
  id: number;
  title: string;
  quantity: number;
  price: string;
  product_id: number;
  variant_id: number;
  image: string | null;
  sku: string | null;
}

export interface ShopifyAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string | null;
}

// Tipos para UltraMsg
export interface UltraMsgMessage {
  from: string;
  to: string;
  body: string;
  caption?: string;
  image?: string;
}

export interface UltraMsgWebhook {
  event: string;
  instance: string;
  data: {
    id: string;
    from: string;
    to: string;
    body: string;
    timestamp: string;
    type: string;
  };
}

// Tipos para mensajes procesados
export interface ProcessedOrder {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: string;
  currency: string;
  products: {
    name: string;
    quantity: number;
    price: string;
  }[];
  shippingAddress: string;
  productImage: string | null;
}

