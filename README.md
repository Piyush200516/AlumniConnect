# AlumniConnect

AlumniConnect is a centralized alumni networking and career development platform that connects Students, Alumni, and the Career Development Cell (CDC) of an institution.

The platform enables students to connect with alumni mentors, discover jobs and internships, participate in events, and build professional networks. Alumni can provide mentorship, share career opportunities, and engage with the institution. CDC can manage events, opportunities, announcements, and student-alumni engagement.

## User Roles

### Student

* Student Registration & Login
* Profile Management
* Search Alumni
* Request Mentorship
* Apply for Jobs & Internships
* Event Registration
* Real-time Chat
* Notifications

### Alumni

* Alumni Registration & Login
* Professional Profile Management
* Post Jobs & Internships
* Accept/Reject Mentorship Requests
* Participate in Events
* Real-time Messaging
* Notifications

### CDC (Career Development Cell)

* Login Only (No Signup)
* Manage Students & Alumni
* Create and Manage Events
* Publish Opportunities
* View Analytics
* Send Notifications & Announcements

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS v4
* Framer Motion
* React Router DOM

### Backend

* Node.js
* Express.js
* JWT Authentication
* Socket.IO

### Database

* Neon PostgreSQL
* Prisma ORM

### Cloud Services

* Cloudinary (Image & File Storage)
* Resend (Emails & Notifications)

## Core Features

* Role Based Authentication (Student, Alumni, CDC)
* Alumni Directory
* Mentorship System
* Job Portal
* Internship Portal
* Event Management
* Real-time Chat
* Notifications
* Profile Management
* Analytics Dashboard
* Resume Upload
* Cloudinary Integration
* Email Verification & Password Reset

## Database Models

* User
* StudentProfile
* AlumniProfile
* CdcProfile
* Post
* Comment
* Like
* Job
* JobApplication
* Event
* EventRegistration
* MentorshipRequest
* Conversation
* Message
* Notification

## Authentication Flow

Student → Signup → Login

Alumni → Signup → Login

CDC → Login Only (Accounts created directly in database)

## Development Status

Phase 1 - Project Setup ✅
Phase 2 - Database Design ✅
Phase 3 - Authentication System 🚧
Phase 4 - Role-Based Dashboards ⏳
Phase 5 - Mentorship Module ⏳
Phase 6 - Job & Internship Portal ⏳
Phase 7 - Real-time Chat ⏳
Phase 8 - Notifications ⏳
Phase 9 - Deployment ⏳
