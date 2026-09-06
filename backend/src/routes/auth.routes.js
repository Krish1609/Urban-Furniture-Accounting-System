import { Router } from 'express';
import {
  register,
  login,
  getMe,
  getAllUsers,
  updateUser,
  resetUserPassword,
  deleteUser,
  forgotPassword,
  verifyResetOtp
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.get('/me', authenticate, getMe);
router.get('/users', authenticate, getAllUsers);
router.put('/users/:id', authenticate, updateUser);
router.post('/users/:id/reset-password', authenticate, resetUserPassword);
router.delete('/users/:id', authenticate, deleteUser);

export default router;

