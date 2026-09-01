# Project Technology Stack Report: AlumniConnect

## Project Overview
**AlumniConnect** is a comprehensive, centralized web portal designed to bridge the gap between Students, Alumni, and the College Administration (College Development Cell / CDC). The platform enables seamless mentorship matching, career opportunity sharing, event management, real-time messaging, and multi-step verification workflows tailored for three primary user roles:
- **Student**: Registers for campus events, requests mentorship from experienced alumni, applies for jobs/internships, and tracks portal application approvals.
- **Alumni**: Shares career opportunities, provides one-on-one mentorship, posts network updates, and participates in campus events.
- **College Admin (CDC)**: Oversees student profile verifications, approves posted jobs and events, manages platform analytics, and orchestrates campus placement activities.

---

## Frontend Stack

### Frameworks & Core Runtime
- **React 19**  
  Serves as the core declarative UI library powering dynamic, component-based user interfaces across Student, Alumni, and CDC portals. Enables responsive state updates, interactive UI elements, and reusable design components across the application.

- **TypeScript**  
  Provides static type checking and compile-time safety across component props, API request/response payloads, and state definitions. Prevents runtime bugs and enhances code maintainability across complex data models.

### Build Tools & Bundler
- **Vite 8**  
  Acts as the next-generation build tool and local development server with instant Hot Module Replacement (HMR). Optimizes production bundle splitting, asset compilation, and tree-shaking for high-performance frontend delivery.

- **@vitejs/plugin-react**  
  Integrates React support into Vite, enabling Fast Refresh during development and optimizing JSX/TSX compilation. Ensures rapid feedback loops for developers building UI components.

### UI Styling & Design Libraries
- **Tailwind CSS v4**  
  Provides a utility-first CSS engine integrated via `@tailwindcss/vite` for rapid styling, custom themes, and glassmorphism UI patterns. Eliminates monolithic CSS files while ensuring design consistency across pages.

- **Framer Motion**  
  Powers smooth micro-interactions, page transitions, modal dialog animations, and gesture-driven UI components. Elevates visual polish and user engagement across dashboard cards and interactive feeds.

- **Lucide React**  
  Delivers a modern, lightweight collection of clean vector icons used across navigation menus, action buttons, and status cards. Enhances visual clarity and intuitive navigation throughout the portal.

- **Heroicons & React Icons**  
  Provide supplemental specialized iconography for social links, status badges, and specialized domain symbols. Support flexible icon composition across specialized components.

### Data Fetching, Form Management & Utilities
- **TanStack Query (React Query v5)**  
  Manages server-state caching, asynchronous data fetching, background revalidation, and request deduplication. Ensures real-time UI data synchronization while minimizing unnecessary server calls.

- **React Router DOM v7**  
  Handles client-side routing, nested navigation layouts, URL parameter parsing, and protected route guards. Controls seamless SPA navigation based on user authentication status and role access.

- **React Hook Form**  
  Enforces lightweight, high-performance form state management with minimal re-renders. Simplifies complex multi-step application forms and profile edit forms.

- **Zod**  
  Defines strict client-side validation schemas integrated with React Hook Form via `@hookform/resolvers/zod`. Guarantees immediate input validation feedback before sending payloads to the backend API.

- **Axios**  
  Acts as the HTTP client configured with global request interceptors for injecting JWT Bearer tokens and handling centralized error responses. Simplifies REST API calls between client components and Express backend endpoints.

- **Socket.io Client**  
  Establishes real-time, event-driven WebSocket connections between the client browser and backend socket server. Enables live direct messaging, online presence indicators, and instant notification alerts.

- **Sonner**  
  Provides accessible, customizable toast notifications for user actions such as successful logins, form validation errors, and messaging alerts. Improves user feedback with sleek toast alerts.

- **Cloudinary React SDK**  
  Facilitates client-side media rendering, avatar image transformations, and document file uploads. Ensures optimized image delivery via cloud CDN endpoints.

---

## Backend Stack

### Server Framework & Runtime Environment
- **Node.js**  
  Serves as the cross-platform asynchronous JavaScript runtime environment running the backend application server. Its event-driven, non-blocking I/O model efficiently handles concurrent HTTP requests and real-time WebSocket connections.

- **Express.js 5**  
  Acts as the foundational web application framework structuring RESTful API routes, middleware chains, and controller functions. Handles incoming HTTP requests, route parsing, and standardized JSON response delivery across all service domains.

- **TypeScript (Node Execution via `tsx` / `tsc`)**  
  Enforces strict type contracts across backend request handlers, database queries, utility helper functions, and custom middleware. Prevents type mismatch errors at compile time and enhances code documentation.

