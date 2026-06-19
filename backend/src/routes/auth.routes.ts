// src/routes/auth.routes.ts
import { Router } from 'express';
import {
  studentSignup,
  alumniSignup,
  cdcLogin,
  studentLogin,
  alumniLogin,
  commonLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';

const router = Router();

// ---- Sign‑up ----
router.post('/student/signup', studentSignup);
router.post('/alumni/signup', alumniSignup);
// CDC has no signup endpoint

// ---- Login ----
router.post('/student/login', studentLogin);
router.post('/alumni/login', alumniLogin);
router.post('/cdc/login', cdcLogin);
router.post('/login', commonLogin);

// ---- Email verification ----
router.get('/verify-email/:token', verifyEmail);

// ---- Password reset ----
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
