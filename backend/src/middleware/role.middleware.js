"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const error_1 = require("../utils/error");
/**
 * Authorize specific user roles.
 * Usage: authorizeRoles('STUDENT', 'ALUMNI')
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user)
                throw new error_1.ApiError(401, 'Unauthenticated');
            if (!roles.includes(req.user.role)) {
                throw new error_1.ApiError(403, 'Forbidden: insufficient role');
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=role.middleware.js.map