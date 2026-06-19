# 🎓 AlumniConnect

> Connecting Students, Alumni, and the Career Development Cell (CDC) through mentorship, networking, opportunities, and collaboration.

![Status](https://img.shields.io/badge/Status-Under%20Development-orange)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-blueviolet)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📌 Overview

AlumniConnect is a centralized platform designed to strengthen the relationship between Students, Alumni, and the Career Development Cell (CDC).

The platform enables:

* 🤝 Alumni Mentorship
* 💼 Job & Internship Opportunities
* 📅 Event Management
* 💬 Real-time Communication
* 🔔 Notifications & Announcements
* 🌐 Professional Networking

---

## 👥 User Roles

### 🎓 Student

* Student Registration & Login
* Create Professional Profile
* Search Alumni Directory
* Request Mentorship
* Apply for Jobs & Internships
* Register for Events
* Real-time Chat
* Notifications

### 🏆 Alumni

* Alumni Registration & Login
* Professional Profile Management
* Post Jobs & Internships
* Accept Mentorship Requests
* Participate in Events
* Real-time Messaging
* Notifications

### 🏢 Career Development Cell (CDC)

* Login Only (No Signup)
* Manage Students & Alumni
* Create & Manage Events
* Publish Opportunities
* Send Announcements
* View Analytics Dashboard

---

## 🚀 Tech Stack

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

* Cloudinary
* Resend

---

## ✨ Core Features

### Authentication

* Role-Based Authentication
* JWT Authorization
* Email Verification
* Password Reset

### Alumni Network

* Alumni Directory
* Search & Filter Alumni
* Professional Profiles

### Mentorship System

* Request Mentorship
* Accept/Reject Requests
* Track Mentorship Status

### Job Portal

* Job Listings
* Internship Opportunities
* Application Tracking

### Event Management

* Create Events
* Event Registration
* Event Notifications

### Real-Time Communication

* One-to-One Chat
* Socket.IO Integration
* Instant Messaging

### Notifications

* In-App Notifications
* Event Updates
* Opportunity Alerts

---

## 🗄️ Database Models

* User
* StudentProfile
* AlumniProfile
* CdcProfile
* Post
* Comment
* Like
* MentorshipRequest
* Job
* JobApplication
* Event
* EventRegistration
* Conversation
* Message
* Notification

---

## 🔐 Authentication Flow

### Student

Signup → Email Verification → Login → Dashboard

### Alumni

Signup → Email Verification → Login → Dashboard

### CDC

Account Created by Admin → Login → Dashboard

---

## 📁 Project Structure

```text
AlumniConnect
│
├── frontend
│   ├── React
│   ├── TypeScript
│   ├── Tailwind CSS
│   └── Framer Motion
│
├── backend
│   ├── Express.js
│   ├── Prisma ORM
│   ├── Socket.IO
│   └── JWT Auth
│
└── database
    └── Neon PostgreSQL
```

---

# 🚀 Running AlumniConnect Locally

## 1. Clone Repository

```bash
git clone <repository-url>
cd alumniconnect
```

---

## 2. Frontend Setup

```bash
cd frontend
npm install
```

### Start Frontend Development Server

```bash
npm run dev
```

Frontend will run on:

```txt
http://localhost:5173
```

---

## 3. Backend Setup

Open a new terminal:

```bash
cd backend
npm install
```

### Start Backend Development Server

```bash
npm run dev
```

Backend will run on:

```txt
http://localhost:5002
```

---

## 4. Prisma Commands

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Database Migration

```bash
npx prisma migrate dev
```

### Open Prisma Studio

```bash
npx prisma studio
```

---

## 5. Build Frontend

```bash
cd frontend
npm run build
```

---

## 6. Preview Production Build

```bash
npm run preview
```

---

## 7. Environment Variables

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5002/api
```

### Backend (.env)

```env
DATABASE_URL=your_neon_database_url

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RESEND_API_KEY=your_resend_api_key
```

---

## 8. Common Commands

### Install Dependencies

```bash
npm install
```

### Check Prisma Status

```bash
npx prisma validate
```

### Reset Database

```bash
npx prisma migrate reset
```

### Format Prisma Schema

```bash
npx prisma format
```

---

## 9. Development Workflow

### Terminal 1

```bash
cd backend
npm run dev
```

### Terminal 2

```bash
cd frontend
npm run dev
```

### Terminal 3 (Optional)

```bash
cd backend
npx prisma studio
```

Open:

```txt
Frontend: http://localhost:5173
Backend: http://localhost:5002
Prisma Studio: http://localhost:5555
```
 ___
 
------

## 📈 Development Progress

* [x] Project Setup
* [x] Database Design
* [x] Prisma Schema
* [x] Neon Database Integration
* [x] CDC Seed Data
* [x] Student Seed Data
* [x] Alumni Seed Data
* [ ] Authentication APIs
* [ ] Frontend Authentication
* [ ] Dashboards
* [ ] Mentorship System
* [ ] Job Portal
* [ ] Event Management
* [ ] Real-time Chat
* [ ] Notifications
* [ ] Deployment

---

## 👨‍💻 Team

Major Project – AlumniConnect

Developed to bridge the gap between students and alumni through mentorship, networking, and career opportunities.

---

⭐ If you like this project, consider giving it a star on GitHub.
