async function testLogin() {
  try {
    const res = await fetch('http://127.0.0.1:5002/api/auth/cdc/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'cdc@alumniconnect.com',
        password: 'Password@123'
      })
    });
    
    if (res.ok) {
      console.log("Login Success:", await res.json());
    } else {
      console.error("Login Failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Request Failed:", err.message);
  }
}

testLogin();
