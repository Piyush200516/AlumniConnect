// src/utils/mockData.ts

export interface MockJob {
  id: string;
  title: string;
  description: string;
  company: string;
  companyLogo: string | null;
  location: string | null;
  salary: string | null;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'FREELANCE' | 'REMOTE';
  skillsRequired: string[];
  deadline: string | null;
  isActive: boolean;
  createdAt: string;
  responsibilities: string | null;
  eligibility: string | null;
  benefits: string | null;
  selectionProcess: string | null;
  applicationLink: string | null;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks: string | null;
  postedBy: {
    role: string;
    email: string;
    alumniProfile: {
      fullName: string;
      profileImageUrl: string | null;
      designation: string | null;
      currentCompany: string | null;
      bio?: string | null;
      linkedinUrl?: string | null;
    } | null;
  };
  savedBy: any[];
  applications: any[];
}

export interface MockAlumni {
  id: string;
  userId: string;
  fullName: string;
  passingYear: number;
  branch: string;
  course: string;
  currentCompany: string | null;
  companyLogo: string | null;
  designation: string | null;
  experience: number;
  location: string | null;
  skills: string[];
  bio: string | null;
  profileImageUrl: string | null;
  linkedinUrl: string | null;
  isVerified: boolean;
  isFollowing: boolean;
  isSaved: boolean;
  connectionState: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED' | 'REJECTED';
  connectionId: string | null;
  mentorshipStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
}

export interface MockEvent {
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  category: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  eventDate: string;
  eventTime: string;
  duration?: string;
  venue: string;
  totalSeats: number;
  availableSeats: number;
  registrationDeadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  speakerName: string;
  speakerDesignation: string | null;
  speakerCompany: string | null;
  agenda?: string | null;
  keyBenefits?: string[];
  eligibilityCriteria?: string | null;
  requiredDocuments?: string[];
  registrations?: any[];
  createdBy?: any;
  _count?: { registrations: number };
}

