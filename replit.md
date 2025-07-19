# EdTech Assignment Tracker - Replit Configuration

## Overview

The EdTech Assignment Tracker is a comprehensive full-stack web application designed for educational institutions to manage assignments and submissions. The system provides role-based functionality for both teachers and students, featuring assignment management, file submissions, grading, and progress tracking. The application is built with modern web technologies and follows a modular, scalable architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built as a Single Page Application (SPA) using React 18 with TypeScript. The architecture follows component-based design patterns with:

- **Framework**: React 18 with TypeScript for type safety and modern React features
- **Styling**: Tailwind CSS for utility-first styling with Shadcn/UI component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Build Tool**: Vite for fast development and optimized production builds

The frontend uses a role-based dashboard system where teachers and students see different interfaces tailored to their specific needs.

### Backend Architecture
The backend follows a REST API architecture built with Express.js and TypeScript:

- **Framework**: Express.js with TypeScript for robust server-side development
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Handling**: Multer middleware for multipart file uploads with configurable storage
- **Database Connection**: Neon serverless PostgreSQL with connection pooling

The backend implements a layered architecture with separate concerns for routes, storage operations, and database access.

### Database Schema Design
The system uses a relational database design with three main entities:

- **Users**: Stores user information with role-based access (teacher/student)
- **Assignments**: Contains assignment details with foreign key relationships to teachers
- **Submissions**: Links students to assignments with file paths and grading information

The schema includes proper relationships and constraints to maintain data integrity.

## Key Components

### Authentication System
- JWT-based stateless authentication
- Role-based access control (teacher/student)
- Password hashing with bcrypt
- Token validation middleware for protected routes

### File Upload System
- Support for multiple file types (PDF, DOC, DOCX, TXT, ZIP, JS, HTML, CSS)
- File size limits (50MB) and type validation
- Secure file storage with unique naming
- File download capabilities for teachers

### Assignment Management
- CRUD operations for assignments (teachers only)
- Due date tracking and late submission policies
- Rich text descriptions and point values
- Assignment statistics and analytics

### Submission System
- Student file submission with drag-and-drop interface
- Multiple file uploads per assignment
- Submission status tracking (pending, submitted, graded)
- Teacher grading interface with feedback capabilities

### Dashboard Analytics
- Teacher dashboard: assignment stats, submission counts, pending reviews
- Student dashboard: assignment progress, completion rates, grade tracking
- Real-time updates using TanStack Query

## Data Flow

### User Authentication Flow
1. User submits login credentials
2. Server validates credentials and generates JWT token
3. Token stored in localStorage on client
4. Protected routes validate token on each request
5. Role-based routing redirects users to appropriate dashboard

### Assignment Creation Flow (Teachers)
1. Teacher fills out assignment form with validation
2. Form data sent to server with authentication headers
3. Server validates user role and assignment data
4. Assignment stored in database with teacher association
5. Client updates local cache and UI

### File Submission Flow (Students)
1. Student selects files through drag-and-drop or file picker
2. Files validated for type and size on client
3. FormData object created with files and metadata
4. Multipart form submission to server with authentication
5. Server stores files and creates submission record
6. Client updates submission status in real-time

### Grading Flow (Teachers)
1. Teacher views submissions for specific assignment
2. Downloads and reviews submitted files
3. Submits grade and feedback through form
4. Server updates submission record with grade data
5. Student can view updated grade on their dashboard

## External Dependencies

### Frontend Dependencies
- **UI Framework**: Radix UI primitives for accessible components
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date formatting and manipulation
- **Validation**: Zod for schema validation
- **HTTP Client**: Native fetch API with TanStack Query wrapper

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL for managed database hosting
- **ORM**: Drizzle for type-safe database operations
- **Authentication**: jsonwebtoken for JWT handling
- **File Upload**: Multer for handling multipart form data
- **Security**: bcrypt for password hashing

### Development Tools
- **TypeScript**: For type safety across the entire application
- **ESLint**: Code linting and formatting
- **Drizzle Kit**: Database migration and schema management
- **Path Aliases**: Configured for clean import statements

## Deployment Strategy

The application is designed for deployment on platforms that support Node.js applications:

### Build Process
1. Frontend built using Vite with optimized asset bundling
2. Backend compiled using ESBuild for production optimization
3. Static assets served from Express server in production
4. Environment variables for database and JWT configuration

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `JWT_SECRET`: Secret key for JWT token signing
- `NODE_ENV`: Environment specification (development/production)

### File Storage
- Local file system storage for uploaded files
- Upload directory created automatically if not exists
- File paths stored in database for retrieval

### Development Workflow
- Hot module replacement in development via Vite
- Database schema changes managed through Drizzle migrations
- TypeScript compilation checking across all environments
- Comprehensive error handling with user-friendly messages

The application architecture prioritizes type safety, maintainability, and user experience while providing a robust foundation for educational assignment management.