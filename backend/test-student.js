require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function test() {
  console.log("Starting test...");
  try {
    const tables = ['users', 'student_profiles', 'student_applications', 'alumni_profiles', 'jobs', 'events', 'notifications'];
    for (const t of tables) {
      const cols = await prisma.$queryRawUnsafe(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}'`);
      console.log(`Columns in ${t}:`, cols.map(c => `${c.column_name} (${c.data_type})`));
    }


    // 1. Fetch some user who is a STUDENT
    const studentUser = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    });

    if (!studentUser) {
      console.log("No STUDENT user found in database!");
      return;
    }

    console.log("Found STUDENT user:", studentUser.id, studentUser.email);

    // 2. Fetch Profile by User ID (simulation of getProfileByUserId)
    console.log("Simulating getProfileByUserId...");
    const [profile, application] = await Promise.all([
      prisma.studentProfile.findUnique({
        where: { userId: studentUser.id },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
      prisma.studentApplication.findUnique({
        where: { userId: studentUser.id },
        select: {
          status: true,
        },
      }),
    ]);

    console.log("Profile fetched:", !!profile);
    console.log("Application fetched:", !!application);

    if (profile) {
      // Simulate resolveVerificationStatus and mapProfileResponse
      const resolveVerificationStatus = (profileStatus, appStatus) => {
        if (appStatus === 'APPROVED') return 'VERIFIED';
        if (appStatus === 'REJECTED') return 'REJECTED';
        if (appStatus === 'SUBMITTED' || appStatus === 'UNDER_VERIFICATION') return 'PENDING';
        return profileStatus;
      };
      
      const status = resolveVerificationStatus(profile.verificationStatus, application?.status);
      console.log("Resolved status:", status);
    }

    // 3. Simulating getDashboardData
    console.log("Simulating getDashboardData...");
    const userId = studentUser.id;
    const [
      jobsCount,
      eventsCount,
      mentorsCount,
      unreadMessagesCount,
      recentJobs,
      upcomingEvents,
      recentNotifications,
      suggestedMentors
    ] = await Promise.all([
      // Count visible job opportunities for students
      prisma.job.count({
        where: {
          isActive: true,
          approvalStatus: {
            in: ['APPROVED', 'PENDING']
          }
        },
      }),
      // Count upcoming events
      prisma.event.count({
        where: {
          approvalStatus: 'APPROVED',
          status: 'PUBLISHED',
          eventDate: { gte: new Date() },
        },
      }),
      // Count available mentors (role ALUMNI)
      prisma.user.count({
        where: { role: 'ALUMNI', status: 'ACTIVE' },
      }),
      // Count unread messages
      prisma.message.count({
        where: {
          conversation: {
            connection: {
              OR: [
                { studentId: userId },
                { alumniId: userId },
              ],
            },
          },
          senderId: { not: userId },
          isRead: false,
        },
      }),
      // Recent Jobs (limit 5)
      prisma.job.findMany({
        where: {
          isActive: true,
          approvalStatus: {
            in: ['APPROVED', 'PENDING']
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          jobType: true,
          createdAt: true,
        },
      }),
      // Upcoming approved events (limit 5)
      prisma.event.findMany({
        where: {
          approvalStatus: 'APPROVED',
          status: 'PUBLISHED',
          eventDate: { gte: new Date() },
        },
        orderBy: { eventDate: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          mode: true,
          eventDate: true,
          eventTime: true,
          venue: true,
          bannerUrl: true,
          availableSeats: true,
          totalSeats: true,
          registrationDeadline: true,
          speakerName: true,
          speakerCompany: true,
        },
      }),
      // Recent notifications (limit 5)
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          linkUrl: true,
          createdAt: true,
        },
      }),
      // Suggested Mentors (limit 5 alumni profiles)
      prisma.alumniProfile.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          designation: true,
          currentCompany: true,
          skills: true,
          profileImageUrl: true,
        },
      }),
    ]);

    console.log("Dashboard data fetched successfully!");
    console.log("jobsCount:", jobsCount);
    console.log("eventsCount:", eventsCount);
    console.log("mentorsCount:", mentorsCount);
    console.log("unreadMessagesCount:", unreadMessagesCount);
    console.log("recentJobs:", recentJobs.length);
    console.log("upcomingEvents:", upcomingEvents.length);
    console.log("recentNotifications:", recentNotifications.length);
    console.log("suggestedMentors:", suggestedMentors.length);

  } catch (err) {
    console.error("ERROR DURING SIMULATION:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
