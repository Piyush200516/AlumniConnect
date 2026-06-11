-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ALUMNI', 'CDC');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "MentorshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE', 'REMOTE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MENTORSHIP_REQUEST', 'MENTORSHIP_ACCEPTED', 'MENTORSHIP_REJECTED', 'MENTORSHIP_COMPLETED', 'JOB_POSTED', 'JOB_APPLICATION', 'APPLICATION_UPDATE', 'EVENT_CREATED', 'EVENT_REMINDER', 'POST_LIKE', 'POST_COMMENT', 'NEW_MESSAGE', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyToken" TEXT,
    "emailVerifyExpiry" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "enrollmentNo" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "profileImageUrl" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "resumeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumni_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passingYear" INTEGER NOT NULL,
    "currentCompany" TEXT,
    "designation" TEXT,
    "industry" TEXT,
    "experience" INTEGER,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "profileImageUrl" TEXT,
    "linkedinUrl" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumni_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cdc_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "contactNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cdc_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentorship_requests" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "alumniId" TEXT NOT NULL,
    "status" "MentorshipStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentorship_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "salary" TEXT,
    "jobType" "JobType" NOT NULL DEFAULT 'FULL_TIME',
    "skillsRequired" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deadline" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "resumeUrl" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventLocation" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "linkUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_emailVerifyToken_key" ON "users"("emailVerifyToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetToken_key" ON "users"("resetToken");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_enrollmentNo_key" ON "student_profiles"("enrollmentNo");

-- CreateIndex
CREATE INDEX "student_profiles_branch_idx" ON "student_profiles"("branch");

-- CreateIndex
CREATE INDEX "student_profiles_graduationYear_idx" ON "student_profiles"("graduationYear");

-- CreateIndex
CREATE INDEX "student_profiles_course_idx" ON "student_profiles"("course");

-- CreateIndex
CREATE UNIQUE INDEX "alumni_profiles_userId_key" ON "alumni_profiles"("userId");

-- CreateIndex
CREATE INDEX "alumni_profiles_passingYear_idx" ON "alumni_profiles"("passingYear");

-- CreateIndex
CREATE INDEX "alumni_profiles_industry_idx" ON "alumni_profiles"("industry");

-- CreateIndex
CREATE INDEX "alumni_profiles_currentCompany_idx" ON "alumni_profiles"("currentCompany");

-- CreateIndex
CREATE UNIQUE INDEX "cdc_profiles_userId_key" ON "cdc_profiles"("userId");

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");

-- CreateIndex
CREATE INDEX "posts_createdAt_idx" ON "posts"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "comments_postId_idx" ON "comments"("postId");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE INDEX "likes_postId_idx" ON "likes"("postId");

-- CreateIndex
CREATE INDEX "likes_userId_idx" ON "likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "likes_postId_userId_key" ON "likes"("postId", "userId");

-- CreateIndex
CREATE INDEX "mentorship_requests_studentId_idx" ON "mentorship_requests"("studentId");

-- CreateIndex
CREATE INDEX "mentorship_requests_alumniId_idx" ON "mentorship_requests"("alumniId");

-- CreateIndex
CREATE INDEX "mentorship_requests_status_idx" ON "mentorship_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "mentorship_requests_studentId_alumniId_key" ON "mentorship_requests"("studentId", "alumniId");

-- CreateIndex
CREATE INDEX "jobs_postedById_idx" ON "jobs"("postedById");

-- CreateIndex
CREATE INDEX "jobs_jobType_idx" ON "jobs"("jobType");

-- CreateIndex
CREATE INDEX "jobs_isActive_idx" ON "jobs"("isActive");

-- CreateIndex
CREATE INDEX "jobs_deadline_idx" ON "jobs"("deadline");

-- CreateIndex
CREATE INDEX "jobs_createdAt_idx" ON "jobs"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "job_applications_jobId_idx" ON "job_applications"("jobId");

-- CreateIndex
CREATE INDEX "job_applications_applicantId_idx" ON "job_applications"("applicantId");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_jobId_applicantId_key" ON "job_applications"("jobId", "applicantId");

-- CreateIndex
CREATE INDEX "events_createdById_idx" ON "events"("createdById");

-- CreateIndex
CREATE INDEX "events_eventDate_idx" ON "events"("eventDate");

-- CreateIndex
CREATE INDEX "events_isActive_idx" ON "events"("isActive");

-- CreateIndex
CREATE INDEX "event_registrations_eventId_idx" ON "event_registrations"("eventId");

-- CreateIndex
CREATE INDEX "event_registrations_userId_idx" ON "event_registrations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_eventId_userId_key" ON "event_registrations"("eventId", "userId");

-- CreateIndex
CREATE INDEX "conversations_user1Id_idx" ON "conversations"("user1Id");

-- CreateIndex
CREATE INDEX "conversations_user2Id_idx" ON "conversations"("user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_user1Id_user2Id_key" ON "conversations"("user1Id", "user2Id");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumni_profiles" ADD CONSTRAINT "alumni_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cdc_profiles" ADD CONSTRAINT "cdc_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_requests" ADD CONSTRAINT "mentorship_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_requests" ADD CONSTRAINT "mentorship_requests_alumniId_fkey" FOREIGN KEY ("alumniId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
