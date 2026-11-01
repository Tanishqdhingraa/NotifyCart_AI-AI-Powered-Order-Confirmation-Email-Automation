import { Router } from 'express';
import {
  createOrderController,
  getOrderByIdController,
  getAllOrdersController,
  getProductsController,
  getCustomersController,
} from '../controllers/orderController';

const router = Router();

// Order routes
router.post('/orders', createOrderController);
router.get('/orders', getAllOrdersController);
router.get('/orders/:orderId', getOrderByIdController);

// Master data routes (used for order creation and future frontend dropdowns)
router.get('/products', getProductsController);
router.get('/customers', getCustomersController);

export default router;
