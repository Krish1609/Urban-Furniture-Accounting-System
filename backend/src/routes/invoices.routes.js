import { Router } from 'express';
import { getInvoices, createInvoice, payInvoice } from '../controllers/invoices.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getInvoices);
router.post('/', createInvoice);
router.post('/:id/pay', payInvoice);

export default router;
