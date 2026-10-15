# 🚀 Unified Xebia Enterprise LMS Portal

A full-stack **Enterprise Learning Management System (LMS)** that brings course management, assessments, grading, events, learning materials, and certification into one unified platform.

The project integrates three major functional areas:

- 📚 **Learning and Course Management**
- 📝 **Assessment and Evaluation**
- 📅 **Event Management**

The platform provides role-based workspaces for Enterprise Administrators, Teachers, and Learners through shared application navigation, authentication workflows, dashboards, and centralized backend services.

## ✨ Key Features

### 🔐 1. Authentication and Role-Based Access

- User authentication and session-based access workflows
- Role-specific dashboards and navigation
- Separate workspaces for:
  - 👨‍💼 Enterprise Administrators
  - 👨‍🏫 Teachers and Instructors
  - 👨‍🎓 Learners
- Protected application routes
- Shared navigation across integrated LMS modules
- Role-specific access to application features

### 📚 2. Course Management

- Create, view, update, and manage courses
- Course enrollment workflows
- Course details and learning content
- Learning material management
- Access to course resources
- Learner-focused course dashboards
- Course organization and learning progress tracking

### 📝 3. Assessment and Evaluation

- Assessment and question management
- Assessment creation and organization
- Learner assessment submissions
- Teacher evaluation workflows
- Structured grading processes
- Assessment history and result tracking
- Learner score management

### 📅 4. Event Management

- Create and manage organizational events
- Display upcoming events
- View event information and schedules
- Event registration workflows
- Track event registrations
- Centralized event management for learning activities

### 📖 5. Learning Materials

- Organize and manage learning resources
- Associate materials with learning activities
- Access educational content
- Support material upload, download, or preview where implemented
- Provide learners with centralized learning resources

### 🏆 6. Certification

- Track course and assessment completion
- Maintain learner certification records
- Organize certificate-related information
- Support certificate management workflows

Automated certificate generation and verification can be extended as part of future development if not already implemented.

### 🎨 7. Modern Responsive Interface

- Responsive dashboard layouts
- Role-specific sidebar navigation
- Reusable UI components
- Tailwind CSS styling
- Desktop and mobile-friendly layouts
- Consistent navigation across application modules
- Interactive pages for learning and assessment workflows

## 🏗️ System Architecture

The application follows a full-stack architecture in which the frontend communicates with backend services through REST APIs.

```text
                   ┌─────────────────────────┐
                   │      Web Browser        │
                   │  Next.js / React / TS   │
                   └────────────┬────────────┘
                                │
                                │ HTTP / REST APIs
                                ▼
                   ┌─────────────────────────┐
                   │     Spring Boot API     │
                   │       Java Backend      │
                   └────────────┬────────────┘
                                │
                   ┌────────────┴────────────┐
                   │                         │
                   ▼                         ▼
        ┌───────────────────┐     ┌───────────────────┐
        │      MongoDB       │     │      H2 / JPA     │
        │ Document Database  │     │ Relational Data   │
        └───────────────────┘     └───────────────────┘
```

**Architecture overview:**

- **Frontend:** Provides the user interface, dashboards, forms, and navigation.
- **Backend:** Handles API requests, application logic, and data operations.
- **MongoDB:** Supports document-oriented data storage for configured modules.
- **H2 / JPA:** Supports relational persistence for configured modules and local development.
- **REST APIs:** Connect the frontend with backend functionality.

The actual database used by each feature depends on its backend implementation and configuration.

### Application Flow

```text
                    User
                      │
                      ▼
               Authentication
                      │
                      ▼
                Role Detection
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
        Admin       Teacher     Learner
          │           │           │
          ▼           ▼           ▼
      Management   Teaching    Learning
          │           │           │
          └───────────┼───────────┘
                      │
                      ▼
              Spring Boot REST API
                      │
                      ▼
                Service Layer
                      │
                      ▼
               Repository Layer
                      │
                      ▼
                  Database
```

## 📂 Project Structure

