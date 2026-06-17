const crypto = require('crypto');

const targetHash = '72683a884b66c9da053874411d61d431';

const words = [
  'acropolis', 'Acropolis', 'ACROPOLIS',
  'cdc', 'CDC',
  'portal', 'Portal', 'PORTAL',
  'group', 'Group', 'GROUP',
  'aitr', 'Aitr', 'AITR',
  'admin', 'Admin', 'ADMIN',
  'office', 'Office', 'OFFICE',
  'director', 'Director', 'DIRECTOR',
  'user', 'User', 'USER',
  'password', 'Password', 'PASSWORD'
];

const suffixes = [
  '', '123', '@123', '1234', '12345', '2025', '2026', '!', '@', '#', 'office', 'group'
];

let found = false;
for (const w1 of words) {
  for (const w2 of words) {
    for (const s of suffixes) {
      const candidates = [
        w1 + w2 + s,
        w1 + s + w2,
        w1 + '_' + w2 + s,
        w1 + '-' + w2 + s,
        w1 + s,
      ];
      for (const c of candidates) {
        const md5 = crypto.createHash('md5').update(c).digest('hex');
        if (md5 === targetHash) {
          console.log(`FOUND IT! Plaintext: "${c}"`);
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (found) break;
  }
  if (found) break;
}

if (!found) {
  // Let's try single words with more combinations
  for (const w of words) {
    for (const s1 of suffixes) {
      for (const s2 of suffixes) {
        const c = w + s1 + s2;
        const md5 = crypto.createHash('md5').update(c).digest('hex');
        if (md5 === targetHash) {
          console.log(`FOUND IT! Plaintext: "${c}"`);
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (found) break;
  }
}

if (!found) {
  console.log("Still not found");
}
