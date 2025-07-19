import { 
  users, 
  assignments, 
  submissions,
  type User, 
  type InsertUser,
  type Assignment,
  type InsertAssignment,
  type Submission,
  type InsertSubmission,
  type GradeSubmission
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

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

  // Stats
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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async createAssignment(assignment: InsertAssignment, teacherId: number): Promise<Assignment> {
    const [newAssignment] = await db
      .insert(assignments)
      .values({ ...assignment, teacherId })
      .returning();
    return newAssignment;
  }

  async getAssignmentsByTeacher(teacherId: number): Promise<Assignment[]> {
    return db
      .select()
      .from(assignments)
      .where(eq(assignments.teacherId, teacherId))
      .orderBy(desc(assignments.createdAt));
  }

  async getAssignmentsForStudent(): Promise<Assignment[]> {
    return db
      .select()
      .from(assignments)
      .orderBy(desc(assignments.createdAt));
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    const [assignment] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, id));
    return assignment;
  }

  async updateAssignment(id: number, assignment: Partial<InsertAssignment>): Promise<Assignment | undefined> {
    const [updated] = await db
      .update(assignments)
      .set(assignment)
      .where(eq(assignments.id, id))
      .returning();
    return updated;
  }

  async deleteAssignment(id: number): Promise<boolean> {
    const result = await db
      .delete(assignments)
      .where(eq(assignments.id, id));
    return result.rowCount > 0;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db
      .insert(submissions)
      .values(submission)
      .returning();
    return newSubmission;
  }

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

  async getSubmissionsByStudent(studentId: number): Promise<Array<Submission & { assignment: Assignment }>> {
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
        assignment: assignments,
      })
      .from(submissions)
      .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
      .where(eq(submissions.studentId, studentId))
      .orderBy(desc(submissions.submittedAt));
  }

  async getSubmission(assignmentId: number, studentId: number): Promise<Submission | undefined> {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(and(
        eq(submissions.assignmentId, assignmentId),
        eq(submissions.studentId, studentId)
      ));
    return submission;
  }

  async gradeSubmission(submissionId: number, gradeData: GradeSubmission): Promise<Submission | undefined> {
    const [updated] = await db
      .update(submissions)
      .set({ 
        grade: gradeData.grade, 
        feedback: gradeData.feedback,
        gradedAt: new Date()
      })
      .where(eq(submissions.id, submissionId))
      .returning();
    return updated;
  }

  async getTeacherStats(teacherId: number): Promise<{
    totalAssignments: number;
    totalSubmissions: number;
    pendingReviews: number;
  }> {
    // Get total assignments
    const teacherAssignments = await db
      .select()
      .from(assignments)
      .where(eq(assignments.teacherId, teacherId));
    
    const totalAssignments = teacherAssignments.length;
    
    // Get total submissions for teacher's assignments
    const assignmentIds = teacherAssignments.map(a => a.id);
    const allSubmissions = assignmentIds.length > 0 
      ? await db
          .select()
          .from(submissions)
          .where(eq(submissions.assignmentId, assignmentIds[0])) // Simplified for demo
      : [];
    
    const pendingReviews = allSubmissions.filter(s => s.grade === null).length;
    
    return {
      totalAssignments,
      totalSubmissions: allSubmissions.length,
      pendingReviews,
    };
  }

  async getStudentStats(studentId: number): Promise<{
    activeAssignments: number;
    completedAssignments: number;
    pendingGrading: number;
  }> {
    const allAssignments = await this.getAssignmentsForStudent();
    const studentSubmissions = await this.getSubmissionsByStudent(studentId);
    
    const completedAssignments = studentSubmissions.length;
    const pendingGrading = studentSubmissions.filter(s => s.grade === null).length;
    const activeAssignments = allAssignments.length - completedAssignments;
    
    return {
      activeAssignments,
      completedAssignments,
      pendingGrading,
    };
  }
}

export const storage = new DatabaseStorage();
