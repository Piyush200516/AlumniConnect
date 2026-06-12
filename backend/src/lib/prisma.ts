import { PrismaClient } from '@prisma/client';
import { PrismaPgAdapter } from '@prisma/adapter-pg';
import 'dotenv/config';

// Export a named Prisma client instance and also as default
export const prisma = new PrismaClient({
  adapter: new PrismaPgAdapter(),
  log: ['error', 'info', 'query', 'warn'],
});

export default prisma;

