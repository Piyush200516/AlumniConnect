"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const error_1 = require("../utils/error");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const errorHandler = (err, _req, res, _next) => {
    // Log the error
    logger_1.logger.error(`Error: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    if (err instanceof error_1.ApiError) {
        // Structured API error
        const { statusCode, message, details } = err;
        return (0, response_1.responseError)(res, { success: false, message, errors: details }, statusCode);
    }
    // Fallback for unexpected errors
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    return (0, response_1.responseError)(res, { success: false, message }, status);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map