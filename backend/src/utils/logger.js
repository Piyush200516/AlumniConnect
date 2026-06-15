"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// src/utils/logger.ts
// src/utils/logger.ts
// Simple console logger to avoid external dependencies
exports.logger = {
    info: (msg) => console.log(`INFO: ${msg}`),
    error: (msg) => console.error(`ERROR: ${msg}`),
    warn: (msg) => console.warn(`WARN: ${msg}`),
    debug: (msg) => console.debug(`DEBUG: ${msg}`),
};
//# sourceMappingURL=logger.js.map