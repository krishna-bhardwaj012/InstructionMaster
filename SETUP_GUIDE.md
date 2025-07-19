# EdTech Assignment Tracker - Complete Setup Guide

This guide will help you set up and run the EdTech Assignment Tracker application on your local machine using VS Code.

## Prerequisites

Before starting, ensure you have the following installed on your system:

1. **Node.js (version 18 or higher)**
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm (comes with Node.js)**
   - Verify installation: `npm --version`

3. **PostgreSQL Database**
   - Download from: https://www.postgresql.org/download/
   - Or use a cloud service like Neon, Supabase, or Railway

4. **VS Code**
   - Download from: https://code.visualstudio.com/

## Step-by-Step Setup Instructions

### Step 1: Extract and Open Project

1. **Extract the zip file** to your desired location
2. **Open VS Code**
3. **Open the project folder** in VS Code:
   - File → Open Folder
   - Select the extracted project folder

### Step 2: Install Dependencies

Open the terminal in VS Code (Terminal → New Terminal) and run:

```bash
# Install all project dependencies
npm install
```

### Dependencies Included in package.json

#### Frontend Dependencies:
```json
{
  "@hookform/resolvers": "^3.3.2",
  "@radix-ui/react-accordion": "^1.1.2",
  "@radix-ui/react-alert-dialog": "^1.0.5",
  "@radix-ui/react-aspect-ratio": "^1.0.3",
  "@radix-ui/react-avatar": "^1.0.4",
  "@radix-ui/react-checkbox": "^1.0.4",
  "@radix-ui/react-collapsible": "^1.0.3",
  "@radix-ui/react-context-menu": "^2.1.5",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-hover-card": "^1.0.7",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-menubar": "^1.0.4",
  "@radix-ui/react-navigation-menu": "^1.1.4",
  "@radix-ui/react-popover": "^1.0.7",
  "@radix-ui/react-progress": "^1.0.3",
  "@radix-ui/react-radio-group": "^1.1.3",
  "@radix-ui/react-scroll-area": "^1.0.5",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-separator": "^1.0.3",
  "@radix-ui/react-slider": "^1.1.2",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-switch": "^1.0.3",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.5",
  "@radix-ui/react-toggle": "^1.0.3",
  "@radix-ui/react-toggle-group": "^1.0.4",
  "@radix-ui/react-tooltip": "^1.0.7",
  "@tanstack/react-query": "^5.8.4",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "cmdk": "^0.2.0",
  "date-fns": "^2.30.0",
  "embla-carousel-react": "^8.0.0-rc22",
  "input-otp": "^1.2.4",
  "lucide-react": "^0.294.0",
  "next-themes": "^0.2.1",
  "react": "^18.2.0",
  "react-day-picker": "^8.9.1",
  "react-dom": "^18.2.0",
  "react-hook-form": "^7.47.0",
  "react-icons": "^4.12.0",
  "react-resizable-panels": "^0.0.55",
  "recharts": "^2.8.0",
  "tailwind-merge": "^2.0.0",
  "tailwindcss-animate": "^1.0.7",
  "vaul": "^0.7.9",
  "wouter": "^2.12.1",
  "zod": "^3.22.4"
}
```

#### Backend Dependencies:
```json
{
  "@neondatabase/serverless": "^0.6.0",
  "bcrypt": "^5.1.1",
  "drizzle-orm": "^0.29.0",
  "drizzle-zod": "^0.5.1",
  "express": "^4.18.2",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5-lts.1",
  "zod-validation-error": "^2.1.0"
}
```

#### Development Dependencies:
```json
{
  "@types/bcrypt": "^5.0.2",
  "@types/express": "^4.17.21",
  "@types/jsonwebtoken": "^9.0.5",
  "@types/multer": "^1.4.11",
  "@types/node": "^20.8.10",
  "@types/react": "^18.2.37",
  "@types/react-dom": "^18.2.15",
  "@vitejs/plugin-react": "^4.1.1",
  "autoprefixer": "^10.4.16",
  "drizzle-kit": "^0.20.4",
  "postcss": "^8.4.31",
  "tailwindcss": "^3.3.5",
  "tsx": "^4.1.2",
  "typescript": "^5.2.2",
  "vite": "^4.5.0"
}
```

