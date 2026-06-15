"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.alumniLogin = exports.studentLogin = exports.commonLogin = exports.cdcLogin = exports.alumniSignup = exports.studentSignup = void 0;
const auth_service_1 = __importDefault(require("../services/auth.service"));
const response_1 = require("../utils/response");
const client_1 = require("@prisma/client");
const authService = new auth_service_1.default();
/** STUDENT SIGN‑UP */
const studentSignup = async (req, res, next) => {
    try {
        const result = await authService.studentSignup(req.body);
        (0, response_1.responseSuccess)(res, 'Student signup successful', result);
    }
    catch (err) {
        next(err);
    }
};
exports.studentSignup = studentSignup;
/** ALUMNI SIGN‑UP */
const alumniSignup = async (req, res, next) => {
    try {
        const result = await authService.alumniSignup(req.body);
        (0, response_1.responseSuccess)(res, 'Alumni signup successful', result);
    }
    catch (err) {
        next(err);
    }
};
exports.alumniSignup = alumniSignup;
/** CDC LOGIN */
const cdcLogin = async (req, res, next) => {
    try {
        const result = await authService.login(req.body, client_1.Role.CDC);
        (0, response_1.responseSuccess)(res, 'CDC login successful', result);
    }
    catch (err) {
        next(err);
    }
};
exports.cdcLogin = cdcLogin;
/** COMMON LOGIN (any role) */
const commonLogin = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        (0, response_1.responseSuccess)(res, 'Login successful', result);
    }
    catch (err) {
        next(err);
    }
};
exports.commonLogin = commonLogin;
// Role‑specific login handlers
const studentLogin = async (req, res, next) => {
    try {
        const result = await authService.login(req.body, client_1.Role.STUDENT);
        (0, response_1.responseSuccess)(res, 'Student login successful', result);
    }
    catch (err) {
        next(err);
    }
};
exports.studentLogin = studentLogin;
const alumniLogin = async (req, res, next) => {
    try {
        const result = await authService.login(req.body, client_1.Role.ALUMNI);
        (0, response_1.responseSuccess)(res, 'Alumni login successful', result);
    }
    catch (err) {
        next(err);
    }
};
exports.alumniLogin = alumniLogin;
/** EMAIL VERIFICATION */
const verifyEmail = async (req, res, next) => {
    try {
        await authService.verifyEmail(req.query.token);
        (0, response_1.responseSuccess)(res, 'Email verified successfully');
    }
    catch (err) {
        next(err);
    }
};
exports.verifyEmail = verifyEmail;
/** FORGOT PASSWORD */
const forgotPassword = async (req, res, next) => {
    try {
        await authService.forgotPassword(req.body.email);
        (0, response_1.responseSuccess)(res, 'Password reset email sent');
    }
    catch (err) {
        next(err);
    }
};
exports.forgotPassword = forgotPassword;
/** RESET PASSWORD */
const resetPassword = async (req, res, next) => {
    try {
        await authService.resetPassword(req.body.token, req.body.newPassword);
        (0, response_1.responseSuccess)(res, 'Password has been reset');
    }
    catch (err) {
        next(err);
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map