import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/authUtils";
import { X, Upload, File, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const submissionSchema = z.object({
  notes: z.string().optional(),
  files: z.any().optional(),
});

interface SubmitAssignmentFormProps {
  assignment: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = z.infer<typeof submissionSchema>;

export default function SubmitAssignmentForm({ assignment, isOpen, onClose, onSuccess }: SubmitAssignmentFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      notes: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      formData.append('assignmentId', assignment.id.toString());
      if (data.notes) {
        formData.append('notes', data.notes);
      }
      
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
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
        description: "Assignment submitted successfully.",
      });
      form.reset();
      setSelectedFiles([]);
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message.includes('already submitted') 
          ? "You have already submitted this assignment."
          : "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onSubmit = (data: FormData) => {
    if (assignment.requireFileUpload && selectedFiles.length === 0) {
      toast({
        title: "Files required",
        description: "This assignment requires file uploads.",
        variant: "destructive",
      });
      return;
    }
    
    submitMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">Submit Assignment</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Card className="mb-6">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">{assignment.title}</h4>
            <p className="text-blue-800 text-sm">
              Due: {format(new Date(assignment.dueDate), 'PPP')}
            </p>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Submission Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about your submission..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Upload Files</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors mt-2">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop your files here, or click to browse</p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports: PDF, DOC, DOCX, TXT, ZIP, JS, HTML, CSS (Max 50MB each)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.zip,.js,.html,.css"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileUpload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('fileUpload')?.click()}
                >
                  Choose Files
                </Button>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h5>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <File className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h5 className="text-sm font-medium text-yellow-800">Important Reminder</h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      Make sure your submission is complete and follows the assignment requirements. 
                      You can only submit once.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "Submitting..." : "Submit Assignment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
