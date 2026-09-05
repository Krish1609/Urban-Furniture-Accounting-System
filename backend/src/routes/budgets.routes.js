import { Router } from 'express';
import {
  getBudgets,
  createBudget,
  updateBudget,
  reviseBudget,
  getAnalyticAccounts,
  createAnalyticAccount
} from '../controllers/budgets.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Budgets
router.get('/', getBudgets);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.post('/:id/revise', reviseBudget);

// Analytic Accounts
router.get('/analytics', getAnalyticAccounts);
router.post('/analytics', createAnalyticAccount);

export default router;
