import { Router } from 'express';
import chartOfAccountsRouter from './chartOfAccounts.js';
import contactsRouter from './contacts.js';
import productsRouter from './products.js';

const router = Router();

router.use(chartOfAccountsRouter);
router.use(contactsRouter);
router.use(productsRouter);

export default router;
