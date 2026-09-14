# AlumniConnect Project Report

## 1. Executive Summary

**AlumniConnect** is a comprehensive role-based college networking platform designed to bridge the gap between students, alumni, and the Career Development Cell (CDC). The platform centralizes mentorship, job opportunities, event management, and real-time communication into a single, cohesive workspace.

## 2. Platform Overview

AlumniConnect supports three primary roles, each with tailored functionalities:

### 2.1 Student Features
- Seamless registration and login
- Comprehensive profile management
- Access to an extensive alumni directory for mentorship requests
- Job and internship browsing and application
- Event registration and attendance tracking
- Real-time one-to-one messaging with mentors and peers

### 2.2 Alumni Features
- Professional profile and availability management
- Event creation and management
- Job and internship posting
- Applicant review and status tracking for posted opportunities
- Mentorship request management
- Direct messaging with students

### 2.3 CDC (Career Development Cell) Features
- Secure, login-only access (no open registration)
- Review capabilities for student applications
- Moderation of alumni-created events and job postings
- Official CDC event creation
- Data export capabilities (e.g., event registrants as CSV)

## 3. Technology Stack

The platform leverages a modern, robust, and scalable technology stack:

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Redux Toolkit
- **Backend:** Node.js, Express 5, Prisma ORM, PostgreSQL (Neon)
- **Authentication:** Passport.js (Google OAuth 2.0), JWT Authentication, bcryptjs
- **Real-time Communication:** Socket.IO, native WebSocket (`ws`) library
- **File Management:** Multer, Cloudinary
- **Notifications & Email:** Firebase Cloud Messaging (FCM), Nodemailer, Resend
- **Testing:** Vitest, React Testing Library, Jest, Supertest, Cypress

## 4. System Architecture

### 4.1 High-Level System Architecture

The architecture connects users through a React frontend to an Express API backend, utilizing a PostgreSQL database and various external services.

```mermaid
flowchart LR
    %% Actors
    U1(["Student"]) --> F
    U2(["Alumni"]) --> F
    U3(["CDC Admin"]) --> F
    
    %% Frontend
    subgraph Frontend
        F["React + Vite UI"]
    end
    
    %% Backend
    subgraph Backend
        A["Express.js API"]
        C["Controllers"]
        S["Services"]
        P["Prisma ORM"]
        
        A --> C --> S --> P
    end
    
    %% Database
    subgraph Database
        D[("PostgreSQL (Neon)")]
    end
    
    %% External Services
    subgraph External Services
        CL["Cloudinary"]
        RE["Resend"]
        SO["Socket.IO"]
    end
    
    %% Connections
    F <-->|REST API| A
    F <-->|WebSocket| SO
    A <--> SO
    P <--> D
    A --> CL
    A --> RE
```

### 4.2 Database Architecture

The data layer uses PostgreSQL, managed via Prisma ORM, utilizing Role-Based Access Control to distinguish between generic users and specific profiles.

```mermaid
erDiagram
    User ||--o| StudentProfile : "has (if STUDENT)"
    User ||--o| AlumniProfile : "has (if ALUMNI)"
    User ||--o| CdcProfile : "has (if CDC)"
    User ||--o{ Post : "creates"
    User ||--o{ Comment : "writes"
    User ||--o{ Like : "leaves"
    User ||--o{ Job : "posts (Alumni)"
    User ||--o{ JobApplication : "submits (Student)"
    User ||--o{ Event : "creates"
    User ||--o{ EventRegistration : "registers for"
    User ||--o{ Notification : "receives"
    User ||--o{ MentorshipRequest : "sends/receives"
    User ||--o{ Message : "sends"
    User ||--o{ SavedJob : "saves"
    User ||--o{ SavedAlumni : "saves"
    User ||--o{ Connection : "requests/accepts"
    
    AlumniProfile ||--o{ WorkExperience : "has"
    AlumniProfile ||--o{ Education : "has"
    AlumniProfile ||--o{ Skill : "possesses"
    AlumniProfile }|--o| Company : "works at"
    
    Post ||--o{ Comment : "has"
    Post ||--o{ Like : "has"
    
    Job ||--o{ JobApplication : "receives"
    Job ||--o{ SavedJob : "saved as"
    
    Event ||--o{ EventRegistration : "has"
    Event ||--o{ EventCertificate : "issues"
    
    EventRegistration ||--o| EventCertificate : "earns"
    
    MentorshipConnection ||--o| Conversation : "has"
    MentorshipConnection ||--o{ Meeting : "schedules"
    MentorshipConnection ||--o{ SharedResource : "shares"
    
    Conversation ||--o{ Message : "contains"
    Message ||--o{ MessageAttachment : "has"
    
    StudentApplication ||--o{ ApplicationCertification : "includes"
    User ||--o| StudentApplication : "submits"
```

### 4.3 Client–Server Architecture

The interaction between the React client and Express server relies on HTTP requests for standard operations and WebSockets for real-time features.

```mermaid
flowchart LR
    Browser["Browser / Client"]
    
    subgraph Frontend Application
        React["React UI"]
        Axios["Axios Client"]
    end
    
    subgraph Backend Application
        Express["Express API"]
        Prisma["Prisma ORM"]
    end
    
    subgraph Cloud Infrastructure
        DB[("PostgreSQL")]
        JWT["JWT Auth"]
        Cloudinary["Cloudinary (Images)"]
        Resend["Resend (Emails)"]
        SocketIO["Socket.IO (Real-time)"]
    end
    
    Browser <--> React
    React <--> Axios
    Axios <-->|HTTP Request/Response| Express
    React <-->|WebSocket| SocketIO
    Express <--> JWT
    Express <--> Prisma
    Prisma <--> DB
    Express --> Cloudinary
    Express --> Resend
```

