// src/lib/prisma.ts
import { PrismaClient, Role } from '../prisma';

const prisma = new PrismaClient({
  log: ['error', 'info', 'query', 'warn'],
});

export { prisma };
