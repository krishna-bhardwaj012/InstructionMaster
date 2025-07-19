import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { getAuthHeaders } from "@/lib/authUtils";
import { 
  GraduationCap, 
  Plus, 
  Bell, 
  LogOut, 
  FileText, 
  Users, 
  Clock, 
  Calendar,
  Star,
  Eye,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import CreateAssignmentForm from "@/components/create-assignment-form";
import ViewSubmissions from "@/components/view-submissions";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewSubmissionsId, setViewSubmissionsId] = useState<number | null>(null);

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

  const { data: assignments, isLoading, refetch } = useQuery({
    queryKey: ["/api/assignments"],
    queryFn: async () => {
      const response = await fetch('/api/assignments', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch assignments');
      return response.json();
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : '';

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
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Teacher
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h2>
            <p className="text-gray-600">Manage assignments and view student submissions</p>
          </div>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
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
                  <p className="text-sm text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalAssignments || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalSubmissions || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.pendingReviews || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments && assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {assignment.title}
                        </h4>
                        <p className="text-gray-600 mb-3">
                          {assignment.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Due: {format(new Date(assignment.dueDate), 'PPP')}
                          </span>
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-2 text-amber-500" />
                            {assignment.maxPoints} points
                          </span>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 flex space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewSubmissionsId(assignment.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Submissions
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No assignments created yet</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Assignment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Assignment Form Modal */}
      {showCreateForm && (
        <CreateAssignmentForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            refetch();
          }}
        />
      )}

      {/* View Submissions Modal */}
      {viewSubmissionsId && (
        <ViewSubmissions
          assignmentId={viewSubmissionsId}
          isOpen={!!viewSubmissionsId}
          onClose={() => setViewSubmissionsId(null)}
        />
      )}
    </div>
  );
}
