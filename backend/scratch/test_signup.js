const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_J8hwtiySU0zA@ep-green-art-ap5hjgzj.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT id, "fullName", "enrollmentNumber", "linkedinUrl", "passingYear", "currentCompany", designation 
    FROM alumni_profiles 
    ORDER BY "createdAt" DESC 
    LIMIT 5
  `);
  console.log('--- RECENT ALUMNI PROFILES ---');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch(console.error);
