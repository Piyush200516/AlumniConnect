require('dotenv').config();
const { prisma } = require('../dist/lib/prisma');
const bcrypt = require('bcryptjs');

async function debugLogin() {
  const targetEmail = 'shalinibhadouriya230308@acropolis.in';

  console.log(`\n🔍 Searching for email: ${targetEmail}`);

  // Search case-insensitive or exact
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: 'shalinibhadouriya',
        mode: 'insensitive',
      },
    },
    include: {
      studentProfile: true,
      alumniProfile: true,
      cdcProfile: true,
    },
  });

  console.log(`Found ${users.length} matching user(s):`);

  for (const u of users) {
    console.log({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      isEmailVerified: u.isEmailVerified,
      passwordHashPrefix: u.password.substring(0, 15),
    });

    const candidatePasswords = [
      'Shalini@162005',
      'Shalini@16_2005',
      'Shalini@16_2005_I_Love_You',
      'shalini123',
      'Password123',
    ];

    for (const pwd of candidatePasswords) {
      const isMatch = await bcrypt.compare(pwd, u.password);
      console.log(`  Password check ["${pwd}"]: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
  }

  console.log('\n--- ALL USERS IN DB ---');
  const allUsers = await prisma.user.findMany({
    select: { email: true, role: true, isEmailVerified: true },
  });
  console.table(allUsers);
}

debugLogin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
