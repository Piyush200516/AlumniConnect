import { PrismaClient, Role, AccountStatus, EventMode, EventStatus, JobApprovalStatus, EventApprovalStatus, JobType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding data...');
  
  // Clean up existing data to prevent conflicts (optional, but good for fresh seed)
  // Be careful with this in production! Here we assume this is just for testing.
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.job.deleteMany();
  await prisma.mentorshipRequest.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.alumniProfile.deleteMany();
  await prisma.cdcProfile.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('Password@123', 10);

  // 1. Create CDC User
  const cdcUser = await prisma.user.create({
    data: {
      email: 'cdc@alumniconnect.com',
      password,
      role: Role.CDC,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      cdcProfile: {
        create: {
          collegeName: 'Global Engineering College',
          department: 'Placement Cell',
          officialEmail: 'cdc@alumniconnect.com',
          contactNumber: '1234567890',
        },
      },
    },
  });
  console.log('Created CDC user');

  // 2. Create Alumni Users
  const alumni1 = await prisma.user.create({
    data: {
      email: 'alumni1@example.com',
      password,
      role: Role.ALUMNI,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      alumniProfile: {
        create: {
          fullName: 'Alice Smith',
          passingYear: 2020,
          currentCompany: 'Tech Corp',
          designation: 'Software Engineer',
          industry: 'IT',
          experience: 4,
          skills: ['React', 'Node.js', 'PostgreSQL'],
          location: 'New York',
          verificationStatus: 'VERIFIED',
        },
      },
    },
  });

  const alumni2 = await prisma.user.create({
    data: {
      email: 'alumni2@example.com',
      password,
      role: Role.ALUMNI,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      alumniProfile: {
        create: {
          fullName: 'Bob Johnson',
          passingYear: 2018,
          currentCompany: 'Finance Inc',
          designation: 'Data Scientist',
          industry: 'Finance',
          experience: 6,
          skills: ['Python', 'Machine Learning', 'SQL'],
          location: 'San Francisco',
          verificationStatus: 'VERIFIED',
        },
      },
    },
  });
  console.log('Created Alumni users');

  // 3. Create Student Users
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@example.com',
      password,
      role: Role.STUDENT,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      studentProfile: {
        create: {
          fullName: 'Charlie Davis',
          enrollmentNumber: 'EN123456',
          branch: 'Computer Science',
          course: 'B.Tech',
          graduationYear: 2025,
          skills: ['Java', 'C++', 'Algorithms'],
          verificationStatus: 'VERIFIED',
        },
      },
    },
  });
  console.log('Created Student users');

  // 4. Create Jobs
  const job = await prisma.job.create({
    data: {
      postedById: alumni1.id,
      title: 'Frontend Developer',
      description: 'Looking for a skilled frontend developer with React experience.',
      company: 'Tech Corp',
      location: 'Remote',
      salary: '$80,000 - $120,000',
      jobType: JobType.FULL_TIME,
      skillsRequired: ['React', 'JavaScript', 'CSS'],
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 month from now
      isActive: true,
      approvalStatus: JobApprovalStatus.APPROVED,
    },
  });
  console.log('Created Job');

  // 5. Create Events
  const event = await prisma.event.create({
    data: {
      createdById: cdcUser.id,
      title: 'Annual Tech Summit',
      description: 'Join us for the biggest tech event of the year!',
      eventDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true,
      approvalStatus: EventApprovalStatus.APPROVED,
      category: 'Workshop',
      duration: '4 hours',
      eventTime: '10:00 AM',
      mode: EventMode.ONLINE,
      registrationDeadline: new Date(new Date().setDate(new Date().getDate() + 15)),
      speakerName: 'Alice Smith',
      speakerCompany: 'Tech Corp',
      status: EventStatus.PUBLISHED,
      venue: 'Online Platform',
      availableSeats: 500,
      totalSeats: 500,
    },
  });
  console.log('Created Event');

  // 6. Create Posts
  const post = await prisma.post.create({
    data: {
      authorId: alumni2.id,
      content: 'Excited to announce my new paper published in IEEE!',
    },
  });
  console.log('Created Post');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
