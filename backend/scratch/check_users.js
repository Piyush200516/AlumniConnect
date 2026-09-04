const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const cdcUser = await prisma.user.findFirst({ where: { role: 'CDC' } });
  const alumniUser = await prisma.user.findFirst({ where: { role: 'ALUMNI' } });
  console.log('CDC User:', cdcUser ? { id: cdcUser.id, email: cdcUser.email } : 'NOT FOUND');
  console.log('Alumni User:', alumniUser ? { id: alumniUser.id, email: alumniUser.email } : 'NOT FOUND');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
