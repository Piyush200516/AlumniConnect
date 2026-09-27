require('dotenv').config();
const { prisma } = require('../dist/lib/prisma');
const bcrypt = require('bcryptjs');

async function createShaliniUser() {
  const email = 'shalinibhadouriya230308@acropolis.in';
  const rawPassword1 = 'Shalini@162005';
  const rawPassword2 = 'Shalini@16_2005';

  console.log(`\n⚙️ Creating/Upserting user account for: ${email}...`);

  // Hash password
  const hashedPassword = await bcrypt.hash(rawPassword1, 10);

  // Check if user exists
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    console.log(`User already exists (ID: ${user.id}). Updating password and verification status...`);
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isEmailVerified: true,
        status: 'ACTIVE',
        role: 'STUDENT',
      },
    });
  } else {
    console.log(`Creating new STUDENT user...`);
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
        isEmailVerified: true,
      },
    });
  }

  // Ensure Student Profile exists
  const profile = await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: {
      fullName: 'Shalini Bhadouriya',
      branch: 'Computer Science & Engineering',
      course: 'B.Tech',
      graduationYear: 2026,
      verificationStatus: 'VERIFIED',
    },
    create: {
      userId: user.id,
      fullName: 'Shalini Bhadouriya',
      enrollmentNumber: '0827CS231264',
      branch: 'Computer Science & Engineering',
      course: 'B.Tech',
      graduationYear: 2026,
      skills: ['React', 'JavaScript', 'Node.js', 'Python'],
      bio: 'Student at Acropolis Institute of Technology and Research.',
      verificationStatus: 'VERIFIED',
    },
  });

  // Ensure Student Application exists for CDC Portal Verification
  await prisma.studentApplication.upsert({
    where: { userId: user.id },
    update: { status: 'APPROVED' },
    create: {
      userId: user.id,
      status: 'APPROVED',
      fullName: 'Shalini Bhadouriya',
      enrollmentNumber: '0827CS231264',
      email: email,
      phone: '+91 9876543210',
      gender: 'Female',
      dateOfBirth: new Date('2005-03-16'),
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      aadharNumber: '1234-5678-9012',
      collegeIdNumber: '0827CS231264',
      fatherName: 'Mr. Bhadouriya',
      fatherOccupation: 'Business',
      fatherPhone: '+91 9812345678',
      motherName: 'Mrs. Bhadouriya',
      motherOccupation: 'Homemaker',
      motherPhone: '+91 9812345679',
      familyIncome: '₹8,00,000 PA',
      emergencyContact: '+91 9876543210',
      currentAddress: 'Acropolis Campus',
      currentCity: 'Indore',
      currentState: 'Madhya Pradesh',
      currentPincode: '452001',
      permanentAddress: 'Acropolis Campus',
      permanentCity: 'Indore',
      permanentState: 'Madhya Pradesh',
      permanentPincode: '452001',
      sameAsCurrent: true,
      class10Board: 'CBSE',
      class10School: 'School Name',
      class10Percentage: 90.0,
      class10PassingYear: 2020,
      class12Board: 'CBSE',
      class12School: 'School Name',
      class12Percentage: 88.0,
      class12PassingYear: 2022,
      currentCourse: 'B.Tech',
      currentBranch: 'Computer Science & Engineering',
      currentSemester: 6,
      currentCGPA: 8.5,
      careerPreference: 'Software Development',
      primaryDomain: 'Web Development',
      skills: ['React', 'JavaScript', 'Node.js', 'Python'],
      resumeUrl: 'https://res.cloudinary.com/demo/image/upload/sample_resume.pdf',
      submittedAt: new Date(),
      verifiedAt: new Date(),
    },
  });

  console.log(`\n✅ ACCOUNT CREATED SUCCESSFULLY!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${rawPassword1}`);
  console.log(`Role: STUDENT`);

  // Verify bcrypt password match test
  const isMatch1 = await bcrypt.compare(rawPassword1, user.password);
  console.log(`Password match test ("${rawPassword1}"): ${isMatch1 ? '✅ PASS' : '❌ FAIL'}`);
}

createShaliniUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
