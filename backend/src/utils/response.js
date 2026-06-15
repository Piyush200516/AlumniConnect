"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseError = exports.responseSuccess = void 0;
const responseSuccess = (res, message, data) => {
    return res.status(200).json({ success: true, message, data });
};
exports.responseSuccess = responseSuccess;
const responseError = (res, payload, statusCode = 500) => {
    const { message, errors } = payload;
    return res.status(statusCode).json({ success: false, message, errors });
};
exports.responseError = responseError;
//# sourceMappingURL=response.js.map