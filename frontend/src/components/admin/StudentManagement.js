import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const StudentManagement = () => {
  return (
    <Card className="bg-gray-900 border-gray-800" data-testid="student-management">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 text-green-400 mr-2" />
          Student Management
        </CardTitle>
        <CardDescription>View and manage student enrollments and progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Student management features coming soon!</p>
          <p className="text-sm text-gray-500">View student progress, manage enrollments, and track completion</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentManagement;