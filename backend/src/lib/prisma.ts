import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { logger } from '../utils/logger';

// Global singleton to avoid multiple instances in hot-reloading environments (tsx, nodemon)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

if (!globalForPrisma.prisma) {
  // Configure database connection pooling
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon requires SSL
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Log pool errors to prevent unhandled exceptions
  pool.on('error', (err) => {
    logger.error(`[DB Pool Error] Unexpected error on idle client: ${err.message}`);
  });

  globalForPrisma.prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  logger.info('[Prisma] New PrismaClient instance created.');
}

export const prisma = globalForPrisma.prisma!;
export default prisma;