### Authentication & Authorization
- **JSON Web Tokens (`jsonwebtoken`)**  
  Encapsulates stateless user identity payloads containing `userId`, `email`, and `role` signed with a secure server secret. Enables secure Bearer token authentication across all protected REST and WebSocket routes.

- **Passport.js (`passport-google-oauth20`, `passport-github2`)**  
  Provides modular authentication strategies for third-party OAuth 2.0 social logins via Google and GitHub. Allows users to sign up and sign in using external identity providers alongside standard credentials.

- **Bcrypt / Bcryptjs**  
  Executes salted cryptographic password hashing before persisting user credentials into PostgreSQL. Protects account credentials against brute-force attacks and rainbow table compromises.

### Database Integration & Real-time Services
- **Prisma Adapter PG (`@prisma/adapter-pg` & `pg` Pool)**  
  Manages database connection pooling with Neon PostgreSQL, enforcing strict connection pool limits (`max: 20`) and idle timeout management. Prevents database connection exhaustion during peak traffic concurrency.

- **Socket.io Server**  
  Orchestrates real-time bidirectional WebSocket communication for direct peer-to-peer messaging, active status tracking, and instant alerts. Eliminates HTTP polling overhead for chat and notification features.

- **Firebase Admin SDK**  
  Integrates Firebase Cloud Messaging (FCM) to dispatch web and mobile push notifications to target user devices. Keeps users notified about pending mentorship requests, job updates, and event announcements.

- **Nodemailer & Resend**  
  Handle transactional email dispatch for account email verification, password reset links, and automated system alerts. Ensure reliable inbox delivery for critical system notifications.

- **Cloudinary Node SDK & Multer**  
  Manage multipart file uploads (`multer`) and upload media assets (resumes, profile photos, event banners, certificates) directly to Cloudinary cloud storage. Ensures secure file storage and CDN distribution.

---

## Database & ORM Layer

### Database Engine
- **Neon PostgreSQL**: A serverless, cloud-native PostgreSQL database engine featuring isolated storage and compute scalability, SSL enforcement, and automated backups. Stores all domain entities with strict transactional integrity.

### ORM Architecture
- **Prisma ORM v7**: Provides a type-safe object-relational mapping interface linking TypeScript backend models directly to PostgreSQL database tables. Generates strongly-typed database queries, manages migrations, and handles complex relational joins efficiently.

### Database Models & Tables
The database schema consists of **28 models and enums** categorized into domain modules:
1. **Core Identity & Authentication**:
   - `User`: Primary user account table storing email, hashed password, role (`STUDENT`, `ALUMNI`, `CDC`), status (`ACTIVE`, `SUSPENDED`), and verification tokens.
   - `StudentProfile`: 1:1 linked profile storing enrollment number, branch, course, graduation year, skills, resume URL, and verification status.
   - `AlumniProfile`: 1:1 linked profile storing passing year, current company, designation, experience, skills, industry, and location.
   - `CdcProfile`: 1:1 linked profile storing college department, official email, and contact details.

2. **Career & Job Portal**:
   - `Job`: Job and internship postings containing title, description, company, salary, job type, skills required, and approval status.
   - `JobApplication`: Student applications linking applicants to jobs with attached resume URLs and cover letters.
   - `SavedJob`: User bookmarks for target job postings.
   - `Company`, `WorkExperience`, `Education`, `Skill`: Work history, company directories, education history, and skill taxonomies.

3. **Mentorship & Networking Ecosystem**:
   - `MentorshipRequest`: Student-to-Alumni mentorship requests with status (`PENDING`, `ACCEPTED`, `REJECTED`).
   - `MentorshipConnection`: Active mentorship pairs managing chat conversations, scheduled meetings, and shared resource links.
   - `Meeting` & `SharedResource`: Scheduled mentorship sessions and shared document resources.
   - `Connection` & `SavedAlumni`: Peer-to-peer connection requests and alumni bookmarking.

4. **Campus Events & Verification**:
   - `Event`: Campus events created by CDC/Alumni storing title, date, venue, category, available seats, and approval status.
   - `EventRegistration` & `EventCertificate`: Event participant registrations, attendance records, and generated completion certificates.
   - `StudentApplication` & `ApplicationCertification`: Comprehensive multi-step verification application tracking academic records, income, address details, and uploaded certificates.

5. **Communication & Notifications**:
   - `Conversation`, `Message`, `MessageAttachment`: Real-time chat threads, direct messages, resume review tags, and file attachments.
   - `Notification` & `FcmToken`: In-app notification queue and registered Firebase push notification tokens.

