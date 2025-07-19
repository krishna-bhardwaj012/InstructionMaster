# EdTech Assignment Tracker

A comprehensive assignment tracking system for educational institutions, built with React, Express, and PostgreSQL. This application provides role-based functionality for both teachers and students to manage assignments effectively.

## Features

### For Teachers:
- **Assignment Management**: Create, edit, and delete assignments with detailed descriptions and due dates
- **Submission Review**: View all student submissions for each assignment
- **Grading System**: Grade submissions and provide feedback to students
- **Analytics Dashboard**: View statistics on assignments, submissions, and pending reviews
- **File Management**: Download submitted files from students

### For Students:
- **Assignment Viewing**: Browse all available assignments with due dates and requirements
- **File Submission**: Upload multiple files for assignments with drag-and-drop support
- **Progress Tracking**: Track submission status (pending, submitted, graded)
- **Grade Viewing**: View grades and feedback from teachers
- **Dashboard Analytics**: Monitor assignment progress and completion statistics

### Technical Features:
- **Role-based Authentication**: Secure login system with teacher/student roles
- **File Upload Support**: Handles multiple file types (PDF, DOC, DOCX, TXT, ZIP, JS, HTML, CSS)
- **Real-time Updates**: Dynamic UI updates after submissions and grading
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Form Validation**: Client and server-side validation for data integrity
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Technology Stack

### Frontend:
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/UI** component library
- **React Hook Form** with Zod validation
- **TanStack Query** for API state management
- **Wouter** for client-side routing
- **Lucide React** for icons

### Backend:
- **Express.js** with TypeScript
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing

### Development Tools:
- **Vite** for build tooling
- **ESBuild** for production builds
- **TypeScript** for type safety
- **Drizzle Kit** for database migrations

## Project Structure

