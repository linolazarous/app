import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Users, Globe, Sparkles } from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white" data-testid="about-page">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="https://customer-assets.emergentagent.com/job_8ff41f05-92b1-4c8a-95d9-187ebdd2d158/artifacts/umfriwpy_logo.webp" 
              alt="Right Tech Centre" 
              className="h-10 w-10"
              data-testid="about-logo"
            />
            <span className="text-xl font-bold gradient-text">Right Tech Centre</span>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="border-gray-700" data-testid="back-home-btn">
            Back to Home
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6" data-testid="about-title">
            About <span className="gradient-text">Right Tech Centre</span>
          </h1>
          <p className="text-xl text-gray-400 text-center mb-12" data-testid="about-tagline">
            AI-Powered Tech Education Platform
          </p>

          <div className="space-y-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <p className="text-gray-300 leading-relaxed mb-4">
                  Right Tech Centre is a cutting-edge learning management system designed to provide world-class
                  technology education powered by artificial intelligence. Our platform combines structured
                  curriculum with AI-driven personalized learning to help students master modern technologies.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We offer diploma programs, bachelor degrees, and professional certifications in various
                  technology domains, all designed with a credit hour system that ensures comprehensive learning
                  and industry recognition.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800 hover-lift">
                <CardHeader>
                  <Sparkles className="h-8 w-8 text-yellow-400 mb-2" />
                  <CardTitle>AI-Powered</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Every course includes a personal AI tutor to provide instant help, explanations, and guidance
                    throughout your learning journey.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 hover-lift">
                <CardHeader>
                  <Award className="h-8 w-8 text-green-400 mb-2" />
                  <CardTitle>Recognized Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Earn globally recognized diplomas, bachelor degrees, and professional certifications upon
                    course completion.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 hover-lift">
                <CardHeader>
                  <Users className="h-8 w-8 text-yellow-400 mb-2" />
                  <CardTitle>Expert Instructors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Learn from industry professionals with real-world experience in technology and software development.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 hover-lift">
                <CardHeader>
                  <Globe className="h-8 w-8 text-green-400 mb-2" />
                  <CardTitle>Flexible Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Self-paced programs that fit your schedule, allowing you to learn at your own pace from anywhere.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;