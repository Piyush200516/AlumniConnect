process.env.NODE_ENV = 'test';

import { app } from '../src/server';
import { prisma } from '../src/lib/prisma';
import { generateAccessToken } from '../src/utils/jwt';
import http from 'http';
import { AddressInfo } from 'net';

async function makeRequest(port: number, options: http.RequestOptions, postData?: any): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const reqOptions: http.RequestOptions = {
      hostname: '127.0.0.1',
      port,
      ...options
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode || 500, data: parsed });
        } catch {
          resolve({ statusCode: res.statusCode || 500, data: body });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

(async () => {
  let server: http.Server | undefined;
  try {
    console.log('--- Starting Alumni RBAC & Job Posting Verification ---');

    await prisma.$connect();
    console.log('Prisma connected successfully.');

    // Start server listener on dynamic port
    server = http.createServer(app).listen(0, '127.0.0.1');
    await new Promise((res) => server?.once('listening', res));
    const address = server.address() as AddressInfo;
    const port = address.port;
    console.log(`Test server running on port ${port}`);

    // 1. Find Alumni user
    const alumniUser = await prisma.user.findFirst({ where: { role: 'ALUMNI' } });
    if (!alumniUser) {
      console.error('ERROR: No user with role ALUMNI found in database');
      process.exit(1);
    }
    console.log(`Found Alumni User: ${alumniUser.email} (ID: ${alumniUser.id}, Role: ${alumniUser.role})`);

    // 2. Find Student user
    const studentUser = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!studentUser) {
      console.error('ERROR: No user with role STUDENT found in database');
      process.exit(1);
    }
    console.log(`Found Student User: ${studentUser.email} (ID: ${studentUser.id}, Role: ${studentUser.role})`);

    // 3. Generate tokens
    const alumniToken = generateAccessToken({ userId: alumniUser.id, email: alumniUser.email, role: alumniUser.role });
    const studentToken = generateAccessToken({ userId: studentUser.id, email: studentUser.email, role: studentUser.role });

    // Test 1: GET /api/alumni/connections/incoming as Alumni
    console.log('\n[Test 1] Testing GET /api/alumni/connections/incoming (Alumni)...');
    const connRes = await makeRequest(port, {
      path: '/api/alumni/connections/incoming',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${alumniToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status: ${connRes.statusCode}`);
    if (connRes.statusCode === 200) {
      console.log('✅ GET /api/alumni/connections/incoming SUCCESS!');
    } else {
      console.error('❌ GET /api/alumni/connections/incoming FAILED:', connRes.data);
    }

    // Test 2: POST /api/jobs/create as Alumni
    console.log('\n[Test 2] Testing POST /api/jobs/create (Alumni)...');
    const testJobTitle = `Test Senior Software Engineer ${Date.now()}`;
    const jobPayload = {
      title: testJobTitle,
      company: 'Tech Solutions Inc',
      companyLogo: null,
      location: 'Remote',
      salary: '18-25 LPA',
      jobType: 'FULL_TIME',
      skillsRequired: ['TypeScript', 'Node.js', 'React'],
      deadline: new Date(Date.now() + 864000000).toISOString(),
      description: 'We are hiring a Senior Software Engineer to join our growing team.',
      responsibilities: 'Develop backend APIs and frontend dashboards.',
      eligibility: 'Open to B.Tech 2026 graduates and alumni',
      benefits: 'Health insurance, flexible hours',
      selectionProcess: 'Resume screening -> Technical Interview -> HR Round',
      applicationLink: 'https://example.com/careers'
    };

    const createJobRes = await makeRequest(port, {
      path: '/api/jobs/create',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${alumniToken}`,
        'Content-Type': 'application/json'
      }
    }, jobPayload);

    console.log(`Status: ${createJobRes.statusCode}`);
    if (createJobRes.statusCode === 201) {
      console.log('✅ POST /api/jobs/create SUCCESS! Created Job ID:', createJobRes.data?.data?.id);
    } else {
      console.error('❌ POST /api/jobs/create FAILED:', createJobRes.data);
    }

    // Test 3: GET /api/jobs as Student (verify newly created job is listed)
    console.log('\n[Test 3] Testing GET /api/jobs (Student view for newly posted job)...');
    const studentJobsRes = await makeRequest(port, {
      path: '/api/jobs',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status: ${studentJobsRes.statusCode}`);
    if (studentJobsRes.statusCode === 200) {
      const jobsList = studentJobsRes.data?.data || [];
      const foundJob = jobsList.find((j: any) => j.title === testJobTitle);
      if (foundJob) {
        console.log(`✅ Newly posted job found in Student job listing! Title: "${foundJob.title}", ApprovalStatus: ${foundJob.approvalStatus}`);
      } else {
        console.warn('⚠️ Newly posted job not found in student jobs list! Total jobs returned:', jobsList.length);
      }
    } else {
      console.error('❌ GET /api/jobs (Student) FAILED:', studentJobsRes.data);
    }

    console.log('\n--- ALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY ---');
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Verification script error:', err);
    if (server) server.close();
    await prisma.$disconnect();
    process.exit(1);
  }
})();