### 4.4 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (React)
    participant A as API Route
    participant M as JWT Middleware
    participant C as Controller
    participant DB as Database
    
    U->>F: Enters Credentials & Clicks Login
    F->>A: POST /api/auth/login
    A->>C: Routes to Auth Controller
    C->>DB: Query User & Verify Password
    DB-->>C: User Record
    C-->>F: Returns JWT Token & User Data
    F->>F: Stores Token (Local Storage / Context)
    
    U->>F: Navigates to Dashboard
    F->>A: GET /api/student/dashboard (with Token)
    A->>M: Intercepts Request
    M->>M: Verifies JWT Token
    M->>C: Forwards Authenticated Request
    C->>DB: Fetch Dashboard Data
    DB-->>C: Data Result
    C-->>F: JSON Response
    F-->>U: Renders Dashboard
```

### 4.5 MVC Architecture

The backend employs a Model-View-Controller pattern integrated with a Service layer to encapsulate business logic.

```mermaid
flowchart TB
    Client["Client Request"]
    
    subgraph Express Backend
        Routes["Routes (/api/...)"]
        Middleware["Middleware (Auth, Uploads, Error Handling)"]
        Controllers["Controllers (Req/Res handling)"]
        Services["Services (Business Logic)"]
    end
    
    subgraph Data Access
        Prisma["Prisma ORM"]
        Postgres[("PostgreSQL Database")]
    end
    
    Client --> Routes
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma --> Postgres
    
    Postgres --> Prisma
    Prisma --> Services
    Services --> Controllers
    Controllers -->|JSON Response| Client
```

### 4.6 Request Lifecycle

```mermaid
flowchart TD
    A[User Action] --> B[React Component]
    B --> C[Axios API Call]
    C --> D[Express Route Handler]
    D --> E{Auth Middleware}
    E -->|Invalid Token| F[401 Unauthorized]
    E -->|Valid Token| G[Job Controller]
    G --> H[Job Service]
    H --> I[Prisma ORM]
    I --> J[PostgreSQL Database]
    J --> I
    I --> H
    H --> G
    G --> K[JSON Response 200 OK]
    K --> L[Axios Interceptor]
    L --> M[React State Update]
    M --> N[UI Rerenders]
```

### 4.7 Deployment Architecture

The application is deployed across resilient cloud providers ensuring high availability and robust performance.

```mermaid
flowchart LR
    User[End User]
    
    subgraph Hosting Providers
        Vercel[Frontend Vercel]
        Render[Backend Render]
    end
    
    subgraph Managed Services
        Neon[PostgreSQL Neon]
        Cloudinary[Cloudinary Media]
        Resend[Resend Emails]
    end
    
    User -->|HTTPS| Vercel
    Vercel -->|HTTPS| User
    
    Vercel -->|API Requests| Render
    Render -->|API Responses| Vercel
    
    User -->|WSS Socket.IO| Render
    Render -->|WSS Socket.IO| User
    
    Render -->|Prisma TCP| Neon
    Neon -->|Prisma TCP| Render
    
    Render -->|API| Cloudinary
    Render -->|API| Resend
```

### 4.8 Feature Architecture

```mermaid
flowchart TB
    Core["AlumniConnect Platform"]
    
    Core --> Auth["Authentication & Profiles"]
    Core --> Dashboards["Dashboards"]
    Core --> Features["Core Features"]
    Core --> Comms["Communications"]
    
    Auth --> S_Auth["Student, Alumni, CDC"]
    Auth --> RBAC["Role-Based Access"]
    
    Dashboards --> S_Dash["Student Workspace"]
    Dashboards --> A_Dash["Alumni Workspace"]
    Dashboards --> C_Dash["CDC Admin Console"]
    
    Features --> Jobs["Jobs & Internships"]
    Features --> Events["Events & Ticketing"]
    Features --> Mentorship["Mentorship Programs"]
    Features --> Applications["Student Portal Apps"]
    
    Comms --> Chat["1-on-1 Messaging"]
    Comms --> Notif["In-App Notifications"]
    Comms --> Email["Automated Emails"]
```

## 5. Security & Real-Time Communication

- **Real-Time System**: Uses a native WebSocket (`ws`) library running on the Express HTTP server instance. Handshakes are authenticated via JWT. Dead connections are detected through a heartbeat mechanism.
- **Security Enhancements**: 
  - Helmet and Express Rate Limit implemented.
  - Optional email verification and password reset functionality is available.
  - Role-based restricted routing on the frontend and backend.
  - Passwords hashed using `bcryptjs`.

## 6. Testing Strategy

The platform maintains a robust test suite covering multiple layers:
- **Frontend Unit/Component**: Vitest and React Testing Library
- **E2E Testing**: Cypress
- **Backend API**: Jest and Supertest
- **Performance**: k6 for load testing

## 7. API Surface Summary

The REST API exposes well-defined endpoints organized into domains:
- `/api/auth/*` - User authentication and registration
- `/api/student/*` - Profile and dashboard access
- `/api/jobs/*` - Job listings, creation, and applications
- `/api/events/*` - Event management and attendance tracking
- `/api/mentorship/*` - Mentorship requests and management
- `/api/messages/*` - Real-time chat history and delivery

## 8. Conclusion

AlumniConnect stands out as a scalable, secure, and modern web application. Through the use of a robust MVC architecture on the backend, a reactive frontend, and comprehensive deployment strategies, it successfully addresses the networking and professional development needs of academic institutions.
