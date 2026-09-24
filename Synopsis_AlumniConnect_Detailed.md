# Project Synopsis: AlumniConnect

## Team Members
- **Piyush Mishra** (0827RL243D05)
- **Ashish Sharma** (0827RL243D02)
- **Uddhav Solanki** (0827RL231069)
- **Yug Singh Chauhan** (0827RL231074)

## Under the Supervision of
**Prof. Seema Jhade**

---

## 1. Introduction of the Project
Maintaining an active and engaged alumni network is crucial for educational institutions as it fosters a strong community, facilitates mentorship, and opens up career opportunities for current students. Traditional methods of alumni tracking, such as manual spreadsheets or fragmented social media groups, are often inefficient and fail to provide structured networking opportunities. 

The proposed **AlumniConnect** system is a centralized web platform designed to bridge the gap between alumni, current students, and the institution. The target users include university alumni, students seeking mentorship or job referrals, and college administrators. The platform will offer features like profile creation, professional networking, direct messaging, job postings, and event management. By implementing AlumniConnect, institutions can build a thriving digital community, streamline communication, and provide students with invaluable industry connections, thereby enhancing the overall educational and professional ecosystem.

## 2. Objective
The primary objectives of the AlumniConnect project are:
1. **To develop** a centralized and automated platform for managing the institution's alumni network.
2. **To facilitate** seamless networking and mentorship between alumni and current students.
3. **To design** a secure authentication system that verifies user credentials based on their institutional role (Student/Alumni).
4. **To improve** career opportunities for students by allowing alumni to post jobs, internships, and referral opportunities.
5. **To provide** administrators with a dashboard to monitor engagement, manage users, and organize alumni events.

## 3. Scope

**In Scope:**
- User registration and role-based access (Student, Alumni, Admin).
- Detailed user profiles with academic and professional histories.
- Mentorship matching and direct messaging system.
- Job and internship posting board.
- Alumni events and reunion management module.
- Admin dashboard for user approval and analytics.

**Out of Scope:**
- Mobile application development (initial release is web-only).
- Integration with external university ERP systems.
- Payment gateway for institutional donations.
- Video conferencing functionalities within the platform.

## 4. Study of Existing System

| No | Existing System | Problems Addressed | Advantages | Disadvantages | Gap Identified | Reference |
|---|---|---|---|---|---|---|
| 1 | LinkedIn | Professional networking | Large user base, global reach | Not institution-specific, students get lost in the crowd | Lack of curated, college-specific mentorship | [1] |
| 2 | Facebook Groups | Community building | Familiar UI, easy to use | Poor professional context, unstructured data | Difficult to search for jobs, skills, or specific alumni | [2] |
| 3 | Manual Spreadsheets | Basic record keeping | Zero cost, simple | Highly prone to data rot, unscalable | No interaction platform for students and alumni | [3] |
| 4 | Almabase | Alumni management | Comprehensive, institutional focused | Expensive for small colleges | High barrier to entry, complex setup | [4] |
| 5 | WhatsApp Groups | Instant communication | Fast, real-time | Limited member capacity, spam | No structured profiles, job boards, or privacy control | [5] |

## 5. Project Description

### 5.1 Proposed System
The proposed AlumniConnect platform addresses the gap by providing an institution-specific, dedicated digital space for networking. Unlike generic platforms like LinkedIn, AlumniConnect verifies users based on college records, ensuring a trusted environment. It offers tailored features like mentorship requests and targeted job boards that directly benefit the college community.

### 5.2 Working of the System
1. **Registration/Login:** Users register as Students or Alumni. Admins verify and approve the accounts.
2. **Profile Completion:** Users fill in their academic details, current company, skills, and interests.
3. **Networking & Mentorship:** Students can search for alumni based on companies, roles, or skills and send connection/mentorship requests.
4. **Communication:** Approved connections can chat via the integrated messaging system.
5. **Job Board:** Alumni can post job openings at their companies, and students can apply directly.

### 5.3 Data Flow / Process Flow
*(A flowchart/DFD will be inserted here illustrating User Registration → Admin Approval → Profile Creation → Networking/Job Applications)*

### 5.4 Database Design
*(An ER Diagram will be attached illustrating the relationships between User, Profile, JobPosting, ConnectionRequest, and Message entities.)*

## 6. Planning of the Project work

| Phase | Activity | Indicative Duration |
|---|---|---|
| 1 | Problem Identification & Literature Survey | Week 1 |
| 2 | Requirement Analysis & Architecture Design | Week 2 |
| 3 | Database Design & API Planning (Prisma/Express) | Week 3 |
| 4 | Backend Implementation (Authentication, Endpoints) | Week 4-5 |
| 5 | Frontend Implementation (React, UI/UX) | Week 6-8 |
| 6 | System Integration & Chat functionality | Week 9-10 |
| 7 | Testing & Debugging (Unit & E2E) | Week 11 |
| 8 | Documentation (Report, Presentation) & Final Demo | Week 12 |

