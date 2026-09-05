import { Router } from 'express';
import {
  getChartOfAccounts,
  createAccount,
  toggleArchiveAccount,
  getJournals,
  createJournal,
  updateJournal,
  getJournalEntries,
  createJournalEntry
} from '../controllers/accounting.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Chart of Accounts
router.get('/chart-of-accounts', getChartOfAccounts);
router.post('/chart-of-accounts', createAccount);
router.patch('/chart-of-accounts/:id/archive', toggleArchiveAccount);
router.put('/chart-of-accounts/:id', toggleArchiveAccount);

// Journals
router.get('/journals', getJournals);
router.post('/journals', createJournal);
router.put('/journals/:id', updateJournal);

// Journal Entries
router.get('/journal-entries', getJournalEntries);
router.post('/journal-entries', createJournalEntry);

export default router;
