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

**Security:** Never commit database passwords, API keys, or production secrets to GitHub.

### 3. Start the Backend

On Windows, run:

```powershell
.\mvnw.cmd spring-boot:run
```

Wait for the Spring Boot startup message, such as:

```text
Started ...Application
```

Keep the terminal open while the backend is running.

The configured port is `8080` by default, and the API context path is `/api`.

Example base URL:

```text
http://localhost:8080/api
```

An HTTP error for an API root URL does not necessarily mean the server is down; individual endpoints may be required.

### 4. Start the Frontend

Open a **second terminal** in Visual Studio Code.

Navigate to the frontend project directory:

```powershell
cd C:\Users\kotir\XEBIA__LMS\Xebia-LMS
```

If your repository is stored elsewhere, replace this path with your actual location.

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Open the application in your browser:

**http://localhost:3000**

Keep both terminals running while using the application.

### 5. Frontend and Backend Configuration

The frontend has previously been observed to use `http://localhost:8080/api` as its default API base URL.

If API requests fail, check:

- The backend is running on the expected port.
- The frontend is using the correct API base URL.
- Required environment variables are configured.
- CORS settings permit the frontend origin where necessary.
- The requested backend endpoint actually exists.
- The application is not unintentionally using mock API mode.

Review the frontend configuration and API client before changing environment variables.

## 🧪 Testing and Quality Assurance

Testing helps verify that application modules work together correctly.

### API Testing

Use Postman or another API client to test implemented endpoints.

Recommended test scenarios include:

- Authentication success and failure
- Course creation and retrieval
- Course enrollment
- Assessment creation and retrieval
- Learner submissions
- Evaluation and score recording
- Event creation and registration
- Learning material access
- Authorization and role permissions
- Invalid inputs and error handling

### Backend Tests

From the backend directory, run:

```powershell
.\mvnw.cmd test
```

To package the backend without executing tests:

```powershell
.\mvnw.cmd clean package -DskipTests
```

Skipping tests is useful for a quick package check, but it does not replace a full test run.

### Frontend Build

From the `Xebia-LMS` directory, run:

```powershell
npm run build
```

If the build succeeds, start the production server with:

```powershell
npm start
```

Use the development server (`npm run dev`) for normal local development.

## 🔐 Security Considerations

Production deployments should implement and verify the following practices:

- Enforce authentication and authorization on the backend.
- Validate user permissions on every protected API operation.
- Store secrets in environment variables or a secure secret manager.
- Avoid hardcoded production credentials.
- Replace demonstration credentials before deployment.
- Configure HTTPS for production.
- Restrict CORS to trusted origins.
- Validate and sanitize incoming data.
- Use secure session handling and appropriate cookie settings.
- Apply database access controls and least-privilege permissions.
- Avoid exposing database administration consoles publicly.
- Keep dependencies updated and scan for known vulnerabilities.

**Important:** Hiding a page or navigation item in the frontend is not sufficient authorization. The backend must enforce permissions independently.

## 🚀 Deployment Architecture

A possible deployment architecture is:

```text
                  GitHub Repository
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
           Vercel                Railway
      Next.js Frontend       Spring Boot API
              │                     │
              └──────────┬──────────┘
                         │
                         ▼
                   MongoDB Atlas
```

### Frontend Deployment

The Next.js frontend can be deployed to Vercel or another compatible hosting platform.

Configure the production API URL and other required environment variables through the hosting platform's settings.

### Backend Deployment

The Spring Boot backend can be deployed to Railway or another Java-compatible hosting service.

Configure the required database connections, port, secrets, and deployment settings for the hosting environment.

### Database Deployment

MongoDB Atlas can provide hosted MongoDB storage for modules that use MongoDB.

Relational persistence should also be configured appropriately if the application depends on JPA or H2. An in-memory H2 database is not a persistent production database.

Before deployment, verify that all services can communicate securely and that frontend API URLs point to the deployed backend rather than `localhost`.

## 📊 Major Modules

| Module | Purpose |
|---|---|
| Authentication | User access and session workflows |
| Dashboard | Role-specific workspace |
| Courses | Course creation, enrollment, and management |
| Learning Materials | Educational resource management |
| Assessments | Assessment and question management |
| Submissions | Learner submission and evaluation workflows |
| Events | Event creation and registration |
| Certification | Certificate-related workflows |
| User Management | User and role administration |
| Reporting | Learning and assessment insights, where implemented |

## 🎯 Project Objectives

The Unified Xebia Enterprise LMS Portal aims to:

- Centralize enterprise learning activities in one application.
- Integrate course, assessment, and event management.
- Provide role-specific workflows for administrators, teachers, and learners.
- Simplify access to educational resources.
- Support structured assessment and evaluation.
- Track learner performance and learning progress.
- Provide a foundation for certification management.
- Connect frontend workflows to backend REST APIs.
- Demonstrate full-stack application development and integration.

## 🔮 Future Enhancements

Potential improvements include:

- 📈 Advanced analytics dashboards
- 🤖 AI-assisted assessment evaluation
- 💬 An AI-powered learning assistant
- 🔔 Real-time notifications
- 📱 Progressive Web App support
- 📊 Detailed learner performance analytics
- 🏆 Gamification and achievement badges
- 📄 Automated certificate generation with verification
- 🔍 Advanced course search and filtering
- ☁️ Cloud-optimized deployment
- 🔐 OAuth 2.0 and enterprise single sign-on
- 📦 Docker and container-based deployment
- ⚡ Redis caching where appropriate
- 🧪 Expanded unit, integration, and end-to-end testing
- 📋 Audit logs and administrative activity tracking
- ♿ Accessibility improvements

## 🔄 Development Workflow

```text
1. Plan the feature
        ↓
2. Implement the frontend
        ↓
3. Develop or update REST APIs
        ↓
4. Integrate the database
        ↓
5. Connect frontend and backend
        ↓
6. Test API endpoints
        ↓
7. Validate end-to-end workflows
        ↓
8. Run backend tests and frontend builds
        ↓
9. Review and commit changes
        ↓
10. Push to GitHub and deploy
```

## 👨‍💻 Skills Demonstrated

This project provides experience with:

- Frontend development using Next.js and React
- REST API integration
- Java and Spring Boot backend development
- Database integration
- Authentication and role-based access control
- Reusable UI components
- API testing and debugging
- Git and GitHub collaboration
- Build verification and deployment workflows
- Full-stack application development

## 📌 Project Status

**Status:** Active Development

The repository contains the integrated LMS application, with a focus on combining learning management, assessments, and event-related workflows in a unified platform.

Feature availability and production readiness should be evaluated against the current implementation before each release.

## 📜 License

This project is intended for educational, internship, and demonstration purposes, subject to the licensing terms of the repository and its dependencies.

Add a specific open-source license only after confirming that you have permission to distribute the project under those terms.

## 🙏 Acknowledgements

Developed as part of the Xebia internship and academic project work, with the goal of integrating enterprise learning workflows into a unified full-stack platform.

---

**Unified Xebia Enterprise LMS Portal**  
*One platform for learning, assessment, and enterprise learning activities.*
