import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, password: true, role: true, status: true } });
  console.log(`Found ${users.length} users.`);
  for (const user of users) {
    const match = await bcrypt.compare('Password@123', user.password);
    console.log(`User: ${user.email} (${user.role}) | Status: ${user.status} | Password match: ${match}`);
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
