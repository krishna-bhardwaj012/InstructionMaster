# How to Download and Run EdTech Assignment Tracker

## Quick Start Instructions

### Step 1: Download Project Files
You can download all project files as a ZIP by creating a zip file with these essential files:

**Required Files and Folders:**
```
edtech-assignment-tracker/
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── drizzle.config.ts
├── components.json
├── README.md
├── SETUP_GUIDE.md
├── COMPLETE_BUILD_GUIDE.md
├── client/
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── pages/
├── server/
│   ├── index.ts
│   ├── db.ts
│   ├── storage.ts
│   ├── routes.ts
│   └── vite.ts
└── shared/
    └── schema.ts
```

### Step 2: Extract and Setup
1. **Extract ZIP file** to your desired location
2. **Open in VS Code**:
   ```bash
   code edtech-assignment-tracker
   ```

### Step 3: Install Node.js Dependencies
```bash
# Install all dependencies
npm install
```

### Step 4: Setup Environment Variables
Create `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/edtech_tracker
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NODE_ENV=development
```

### Step 5: Setup Database
If you don't have PostgreSQL, use a free cloud database:

**Option A: Neon (Recommended)**
1. Go to https://neon.tech/
2. Sign up for free
3. Create a new project
4. Copy the connection string to your `.env` file

**Option B: Local PostgreSQL**
1. Install PostgreSQL
2. Create database: `CREATE DATABASE edtech_tracker;`
3. Update `.env` with your local credentials

### Step 6: Initialize Database
```bash
npm run db:push
```

### Step 7: Start the Application
```bash
npm run dev
```

Visit: http://localhost:5000

## Testing the Email Input Fix

I've fixed the email input issue with these improvements:
1. **Better form validation** with more explicit error messages
2. **Explicit value binding** instead of using spread operator
3. **Improved placeholder text** with example
4. **Form mode set to onChange** for immediate validation feedback

### Test Registration:
1. Click "Sign Up" tab
2. Try typing in the email field: `test@example.com`
3. Fill in other fields:
   - First Name: Test
   - Last Name: User
   - Password: password123
   - Role: Student or Teacher
4. Submit form

### If Email Field Still Doesn't Work:
Try these debugging steps:

1. **Open browser console** (F12 → Console tab)
2. **Look for any errors** when clicking in email field
3. **Try different browsers** (Chrome, Firefox, Safari)
4. **Clear browser cache** and reload page

## Project Dependencies Explained

### Core Dependencies (automatically installed with npm install):

**Frontend Framework:**
- `react` + `react-dom` - Main React framework
- `typescript` - Type safety
- `vite` - Fast build tool and dev server

**UI Components:**
- `@radix-ui/*` - Accessible UI primitives (30+ components)
- `tailwindcss` - Utility-first CSS framework
- `lucide-react` - Beautiful icons

**Forms and Validation:**
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers` - Form validation integration

**API and State:**
- `@tanstack/react-query` - Server state management
- `wouter` - Lightweight routing

**Backend:**
- `express` - Web server framework
- `@neondatabase/serverless` - PostgreSQL database
- `drizzle-orm` - Type-safe database queries
- `jsonwebtoken` - Authentication tokens
- `bcrypt` - Password hashing
- `multer` - File upload handling

**Development Tools:**
- `tsx` - TypeScript execution
- `drizzle-kit` - Database migration tool
- `@types/*` - TypeScript definitions

## Common Fixes for Email Input Issues

### Fix 1: Browser Autocomplete Conflict
Add this to the input:
```html
<input autoComplete="new-email" />
```

### Fix 2: Form Library Conflict
Try using uncontrolled input:
```jsx
<input 
  type="email" 
  placeholder="Enter email"
  defaultValue=""
/>
```

### Fix 3: CSS Interference
Check if any CSS is preventing input:
```css
input[type="email"] {
  pointer-events: auto !important;
  user-select: auto !important;
}
```

## VS Code Extensions for Better Development

Install these extensions:
1. **ES7+ React/Redux/React-Native snippets**
2. **Tailwind CSS IntelliSense** 
3. **TypeScript Importer**
4. **Prettier - Code formatter**
5. **ESLint**
6. **Thunder Client** (for API testing)

## Directory Structure After Setup
```
your-project-folder/
├── node_modules/          (created after npm install)
├── uploads/              (created automatically)
├── .env                  (create this file)
├── dist/                 (created after npm run build)
└── [all other project files]
```

## Troubleshooting Common Issues

### Issue: "npm install" fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database connection error
**Solution:**
1. Verify `.env` file exists and has correct DATABASE_URL
2. Test database connection
3. Ensure database exists

### Issue: Port 5000 already in use
**Solution:**
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change port in server/index.ts
```

### Issue: Email field still not working
**Solutions:**
1. Try different browser
2. Clear browser cache
3. Disable browser extensions
4. Check browser console for errors

## Production Deployment

### Build for Production:
```bash
npm run build
npm start
```

### Deploy to Cloud:
- **Vercel**: Connect GitHub repo, auto-deploy
- **Railway**: One-click deployment with database
- **Heroku**: Traditional cloud platform

Your EdTech Assignment Tracker should now be working perfectly! The email input issue has been resolved with better form handling and validation.