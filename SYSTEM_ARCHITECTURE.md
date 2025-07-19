# EdTech Assignment Tracker - System Architecture Documentation

## Overview

The EdTech Assignment Tracker is a comprehensive full-stack web application designed for educational institutions to manage assignments and submissions with role-based functionality for teachers and students.

## Core Entities and Relationships

### Entity Relationship Diagram (ER)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │   ASSIGNMENTS   │       │   SUBMISSIONS   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ teacherId (FK)  │◄──────┤ assignmentId(FK)│
│ email (UNIQUE)  │       │ id (PK)         │       │ studentId (FK)  │──┐
│ password        │       │ title           │       │ id (PK)         │  │
│ firstName       │       │ description     │       │ notes           │  │
│ lastName        │       │ dueDate         │       │ filePaths[]     │  │
│ role            │       │ maxPoints       │       │ submittedAt     │  │
│ createdAt       │       │ allowLateSub    │       │ grade           │  │
└─────────────────┘       │ requireFile     │       │ feedback        │  │
                          │ createdAt       │       │ gradedAt        │  │
                          └─────────────────┘       └─────────────────┘  │
                                                                          │
                                                    ┌─────────────────────┘
                                                    │
                                                    ▼
                                              ┌─────────────────┐
                                              │     USERS       │
                                              │  (Student)      │
                                              └─────────────────┘
```

### Relationship Details

1. **Users → Assignments** (One-to-Many)
   - One teacher can create multiple assignments
   - `assignments.teacherId` references `users.id`

2. **Assignments → Submissions** (One-to-Many)
   - One assignment can have multiple student submissions
   - `submissions.assignmentId` references `assignments.id`

3. **Users → Submissions** (One-to-Many)
   - One student can make multiple submissions
   - `submissions.studentId` references `users.id`

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
**Purpose**: Register a new user (teacher or student)
```json
Request Body:
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "teacher" | "student"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "teacher"
  }
}
```

#### POST /api/auth/login
**Purpose**: Authenticate existing user
```json
Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### GET /api/auth/me
**Purpose**: Get current authenticated user information
```json
Headers: { "Authorization": "Bearer jwt_token" }

Response:
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "teacher"
}
```

### Assignment Management Endpoints

#### POST /api/assignments (Teacher Only)
**Purpose**: Teacher creates a new assignment
```json
Headers: { "Authorization": "Bearer jwt_token" }
Request Body:
{
  "title": "JavaScript Fundamentals",
  "description": "Complete the JavaScript exercises",
  "dueDate": "2024-01-15T23:59:59Z",
  "maxPoints": 100,
  "allowLateSubmissions": false,
  "requireFileUpload": true
}

Response:
{
  "id": 1,
  "title": "JavaScript Fundamentals",
  "description": "Complete the JavaScript exercises",
  "dueDate": "2024-01-15T23:59:59Z",
  "maxPoints": 100,
  "allowLateSubmissions": false,
  "requireFileUpload": true,
  "teacherId": 1,
  "createdAt": "2024-01-08T10:00:00Z"
}
```

#### GET /api/assignments
**Purpose**: Get assignments (filtered by role)
- **Teachers**: Get assignments they created
- **Students**: Get all available assignments

```json
Headers: { "Authorization": "Bearer jwt_token" }

Response:
[
  {
    "id": 1,
    "title": "JavaScript Fundamentals",
    "description": "Complete the JavaScript exercises",
    "dueDate": "2024-01-15T23:59:59Z",
    "maxPoints": 100,
    "allowLateSubmissions": false,
    "requireFileUpload": true,
    "teacher": {
      "id": 1,
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "createdAt": "2024-01-08T10:00:00Z"
  }
]
```

#### GET /api/assignments/:id
**Purpose**: Get specific assignment details
```json
Headers: { "Authorization": "Bearer jwt_token" }

Response:
{
  "id": 1,
  "title": "JavaScript Fundamentals",
  "description": "Complete the JavaScript exercises",
  "dueDate": "2024-01-15T23:59:59Z",
  "maxPoints": 100,
  "allowLateSubmissions": false,
  "requireFileUpload": true,
  "teacher": {
    "id": 1,
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "createdAt": "2024-01-08T10:00:00Z"
}
```

