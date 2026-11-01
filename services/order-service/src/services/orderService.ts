import { Customer, Product, Order, CreateOrderRequest } from '../types/order.types';
import { mockCustomers, mockProducts } from '../data/mockData';
import { publishEvent } from '../../../../shared/src/events/rabbitClient';
import { OrderCreatedEvent } from '../../../../shared/src/events/event.types';

// In-memory array to store placed orders during Phase 1
const orders: Order[] = [];
let nextOrderId = 1001;

/**
 * Rounds numbers to 2 decimal places to avoid JavaScript floating point errors.
 */
export function roundToTwo(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Validates incoming order data.
 * Returns customer and product if valid, or an error message if invalid.
 */
export function validateOrder(request: CreateOrderRequest): {
  isValid: boolean;
  error?: string;
  customer?: Customer;
  product?: Product;
} {
  const { customerId, productId, quantity } = request;

  if (!customerId || typeof customerId !== 'string') {
    return { isValid: false, error: 'Customer ID is required.' };
  }

  if (!productId || typeof productId !== 'string') {
    return { isValid: false, error: 'Product ID is required.' };
  }

  if (!quantity || typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
    return { isValid: false, error: 'Quantity must be a positive integer.' };
  }

  // Authoritative check: Customer must exist
  const customer = mockCustomers.find((c) => c.id === customerId);
  if (!customer) {
    return { isValid: false, error: `Customer '${customerId}' does not exist.` };
  }

  // Authoritative check: Product must exist
  const product = mockProducts.find((p) => p.id === productId);
  if (!product) {
    return { isValid: false, error: `Product '${productId}' does not exist.` };
  }

  return { isValid: true, customer, product };
}

/**
 * Creates an order, calculates financials, and saves it.
 */
export function createOrder(request: CreateOrderRequest): Order {
  const validation = validateOrder(request);
  if (!validation.isValid || !validation.customer || !validation.product) {
    throw new Error(validation.error || 'Invalid order data.');
  }

  const { customer, product } = validation;
  const quantity = request.quantity;

  // 1. Subtotal using server-side product price
  const itemTotal = roundToTwo(product.price * quantity);
  const subtotal = itemTotal;

  // 2. Shipping calculation rule: Free if subtotal >= 1000, else 50
  const shippingAmount = subtotal >= 1000 ? 0 : 50;

  // 3. Tax calculation: 18% GST
  const taxAmount = roundToTwo(subtotal * 0.18);

  // 4. Final total
  const totalAmount = roundToTwo(subtotal + shippingAmount + taxAmount);

  // 5. Build order object
  const newOrder: Order = {
    id: `ORD-${nextOrderId++}`,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    items: [
      {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        itemTotal,
      },
    ],
    subtotal,
    shippingAmount,
    taxAmount,
    totalAmount,
    currency: 'INR',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);

  // Publish 'order.created' event to RabbitMQ
  const event: OrderCreatedEvent = {
    eventId: `evt-ord-${newOrder.id}-${Date.now()}`,
    eventType: 'order.created',
    timestamp: new Date().toISOString(),
    data: { order: newOrder },
  };

  publishEvent('order.created', event).catch((err) => {
    console.error(`[OrderService] Failed to publish order.created event:`, err);
  });

  return newOrder;
}

export function getOrderById(orderId: string): Order | undefined {
  return orders.find((o) => o.id === orderId);
}

export function getAllOrders(): Order[] {
  return [...orders];
}

export function getMockCustomers(): Customer[] {
  return [...mockCustomers];
}

export function getMockProducts(): Product[] {
  return [...mockProducts];
}
