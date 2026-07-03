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
import passport from '../config/passport';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { logger } from '../utils/logger';

const router = Router();

// ──────────────────────────────────────────────
// Sign-up
// ──────────────────────────────────────────────
router.post('/student/signup', studentSignup);
router.post('/alumni/signup', alumniSignup);

// ──────────────────────────────────────────────
// Login (email + password)
// ──────────────────────────────────────────────
router.post('/student/login', studentLogin);
router.post('/alumni/login', alumniLogin);
router.post('/cdc/login', cdcLogin);
router.post('/login', commonLogin);

// ──────────────────────────────────────────────
// Email verification & password reset
// ──────────────────────────────────────────────
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ══════════════════════════════════════════════
// Google OAuth
// ══════════════════════════════════════════════

// Generic route — frontend opens http://localhost:3000/api/auth/google
// Falls back to STUDENT role when no state is provided.
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));
console.log('✅ Route registered: GET /api/auth/google');

// Role-specific initiation routes
router.get('/student/google', passport.authenticate('google', { scope: ['profile', 'email'], state: 'student', session: false }));
router.get('/alumni/google',  passport.authenticate('google', { scope: ['profile', 'email'], state: 'alumni',  session: false }));
router.get('/cdc/google',     passport.authenticate('google', { scope: ['profile', 'email'], state: 'cdc',     session: false }));

// Single Google callback — Google always redirects here.
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        logger.warn('[Google OAuth] No user object after authentication');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
      }

      const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = await generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

      let dashboardPath = '/student/dashboard';
      if (user.role === 'ALUMNI') dashboardPath = '/alumni/dashboard';
      else if (user.role === 'CDC') dashboardPath = '/cdc/dashboard';

      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}${dashboardPath}?accessToken=${accessToken}&refreshToken=${refreshToken}`;
      logger.info(`[Google OAuth] Redirecting ${user.email} (${user.role}) to ${dashboardPath}`);
      return res.redirect(redirectUrl);
    } catch (err) {
      logger.error(`[Google OAuth callback error] ${err instanceof Error ? err.message : err}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
    }
  }
);
console.log('✅ Route registered: GET /api/auth/google/callback');

// ══════════════════════════════════════════════
// GitHub OAuth
// ══════════════════════════════════════════════

// Generic route — frontend opens http://localhost:3000/api/auth/github
router.get('/github', passport.authenticate('github', {
  scope: ['user:email'],
  session: false,
} as any));
console.log('✅ Route registered: GET /api/auth/github');

// Role-specific initiation routes
router.get('/student/github', passport.authenticate('github', { scope: ['user:email'], state: 'student', session: false } as any));
router.get('/alumni/github',  passport.authenticate('github', { scope: ['user:email'], state: 'alumni',  session: false } as any));
router.get('/cdc/github',     passport.authenticate('github', { scope: ['user:email'], state: 'cdc',     session: false } as any));

// Single GitHub callback
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        logger.warn('[GitHub OAuth] No user object after authentication');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
      }

      const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = await generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

      let dashboardPath = '/student/dashboard';
      if (user.role === 'ALUMNI') dashboardPath = '/alumni/dashboard';
      else if (user.role === 'CDC') dashboardPath = '/cdc/dashboard';

      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}${dashboardPath}?accessToken=${accessToken}&refreshToken=${refreshToken}`;
      logger.info(`[GitHub OAuth] Redirecting ${user.email} (${user.role}) to ${dashboardPath}`);
      return res.redirect(redirectUrl);
    } catch (err) {
      logger.error(`[GitHub OAuth callback error] ${err instanceof Error ? err.message : err}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
    }
  }
);
console.log('✅ Route registered: GET /api/auth/github/callback');

export default router;
