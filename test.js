const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$/.test(value);
console.log("Matches:", isBcryptHash("$2a$10$22aA.v03c94f5T1Ky..."));
