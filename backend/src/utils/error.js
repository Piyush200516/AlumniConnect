"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
// src/utils/error.ts
/**
 * Centralized API error class to be used with Express error handling middleware.
 * Extends the native Error and carries an HTTP status code.
 */
class ApiError extends Error {
    statusCode;
    details;
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        // Set the prototype explicitly (required when targeting ES5)
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=error.js.map