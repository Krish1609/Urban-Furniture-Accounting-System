import { Router } from 'express';
import { getOrders, createOrder, convertToBill, convertToInvoice } from '../controllers/orders.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getOrders);
router.post('/', createOrder);
router.post('/:id/convert-to-bill', convertToBill);
router.post('/:id/convert-to-invoice', convertToInvoice);

export default router;
