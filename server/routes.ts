import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertUserSchema, 
  loginUserSchema, 
  insertAssignmentSchema, 
  insertSubmissionSchema,
  gradeSubmissionSchema
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Multer configuration for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Middleware to verify JWT token
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await storage.createUser(userData);
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          role: user.role 
        } 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Invalid user data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      
      const user = await storage.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          role: user.role 
        } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: 'Invalid credentials' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Assignment routes
  app.post('/api/assignments', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Only teachers can create assignments' });
      }

      const assignmentData = insertAssignmentSchema.parse(req.body);
      const assignment = await storage.createAssignment(assignmentData, req.user.id);
      res.json(assignment);
    } catch (error) {
      console.error('Create assignment error:', error);
      res.status(400).json({ message: 'Invalid assignment data' });
    }
  });

  app.get('/api/assignments', authenticateToken, async (req: any, res) => {
    try {
      let assignments;
      
      if (req.user.role === 'teacher') {
        assignments = await storage.getAssignmentsByTeacher(req.user.id);
      } else {
        assignments = await storage.getAssignmentsForStudent();
      }
      
      res.json(assignments);
    } catch (error) {
      console.error('Get assignments error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/assignments/:id', authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const assignment = await storage.getAssignment(id);
      
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      res.json(assignment);
    } catch (error) {
      console.error('Get assignment error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/assignments/:id', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Only teachers can update assignments' });
      }

      const id = parseInt(req.params.id);
      const assignmentData = insertAssignmentSchema.partial().parse(req.body);
      const assignment = await storage.updateAssignment(id, assignmentData);
      
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      res.json(assignment);
    } catch (error) {
      console.error('Update assignment error:', error);
      res.status(400).json({ message: 'Invalid assignment data' });
    }
  });

  app.delete('/api/assignments/:id', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Only teachers can delete assignments' });
      }

      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAssignment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
      console.error('Delete assignment error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Submission routes
  app.post('/api/submissions', authenticateToken, upload.array('files'), async (req: any, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can submit assignments' });
      }

      const submissionData = insertSubmissionSchema.parse({
        assignmentId: parseInt(req.body.assignmentId),
        studentId: req.user.id,
        notes: req.body.notes || null,
        filePaths: req.files ? req.files.map((file: any) => file.path) : []
      });

      // Check if student has already submitted
      const existingSubmission = await storage.getSubmission(
        submissionData.assignmentId, 
        submissionData.studentId
      );
      
      if (existingSubmission) {
        return res.status(400).json({ message: 'Assignment already submitted' });
      }

      const submission = await storage.createSubmission(submissionData);
      res.json(submission);
    } catch (error) {
      console.error('Create submission error:', error);
      res.status(400).json({ message: 'Invalid submission data' });
    }
  });

  app.get('/api/assignments/:id/submissions', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Only teachers can view submissions' });
      }

      const assignmentId = parseInt(req.params.id);
      const submissions = await storage.getSubmissionsByAssignment(assignmentId);
      res.json(submissions);
    } catch (error) {
      console.error('Get submissions error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/my-submissions', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can view their submissions' });
      }

      const submissions = await storage.getSubmissionsByStudent(req.user.id);
      res.json(submissions);
    } catch (error) {
      console.error('Get my submissions error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/submissions/:id/grade', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Only teachers can grade submissions' });
      }

      const submissionId = parseInt(req.params.id);
      const gradeData = gradeSubmissionSchema.parse(req.body);
      
      const submission = await storage.gradeSubmission(submissionId, gradeData);
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      
      res.json(submission);
    } catch (error) {
      console.error('Grade submission error:', error);
      res.status(400).json({ message: 'Invalid grade data' });
    }
  });

  // Stats routes
  app.get('/api/stats', authenticateToken, async (req: any, res) => {
    try {
      let stats;
      
      if (req.user.role === 'teacher') {
        stats = await storage.getTeacherStats(req.user.id);
      } else {
        stats = await storage.getStudentStats(req.user.id);
      }
      
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // File download route
  app.get('/api/files/:filename', authenticateToken, (req: any, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(uploadDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      res.download(filePath);
    } catch (error) {
      console.error('File download error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
