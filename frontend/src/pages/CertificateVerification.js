import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, CheckCircle2 } from 'lucide-react';

const CertificateVerification = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white" data-testid="certificate-verification">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="https://customer-assets.emergentagent.com/job_8ff41f05-92b1-4c8a-95d9-187ebdd2d158/artifacts/umfriwpy_logo.webp" 
              alt="Right Tech Centre" 
              className="h-10 w-10"
              data-testid="verify-logo"
            />
            <span className="text-xl font-bold gradient-text">Certificate Verification</span>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="border-gray-700" data-testid="back-home-btn">
            Back to Home
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900 border-gray-800" data-testid="verification-card">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Award className="h-16 w-16 text-yellow-400" />
              </div>
              <CardTitle className="text-2xl text-center">Certificate Verification</CardTitle>
              <CardDescription className="text-center">
                Certificate ID: {certificateId}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">
                Certificate verification system coming soon!
              </p>
              <p className="text-sm text-gray-500">
                You will be able to verify the authenticity of certificates issued by Right Tech Centre
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;