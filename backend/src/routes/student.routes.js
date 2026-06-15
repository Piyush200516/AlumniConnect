"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/student.routes.ts
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const student_controller_1 = require("../controllers/student.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
router.get('/profile', auth_middleware_1.authenticateUser, (0, role_middleware_1.authorizeRoles)('STUDENT'), student_controller_1.getStudentProfile);
router.put('/profile', auth_middleware_1.authenticateUser, (0, role_middleware_1.authorizeRoles)('STUDENT'), upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
]), student_controller_1.updateStudentProfile);
exports.default = router;
//# sourceMappingURL=student.routes.js.map