```text
XEBIA__LMS/
│
├── .github/
│   └── workflows/                   # CI/CD workflows, if configured
│
├── Assessment-Portal/               # Legacy / reference module
│
├── Xebia-LMS/                       # Main integrated application
│   │
│   ├── backend/
│   │   ├── pom.xml                  # Maven dependencies
│   │   ├── mvnw                     # Maven wrapper (Unix)
│   │   ├── mvnw.cmd                 # Maven wrapper (Windows)
│   │   └── src/
│   │       ├── main/
│   │       │   ├── java/            # Controllers, services, models
│   │       │   └── resources/
│   │       │       └── application.properties
│   │       └── test/                # Backend tests
│   │
│   ├── public/
│   │   └── assets/                  # Static assets
│   │
│   ├── src/
│   │   ├── app/                     # Next.js application routes
│   │   ├── components/              # Reusable UI components
│   │   ├── lib/                     # API clients and shared logic
│   │   └── types/                   # TypeScript types
│   │
│   ├── package.json                 # Frontend dependencies
│   ├── next.config.mjs              # Next.js configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── ...
│
├── .gitignore
└── README.md
```

*Note: This is a high-level project structure. Individual directories and files may differ as development progresses.*

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js |
| UI Library | React |
| Programming Language | TypeScript / JavaScript |
| Styling | Tailwind CSS |
| Backend Framework | Spring Boot 2.7.18 |
| Backend Language | Java |
| Build Tool | Maven |
| API Architecture | REST |
| Document Database | MongoDB |
| Relational Persistence | JPA / H2 |
| Version Control | Git and GitHub |
| Frontend Deployment | Vercel |
| Backend Deployment | Railway |
| Development Environment | Visual Studio Code |

**Version note:** The backend version above reflects the previously inspected Maven configuration. Check `pom.xml` and `package.json` before documenting different versions or adding authentication frameworks as dependencies.

## 🔌 Backend API

The backend exposes REST endpoints under the `/api` context path, according to the current application configuration.

The following are logical API areas. Confirm the actual controller mappings before assuming every endpoint is available.

| Module | Example API Prefix | Purpose |
|---|---|---|
| Authentication | `/api/auth` | Authentication and user-related operations |
| Courses | `/api/courses` | Course management |
| Assessments | `/api/assessments` | Assessment management |
| Submissions | `/api/submissions` | Learner submissions and evaluation |
| Events | `/api/events` | Event management and registration |
| Materials | `/api/materials` | Learning material management |
| Users | `/api/users` | User administration, if implemented |
| Certificates | `/api/certificates` | Certification workflows, if implemented |

### API Request Flow

```text
Frontend Component
        │
        ▼
     API Client
        │
        ▼
Spring Boot Controller
        │
        ▼
   Service Layer
        │
        ▼
 Repository / Data Access
        │
        ▼
      Database
        │
        ▼
   API Response
        │
        ▼
Frontend UI Update
```

## 👥 User Roles

### 👨‍💼 Enterprise Administrator

The administrator workspace is intended for organizational management activities, including:

- Manage users and application roles
- Manage courses and learning resources
- Coordinate teachers and learners
- Create and manage events
- Manage assessments where authorized
- Monitor learning activities
- Maintain organizational learning workflows

### 👨‍🏫 Teacher / Instructor

The teacher workspace is intended for teaching and evaluation activities, including:

- Manage assigned courses
- Create and organize assessments
- Manage assessment questions
- Review learner submissions
- Evaluate assessments and record scores
- Track learner performance
- Manage learning materials

### 👨‍🎓 Learner

The learner workspace is intended to support the learning journey, including:

- Browse available courses
- Enroll in courses where supported
- Access learning materials
- View upcoming events
- Register for events where supported
- Take assessments
- Submit answers
- View results and scores
- Track learning progress
- Access available certificates

*The exact permissions available to each role depend on the implemented frontend and backend authorization rules.*

## ⚙️ Local Development Setup

### Prerequisites

Install the following tools:

- Git
- Java Development Kit compatible with the backend
- Node.js and npm
- A terminal such as PowerShell
- Visual Studio Code or another code editor

The existing backend configuration was previously observed to use Spring Boot 2.7.18, which supports Java 8. Use the Java version compatible with your actual `pom.xml`.

Verify your installations:

```powershell
java -version
node -v
npm -v
git --version
```

### 1. Clone the Repository

If you have not already cloned the repository:

```powershell
git clone https://github.com/akreddiee/XEBIA__LMS.git
cd XEBIA__LMS
```

If the project is already on your computer, open the existing repository directory instead.

### 2. Configure the Backend

Navigate to the backend directory:

```powershell
cd Xebia-LMS\backend
```

Open the following configuration file:

```text
src/main/resources/application.properties
```

Review the database configuration before changing anything.

The current local configuration has been observed to use an in-memory H2 database and an embedded MongoDB setup. If your application relies on embedded MongoDB, you may not need to install MongoDB separately.

If you switch to a local MongoDB server or MongoDB Atlas, configure the appropriate URI and credentials for the modules that use MongoDB.

**Security:**
