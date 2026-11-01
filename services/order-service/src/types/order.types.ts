export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CreateOrderRequest {
  customerId: string;
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}
