require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET ?? 'super-secret-change-me';

// Student user ID from the database
const studentUserId = '4daf33ef-d922-4e6a-b55e-832fb8074bb7';
const studentEmail = 'aasthachouhan231189@acropolis.in';

const token = jwt.sign({
  userId: studentUserId,
  email: studentEmail,
  role: 'STUDENT'
}, JWT_SECRET, { expiresIn: '1d' });

console.log('Generated Token:', token);

async function checkEndpoints() {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log('\n--- Checking Student Profile Endpoint ---');
  try {
    const res = await fetch('http://localhost:5002/api/student/profile', { headers });
    console.log('Profile Status:', res.status);
    const data = await res.json();
    console.log('Profile Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.log('Profile Fetch Error:', err.message);
  }

  console.log('\n--- Checking Student Dashboard Endpoint ---');
  try {
    const res = await fetch('http://localhost:5002/api/student/dashboard', { headers });
    console.log('Dashboard Status:', res.status);
    const data = await res.json();
    console.log('Dashboard Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.log('Dashboard Fetch Error:', err.message);
  }
}

checkEndpoints();
