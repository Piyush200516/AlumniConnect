/**
 * Centralized API error class to be used with Express error handling middleware.
 * Extends the native Error and carries an HTTP status code.
 */
export declare class ApiError extends Error {
    statusCode: number;
    details?: any;
    constructor(statusCode: number, message: string, details?: any);
}
