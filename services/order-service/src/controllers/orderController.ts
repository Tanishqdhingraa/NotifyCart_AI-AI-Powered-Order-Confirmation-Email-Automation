import { Request, Response } from 'express';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  getMockCustomers,
  getMockProducts,
} from '../services/orderService';
import { CreateOrderRequest } from '../types/order.types';

/**
 * POST /api/orders
 */
export function createOrderController(req: Request, res: Response): void {
  try {
    const { customerId, productId, quantity } = req.body as CreateOrderRequest;

    if (!customerId || !productId || quantity === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: customerId, productId, and quantity.',
      });
      return;
    }

    const order = createOrder({ customerId, productId, quantity });

    res.status(201).json({
      success: true,
      orderId: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      currency: order.currency,
      order,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating order';
    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/orders/:orderId
 */
export function getOrderByIdController(req: Request, res: Response): void {
  const rawId = req.params.orderId;
  const orderId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!orderId) {
    res.status(400).json({ success: false, error: 'Order ID is required.' });
    return;
  }

  const order = getOrderById(orderId);

  if (!order) {
    res.status(404).json({
      success: false,
      error: `Order '${orderId}' not found.`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    order,
  });
}

/**
 * GET /api/orders
 */
export function getAllOrdersController(_req: Request, res: Response): void {
  const allOrders = getAllOrders();
  res.status(200).json({
    success: true,
    count: allOrders.length,
    orders: allOrders,
  });
}

/**
 * GET /api/products
 */
export function getProductsController(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    products: getMockProducts(),
  });
}

/**
 * GET /api/customers
 */
export function getCustomersController(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    customers: getMockCustomers(),
  });
}
