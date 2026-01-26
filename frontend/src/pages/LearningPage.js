import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const LearningPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white" data-testid="learning-page">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="container mx-auto">
          <Button onClick={() => navigate('/dashboard')} variant="ghost" className="text-gray-400" data-testid="back-dashboard-btn">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Learning Experience</CardTitle>
            <CardDescription>Interactive lessons with video, quizzes, and AI tutor</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-gray-400 mb-4">Learning interface coming soon!</p>
            <p className="text-sm text-gray-500">Video lectures, interactive quizzes, and AI-powered tutoring</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningPage;