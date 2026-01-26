import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

const CertificateManagement = () => {
  return (
    <Card className="bg-gray-900 border-gray-800" data-testid="certificate-management">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 text-yellow-400 mr-2" />
          Certificate Management
        </CardTitle>
        <CardDescription>Generate and manage course completion certificates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Certificate management features coming soon!</p>
          <p className="text-sm text-gray-500">Issue, verify, and manage certificates automatically</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateManagement;