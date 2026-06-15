"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../lib/prisma");
const error_1 = require("../utils/error");
/**
 * Authenticate user via JWT Bearer token.
 * Attaches `req.user` if valid.
 */
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new error_1.ApiError(401, 'Authorization header missing or malformed');
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // optional: fetch fresh user from DB to ensure still active
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user)
            throw new error_1.ApiError(401, 'User not found');
        if (user.status !== 'ACTIVE')
            throw new error_1.ApiError(403, 'Account is not active');
        req.user = { id: user.id, email: user.email, role: user.role };
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.authenticateUser = authenticateUser;
//# sourceMappingURL=auth.middleware.js.map