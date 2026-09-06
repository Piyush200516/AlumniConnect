import 'dotenv/config';
import AuthService from '../src/services/auth.service';
import { prisma } from '../src/lib/prisma';

const authService = new AuthService();

async function testRegistration() {
  const testEmail = `test.alumni.${Date.now()}@example.com`;
  console.log(`Registering test alumni with email: ${testEmail}`);

  const signupData = {
    name: 'Vikram Sharma',
    email: testEmail,
    password: 'Password123!',
    passingYear: 2024,
    currentCompany: 'Google India',
    designation: 'Software Engineer',
    enrollmentNumber: 'ENR202499',
    linkedinUrl: 'https://linkedin.com/in/vikramsharma-test',
  };

  const result = await authService.alumniSignup(signupData);
  console.log('Registration Result:', result);

  // Fetch the created profile to verify enrollmentNumber and linkedinUrl
  const profile = await prisma.alumniProfile.findFirst({
    where: { userId: result.user.id },
    select: {
      fullName: true,
      enrollmentNumber: true,
      linkedinUrl: true,
      currentCompany: true,
      designation: true,
      passingYear: true,
    }
  });

  console.log('--- VERIFIED CREATED PROFILE IN DB ---');
  console.log(JSON.stringify(profile, null, 2));
}

testRegistration()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