export const MOCK_JOBS: MockJob[] = [
  {
    id: 'mock-job-1',
    title: 'Software Development Engineer - I (SDE 1)',
    description: 'We are seeking an ambitious SDE-1 to join our Core Platforms team at Google. You will build highly scalable distributed microservices, write clean clean code, and collaborate with globally distributed product engineering teams.',
    company: 'Google',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Google&backgroundColor=0d1e3a',
    location: 'Bengaluru, Karnataka',
    salary: '₹22 - ₹28 LPA',
    jobType: 'FULL_TIME',
    skillsRequired: ['TypeScript', 'Node.js', 'Go', 'System Design', 'PostgreSQL', 'Docker'],
    deadline: '2026-11-15T23:59:59.000Z',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    responsibilities: '• Design, develop, and deploy cloud-native microservices.\n• Conduct code reviews and optimize API latency.\n• Collaborate with Product Managers and UI/UX teams.',
    eligibility: '• B.Tech / M.Tech in CSE / IT / ECE with minimum 7.5 CGPA.\n• Strong foundation in Data Structures and Algorithms.\n• Prior Internship experience is a plus.',
    benefits: '• Health & Dental Insurance for family\n• Annual Performance Bonus & RSUs\n• Relocation Allowance & Free Gourmet Food',
    selectionProcess: '1. Online Coding Assessment (LeetCode Medium/Hard)\n2. Technical Round 1 (Data Structures & Systems)\n3. Technical Round 2 (Design & System Architecture)\n4. Leadership & Culture Fit Round',
    applicationLink: null,
    approvalStatus: 'APPROVED',
    remarks: 'Approved by Placement Cell',
    postedBy: {
      role: 'ALUMNI',
      email: 'ananya.sharma@google.com',
      alumniProfile: {
        fullName: 'Ananya Sharma',
        profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        designation: 'Senior Staff Engineer',
        currentCompany: 'Google',
        bio: 'Alumni Batch 2019 • Passionate about distributed systems and mentoring student engineers.',
        linkedinUrl: 'https://linkedin.com'
      }
    },
    savedBy: [],
    applications: []
  },
  {
    id: 'mock-job-2',
    title: 'Backend Engineering Intern',
    description: 'Microsoft IDC is looking for passionate Computer Science students for a 6-month Summer Backend Internship. Work directly on Azure Cloud Services & AI Agents.',
    company: 'Microsoft',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Microsoft&backgroundColor=0d1e3a',
    location: 'Hyderabad, Telangana (Hybrid)',
    salary: '₹80,000 / month',
    jobType: 'INTERNSHIP',
    skillsRequired: ['Python', 'C#', '.NET Core', 'Azure', 'REST APIs'],
    deadline: '2026-10-30T23:59:59.000Z',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    responsibilities: '• Build scalable APIs for Azure Developer CLI.\n• Write automated unit & integration test suites.\n• Participate in daily Agile scrums.',
    eligibility: '• Pre-final year B.Tech students (2027 Graduating Batch).\n• CS/IT/ECE specialization.',
    benefits: '• High Pre-Placement Offer (PPO) conversion rate\n• Dedicated Mentor assignment\n• Monthly wellness stipend',
    selectionProcess: '1. Online MCQ & Coding Challenge\n2. 2x Technical Interviews via Microsoft Teams',
    applicationLink: null,
    approvalStatus: 'APPROVED',
    remarks: 'Verified CDC Listing',
    postedBy: {
      role: 'ALUMNI',
      email: 'rahul.verma@microsoft.com',
      alumniProfile: {
        fullName: 'Rahul Verma',
        profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        designation: 'Principal Engineer',
        currentCompany: 'Microsoft',
        bio: 'Alumni Batch 2017 • Cloud enthusiast & Tech lead.',
        linkedinUrl: 'https://linkedin.com'
      }
    },
    savedBy: [],
    applications: []
  },
  {
    id: 'mock-job-3',
    title: 'Full Stack Web Developer (React + Node.js)',
    description: 'Join Amazon Pay Product team to build next-generation merchant checkout experiences serving millions of daily active users across India.',
    company: 'Amazon',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Amazon&backgroundColor=0d1e3a',
    location: 'Bengaluru / Remote',
    salary: '₹18 - ₹24 LPA',
    jobType: 'FULL_TIME',
    skillsRequired: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'AWS S3', 'GraphQL'],
    deadline: '2026-11-20T23:59:59.000Z',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    responsibilities: '• Create responsive UI components with sub-100ms load times.\n• Integrate AWS DynamoDB & Lambda microservices.\n• Maintain high unit test coverage (Jest + Cypress).',
    eligibility: '• B.Tech / MCA graduates (2025 & 2026 Batch).\n• Proficient in JavaScript/TypeScript ecosystem.',
    benefits: '• Competitive CTC with Sign-on Bonus\n• Flexible work hours & Hybrid allowance',
    selectionProcess: '1. Online Assessment\n2. 3 rounds of Technical Interviews focusing on Frontend Architecture & System Design',
    applicationLink: null,
    approvalStatus: 'APPROVED',
    remarks: 'Approved',
    postedBy: {
      role: 'ALUMNI',
      email: 'rohan.mehta@amazon.com',
      alumniProfile: {
        fullName: 'Rohan Mehta',
        profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        designation: 'Tech Lead',
        currentCompany: 'Amazon',
        bio: 'Alumni Batch 2018 • Fullstack wizard.',
        linkedinUrl: 'https://linkedin.com'
      }
    },
    savedBy: [],
    applications: []
  },
  {
    id: 'mock-job-4',
    title: 'Data Science & AI Research Intern',
    description: 'Work alongside leading AI researchers at OpenAI on Large Language Models fine-tuning, RLHF, and synthetic dataset generation.',
    company: 'OpenAI',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=OpenAI&backgroundColor=0d1e3a',
    location: 'San Francisco, CA (Remote Allowed)',
    salary: '$6,000 / month',
    jobType: 'INTERNSHIP',
    skillsRequired: ['PyTorch', 'Python', 'LLMs', 'Transformers', 'CUDA', 'Data Analysis'],
    deadline: '2026-12-01T23:59:59.000Z',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    responsibilities: '• Implement SOTA transformer model architectures.\n• Evaluate AI benchmarks and safety metrics.\n• Publish research papers in top AI conferences (NeurIPS/ICML).',
    eligibility: '• Pre-final or Final year CS/AI students.\n• Strong background in Linear Algebra & Probability.',
    benefits: '• Top tier USD Stipend\n• Access to massive GPU clusters',
    selectionProcess: '1. AI / ML Coding Challenge\n2. Research Portfolio Review\n3. Interview with Research Director',
    applicationLink: null,
    approvalStatus: 'APPROVED',
    remarks: 'Exclusive Global Partner Internship',
    postedBy: {
      role: 'ALUMNI',
      email: 'vikram.malhotra@openai.com',
      alumniProfile: {
        fullName: 'Vikram Malhotra',
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
        designation: 'Staff AI Researcher',
        currentCompany: 'OpenAI',
        bio: 'Alumni Batch 2016 • Deep Learning researcher.',
        linkedinUrl: 'https://linkedin.com'
      }
    },
    savedBy: [],
    applications: []
  }
];

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: 'mock-event-1',
    title: 'Annual Global Alumni Summit & Tech Conclave 2026',
    description: 'Join over 500+ illustrious alumni from Google, Microsoft, Meta, Goldman Sachs & leading tech startups for a day of keynote talks, panel discussions, and career networking.',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    category: 'Networking Event',
    mode: 'HYBRID',
    eventDate: '2026-10-15T09:30:00.000Z',
    eventTime: '09:30 AM - 05:00 PM',
    duration: '7.5 Hours',
    venue: 'Main Auditorium / Zoom Live',
    totalSeats: 500,
    availableSeats: 84,
    registrationDeadline: '2026-10-12T23:59:59.000Z',
    status: 'PUBLISHED',
    approvalStatus: 'APPROVED',
    speakerName: 'Vikram Malhotra & Ananya Sharma',
    speakerDesignation: 'VP Engineering & Staff Architect',
    speakerCompany: 'Microsoft / Google',
    agenda: '09:30 AM - Keynote Address\n11:00 AM - Panel: The Future of AI in Software Engineering\n01:00 PM - Networking Lunch\n02:30 PM - Mentorship Speed Dating',
    keyBenefits: ['Exclusive 1-on-1 Mentorship Sessions', 'Free Professional Headshot Photo Booth', 'Certificate of Participation', 'Networking Lunch'],
    eligibilityCriteria: 'Open to all current students, faculty, and registered alumni.',
    requiredDocuments: ['College ID Card', 'Registration Pass QR'],
    registrations: [],
    _count: { registrations: 416 }
  },
  {
    id: 'mock-event-2',
    title: 'System Design & Microservices Architecture Workshop',
    description: 'Master high-level & low-level design patterns (HLD/LLD) required to crack SDE-2 interviews at top product companies. Interactive whiteboarding session!',
    bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    category: 'Workshop',
    mode: 'ONLINE',
    eventDate: '2026-10-22T14:00:00.000Z',
    eventTime: '02:00 PM - 05:00 PM',
    duration: '3 Hours',
    venue: 'Google Meet (Link sent upon registration)',
    totalSeats: 250,
    availableSeats: 32,
    registrationDeadline: '2026-10-20T23:59:59.000Z',
    status: 'PUBLISHED',
    approvalStatus: 'APPROVED',
    speakerName: 'Priya Patel',
    speakerDesignation: 'Senior Staff Engineer',
    speakerCompany: 'Meta',
    agenda: '• Fundamentals of Load Balancers & Caching\n• Database Sharding & Consistent Hashing\n• Designing WhatsApp / URL Shortener end-to-end',
    keyBenefits: ['Hands-on Design Blueprints', 'Q&A with Meta Engineering Leader', 'Digital Verified Certificate'],
    eligibilityCriteria: 'Recommended for 3rd & 4th year B.Tech / MCA students.',
    requiredDocuments: ['College ID Card'],
    registrations: [],
    _count: { registrations: 218 }
  },
  {
    id: 'mock-event-3',
    title: 'Mock Interview Bootcamp & Resume Review Session',
    description: 'Get your resume reviewed by top recruiters and participate in live 1-on-1 mock technical interviews to boost your placement confidence.',
    bannerUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    category: 'Mock Interview',
    mode: 'OFFLINE',
    eventDate: '2026-11-05T10:00:00.000Z',
    eventTime: '10:00 AM - 03:00 PM',
    duration: '5 Hours',
    venue: 'CDC Placement Cell Block B',
    totalSeats: 120,
    availableSeats: 15,
    registrationDeadline: '2026-11-02T23:59:59.000Z',
    status: 'PUBLISHED',
    approvalStatus: 'APPROVED',
    speakerName: 'Arjun Nair & Sneha Reddy',
    speakerDesignation: 'Lead Technical Recruiters',
    speakerCompany: 'Amazon & Goldman Sachs',
    agenda: '10:00 AM - Resume Structure Secrets\n11:30 AM - Live Mock Behavioral Interviews\n01:30 PM - 1-on-1 Feedback Slots',
    keyBenefits: ['Detailed Personalized Resume Scorecard', 'Real interview feedback', 'CDC Priority Tag'],
    eligibilityCriteria: '3rd & 4th Year Students with verified CDC Portal profile.',
    requiredDocuments: ['Printed Resume (2 copies)', 'College ID Card'],
    registrations: [],
    _count: { registrations: 105 }
  }
];

export const MOCK_ALUMNI: MockAlumni[] = [
  {
    id: 'mock-alumni-1',
    userId: 'mock-user-alumni-1',
    fullName: 'Ananya Sharma',
    passingYear: 2019,
    branch: 'CSE',
    course: 'B.Tech',
    currentCompany: 'Google',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Google&backgroundColor=0d1e3a',
    designation: 'Senior Staff Engineer',
    experience: 7,
    location: 'Bengaluru, India',
    skills: ['Distributed Systems', 'Cloud Architecture', 'Go', 'Kubernetes', 'System Design'],
    bio: 'Alumni batch of 2019. Lead engineer at Google Cloud. Happy to mentor students on software engineering careers, higher studies, and interview preparation.',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    linkedinUrl: 'https://linkedin.com/in/ananyasharma',
    isVerified: true,
    isFollowing: false,
    isSaved: true,
    connectionState: 'CONNECTED',
    connectionId: 'conn-1',
    mentorshipStatus: 'ACCEPTED'
  },
  {
    id: 'mock-alumni-2',
    userId: 'mock-user-alumni-2',
    fullName: 'Rahul Verma',
    passingYear: 2017,
    branch: 'IT',
    course: 'B.Tech',
    currentCompany: 'Microsoft',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Microsoft&backgroundColor=0d1e3a',
    designation: 'Principal Software Engineer',
    experience: 9,
    location: 'Hyderabad, India',
    skills: ['C#', 'Azure', 'DevOps', 'Microservices', 'Leadership'],
    bio: 'Batch of 2017. Working on Microsoft Azure core infra. Passionate about guiding young coders and facilitating campus placement drives.',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    linkedinUrl: 'https://linkedin.com/in/rahulverma',
    isVerified: true,
    isFollowing: true,
    isSaved: false,
    connectionState: 'NONE',
    connectionId: null,
    mentorshipStatus: null
  },
  {
    id: 'mock-alumni-3',
    userId: 'mock-user-alumni-3',
    fullName: 'Priya Patel',
    passingYear: 2020,
    branch: 'ECE',
    course: 'B.Tech',
    currentCompany: 'Meta',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Meta&backgroundColor=0d1e3a',
    designation: 'Senior Frontend Engineer',
    experience: 6,
    location: 'London, UK',
    skills: ['React', 'Next.js', 'Web Performance', 'GraphQL', 'TypeScript'],
    bio: 'ECE graduate turned Frontend Specialist at Meta London. Lover of open source, design systems, and UI micro-animations.',
    profileImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    linkedinUrl: 'https://linkedin.com/in/priyapatel',
    isVerified: true,
    isFollowing: false,
    isSaved: true,
    connectionState: 'PENDING_SENT',
    connectionId: 'conn-3',
    mentorshipStatus: 'PENDING'
  },
  {
    id: 'mock-alumni-4',
    userId: 'mock-user-alumni-4',
    fullName: 'Rohan Mehta',
    passingYear: 2018,
    branch: 'CSE',
    course: 'B.Tech',
    currentCompany: 'Amazon',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Amazon&backgroundColor=0d1e3a',
    designation: 'Engineering Manager',
    experience: 8,
    location: 'Seattle, USA',
    skills: ['Fullstack', 'AWS', 'Team Management', 'E-commerce Platforms'],
    bio: 'Engineering Lead at Amazon AWS. Always open to help junior batch mates navigate US job markets and tech interviews.',
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    linkedinUrl: 'https://linkedin.com/in/rohanmehta',
    isVerified: true,
    isFollowing: false,
    isSaved: false,
    connectionState: 'NONE',
    connectionId: null,
    mentorshipStatus: null
  },
  {
    id: 'mock-alumni-5',
    userId: 'mock-user-alumni-5',
    fullName: 'Sneha Reddy',
    passingYear: 2021,
    branch: 'CSIT',
    course: 'B.Tech',
    currentCompany: 'Goldman Sachs',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Goldman&backgroundColor=0d1e3a',
    designation: 'Quantitative Strategist',
    experience: 5,
    location: 'Mumbai, India',
    skills: ['Python', 'Quantitative Finance', 'Machine Learning', 'SQL'],
    bio: 'FinTech professional at Goldman Sachs. Enjoys mentoring students interested in Quantitative Finance, Algorithmic Trading, and Data Science.',
    profileImageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    linkedinUrl: 'https://linkedin.com/in/snehareddy',
    isVerified: true,
    isFollowing: true,
    isSaved: true,
    connectionState: 'CONNECTED',
    connectionId: 'conn-5',
    mentorshipStatus: 'ACCEPTED'
  }
];