### Recent Database Index Optimizations
To resolve performance bottlenecks and speed up high-frequency API endpoints, key compound and single-column indexes were added:
- **`MentorshipRequest`**:
  - `@@index([studentId])` and `@@index([studentId, status])`: Accelerates student dashboard query execution and filters active mentorship request statuses without full table scans.
- **`MentorshipConnection`**:
  - `@@index([studentId])`: Speeds up active mentor retrieval (`getMyMentors`) and student connection dashboard rendering.
- **`Connection`**:
  - `@@index([senderId])` and `@@index([senderId, status])`: Eliminates bottlenecks when querying outgoing connection requests.
- **`Notification`**:
  - `@@index([userId, createdAt(sort: Desc)])` and `@@index([userId, isRead])`: Optimizes notification inbox retrieval and unread notification badge aggregations.
- **`Job`**:
  - `@@index([isActive, approvalStatus])` and `@@index([createdAt(sort: Desc)])`: Speeds up active public job feed filters and CDC job approval queues.
- **`Message`**:
  - `@@index([conversationId, createdAt(sort: Desc)])`: Streamlines paginated chat message history queries in active conversations.
- **`User` & Profiles**:
  - `@@index([role])`, `@@index([status])`, `@@index([branch])`, `@@index([graduationYear])`, `@@index([passingYear])`, `@@index([companyId])`: Enables instantaneous multi-criteria filtering across student and alumni directories.

---

## Core Architecture & Request Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND LAYER                                       │
│    React 19 SPA (Vite 8, Tailwind v4, TanStack Query, Axios, Socket.io Client)          │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                 HTTPS / WSS Requests
                                           │
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│                                   BACKEND LAYER                                        │
│                              Node.js + Express.js 5                                    │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │                              GLOBAL MIDDLEWARE                                 │   │
│   │   1. CORS (`cors`)  ───>  2. JSON Parser  ───>  3. Logger (`requestLogger`)     │   │
│   └──────────────────────────────────────┬─────────────────────────────────────────┘   │
│                                          │                                             │
│   ┌──────────────────────────────────────▼─────────────────────────────────────────┐   │
│   │                        AUTHENTICATION & AUTHORIZATION                          │   │
│   │                                                                                │   │
│   │   • `authenticateUser`: Extracts Bearer Token ──> Verifies JWT ──> Loads `user`│   │
│   │   • `authorizeRoles('STUDENT', 'ALUMNI', 'CDC')`: Validates RBAC permissions   │   │
│   └──────────────────────────────────────┬─────────────────────────────────────────┘   │
│                                          │                                             │
│   ┌──────────────────────────────────────▼─────────────────────────────────────────┐   │
│   │                       ROUTE CONTROLLERS & VALIDATION                           │   │
│   │   Zod Input Sanitization ──> Business Logic Execution ──> Response Formatting  │   │
│   └──────────────────────────────────────┬─────────────────────────────────────────┘   │
└──────────────────────────────────────────┼─────────────────────────────────────────────┘
                                           │
                              Connection Pool (`pg` Adapter)
                                           │
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│                                  DATABASE LAYER                                        │
│                 Neon PostgreSQL + Prisma ORM v7 (Optimized Indexes)                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle & Role-Based Access Control (RBAC)
1. **Client Request Dispatch**:  
   The frontend user initiates an action (e.g., fetching mentorship requests or posting a job). Axios attaches the JWT access token in the `Authorization: Bearer <token>` header.

2. **Global Middleware Handling**:  
   The request passes through `cors` cross-origin validation, `express.json()` payload parsing, and `requestLogger` tracking.

3. **Authentication Layer (`authenticateUser`)**:  
   The `authenticateUser` middleware extracts the token, verifies its signature via `jsonwebtoken`, decodes user claims (`userId`, `role`), and executes a fast primary key query (`prisma.user.findUnique`) to attach the full user object (including profile data) to `req.user`. Accounts with non-`ACTIVE` statuses are rejected with HTTP 403.

4. **Authorization Layer (`authorizeRoles`)**:  
   Route-level RBAC middleware checks `req.user.role` against authorized roles (e.g., requiring `'CDC'` for approving jobs or `'ALUMNI'` for posting job openings). If unauthorized, an `ApiError(403, 'Forbidden')` is thrown immediately.

5. **Controller & ORM Execution**:  
   The controller validates input parameters using Zod schemas, executes business logic, and queries Neon PostgreSQL through Prisma ORM using indexed query paths.

6. **Centralized Error & Response Management**:  
   Responses return cleanly formatted JSON payloads. Any uncaught runtime exceptions are intercepted by the global `errorHandler` middleware, maintaining consistent error schemas and HTTP status codes.
