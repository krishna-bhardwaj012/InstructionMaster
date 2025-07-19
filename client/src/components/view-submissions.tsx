import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/authUtils";
import { X, Download, Edit, User } from "lucide-react";
import { format } from "date-fns";

const gradeSchema = z.object({
  grade: z.number().min(0, "Grade cannot be negative"),
  feedback: z.string().optional(),
});

interface ViewSubmissionsProps {
  assignmentId: number;
  isOpen: boolean;
  onClose: () => void;
}

type GradeFormData = z.infer<typeof gradeSchema>;

export default function ViewSubmissions({ assignmentId, isOpen, onClose }: ViewSubmissionsProps) {
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignment } = useQuery({
    queryKey: ["/api/assignments", assignmentId],
    queryFn: async () => {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch assignment');
      return response.json();
    },
    enabled: !!assignmentId,
  });

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["/api/assignments", assignmentId, "submissions"],
    queryFn: async () => {
      const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch submissions');
      return response.json();
    },
    enabled: !!assignmentId,
  });

  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      grade: 0,
      feedback: "",
    },
  });

  const gradeMutation = useMutation({
    mutationFn: async ({ submissionId, data }: { submissionId: number; data: GradeFormData }) => {
      const response = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Submission graded successfully.",
      });
      setGradingSubmission(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/assignments", assignmentId, "submissions"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to grade submission. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGradeSubmission = (submission: any) => {
    setGradingSubmission(submission);
    form.setValue('grade', submission.grade || 0);
    form.setValue('feedback', submission.feedback || '');
  };

  const onGradeSubmit = (data: GradeFormData) => {
    if (gradingSubmission) {
      gradeMutation.mutate({
        submissionId: gradingSubmission.id,
        data,
      });
    }
  };

  const handleDownload = (filePaths: string[]) => {
    filePaths.forEach(filePath => {
      const filename = filePath.split('/').pop() || filePath;
      window.open(`/api/files/${filename}`, '_blank');
    });
  };

  const getStatusBadge = (submission: any) => {
    if (submission.grade !== null) {
      return <Badge className="bg-green-100 text-green-800">Graded</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
  };

  const getUserInitials = (user: any) => {
    return `${user.firstName[0]}${user.lastName[0]}`;
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading submissions...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {assignment?.title} - Submissions
                </DialogTitle>
                <p className="text-gray-600 text-sm mt-1">
                  {submissions?.length || 0} total submissions
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {submissions && submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission: any) => (
                    <TableRow key={submission.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-medium">
                              {getUserInitials(submission.student)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {submission.student.firstName} {submission.student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.student.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(submission.submittedAt), 'PPp')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(submission)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {submission.grade !== null 
                          ? `${submission.grade}/${assignment?.maxPoints}`
                          : "Not graded"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {submission.filePaths && submission.filePaths.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(submission.filePaths)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGradeSubmission(submission)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Grade
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No submissions yet for this assignment</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={!!gradingSubmission} onOpenChange={() => setGradingSubmission(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <p className="text-sm text-gray-600">
              Grading {gradingSubmission?.student.firstName} {gradingSubmission?.student.lastName}'s submission
            </p>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onGradeSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Grade (out of {assignment?.maxPoints} points)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max={assignment?.maxPoints}
                        placeholder="Enter grade"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide feedback for the student..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setGradingSubmission(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={gradeMutation.isPending}>
                  {gradeMutation.isPending ? "Saving..." : "Save Grade"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
