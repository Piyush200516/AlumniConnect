const crypto = require('crypto');

const hash = '72683a884b66c9da053874411d61d431';
const commonPasswords = [
  'admin',
  'admin123',
  'password',
  'cdc123',
  '12345678',
  'acropolis',
  'acropolis123',
  'cdcportalgroup',
  'cdcportal',
  'cdcportal123',
  'cdcportalgroup123',
  'cdc',
  '12345',
  '123456'
];

for (const p of commonPasswords) {
  const md5 = crypto.createHash('md5').update(p).digest('hex');
  if (md5 === hash) {
    console.log(`Found! Plain text password is: ${p}`);
    process.exit(0);
  }
}
console.log('Not found in simple list');
