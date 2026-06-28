// src/utils/logger.ts
// Enhanced console logger with timestamps and multi-arg support
const ts = () => new Date().toISOString();

export const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[${ts()}] INFO: ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[${ts()}] ERROR: ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[${ts()}] WARN: ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.debug(`[${ts()}] DEBUG: ${msg}`, ...args),
};

