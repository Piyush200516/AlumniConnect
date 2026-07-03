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

// ---- Sign-up ----
router.post('/student/signup', studentSignup);
router.post('/alumni/signup', alumniSignup);

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

// =============================================
// Google OAuth
// =============================================
// Role-specific initiation routes — they pass `state` so the
// passport strategy knows which role the user is signing up / logging in as.
router.get('/student/google', passport.authenticate('google', { scope: ['profile', 'email'], state: 'student', session: false }));
router.get('/alumni/google',  passport.authenticate('google', { scope: ['profile', 'email'], state: 'alumni',  session: false }));
router.get('/cdc/google',     passport.authenticate('google', { scope: ['profile', 'email'], state: 'cdc',     session: false }));

// Single Google callback — Google always redirects here regardless of which
// role-specific initiation route was used. The passport strategy has already
// resolved the user (and created a new one if needed).
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

      // Determine dashboard path based on role
      let dashboardPath = '/student/dashboard';
      if (user.role === 'ALUMNI') dashboardPath = '/alumni/dashboard';
      else if (user.role === 'CDC') dashboardPath = '/cdc/dashboard';

      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}${dashboardPath}?accessToken=${accessToken}&refreshToken=${refreshToken}`;
      logger.info(`[Google OAuth] Redirecting ${user.email} (${user.role}) to dashboard`);
      return res.redirect(redirectUrl);
    } catch (err) {
      logger.error(`[Google OAuth callback error] ${err instanceof Error ? err.message : err}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
    }
  }
);

// =============================================
// GitHub OAuth
// =============================================
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
      logger.info(`[GitHub OAuth] Redirecting ${user.email} (${user.role}) to dashboard`);
      return res.redirect(redirectUrl);
    } catch (err) {
      logger.error(`[GitHub OAuth callback error] ${err instanceof Error ? err.message : err}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
    }
  }
);

export default router;
