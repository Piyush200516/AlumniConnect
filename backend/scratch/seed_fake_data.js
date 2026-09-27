require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function seedFakeData() {
  console.log('🚀 Starting Fake Data Generation while preserving existing Users & Profiles...\n');

  // Fetch existing users
  const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, include: { studentProfile: true } });
  const alumni = await prisma.user.findMany({ where: { role: 'ALUMNI' }, include: { alumniProfile: true } });
  const cdcUsers = await prisma.user.findMany({ where: { role: 'CDC' }, include: { cdcProfile: true } });

  console.log(`Found ${students.length} Students, ${alumni.length} Alumni, ${cdcUsers.length} CDC Users.`);

  if (students.length === 0 || alumni.length === 0 || cdcUsers.length === 0) {
    throw new Error('Database must contain at least 1 Student, 1 Alumni, and 1 CDC User.');
  }

  const student1 = students[0];
  const alumni1 = alumni[0];
  const alumni2 = alumni.length > 1 ? alumni[1] : alumni[0];
  const cdc1 = cdcUsers[0];

  // 1. Companies & Skills
  console.log('📦 Seeding Companies & Skills...');
  const companyNames = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Razorpay', 'Swiggy'];
  const companyRecords = [];
  for (const name of companyNames) {
    let comp = await prisma.company.findUnique({ where: { name } });
    if (!comp) {
      comp = await prisma.company.create({
        data: {
          name,
          location: 'Bangalore, India',
          logoUrl: `https://logo.clearbit.com/${name.toLowerCase()}.com`,
        },
      });
    }
    companyRecords.push(comp);
  }

  const skillNames = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Python', 'AWS', 'Docker', 'Machine Learning'];
  for (const name of skillNames) {
    const existing = await prisma.skill.findUnique({ where: { name } });
    if (!existing) {
      await prisma.skill.create({ data: { name } });
    }
  }

  // 2. Extended Alumni Profile details
  console.log('👤 Enhancing Alumni Profiles...');
  for (const alm of alumni) {
    if (alm.alumniProfile) {
      await prisma.alumniProfile.update({
        where: { id: alm.alumniProfile.id },
        data: {
          currentCompany: companyRecords[0].name,
          designation: 'Senior Software Engineer',
          industry: 'Information Technology',
          experience: 5,
          skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
          bio: 'Passionate about building scalable backend systems and mentoring students.',
          location: 'Bangalore, India',
          companyId: companyRecords[0].id,
          mentorshipAvailability: true,
          verificationStatus: 'VERIFIED',
        },
      });
    }
  }

  // 3. Jobs & Internships
  console.log('💼 Seeding Jobs & Internships...');
  const fakeJobs = [
    {
      postedById: alumni1.id,
      title: 'Full Stack Software Engineer',
      description: 'Join our core product team working on React, TypeScript, and Node.js microservices.',
      company: 'Google',
      location: 'Bangalore / Hybrid',
      salary: '₹18,000,000 - ₹24,000,000 PA',
      jobType: 'FULL_TIME',
      skillsRequired: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      approvalStatus: 'APPROVED',
      responsibilities: 'Build scalable web APIs and optimize DB queries.',
      eligibility: 'B.Tech CSE/IT with 0-2 years experience.',
      companyLogo: 'https://logo.clearbit.com/google.com',
    },
    {
      postedById: alumni2.id,
      title: 'Backend Engineering Intern',
      description: '6-month internship building cloud microservices with Node.js and Redis.',
      company: 'Microsoft',
      location: 'Hyderabad / Remote',
      salary: '₹65,000 / month',
      jobType: 'INTERNSHIP',
      skillsRequired: ['Node.js', 'Python', 'AWS'],
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isActive: true,
      approvalStatus: 'APPROVED',
      responsibilities: 'Develop REST APIs and write automated unit tests.',
      eligibility: 'Final year B.Tech/M.Tech students.',
      companyLogo: 'https://logo.clearbit.com/microsoft.com',
    },
    {
      postedById: alumni1.id,
      title: 'Frontend Developer (React)',
      description: 'Exciting frontend opportunity building responsive user dashboards.',
      company: 'Razorpay',
      location: 'Bangalore',
      salary: '₹14,000,000 - ₹18,000,000 PA',
      jobType: 'FULL_TIME',
      skillsRequired: ['React', 'TypeScript', 'Tailwind CSS'],
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      isActive: true,
      approvalStatus: 'PENDING',
      responsibilities: 'Create pixel-perfect UI components.',
      eligibility: 'Passionate frontend developer.',
      companyLogo: 'https://logo.clearbit.com/razorpay.com',
    },
  ];

  const createdJobs = [];
  for (const jobData of fakeJobs) {
    const job = await prisma.job.create({ data: jobData });
    createdJobs.push(job);
  }

  // 4. Job Applications
  console.log('📝 Seeding Job Applications...');
  for (const student of students) {
    for (const job of createdJobs) {
      const existing = await prisma.jobApplication.findUnique({
        where: { jobId_applicantId: { jobId: job.id, applicantId: student.id } },
      });
      if (!existing) {
        await prisma.jobApplication.create({
          data: {
            jobId: job.id,
            applicantId: student.id,
            resumeUrl: 'https://res.cloudinary.com/demo/image/upload/sample_resume.pdf',
            coverLetter: 'I am highly enthusiastic about this role and have hands-on experience in the required stack.',
            status: 'SHORTLISTED',
          },
        });
      }
    }
  }

  // 5. Events & Registrations
  console.log('📅 Seeding Events & Registrations...');
  const fakeEvents = [
    {
      createdById: cdc1.id,
      title: 'Annual Campus Placement Orientation 2026',
      description: 'Comprehensive orientation for final year students covering placement guidelines.',
      category: 'PLACEMENT',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      eventTime: '10:00 AM - 01:00 PM',
      duration: '3 Hours',
      venue: 'Main University Auditorium',
      mode: 'HYBRID',
      speakerName: 'Dr. A. K. Sharma',
      speakerDesignation: 'Head of CDC',
      speakerCompany: 'University CDC',
      totalSeats: 500,
      availableSeats: 480,
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'PUBLISHED',
      approvalStatus: 'APPROVED',
      keyBenefits: ['Resume Checklist', 'Mock Interview Schedule'],
    },
    {
      createdById: alumni1.id,
      title: 'Mastering System Design & Microservices',
      description: 'Interactive technical workshop hosted by senior engineers on distributed systems.',
      category: 'WORKSHOP',
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      eventTime: '04:00 PM - 06:00 PM',
      duration: '2 Hours',
      venue: 'Google Meet',
      mode: 'ONLINE',
      speakerName: alumni1.alumniProfile?.fullName || 'Senior Tech Lead',
      speakerDesignation: 'Staff Software Engineer',
      speakerCompany: 'Google',
      totalSeats: 200,
      availableSeats: 185,
      registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      status: 'PUBLISHED',
      approvalStatus: 'APPROVED',
      keyBenefits: ['Live System Architecture', 'Q&A Session', 'Certificate'],
    },
  ];

  const createdEvents = [];
  for (const evtData of fakeEvents) {
    const event = await prisma.event.create({ data: evtData });
    createdEvents.push(event);
  }

  // Registrations & Certificates
  for (const student of students) {
    for (const evt of createdEvents) {
      const regId = `REG-${evt.id.slice(0, 4)}-${student.id.slice(0, 4)}`.toUpperCase();
      const existing = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: evt.id, userId: student.id } },
      });
      let reg = existing;
      if (!reg) {
        reg = await prisma.eventRegistration.create({
          data: {
            eventId: evt.id,
            userId: student.id,
            registrationId: regId,
            status: 'ATTENDED',
            attendanceMarkedAt: new Date(),
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?data=${regId}`,
          },
        });
      }

      // Issue Certificate
      const certExisting = await prisma.eventCertificate.findUnique({ where: { registrationId: reg.id } });
      if (!certExisting) {
        await prisma.eventCertificate.create({
          data: {
            registrationId: reg.id,
            studentId: student.id,
            eventId: evt.id,
            certificateUrl: 'https://res.cloudinary.com/demo/image/upload/sample_certificate.pdf',
          },
        });
      }
    }
  }

  // 6. Mentorship Requests, Connections, & Chat Messages
  console.log('🤝 Seeding Mentorship Requests & Messages...');
  for (const student of students) {
    const reqExisting = await prisma.mentorshipRequest.findUnique({
      where: { studentId_alumniId: { studentId: student.id, alumniId: alumni1.id } },
    });
    if (!reqExisting) {
      await prisma.mentorshipRequest.create({
        data: {
          studentId: student.id,
          alumniId: alumni1.id,
          status: 'ACCEPTED',
          message: 'Hello! I would love guidance on full-stack engineering interviews.',
          note: 'Accepted! Happy to guide you.',
        },
      });
    }

    let conn = await prisma.mentorshipConnection.findUnique({
      where: { studentId_alumniId: { studentId: student.id, alumniId: alumni1.id } },
    });
    if (!conn) {
      conn = await prisma.mentorshipConnection.create({
        data: { studentId: student.id, alumniId: alumni1.id },
      });
    }

    let conv = await prisma.conversation.findUnique({ where: { connectionId: conn.id } });
    if (!conv) {
      conv = await prisma.conversation.create({ data: { connectionId: conn.id } });
    }

    await prisma.message.createMany({
      data: [
        {
          conversationId: conv.id,
          senderId: student.id,
          message: 'Hi Sir, thank you for accepting my mentorship request!',
          isRead: true,
        },
        {
          conversationId: conv.id,
          senderId: alumni1.id,
          message: 'Welcome! Share your resume and portfolio project link.',
          isRead: true,
        },
        {
          conversationId: conv.id,
          senderId: student.id,
          message: 'Sure! I have shared my resume on the platform.',
          isRead: false,
        },
      ],
    });
  }

  // 7. Community Posts & Comments
  console.log('💬 Seeding Community Posts & Comments...');
  const fakePosts = [
    {
      authorId: alumni1.id,
      content: '🚀 Top 5 tips for cracking tech interviews in 2026: 1. Master DSA. 2. Build full-stack projects. 3. System Design. 4. Mock Interviews. 5. Keep active on GitHub!',
    },
    {
      authorId: cdc1.id,
      content: '📢 Placement drive registration begins next week. Make sure your CDC student application is submitted and verified.',
    },
  ];

  for (const postData of fakePosts) {
    const post = await prisma.post.create({ data: postData });
    for (const student of students) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          userId: student.id,
          content: 'Thank you for sharing this update!',
        },
      });
      await prisma.like.create({
        data: {
          postId: post.id,
          userId: student.id,
        },
      });
    }
  }

  // 8. Student Portal Application
  console.log('📋 Seeding Student Application for CDC Verification...');
  for (const student of students) {
    const appExisting = await prisma.studentApplication.findUnique({ where: { userId: student.id } });
    if (!appExisting) {
      await prisma.studentApplication.create({
        data: {
          userId: student.id,
          status: 'APPROVED',
          fullName: student.studentProfile?.fullName || 'Student Applicant',
          enrollmentNumber: student.studentProfile?.enrollmentNumber || 'ENR2026001',
          email: student.email,
          phone: '+91 9876543210',
          gender: 'Male',
          dateOfBirth: new Date('2003-05-15'),
          profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
          aadharNumber: '1234-5678-9012',
          collegeIdNumber: 'COL2026-CS-042',
          fatherName: 'Rajesh Mishra',
          fatherOccupation: 'Government Service',
          fatherPhone: '+91 9812345678',
          motherName: 'Sunita Mishra',
          motherOccupation: 'Homemaker',
          motherPhone: '+91 9812345679',
          familyIncome: '₹8,00,000 - ₹12,00,000 PA',
          emergencyContact: '+91 9876543210',
          currentAddress: '123 University Campus Hostel',
          currentCity: 'Bhopal',
          currentState: 'Madhya Pradesh',
          currentPincode: '462001',
          permanentAddress: '45 Green Park Colony',
          permanentCity: 'Indore',
          permanentState: 'Madhya Pradesh',
          permanentPincode: '452001',
          sameAsCurrent: false,
          class10Board: 'CBSE',
          class10School: 'Demonstration School',
          class10Percentage: 92.5,
          class10PassingYear: 2019,
          class12Board: 'CBSE',
          class12School: 'Demonstration School',
          class12Percentage: 90.2,
          class12PassingYear: 2021,
          currentCourse: 'B.Tech',
          currentBranch: 'Computer Science & Engineering',
          currentSemester: 7,
          currentCGPA: 8.85,
          careerPreference: 'Software Engineering',
          primaryDomain: 'Web Development',
          secondaryDomain: 'Cloud Computing',
          skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
          githubUrl: 'https://github.com/Piyush200516',
          linkedinUrl: 'https://linkedin.com/in/piyushmishra',
          resumeUrl: 'https://res.cloudinary.com/demo/image/upload/sample_resume.pdf',
          submittedAt: new Date(),
          verifiedAt: new Date(),
        },
      });
    }
  }

  // 9. Notifications & Bookmarks
  console.log('🔔 Seeding Notifications & Bookmarks...');
  for (const student of students) {
    await prisma.notification.createMany({
      data: [
        {
          userId: student.id,
          type: 'JOB_APPLICATION',
          title: 'Application Shortlisted',
          message: 'Your application for Full Stack Engineer at Google has been shortlisted!',
          isRead: false,
        },
        {
          userId: student.id,
          type: 'MENTORSHIP_ACCEPTED',
          title: 'Mentorship Accepted',
          message: 'Your mentorship request has been accepted by Senior Software Engineer at Google.',
          isRead: true,
        },
      ],
    });

    if (createdJobs.length > 0) {
      const existingSavedJob = await prisma.savedJob.findUnique({
        where: { userId_jobId: { userId: student.id, jobId: createdJobs[0].id } },
      });
      if (!existingSavedJob) {
        await prisma.savedJob.create({ data: { userId: student.id, jobId: createdJobs[0].id } });
      }
    }
  }

  console.log('\n✅ FAKE DATA SEEDING COMPLETED SUCCESSFULLY!');
}

seedFakeData()
  .catch((err) => {
    console.error('❌ Seeding failed with error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect().then(() => pool.end()));
