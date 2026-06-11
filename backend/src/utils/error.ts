// src/utils/error.ts
/**
 * Centralized API error class to be used with Express error handling middleware.
 * Extends the native Error and carries an HTTP status code.
 */
export class ApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    // Set the prototype explicitly (required when targeting ES5)
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
