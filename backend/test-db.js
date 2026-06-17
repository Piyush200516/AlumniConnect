require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log("Fetching CDC users...");
  try {
    const users = await prisma.user.findMany({
      include: {
        cdcProfile: true
      }
    });
    console.log("Found users count:", users.length);
    console.log("Users:", JSON.stringify(users.map(u => ({ id: u.id, email: u.email, role: u.role, status: u.status, isEmailVerified: u.isEmailVerified, hasProfile: !!u.cdcProfile, cdcProfile: u.cdcProfile, passwordHash: u.password })), null, 2));
  } catch (err) {
    console.error("Error querying db:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
