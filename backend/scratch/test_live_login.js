require('dotenv').config();
const fetch = require('node-fetch');

async function testLiveLogin() {
  const email = 'shalinibhadouriya230308@acropolis.in';
  const password = 'Shalini@162005';

  console.log(`\n🔑 Testing Student Login API with credentials...`);

  // Test local backend server or live server
  const targets = [
    'http://127.0.0.1:5002/api/auth/student/login',
  ];

  for (const url of targets) {
    try {
      console.log(`Sending POST request to ${url}...`);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log(`HTTP Status: ${res.status}`);
      if (res.ok) {
        console.log('✅ LOGIN SUCCESS!');
        console.log('Token generated:', data.token ? `${data.token.substring(0, 20)}...` : 'No token');
        console.log('User data:', data.user ? { id: data.user.id, email: data.user.email, role: data.user.role } : data);
      } else {
        console.error('❌ LOGIN FAILED:', data);
      }
    } catch (err) {
      console.error(`Connection failed for ${url}:`, err.message);
    }
  }
}

testLiveLogin();
