require('dotenv').config();
const { prisma } = require('../dist/lib/prisma');

async function main() {
  const users = await prisma.user.findMany({
    include: { studentProfile: true, alumniProfile: true, cdcProfile: true }
  });
  console.log('=== ALL USERS IN DB (' + users.length + ') ===');
  for (const u of users) {
    console.log({
      id: u.id,
      email: u.email,
      role: u.role,
      studentName: u.studentProfile?.fullName,
      alumniName: u.alumniProfile?.fullName,
      cdcDept: u.cdcProfile?.department,
    });
  }
}

main().finally(() => prisma.$disconnect());
