import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const AnalyticsView = ({ analytics }) => {
  return (
    <Card className="bg-gray-900 border-gray-800" data-testid="analytics-view">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 text-yellow-400 mr-2" />
          Analytics & Reports
        </CardTitle>
        <CardDescription>Track platform performance and student engagement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Advanced analytics coming soon!</p>
          <p className="text-sm text-gray-500">Track enrollments, completions, and revenue metrics</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsView;