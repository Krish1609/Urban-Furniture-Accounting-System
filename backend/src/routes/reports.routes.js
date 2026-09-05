import { Router } from 'express';
import {
  getProfitLoss,
  getBalanceSheet,
  getTrialBalance,
  getTaxSummary
} from '../controllers/reports.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/profit-loss', getProfitLoss);
router.get('/balance-sheet', getBalanceSheet);
router.get('/trial-balance', getTrialBalance);
router.get('/tax-summary', getTaxSummary);

export default router;
