import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { generateAccessToken } from '../src/utils/jwt';

const prisma = new PrismaClient();

async function testNotificationSystem() {
  try {
    // 1. Fetch a Student and a CDC user
    const student = await prisma.user.findFirst({
      where: { role: Role.STUDENT },
      select: { id: true, email: true },
    });

    const cdc = await prisma.user.findFirst({
      where: { role: Role.CDC },
      select: { id: true, email: true },
    });

    if (!student || !cdc) {
      console.error('❌ Could not find a STUDENT and/or CDC user in the database. Please seed or create them first.');
      return;
    }

    console.log(`🔑 Using STUDENT: ${student.email} (${student.id})`);
    console.log(`🔑 Using CDC: ${cdc.email} (${cdc.id})`);

    // 2. Generate Tokens
    const studentToken = generateAccessToken({
      userId: student.id,
      email: student.email,
      role: Role.STUDENT,
    });

    const cdcToken = generateAccessToken({
      userId: cdc.id,
      email: cdc.email,
      role: Role.CDC,
    });

    console.log('✅ Generated Student JWT Token:', studentToken);
    console.log('✅ Generated CDC JWT Token:', cdcToken);

    const headers = (token: string) => ({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // 3. Register FCM Token for Student
    console.log('\n--- 1. Registering FCM Token ---');
    const fcmRegisterRes = await fetch('http://localhost:3000/api/notifications/fcm-token', {
      method: 'POST',
      headers: headers(studentToken),
      body: JSON.stringify({
        token: 'test-fcm-token-12345',
        deviceType: 'WEB',
      }),
    });
    console.log('Register FCM Status:', fcmRegisterRes.status);
    console.log('Register FCM Body:', await fcmRegisterRes.json());

    // 4. Create Notification from CDC to Student
    console.log('\n--- 2. Sending manual notification from CDC to Student ---');
    const sendNotifRes = await fetch('http://localhost:3000/api/notifications/manual', {
      method: 'POST',
      headers: headers(cdcToken),
      body: JSON.stringify({
        userId: student.id,
        type: 'SYSTEM',
        title: 'CDC Test Notice',
        message: 'This is a test notification from CDC to Student.',
        linkUrl: '/student/events',
        sendEmail: true,
      }),
    });
    console.log('Send Notification Status:', sendNotifRes.status);
    const createdNotif = await sendNotifRes.json();
    console.log('Send Notification Body:', JSON.stringify(createdNotif, null, 2));

    // 5. Get Student Notifications
    console.log('\n--- 3. Fetching Student Notifications ---');
    const fetchNotifRes = await fetch('http://localhost:3000/api/notifications', {
      headers: headers(studentToken),
    });
    console.log('Fetch Notifications Status:', fetchNotifRes.status);
    const notifs = await fetchNotifRes.json();
    console.log('Fetch Notifications Body:', JSON.stringify(notifs, null, 2));

    // Find the ID of the notification we just created
    const testNotifId = notifs.data?.notifications?.find((n: any) => n.title === 'CDC Test Notice')?.id;

    if (testNotifId) {
      // 6. Mark as Read
      console.log(`\n--- 4. Marking Notification ${testNotifId} as Read ---`);
      const readRes = await fetch(`http://localhost:3000/api/notifications/${testNotifId}/read`, {
        method: 'PATCH',
        headers: headers(studentToken),
      });
      console.log('Mark as Read Status:', readRes.status);
      console.log('Mark as Read Body:', await readRes.json());
    } else {
      console.log('⚠️ Could not find test notification in user list to mark as read.');
    }

    // 7. Unregister FCM Token
    console.log('\n--- 5. Unregistering FCM Token ---');
    const unregisterRes = await fetch('http://localhost:3000/api/notifications/fcm-token', {
      method: 'DELETE',
      headers: headers(studentToken),
      body: JSON.stringify({
        token: 'test-fcm-token-12345',
      }),
    });
    console.log('Unregister FCM Status:', unregisterRes.status);
    console.log('Unregister FCM Body:', await unregisterRes.json());

  } catch (err: any) {
    console.error('❌ Test execution error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationSystem();
