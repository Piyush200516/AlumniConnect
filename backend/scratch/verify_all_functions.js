require('dotenv').config();
const { prisma } = require('../dist/lib/prisma');

async function testAllFunctions() {
  console.log('🧪 Starting Full Platform Functionality Verification...\n');

  const testResults = [];

  function record(feature, status, detail) {
    testResults.push({ Feature: feature, Status: status ? '✅ PASS' : '❌ FAIL', Detail: detail });
  }

  try {
    // 1. User & Profile Verification
    console.log('1️⃣ Testing Users & Profiles...');
    const users = await prisma.user.findMany({ include: { studentProfile: true, alumniProfile: true, cdcProfile: true } });
    record('User Management', users.length > 0, `Found ${users.length} total users across Student, Alumni, and CDC roles.`);

    const student = users.find(u => u.role === 'STUDENT');
    const alumni = users.find(u => u.role === 'ALUMNI');
    const cdc = users.find(u => u.role === 'CDC');

    record('Student Profile', !!student?.studentProfile, `Student: ${student?.email}, Branch: ${student?.studentProfile?.branch}`);
    record('Alumni Profile', !!alumni?.alumniProfile, `Alumni: ${alumni?.email}, Company: ${alumni?.alumniProfile?.currentCompany}`);
    record('CDC Profile', !!cdc?.cdcProfile, `CDC: ${cdc?.email}, Department: ${cdc?.cdcProfile?.department}`);

    // 2. Jobs & Internships
    console.log('2️⃣ Testing Jobs & Internships System...');
    const jobs = await prisma.job.findMany({ include: { postedBy: true, applications: true } });
    record('Jobs Listing', jobs.length > 0, `Total Jobs Posted: ${jobs.length}`);

    const approvedJobs = jobs.filter(j => j.approvalStatus === 'APPROVED');
    record('Job Approval Filtering', approvedJobs.length > 0, `Approved Jobs count: ${approvedJobs.length}`);

    const applications = await prisma.jobApplication.findMany({ include: { job: true, applicant: true } });
    record('Job Applications', applications.length > 0, `Total Applications: ${applications.length}`);

    // 3. Events & Registrations
    console.log('3️⃣ Testing Events & Certification System...');
    const events = await prisma.event.findMany({ include: { createdBy: true, registrations: true } });
    record('Events Management', events.length > 0, `Total Events: ${events.length}`);

    const registrations = await prisma.eventRegistration.findMany({ include: { certificate: true, user: true, event: true } });
    record('Event Registrations', registrations.length > 0, `Event Registrations: ${registrations.length}`);

    const certificates = await prisma.eventCertificate.findMany();
    record('Event Certificates', certificates.length > 0, `Certificates Issued: ${certificates.length}`);

    // 4. Mentorship & Real-time Chat
    console.log('4️⃣ Testing Mentorship & Messaging System...');
    const mentorshipRequests = await prisma.mentorshipRequest.findMany();
    record('Mentorship Requests', mentorshipRequests.length > 0, `Total Requests: ${mentorshipRequests.length}`);

    const mentorshipConnections = await prisma.mentorshipConnection.findMany({ include: { conversation: { include: { messages: true } } } });
    record('Mentorship Connections', mentorshipConnections.length > 0, `Connections: ${mentorshipConnections.length}`);

    const conversations = await prisma.conversation.findMany({ include: { messages: true } });
    const totalMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0);
    record('Conversations & Messages', conversations.length > 0 && totalMessages > 0, `Conversations: ${conversations.length}, Total Messages: ${totalMessages}`);

    // 5. CDC Portal Verification Applications
    console.log('5️⃣ Testing CDC Student Applications System...');
    const studentApps = await prisma.studentApplication.findMany();
    record('CDC Student Applications', studentApps.length > 0, `Total Student Portal Verification Applications: ${studentApps.length}`);

    // 6. Community Posts, Comments, & Likes
    console.log('6️⃣ Testing Community Feed & Engagement...');
    const posts = await prisma.post.findMany({ include: { comments: true, likes: true } });
    record('Community Posts', posts.length > 0, `Posts: ${posts.length}`);
    const commentsCount = posts.reduce((acc, p) => acc + p.comments.length, 0);
    const likesCount = posts.reduce((acc, p) => acc + p.likes.length, 0);
    record('Post Comments & Likes', commentsCount > 0 && likesCount > 0, `Comments: ${commentsCount}, Likes: ${likesCount}`);

    // 7. Notifications & Saved Items
    console.log('7️⃣ Testing Notifications & Bookmarks...');
    const notifications = await prisma.notification.findMany();
    record('In-App Notifications', notifications.length > 0, `Notifications: ${notifications.length}`);

    const savedJobs = await prisma.savedJob.findMany();
    record('Saved Jobs Bookmarks', savedJobs.length > 0, `Saved Jobs: ${savedJobs.length}`);

    const savedAlumni = await prisma.savedAlumni.findMany();
    record('Saved Alumni Bookmarks', savedAlumni.length > 0, `Saved Alumni: ${savedAlumni.length}`);

    console.log('\n======================================================');
    console.log('📊 FUNCTIONALITY VERIFICATION SUMMARY');
    console.log('======================================================');
    console.table(testResults);

  } catch (error) {
    console.error('❌ Function verification encountered error:', error);
  }
}

testAllFunctions()
  .finally(() => prisma.$disconnect());
