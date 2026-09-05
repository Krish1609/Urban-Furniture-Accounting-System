import { Router } from 'express';
import { getPortalData } from '../controllers/portal.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getPortalData);

export default router;
