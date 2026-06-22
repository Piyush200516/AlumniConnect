const axios = require('axios');
(async () => {
  try {
    const res = await axios.post('http://localhost:5002/api/auth/student/login', {
      email: 'student@example.com',
      password: 'test123'
    }, { headers: { 'Content-Type': 'application/json' } });
    console.log('Response:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
})();
