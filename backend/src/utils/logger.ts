// src/utils/logger.ts
// src/utils/logger.ts
// Simple console logger to avoid external dependencies
export const logger = {
  info: (msg: string) => console.log(`INFO: ${msg}`),
  error: (msg: string) => console.error(`ERROR: ${msg}`),
  warn: (msg: string) => console.warn(`WARN: ${msg}`),
  debug: (msg: string) => console.debug(`DEBUG: ${msg}`),
};
