import { prisma } from '../src/lib/prisma';
import { generateAccessToken } from '../src/utils/jwt';

(async () => {
  const user = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  if (!user) {
    console.error('No student user found');
    process.exit(1);
  }
  const token = generateAccessToken({ userId: user.id, email: user.email, role: user.role as any });
  console.log('TOKEN:', token);
  await prisma.$disconnect();
})();
