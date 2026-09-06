import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const alumniList = await prisma.alumniProfile.findMany({
    select: {
      id: true,
      fullName: true,
      enrollmentNumber: true,
      linkedinUrl: true,
      currentCompany: true,
      designation: true,
      user: {
        select: { email: true }
      }
    }
  });

  console.log('--- ALUMNI PROFILES IN DATABASE ---');
  console.log(JSON.stringify(alumniList, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
