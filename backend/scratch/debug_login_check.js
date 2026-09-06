require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function debugCheck() {
  console.log("=== CHECKING ALL USERS IN DB FOR EMAIL MATCHES & DUPLICATES ===");
  const users = await prisma.user.findMany();
  console.log(`Total users in database: ${users.length}`);

  // Find any users matching sonu / piyush / etc case-insensitively
  const emailMap = {};
  const duplicates = [];

  for (const u of users) {
    const lower = u.email.toLowerCase();
    if (emailMap[lower]) {
      duplicates.push({ existing: emailMap[lower], duplicate: u });
    } else {
      emailMap[lower] = u;
    }
  }

  if (duplicates.length > 0) {
    console.log("⚠️ FOUND DUPLICATE EMAILS (case-insensitive):", JSON.stringify(duplicates, null, 2));
  } else {
    console.log("✅ No duplicate emails found in DB (case-insensitive).");
  }

  // Check recent alumni or student users, e.g., sonuyadav
  const sonuUsers = users.filter(u => u.email.toLowerCase().includes('sonu'));
  console.log("\nUsers matching 'sonu':", JSON.stringify(sonuUsers, null, 2));

  for (const user of sonuUsers) {
    console.log(`\nTesting password compare for user: ${user.email} (Role: ${user.role}, Status: ${user.status})`);
    console.log(`Stored password: ${user.password}`);
    const isBcrypt = /^\$2[aby]\$\d{2}\$/.test(user.password);
    console.log(`Is Bcrypt Hash format? ${isBcrypt}`);
  }

  await prisma.$disconnect();
  await pool.end();
}

debugCheck().catch(console.error);
