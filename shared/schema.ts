import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'teacher' or 'student'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignmentsCreated: many(assignments),
  submissions: many(submissions),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  teacher: one(users, {
    fields: [assignments.teacherId],
    references: [users.id],
  }),
  submissions: many(submissions),
}));

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

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
  teacherId: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
  grade: true,
  feedback: true,
  gradedAt: true,
});

export const gradeSubmissionSchema = z.object({
  grade: z.number().min(0),
  feedback: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type GradeSubmission = z.infer<typeof gradeSubmissionSchema>;
