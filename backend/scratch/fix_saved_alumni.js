require('dotenv').config();
const { prisma } = require('../dist/lib/prisma');

async function main() {
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  const alumni = await prisma.user.findFirst({ where: { role: 'ALUMNI' } });

  if (student && alumni) {
    await prisma.savedAlumni.upsert({
      where: { userId_alumniId: { userId: student.id, alumniId: alumni.id } },
      update: {},
      create: { userId: student.id, alumniId: alumni.id },
    });
    console.log('Saved alumni record created successfully.');
  }
}

main().finally(() => prisma.$disconnect());
