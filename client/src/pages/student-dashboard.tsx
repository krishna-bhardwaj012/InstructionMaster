import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { getAuthHeaders } from "@/lib/authUtils";
import { 
  GraduationCap, 
  Bell, 
  LogOut, 
  FileText, 
  CheckCircle, 
  Clock, 
  Calendar,
  Star,
  User,
  Upload,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import SubmitAssignmentForm from "@/components/submit-assignment-form";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch('/api/stats', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["/api/assignments"],
    queryFn: async () => {
      const response = await fetch('/api/assignments', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch assignments');
      return response.json();
    },
  });

  const { data: submissions, refetch: refetchSubmissions } = useQuery({
    queryKey: ["/api/my-submissions"],
    queryFn: async () => {
      const response = await fetch('/api/my-submissions', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch submissions');
      return response.json();
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleSubmit = (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowSubmitForm(true);
  };

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : '';

  // Create a map of submitted assignments
  const submittedAssignments = new Set(
    submissions?.map((sub: any) => sub.assignment.id) || []
  );

  const getAssignmentStatus = (assignment: any) => {
    if (submittedAssignments.has(assignment.id)) {
      const submission = submissions?.find((sub: any) => sub.assignment.id === assignment.id);
      if (submission?.grade !== null) return 'graded';
      return 'submitted';
    }
    return 'pending';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'graded':
        return <Badge className="bg-green-100 text-green-800">Graded</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold text-gray-900">Assignment Tracker</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Student
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{userInitials}</span>
                </div>
                <span className="text-gray-700 font-medium hidden sm:block">
                  {user?.firstName} {user?.lastName}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h2>
          <p className="text-gray-600">View and submit your assignments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.activeAssignments || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.completedAssignments || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Pending Grading</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.pendingGrading || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Assignments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {assignments && assignments.length > 0 ? (
                  <div className="space-y-6">
                    {assignments.map((assignment: any) => {
                      const status = getAssignmentStatus(assignment);
                      const submission = submissions?.find((sub: any) => sub.assignment.id === assignment.id);
                      
                      return (
                        <div
                          key={assignment.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                            <div className="flex-1">
                              <div className="flex items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-900 mr-3">
                                  {assignment.title}
                                </h3>
                                {getStatusBadge(status)}
                              </div>
                              
                              <p className="text-gray-600 mb-4">
                                {assignment.description}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-red-500" />
                                  Due: <span className="font-medium ml-1">
                                    {format(new Date(assignment.dueDate), 'PPP')}
                                  </span>
                                </span>
                                <span className="flex items-center">
                                  <Star className="h-4 w-4 mr-2 text-amber-500" />
                                  {assignment.maxPoints} points
                                </span>
                                {submission?.grade && (
                                  <span className="flex items-center text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Grade: {submission.grade}/{assignment.maxPoints}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-4 lg:mt-0 lg:ml-6">
                              {status === 'pending' ? (
                                <Button onClick={() => handleSubmit(assignment)}>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Submit Assignment
                                </Button>
                              ) : (
                                <Button variant="outline">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Submission
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No assignments available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {assignments?.filter((assignment: any) => getAssignmentStatus(assignment) === 'pending').map((assignment: any) => (
                    <div
                      key={assignment.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 mr-3">
                              {assignment.title}
                            </h3>
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-4">
                            {assignment.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-red-500" />
                              Due: <span className="font-medium ml-1">
                                {format(new Date(assignment.dueDate), 'PPP')}
                              </span>
                            </span>
                            <span className="flex items-center">
                              <Star className="h-4 w-4 mr-2 text-amber-500" />
                              {assignment.maxPoints} points
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 lg:mt-0 lg:ml-6">
                          <Button onClick={() => handleSubmit(assignment)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Submit Assignment
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No pending assignments</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submitted">
            <Card>
              <CardHeader>
                <CardTitle>Submitted Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {submissions?.filter((sub: any) => sub.grade === null).map((submission: any) => (
                    <div
                      key={submission.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 mr-3">
                              {submission.assignment.title}
                            </h3>
                            <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-4">
                            {submission.assignment.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Due: {format(new Date(submission.assignment.dueDate), 'PPP')}
                            </span>
                            <span className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              Submitted on {format(new Date(submission.submittedAt), 'PPP')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 lg:mt-0 lg:ml-6">
                          <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Submission
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No submitted assignments</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graded">
            <Card>
              <CardHeader>
                <CardTitle>Graded Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {submissions?.filter((sub: any) => sub.grade !== null).map((submission: any) => (
                    <div
                      key={submission.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 mr-3">
                              {submission.assignment.title}
                            </h3>
                            <Badge className="bg-green-100 text-green-800">Graded</Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-4">
                            {submission.assignment.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Due: {format(new Date(submission.assignment.dueDate), 'PPP')}
                            </span>
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Grade: {submission.grade}/{submission.assignment.maxPoints}
                            </span>
                            {submission.feedback && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                Has feedback
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 lg:mt-0 lg:ml-6">
                          <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Submission
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No graded assignments yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Submit Assignment Form Modal */}
      {showSubmitForm && selectedAssignment && (
        <SubmitAssignmentForm
          assignment={selectedAssignment}
          isOpen={showSubmitForm}
          onClose={() => {
            setShowSubmitForm(false);
            setSelectedAssignment(null);
          }}
          onSuccess={() => {
            setShowSubmitForm(false);
            setSelectedAssignment(null);
            refetchSubmissions();
          }}
        />
      )}
    </div>
  );
}
