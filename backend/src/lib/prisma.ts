import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { logger } from '../utils/logger';

console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

// Global singleton to avoid multiple instances in hot-reloading environments
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Configure database connection pooling for production performance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
  max: 20,                        // Maximum pool connections
  idleTimeoutMillis: 30000,       // Close idle clients after 30s
  connectionTimeoutMillis: 10000, // Increased timeout to 10s
});

// Log pool errors to prevent unhandled exceptions
pool.on('error', (err) => {
  logger.error(`[DB Pool Error] Unexpected error on idle client: ${err.message}`);
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

