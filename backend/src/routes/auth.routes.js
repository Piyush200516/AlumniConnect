"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// ---- Sign‑up ----
router.post('/student/signup', auth_controller_1.studentSignup);
router.post('/alumni/signup', auth_controller_1.alumniSignup);
// CDC has no signup endpoint
// ---- Login ----
router.post('/student/login', auth_controller_1.studentLogin);
router.post('/alumni/login', auth_controller_1.alumniLogin);
router.post('/cdc/login', auth_controller_1.cdcLogin);
// ---- Email verification ----
router.get('/verify-email/:token', auth_controller_1.verifyEmail);
// ---- Password reset ----
router.post('/forgot-password', auth_controller_1.forgotPassword);
router.post('/reset-password', auth_controller_1.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map