export const MOCK_CDC_STATS = {
  studentUsersCount: 1420,
  alumniUsersCount: 3850,
  totalApplications: 480,
  verifiedApplications: 432,
  pendingApplications: 48,
  placedStudentsCount: 365,
  upcomingEventsCount: 12,
  pendingEventCount: 2,
  activeJobsCount: 18,
};

export const MOCK_PLACED_STUDENTS = [
  {
    id: 'placed-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    enrollmentNumber: 'STU2022001',
    branch: 'CSE',
    course: 'B.Tech',
    graduationYear: 2026,
    phone: '+91 9876543210',
    company: 'Google',
    jobTitle: 'Software Development Engineer 1',
    status: 'OFFERED',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'placed-2',
    name: 'Ishita Gupta',
    email: 'ishita.gupta@college.edu',
    enrollmentNumber: 'STU2022045',
    branch: 'IT',
    course: 'B.Tech',
    graduationYear: 2026,
    phone: '+91 9876543211',
    company: 'Microsoft',
    jobTitle: 'Software Engineer',
    status: 'OFFERED',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'placed-3',
    name: 'Kabir Verma',
    email: 'kabir.verma@college.edu',
    enrollmentNumber: 'STU2022089',
    branch: 'ECE',
    course: 'B.Tech',
    graduationYear: 2026,
    phone: '+91 9876543212',
    company: 'Amazon',
    jobTitle: 'Frontend Engineer',
    status: 'OFFERED',
    updatedAt: new Date().toISOString()
  }
];