### Step 3: Environment Setup

1. **Create a `.env` file** in the project root:
   ```bash
   touch .env
   ```

2. **Add environment variables** to `.env`:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/edtech_tracker
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Environment
   NODE_ENV=development
   ```

### Step 4: Database Setup

#### Option A: Local PostgreSQL
1. **Start PostgreSQL service**
2. **Create database**:
   ```sql
   CREATE DATABASE edtech_tracker;
   ```
3. **Update DATABASE_URL** in `.env` with your credentials

#### Option B: Cloud Database (Recommended)
1. **Sign up for a free PostgreSQL service**:
   - Neon: https://neon.tech/
   - Supabase: https://supabase.com/
   - Railway: https://railway.app/

2. **Get connection string** and add to `.env`

### Step 5: Database Migration

Run the database migration to create tables:

```bash
npm run db:push
```

### Step 6: Start the Application

Start the development server:

```bash
npm run dev
```

The application will be available at: http://localhost:5000

## Project Structure

```
edtech-assignment-tracker/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Application pages
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Data access layer
│   ├── routes.ts          # API routes
│   └── index.ts           # Server entry point
├── shared/                # Shared type definitions
│   └── schema.ts          # Database schema and types
├── uploads/               # File upload directory (created automatically)
├── package.json           # Dependencies and scripts
├── drizzle.config.ts      # Database configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── .env                   # Environment variables (create this)
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push          # Push schema to database
npm run db:generate      # Generate migration files
npm run db:migrate       # Run migrations

# Development tools
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript check
```

## VS Code Extensions (Recommended)

Install these extensions for better development experience:

1. **ES7+ React/Redux/React-Native snippets** - Provides React snippets
2. **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
3. **TypeScript Importer** - Auto import TypeScript modules
4. **Prettier - Code formatter** - Code formatting
5. **ESLint** - JavaScript/TypeScript linting
6. **Thunder Client** - API testing (alternative to Postman)
7. **PostgreSQL** - Database management

## Common Issues and Solutions

### Issue 1: Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change port in server/index.ts
const PORT = process.env.PORT || 3000;
```

### Issue 2: Database Connection Error
- Verify DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Check database credentials

### Issue 3: Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: TypeScript Errors
```bash
# Check TypeScript configuration
npm run type-check
```

## Testing the Application

### 1. Registration Test
1. Go to http://localhost:5000
2. Click "Sign Up" tab
3. Fill in user details:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Password: password123
   - Role: Teacher or Student
4. Click "Sign Up"

### 2. Login Test
1. Use registered credentials to login
2. Verify role-based dashboard appears

### 3. Teacher Workflow Test
1. Login as teacher
2. Create a new assignment
3. Set due date and requirements
4. Save assignment

### 4. Student Workflow Test
1. Login as student
2. View available assignments
3. Submit files for an assignment
4. Check submission status

## Production Deployment

### Build the Application
```bash
npm run build
```

### Environment Variables for Production
```env
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

### Deploy to Platforms
The application can be deployed to:
- **Vercel** - Frontend and serverless functions
- **Railway** - Full-stack deployment
- **Heroku** - Traditional hosting
- **Digital Ocean** - VPS hosting

## Additional Configuration

### Custom Domain Setup
1. Update CORS settings in `server/index.ts`
2. Configure environment variables
3. Set up SSL certificates

### File Upload Configuration
- Default upload limit: 50MB per file
- Supported formats: PDF, DOC, DOCX, TXT, ZIP, JS, HTML, CSS
- Upload directory: `./uploads/`

### Security Configuration
- JWT token expiration: 24 hours
- Password hashing: bcrypt with 10 salt rounds
- File type validation on upload
- Role-based route protection

## Support and Troubleshooting

### Log Files
- Application logs are displayed in the terminal
- Database queries can be logged by enabling Drizzle logging

### Debug Mode
Add to `.env` for verbose logging:
```env
DEBUG=true
```

### Database Reset
To reset the database:
```bash
npm run db:push --force
```

This complete setup guide should help you get the EdTech Assignment Tracker running on your local machine with VS Code. Follow each step carefully, and the application should work perfectly!