# EdTech Assignment Tracker - Complete Build Guide

This document provides comprehensive information about building the EdTech Assignment Tracker application from scratch, including every function, component, and implementation detail.

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Database Design](#database-design)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Authentication System](#authentication-system)
7. [File Upload System](#file-upload-system)
8. [API Endpoints](#api-endpoints)
9. [Component Structure](#component-structure)
10. [Build and Deployment](#build-and-deployment)
11. [Testing and Validation](#testing-and-validation)

## Project Overview

The EdTech Assignment Tracker is a full-stack web application designed to manage educational assignments between teachers and students. It features role-based authentication, assignment creation, file submissions, grading systems, and comprehensive dashboards.

### Key Features
- **Role-based Authentication**: Separate interfaces for teachers and students
- **Assignment Management**: Create, edit, delete, and view assignments
- **File Submission System**: Upload multiple files with validation
- **Grading System**: Teachers can grade submissions and provide feedback
- **Real-time Dashboards**: Statistics and progress tracking
- **Responsive Design**: Mobile-friendly interface

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Shadcn/UI
- **Backend**: Express.js + TypeScript + PostgreSQL + Drizzle ORM
- **Authentication**: JWT-based with bcrypt password hashing
- **File Handling**: Multer for multipart uploads
- **Validation**: Zod for schema validation
- **State Management**: TanStack Query

## System Architecture

### Frontend Architecture
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/UI components
│   │   ├── create-assignment-form.tsx
│   │   ├── submit-assignment-form.tsx
│   │   └── view-submissions.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication hook
│   │   ├── use-toast.ts    # Toast notifications
│   │   └── use-mobile.tsx  # Mobile detection
│   ├── lib/                # Utility libraries
│   │   ├── queryClient.ts  # TanStack Query setup
│   │   ├── authUtils.ts    # Authentication utilities
│   │   └── utils.ts        # General utilities
│   ├── pages/              # Application pages
│   │   ├── login.tsx       # Login/Registration page
│   │   ├── teacher-dashboard.tsx
│   │   ├── student-dashboard.tsx
│   │   └── not-found.tsx
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
```

### Backend Architecture
```
server/
├── db.ts                   # Database connection
├── storage.ts              # Data access layer
├── routes.ts               # API routes
├── index.ts                # Server entry point
└── vite.ts                 # Vite integration

shared/
└── schema.ts               # Shared type definitions
```

## Database Design

### Schema Overview
The application uses three main tables with proper relationships:

#### Users Table
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'teacher' or 'student'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### Assignments Table
```typescript
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  maxPoints: integer("max_points").notNull(),
  allowLateSubmissions: boolean("allow_late_submissions").default(false).notNull(),
  requireFileUpload: boolean("require_file_upload").default(true).notNull(),
  teacherId: integer("teacher_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### Submissions Table
```typescript
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").references(() => assignments.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  notes: text("notes"),
  filePaths: text("file_paths").array(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  grade: integer("grade"),
  feedback: text("feedback"),
  gradedAt: timestamp("graded_at"),
});
```

### Relationships
```typescript
// Users can create multiple assignments (teachers)
// Users can submit multiple assignments (students)
export const usersRelations = relations(users, ({ many }) => ({
  assignmentsCreated: many(assignments),
  submissions: many(submissions),
}));

// Assignments belong to a teacher and have multiple submissions
export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  teacher: one(users, {
    fields: [assignments.teacherId],
    references: [users.id],
  }),
  submissions: many(submissions),
}));

// Submissions belong to an assignment and a student
export const submissionsRelations = relations(submissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [submissions.assignmentId],
    references: [assignments.id],
  }),
  student: one(users, {
    fields: [submissions.studentId],
    references: [users.id],
  }),
}));
```

## Backend Implementation

### Database Connection (server/db.ts)
```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

### Data Access Layer (server/storage.ts)
The storage layer implements the IStorage interface with all CRUD operations:

#### Interface Definition
```typescript
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(email: string, password: string): Promise<User | null>;

  // Assignment operations
  createAssignment(assignment: InsertAssignment, teacherId: number): Promise<Assignment>;
  getAssignmentsByTeacher(teacherId: number): Promise<Assignment[]>;
  getAssignmentsForStudent(): Promise<Assignment[]>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  updateAssignment(id: number, assignment: Partial<InsertAssignment>): Promise<Assignment | undefined>;
  deleteAssignment(id: number): Promise<boolean>;

  // Submission operations
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissionsByAssignment(assignmentId: number): Promise<Array<Submission & { student: User }>>;
  getSubmissionsByStudent(studentId: number): Promise<Array<Submission & { assignment: Assignment }>>;
  getSubmission(assignmentId: number, studentId: number): Promise<Submission | undefined>;
  gradeSubmission(submissionId: number, grade: GradeSubmission): Promise<Submission | undefined>;

  // Statistics
  getTeacherStats(teacherId: number): Promise<{
    totalAssignments: number;
    totalSubmissions: number;
    pendingReviews: number;
  }>;
  getStudentStats(studentId: number): Promise<{
    activeAssignments: number;
    completedAssignments: number;
    pendingGrading: number;
  }>;
}
```

#### Key Implementation Methods
```typescript
// User authentication with bcrypt
async validateUser(email: string, password: string): Promise<User | null> {
  const user = await this.getUserByEmail(email);
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
}

// Complex query for submissions with user data
async getSubmissionsByAssignment(assignmentId: number): Promise<Array<Submission & { student: User }>> {
  return db
    .select({
      id: submissions.id,
      assignmentId: submissions.assignmentId,
      studentId: submissions.studentId,
      notes: submissions.notes,
      filePaths: submissions.filePaths,
      submittedAt: submissions.submittedAt,
      grade: submissions.grade,
      feedback: submissions.feedback,
      gradedAt: submissions.gradedAt,
      student: users,
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.studentId, users.id))
    .where(eq(submissions.assignmentId, assignmentId))
    .orderBy(desc(submissions.submittedAt));
}
```

### API Routes (server/routes.ts)
The API implements RESTful endpoints with proper authentication and validation:

#### Authentication Middleware
```typescript
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

#### File Upload Configuration
```typescript
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'text/javascript',
      'text/html',
      'text/css'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});
```

## Frontend Implementation

### Authentication Hook (client/src/hooks/useAuth.ts)
```typescript
export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch user');
      }

      return response.json();
    },
  });

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user && !error,
    error
  };
}
```

### Main Application Router (client/src/App.tsx)
```typescript
function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/login" component={Login} />
          <Route path="/" component={Login} />
        </>
      ) : (
        <>
          <Route path="/login" component={() => {
            if (user?.role === 'teacher') {
              window.location.href = '/';
            } else {
              window.location.href = '/';
            }
            return null;
          }} />
          <Route path="/" component={user?.role === 'teacher' ? TeacherDashboard : StudentDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}
```

### Form Components

#### Assignment Creation Form
Key features:
- Zod validation with React Hook Form
- DateTime picker for due dates
- File upload requirements toggle
- Real-time form validation

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(insertAssignmentSchema.extend({
    dueDate: insertAssignmentSchema.shape.dueDate.transform(date => date.toISOString()),
  }).transform(data => ({
    ...data,
    dueDate: new Date(data.dueDate),
  }))),
  defaultValues: {
    title: "",
    description: "",
    dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    maxPoints: 100,
    allowLateSubmissions: false,
    requireFileUpload: true,
  },
});
```

#### File Submission Component
Features:
- Drag and drop file upload
- File type and size validation
- Multiple file selection
- Progress tracking

```typescript
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  const validFiles = files.filter(file => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'text/javascript',
      'text/html',
      'text/css'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not a supported file type.`,
        variant: "destructive",
      });
      return false;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB
      toast({
        title: "File too large",
        description: `${file.name} is larger than 50MB.`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  });
  
  setSelectedFiles(prev => [...prev, ...validFiles]);
};
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Assignment Endpoints
- `POST /api/assignments` - Create assignment (teacher only)
- `GET /api/assignments` - Get assignments (role-based)
- `GET /api/assignments/:id` - Get specific assignment
- `PUT /api/assignments/:id` - Update assignment (teacher only)
- `DELETE /api/assignments/:id` - Delete assignment (teacher only)

### Submission Endpoints
- `POST /api/submissions` - Submit assignment (student only)
- `GET /api/assignments/:id/submissions` - Get submissions for assignment (teacher only)
- `GET /api/my-submissions` - Get user's submissions (student only)
- `PUT /api/submissions/:id/grade` - Grade submission (teacher only)

### Utility Endpoints
- `GET /api/stats` - Get role-based statistics
- `GET /api/files/:filename` - Download submitted files

## Component Structure

### Dashboard Components
Both teacher and student dashboards follow similar patterns:
1. **Navigation Bar**: User info, role badge, logout
2. **Stats Cards**: Key metrics display
3. **Main Content**: Role-specific functionality
4. **Modals**: Forms and detailed views

### Form Components
All forms use:
- React Hook Form for form state
- Zod resolver for validation
- Shadcn/UI components for UI
- TanStack Query for API calls
- Toast notifications for feedback

### UI Components
The application uses Shadcn/UI components:
- Cards, Buttons, Inputs, Textareas
- Dialogs, Tables, Badges, Tabs
- Form components with validation
- Toast notifications

## Build and Deployment

### Development Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Database**:
   ```bash
   npm run db:push
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

### Environment Variables
Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `NODE_ENV` - Environment (development/production)

### Production Build
```bash
npm run build
npm start
```

### File Structure for Deployment
```
├── client/dist/          # Built frontend assets
├── server/              # Backend source
├── uploads/             # User uploaded files
├── package.json         # Dependencies and scripts
└── drizzle.config.ts    # Database configuration
```

## Testing and Validation

### User Flow Testing
1. **Registration Flow**:
   - User creates account with role selection
   - Email validation and password requirements
   - Automatic login after registration

2. **Teacher Workflow**:
   - Create assignments with due dates
   - View student submissions
   - Grade submissions with feedback
   - Download submitted files

3. **Student Workflow**:
   - View available assignments
   - Submit files with notes
   - Track submission status
   - View grades and feedback

### Data Validation
- **Client-side**: Zod schemas with React Hook Form
- **Server-side**: Zod validation before database operations
- **File validation**: Type and size checking
- **Authentication**: JWT token validation on protected routes

### Error Handling
- Comprehensive error messages for users
- Proper HTTP status codes
- Database constraint handling
- File upload error management

## Key Implementation Details

### Security Features
1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Stateless token-based auth
3. **Role-based Access**: Route protection by user role
4. **File Upload Security**: Type and size restrictions
5. **Input Validation**: Both client and server-side

### Performance Optimizations
1. **TanStack Query**: Caching and background updates
2. **Code Splitting**: Lazy loading of components
3. **Database Indexing**: Proper foreign key relationships
4. **File Handling**: Efficient multer configuration

### User Experience
1. **Responsive Design**: Mobile-first approach
2. **Loading States**: Skeleton screens and spinners
3. **Error States**: User-friendly error messages
4. **Real-time Updates**: Automatic cache invalidation
5. **Form Validation**: Immediate feedback on input

This comprehensive guide covers every aspect of building the EdTech Assignment Tracker application. Each component, function, and feature has been designed to work together seamlessly while maintaining clean, maintainable code structure.