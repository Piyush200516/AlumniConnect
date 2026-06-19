# AlumniConnect

AlumniConnect is a role-based college networking platform that connects students, alumni, and the Career Development Cell (CDC) for mentorship, job opportunities, events, and real-time communication.

## Overview

The project is split into a React frontend and an Express + Prisma backend.

The current app supports:

- Student registration and login
- Alumni registration and login
- CDC login only
- Student, alumni, and CDC dashboards
- Job browsing, bookmarking, application tracking, and moderation
- Event creation, registration, attendance, and approval flow
- Mentorship requests and one-to-one messaging
- Real-time online presence and chat updates through Socket.IO
- File uploads with Cloudinary, with a local fallback when Cloudinary is not configured
- Optional email verification and password reset flows

## UI Notes

- There is no separate Saved page in the student sidebar.
- There is no separate Notifications page in the student sidebar.
- Saved jobs are handled inside the Jobs view with bookmark actions.
- Notifications are surfaced in the top bar and in the dashboard announcements area.

## Key Features

### Student portal

- Dashboard with jobs, events, mentorship, and unread message stats
- Profile management
- My applications
- Event browsing, registration, certificates, and event details
- Job browsing, details, and bookmark actions
- Alumni directory and alumni profile views
- Mentorship and messaging
- Settings

### Alumni portal

- Dashboard for managing created events and job postings
- Create and edit events
- Track event registrations and attendance
- Create and manage job postings
- View applicants and update candidate status
- Mentorship and messaging

### CDC portal

- Verify student applications
- Approve or reject alumni events
- Approve or reject alumni jobs
- Create official CDC events
- Export event registrants as CSV

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- React Router DOM
- React Query
- React Hook Form
- Zod
- Axios
- Socket.IO client

### Backend

- Node.js
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT auth
- bcryptjs
- Socket.IO
- multer
- zod

### Services

- Neon PostgreSQL
- Cloudinary
- Resend

## Important Routes

### Frontend routes

- `/auth`
- `/auth/student/login`
- `/auth/student/signup`
- `/auth/alumni/login`
- `/auth/alumni/signup`
- `/auth/cdc/login`
- `/student/dashboard`
- `/alumni/dashboard`
- `/cdc/dashboard`

### Backend routes

- `/api/auth`
- `/api/student`
- `/api/applications`
- `/api/events`
- `/api/jobs`
- `/api/alumni`
- `/api/mentorship`
- `/api/messages`
- `/api/files`

### Main API behavior

- `POST /api/auth/student/signup`
- `POST /api/auth/alumni/signup`
- `POST /api/auth/student/login`
- `POST /api/auth/alumni/login`
- `POST /api/auth/cdc/login`
- `GET /api/student/profile`
- `GET /api/student/dashboard`
- `GET /api/jobs`
- `GET /api/events`
- `POST /api/mentorship/request`
- `GET /api/messages`

## Core Data Models

The backend is centered around these main Prisma models:

- User
- StudentProfile
- AlumniProfile
- CdcProfile
- StudentApplication
- Event
- EventRegistration
- EventCertificate
- Job
- JobApplication
- MentorshipRequest
- MentorshipConnection
- Conversation
- Message
- Notification

## Local Setup

### Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL access, such as Neon

### 1. Clone the repository

```bash
git clone <repository-url>
cd alumniconnect
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure the backend environment

Create `backend/.env` with values similar to:

```env
DATABASE_URL=your_postgres_connection_string
PORT=5002
FRONTEND_URL=http://localhost:5173

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

EMAIL_VERIFY_SECRET=your_email_verify_secret
PASSWORD_RESET_SECRET=your_password_reset_secret

RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=no-reply@alumniconnect.com

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

BACKEND_URL=http://localhost:5002
```

Notes:

- `RESEND_API_KEY` is optional for local development. If it is missing, email sending is skipped.
- `CLOUDINARY_*` is optional. If it is missing, file uploads use the local `uploads/` folder.
- The included frontend config expects the backend to run on port `5002`.

### 4. Configure the frontend environment

Create `frontend/.env` with:

```env
VITE_API_BASE_URL=http://localhost:5002/api
```

If you change the backend port, update this value and restart the Vite dev server.

### 5. Run the app

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

### 6. Optional Prisma commands

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

### 7. Build commands

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm run build
npm start
```

## Available Scripts

### Backend

- `npm run dev` - start the backend in watch mode
- `npm run build` - compile TypeScript
- `npm start` - run the compiled server from `dist/`

### Frontend

- `npm run dev` - start the Vite dev server
- `npm run build` - build the production bundle
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build

## Project Structure

```text
alumniconnect/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- hooks/
|   `-- .env
|-- backend/
|   |-- src/
|   |   |-- controllers/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- validators/
|   |   |-- middleware/
|   |   |-- utils/
|   |   |-- socket.ts
|   |   `-- server.ts
|   `-- .env
`-- README.md
```

## Development Checklist

- Frontend and backend are wired together
- Student, alumni, and CDC auth flows are implemented
- Dashboard sections are implemented for all three roles
- Socket.IO is used for messaging and online presence
- Saved and Notifications are not separate student pages

## Notes

- The backend health check is available at `GET /health`.
- Student and alumni signup use role-specific endpoints.
- CDC accounts are login-only in the current app.
- The student dashboard uses in-page sections rather than separate pages for saved items or notifications.

