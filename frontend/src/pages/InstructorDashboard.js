import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white" data-testid="instructor-dashboard">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_8ff41f05-92b1-4c8a-95d9-187ebdd2d158/artifacts/umfriwpy_logo.webp" 
              alt="Right Tech Centre" 
              className="h-10 w-10"
            />
            <span className="text-xl font-bold gradient-text">Instructor Panel</span>
          </div>
          <Button onClick={() => { logout(); navigate('/'); }} variant="ghost" className="text-red-400">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Instructor Dashboard</CardTitle>
            <CardDescription>Manage your courses and track student progress</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-gray-400 mb-4">Instructor features coming soon!</p>
            <p className="text-sm text-gray-500">Course management, grading, and analytics tools</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorDashboard;