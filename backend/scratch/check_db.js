require('dotenv').config();
const { prisma } = require('../dist/lib/prisma');

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, isEmailVerified: true },
  });
  console.log('--- USERS IN DATABASE ---');
  console.table(users);

  const jobsCount = await prisma.job.count();
  const eventsCount = await prisma.event.count();
  const applicationsCount = await prisma.jobApplication.count();
  const mentorshipCount = await prisma.mentorshipRequest.count();
  const postsCount = await prisma.post.count();

  console.log({
    usersCount: users.length,
    jobsCount,
    eventsCount,
    applicationsCount,
    mentorshipCount,
    postsCount,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