*(Gantt chart to be attached illustrating the above timeline)*

## 7. Features

| Category | Example Features |
|---|---|
| **User Interface** | Responsive layout, dark/light mode, intuitive dashboards |
| **Functional** | Role-based registration, advanced search for alumni, job posting, real-time chat, event management |
| **Security** | JWT-based authentication, secure password hashing (bcrypt), role-based authorization |
| **Performance** | Optimized Prisma database queries, lazy loading for frontend components |
| **Reporting & Analytics** | Admin dashboard showing user growth, active jobs, and engagement metrics |
| **User Experience** | Real-time notifications, toast alerts, form validation messages |

## 8. System Architecture
**High-Level Architecture:**
User → React Frontend (Web Interface) → Node.js/Express Backend (REST API / WebSockets) → Prisma ORM → PostgreSQL Database.
*(A labelled architectural diagram will be provided illustrating the client-server interaction and WebSocket integration for chat.)*

## 9. User Interface (UI)
The UI will be built using React and modern CSS frameworks (like Tailwind CSS). 
- **Dashboard:** Will feature quick stats, recent job postings, and suggested alumni connections.
- **Profile Page:** Will display a banner, profile picture, bio, skills, and a timeline of academic/professional history.
- **Chat Interface:** A split-pane view with a contact list on the left and a real-time messaging window on the right.

## 10. Technology Stack

| Component | Technology / Tool |
|---|---|
| **Frontend** | React.js, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL, Prisma ORM |
| **Real-time Communication** | WebSockets (Socket.io/ws) |
| **Programming Language** | TypeScript / JavaScript |
| **Development Tool** | VS Code, Postman |
| **Version Control** | Git, GitHub |

## 11. Testing Plan
The platform will undergo unit testing, integration testing, and manual UI testing to ensure reliability and security.

| Test Case ID | Test Scenario | Input | Expected Output |
|---|---|---|---|
| TC01 | Valid Registration | Correct details and valid email | Account created, pending admin approval |
| TC02 | Invalid Login | Incorrect password | "Invalid credentials" error message |
| TC03 | Unauthorized Access | Student trying to access Admin dashboard | Access denied, redirected to home |
| TC04 | Job Posting | Valid job details entered by Alumni | Job successfully published to the board |
| TC05 | Real-time Chat | Message sent to a connected peer | Message delivered and displayed instantly |

## 12. Expected Outcome and Benefits
The completed AlumniConnect platform is expected to foster a tightly knit, digitally accessible community for the institution. Current students will benefit immensely from career guidance, mentorship, and referral opportunities provided by successful alumni. Alumni will have a streamlined way to give back to their alma mater and recruit fresh talent. The institution will benefit from an organized, up-to-date database of its graduates, improving its placement records and institutional reputation.

## 13. Resources and Limitations

### 1. Resources:
| Resource Type | Examples |
|---|---|
| **Hardware** | Laptops/PCs for development and testing. |
| **Software** | VS Code, Node.js environment, PostgreSQL Server, Git. |
| **Other** | Cloud hosting (e.g., Vercel for frontend, Render/Railway for backend, Supabase/Neon for DB). |

### 2. Limitations:
- The initial version relies on manual verification by the admin, which may become a bottleneck at a very large scale.
- Real-time chat performance is dependent on server WebSocket limits.
- The platform does not currently support automated integration with the university's legacy ERP database.

## 14. Conclusion
The AlumniConnect project aims to solve the persistent problem of fragmented alumni relations by providing a dedicated, secure, and feature-rich networking platform. By facilitating mentorship, professional networking, and job sharing, the system directly aligns with the career aspirations of students and the community-building goals of the institution. With a robust modern tech stack, AlumniConnect is poised to deliver a highly scalable and beneficial solution for the college ecosystem.

## 15. References
[1] LinkedIn Corporation, "About LinkedIn," LinkedIn, 2024. [Online]. Available: https://about.linkedin.com/  
[2] N. Ellison, C. Steinfield, and C. Lampe, "The Benefits of Facebook “Friends:” Social Capital and College Students’ Use of Online Social Network Sites," Journal of Computer-Mediated Communication, vol. 12, no. 4, pp. 1143-1168, 2007.  
[3] Almabase, "Alumni Management Software," Almabase, 2024. [Online]. Available: https://www.almabase.com/  