export const MOCK_CDC_APPLICATIONS = [
  {
    id: 'app-mock-1',
    userId: 'user-stu-101',
    fullName: 'Aarav Sharma',
    enrollmentNumber: 'STU2022001',
    email: 'aarav.sharma@student.edu',
    phone: '+91 9812345678',
    currentCourse: 'B.Tech',
    currentBranch: 'CSE',
    currentSemester: 7,
    currentCGPA: 8.92,
    primaryDomain: 'Full Stack Web Development',
    secondaryDomain: 'Cloud Computing & DevOps',
    skills: ['React', 'Node.js', 'TypeScript', 'Docker', 'PostgreSQL'],
    resumeUrl: 'https://example.com/resume.pdf',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    status: 'APPROVED',
    remarks: 'Verified credentials by CDC Committee',
    submittedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    verifiedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    user: { email: 'aarav.sharma@student.edu' },
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2025-06-15',
        certificateUrl: 'https://example.com/cert1.pdf'
      }
    ]
  },
  {
    id: 'app-mock-2',
    userId: 'user-stu-102',
    fullName: 'Ishita Gupta',
    enrollmentNumber: 'STU2022045',
    email: 'ishita.gupta@student.edu',
    phone: '+91 9823456789',
    currentCourse: 'B.Tech',
    currentBranch: 'IT',
    currentSemester: 7,
    currentCGPA: 9.15,
    primaryDomain: 'AI & Data Engineering',
    secondaryDomain: 'Backend Engineering',
    skills: ['Python', 'PyTorch', 'FastAPI', 'SQL', 'Pandas'],
    resumeUrl: 'https://example.com/resume2.pdf',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    status: 'UNDER_VERIFICATION',
    remarks: 'Pending transcript review',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    verifiedAt: null,
    user: { email: 'ishita.gupta@student.edu' },
    certifications: []
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'EVENT',
    title: 'Upcoming Alumni Talk',
    message: 'Global Alumni Summit 2026 registration is now open! Reserve your seat early.',
    isRead: false,
    linkUrl: '/events',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'notif-2',
    type: 'JOB',
    title: 'New Job Opportunity Posted',
    message: 'Google posted Software Development Engineer 1 position for 2026 batch.',
    isRead: false,
    linkUrl: '/jobs',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'notif-3',
    type: 'SYSTEM',
    title: 'CDC Application Verified',
    message: 'Your placement portal profile verification has been approved.',
    isRead: true,
    linkUrl: '/profile',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];
