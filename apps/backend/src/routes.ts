import { Router } from 'express';
import * as authController from './controllers/auth.controller';
import * as productController from './controllers/product.controller';
import * as cartController from './controllers/cart.controller';
import * as orderController from './controllers/order.controller';
import { authenticate } from './middleware/auth';

const router = Router();

// Authentication
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Product Catalog
router.get('/products', productController.getProducts);
router.get('/products/categories', productController.getCategories);

// Redis-Backed Shopping Cart (JWT authenticated)
router.get('/cart', authenticate as any, cartController.getCart as any);
router.post('/cart', authenticate as any, cartController.updateCart as any);

// Transaction-Safe Order & Checkout (JWT authenticated)
router.post('/orders', authenticate as any, orderController.createOrder as any);
router.get('/orders', authenticate as any, orderController.getOrders as any);

export default router;
