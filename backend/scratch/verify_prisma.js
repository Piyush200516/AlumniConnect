const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst();
    console.log('User record:', user);
  } catch (e) {
    console.error('Error querying user:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