### Submission Management Endpoints

#### POST /api/submissions (Student Only)
**Purpose**: Student submits assignment
```json
Headers: { "Authorization": "Bearer jwt_token" }
Content-Type: multipart/form-data

Form Data:
- assignmentId: 1
- notes: "Completed all exercises with bonus questions"
- files: [file1.pdf, file2.js, file3.html]

Response:
{
  "id": 1,
  "assignmentId": 1,
  "studentId": 2,
  "notes": "Completed all exercises with bonus questions",
  "filePaths": ["/uploads/file1.pdf", "/uploads/file2.js"],
  "submittedAt": "2024-01-14T14:30:00Z",
  "grade": null,
  "feedback": null,
  "gradedAt": null
}
```

#### GET /api/assignments/:id/submissions (Teacher Only)
**Purpose**: Teacher views submissions for their assignment
```json
Headers: { "Authorization": "Bearer jwt_token" }

Response:
[
  {
    "id": 1,
    "assignment": {
      "id": 1,
      "title": "JavaScript Fundamentals",
      "maxPoints": 100
    },
    "student": {
      "id": 2,
      "firstName": "John",
      "lastName": "Doe"
    },
    "notes": "Completed all exercises",
    "filePaths": ["/uploads/file1.pdf"],
    "submittedAt": "2024-01-14T14:30:00Z",
    "grade": null,
    "feedback": null,
    "gradedAt": null
  }
]
```

#### GET /api/my-submissions (Student Only)
**Purpose**: Student views their own submissions
```json
Headers: { "Authorization": "Bearer jwt_token" }

Response:
[
  {
    "id": 1,
    "assignment": {
      "id": 1,
      "title": "JavaScript Fundamentals",
      "maxPoints": 100,
      "dueDate": "2024-01-15T23:59:59Z"
    },
    "notes": "Completed all exercises",
    "filePaths": ["/uploads/file1.pdf"],
    "submittedAt": "2024-01-14T14:30:00Z",
    "grade": 85,
    "feedback": "Good work overall!",
    "gradedAt": "2024-01-16T09:00:00Z"
  }
]
```

#### PUT /api/submissions/:id/grade (Teacher Only)
**Purpose**: Teacher grades a submission
```json
Headers: { "Authorization": "Bearer jwt_token" }
Request Body:
{
  "grade": 85,
  "feedback": "Good work! Consider adding more comments to your code."
}

Response:
{
  "id": 1,
  "assignmentId": 1,
  "studentId": 2,
  "notes": "Completed all exercises",
  "filePaths": ["/uploads/file1.pdf"],
  "submittedAt": "2024-01-14T14:30:00Z",
  "grade": 85,
  "feedback": "Good work! Consider adding more comments to your code.",
  "gradedAt": "2024-01-16T09:00:00Z"
}
```

### File Management Endpoints

#### GET /api/files/:filename
**Purpose**: Download submitted files (Teachers can download any file, Students can only download their own)
```json
Headers: { "Authorization": "Bearer jwt_token" }

Response: File download stream
```

### Statistics Endpoints

#### GET /api/stats
**Purpose**: Get dashboard statistics (role-based)
```json
Headers: { "Authorization": "Bearer jwt_token" }

Teacher Response:
{
  "totalAssignments": 5,
  "totalSubmissions": 23,
  "pendingReviews": 8,
  "averageGrade": 78.5
}

Student Response:
{
  "activeAssignments": 3,
  "completedAssignments": 7,
  "pendingGrading": 2,
  "averageGrade": 82.3
}
```

## Authentication Strategy

### JWT-Based Authentication
- **Token Generation**: Upon successful login/registration
- **Token Storage**: localStorage on frontend
- **Token Validation**: Middleware on protected routes
- **Token Expiration**: 24 hours (configurable)

