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

// ---- OAuth routes ----
import passport from '../config/passport';
// Role‑specific OAuth routes
// Google OAuth
router.get('/student/google', passport.authenticate('google', { scope: ['profile', 'email'], state: 'STUDENT' }));
router.get('/student/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
  // @ts-ignore
  const user = req.user;
  if (!user) return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/dashboard?accessToken=${accessToken}&refreshToken=${refreshToken}`;
  res.redirect(redirectUrl);
});
router.get('/alumni/google', passport.authenticate('google', { scope: ['profile', 'email'], state: 'ALUMNI' }));
router.get('/alumni/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
  const user = req.user as any;
  if (!user) return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/alumni/dashboard?accessToken=${accessToken}&refreshToken=${refreshToken}`;
  res.redirect(redirectUrl);
});
router.get('/cdc/google', passport.authenticate('google', { scope: ['profile', 'email'], state: 'CDC' }));
router.get('/cdc/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
  const user = req.user as any;
  if (!user) return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cdc/dashboard?accessToken=${accessToken}&refreshToken=${refreshToken}`;
  res.redirect(redirectUrl);
});
// GitHub OAuth (role‑specific)
router.get('/student/github', passport.authenticate('github', { scope: ['user:email'], state: 'STUDENT' }));
router.get('/student/github/callback', passport.authenticate('github', { failureRedirect: '/login', session: false }), (req, res) => {
  const user = req.user as any;
  if (!user) return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/dashboard?accessToken=${accessToken}&refreshToken=${refreshToken}`;
  res.redirect(redirectUrl);
});
router.get('/alumni/github', passport.authenticate('github', { scope: ['user:email'], state: 'ALUMNI' }));
router.get('/alumni/github/callback', passport.authenticate('github', { failureRedirect: '/login', session: false }), (req, res) => {
  const user = req.user as any;
  if (!user) return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/alumni/dashboard?accessToken=${accessToken}&refreshToken=${refreshToken}`;
  res.redirect(redirectUrl);
});
router.get('/cdc/github', passport.authenticate('github', { scope: ['user:email'], state: 'CDC' }));
router.get('/cdc/github/callback', passport.authenticate('github', { failureRedirect: '/login', session: false }), (req, res) => {
  const user = req.user as any;
  if (!user) return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cdc/dashboard?accessToken=${accessToken}&refreshToken=${refreshToken}`;
  res.redirect(redirectUrl);
});
// Retain generic routes for backward compatibility (optional)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
  const user = req.user as any;
  if (!user) return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}?accessToken=${accessToken}&refreshToken=${refreshToken}`;
  res.redirect(redirectUrl);
});
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login', session: false }), (req, res) => {
  const user = req.user as any;
  if (!user) return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}?accessToken=${accessToken}&refreshToken=${refreshToken}`;
  res.redirect(redirectUrl);
});

export default router;
