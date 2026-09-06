const bcrypt = require('bcryptjs');

const hash = "$2b$10$yTtv/isYez5b.UN1dNx5bOIxvwbsEbNaVe0ykFsHZxtKysXRlI5G.";

const candidates = [
  "sonu", "Sonu", "sonu@123", "Sonu@123", "sonu123", "Sonu123",
  "123456", "12345678", "password", "Password123", "Password@123",
  "sonuyadav", "SonuYadav", "sonuyadav123", "SonuYadav@123",
  "alumni", "Alumni@123", "Piyush@123", "piyush123"
];

async function check() {
  for (const cand of candidates) {
    const match = await bcrypt.compare(cand, hash);
    if (match) {
      console.log(`MATCH FOUND! The plain password for sonuyadav21052003@gmail.com is: "${cand}"`);
      return;
    }
  }
  console.log("No match among candidates.");
}

check();