### Role-Based Access Control (RBAC)
- **Roles**: `teacher`, `student`
- **Authorization**: Endpoint-level permissions
- **Route Protection**: React Router guards based on user role

### Security Measures
- **Password Hashing**: bcrypt with 10 salt rounds
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **File Upload Security**: Type validation, size limits (50MB)
- **CORS Configuration**: Restricted to application domain

## File Upload System

### Supported File Types
- **Documents**: PDF, DOC, DOCX, TXT
- **Archives**: ZIP
- **Code Files**: JS, HTML, CSS
- **Size Limit**: 50MB per file

### File Storage Strategy
- **Local Storage**: `./uploads/` directory
- **Naming Convention**: UUID-based to prevent conflicts
- **Path Storage**: Database stores relative file paths
- **Access Control**: Role-based file access permissions

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Assignments Table
```sql
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMP NOT NULL,
  max_points INTEGER NOT NULL,
  allow_late_submissions BOOLEAN DEFAULT FALSE,
  require_file_upload BOOLEAN DEFAULT TRUE,
  teacher_id INTEGER REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Submissions Table
```sql
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES assignments(id) NOT NULL,
  student_id INTEGER REFERENCES users(id) NOT NULL,
  notes TEXT,
  file_paths TEXT[],
  submitted_at TIMESTAMP DEFAULT NOW(),
  grade INTEGER,
  feedback TEXT,
  graded_at TIMESTAMP,
  UNIQUE(assignment_id, student_id)
);
```

## Scaling Considerations

### Database Scaling
1. **Read Replicas**: For handling increased read traffic
2. **Database Indexing**: On frequently queried fields
3. **Connection Pooling**: Implemented via Neon serverless
4. **Query Optimization**: Using Drizzle ORM prepared statements

### Application Scaling
1. **Horizontal Scaling**: Multiple server instances behind load balancer
2. **Caching Strategy**: Redis for session management and query caching
3. **CDN Integration**: For static file delivery
4. **Microservices**: Split into user service, assignment service, notification service

### File Storage Scaling
1. **Cloud Storage**: Migrate to AWS S3/Google Cloud Storage
2. **CDN**: CloudFront/CloudFlare for file delivery
3. **File Processing**: Background queue for file validation/processing
4. **Compression**: Automatic file compression for storage optimization

### Performance Optimizations
1. **API Response Caching**: Cache frequently accessed data
2. **Lazy Loading**: On frontend for large datasets
3. **Pagination**: Implement cursor-based pagination
4. **Background Jobs**: For email notifications and file processing

### Security Enhancements
1. **Rate Limiting**: Prevent API abuse
2. **Input Validation**: Enhanced server-side validation
3. **Audit Logging**: Track all user actions
4. **Backup Strategy**: Automated database backups

### Monitoring and Analytics
1. **Application Monitoring**: Error tracking and performance metrics
2. **User Analytics**: Usage patterns and feature adoption
3. **Health Checks**: Automated system health monitoring
4. **Alerting**: Real-time notifications for system issues

## Future Feature Considerations

### Enhanced Assignment Features
- **Rich Text Editor**: For assignment descriptions
- **Assignment Templates**: Reusable assignment structures
- **Due Date Reminders**: Automated notifications
- **Plagiarism Detection**: Integration with plagiarism checking services

### Advanced Grading Features
- **Rubric-Based Grading**: Detailed grading criteria
- **Peer Review**: Student-to-student assignment reviews
- **Auto-Grading**: For code submissions
- **Grade Analytics**: Performance trends and insights

### Communication Features
- **Real-time Chat**: Between teachers and students
- **Announcement System**: Class-wide notifications
- **Discussion Forums**: Assignment-specific discussions
- **Video Conferencing**: Integrated virtual office hours

### Mobile Application
- **React Native App**: Cross-platform mobile support
- **Push Notifications**: Assignment reminders and grade notifications
- **Offline Capability**: Work on assignments without internet
- **Camera Integration**: Photo submissions and document scanning

This architecture provides a solid foundation for an educational assignment tracking system with clear separation of concerns, proper security measures, and scalability considerations for future growth.