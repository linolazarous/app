import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Award, Clock, ArrowRight } from 'lucide-react';

const ProgramsPage = () => {
  const navigate = useNavigate();

  const programs = [
    {
      type: 'diploma',
      title: 'Diploma Programs',
      description: 'Comprehensive 60 credit hour programs designed to build foundational skills',
      duration: '12-18 months',
      modules: '15 modules',
      credits: '60 credit hours',
      features: [
        'Self-paced learning',
        'AI tutor support',
        'Hands-on projects',
        'Industry-recognized certificate'
      ]
    },
    {
      type: 'bachelor',
      title: 'Bachelor Degrees',
      description: 'Advanced 120 credit hour programs for in-depth mastery of technology domains',
      duration: '24 months',
      modules: '30 modules',
      credits: '120 credit hours',
      features: [
        'Advanced curriculum',
        'Capstone project',
        'Career guidance',
        'Bachelor degree certificate'
      ]
    },
    {
      type: 'certification',
      title: 'Professional Certifications',
      description: 'Focused certification programs for specific skills and technologies',
      duration: '6 months',
      modules: '5 modules',
      credits: '20 credit hours',
      features: [
        'Skill-focused training',
        'Quick completion',
        'Industry certifications',
        'Portfolio projects'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white" data-testid="programs-page">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="https://customer-assets.emergentagent.com/job_8ff41f05-92b1-4c8a-95d9-187ebdd2d158/artifacts/umfriwpy_logo.webp" 
              alt="Right Tech Centre" 
              className="h-10 w-10"
              data-testid="programs-logo"
            />
            <span className="text-xl font-bold gradient-text">Our Programs</span>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="border-gray-700" data-testid="back-home-btn">
            Back to Home
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="programs-title">
            Choose Your <span className="gradient-text">Learning Path</span>
          </h1>
          <p className="text-xl text-gray-400" data-testid="programs-subtitle">
            Structured programs designed to match your goals and schedule
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {programs.map((program) => (
            <Card 
              key={program.type} 
              className="bg-gray-900 border-gray-800 hover-lift"
              data-testid={`program-${program.type}`}
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-yellow-400/20 flex items-center justify-center mb-4">
                  {program.type === 'diploma' && <BookOpen className="h-6 w-6 text-yellow-400" />}
                  {program.type === 'bachelor' && <Award className="h-6 w-6 text-green-400" />}
                  {program.type === 'certification' && <Clock className="h-6 w-6 text-yellow-400" />}
                </div>
                <CardTitle className="text-2xl">{program.title}</CardTitle>
                <CardDescription className="text-base">{program.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Duration</span>
                    <span className="font-semibold">{program.duration}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Modules</span>
                    <span className="font-semibold">{program.modules}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Credits</span>
                    <span className="font-semibold">{program.credits}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Includes:</h4>
                  <ul className="space-y-2">
                    {program.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-400">
                        <span className="text-green-400 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  onClick={() => navigate('/catalog')} 
                  className="w-full btn-primary"
                  data-testid={`explore-${program.type}-btn`}
                >
                  Explore Programs <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Credit Hour System</CardTitle>
            <CardDescription className="text-center">Understanding our structured learning approach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-3xl mx-auto space-y-4 text-gray-300">
              <p>
                Each module in our programs equals <span className="text-yellow-400 font-semibold">4 credit hours</span>,
                ensuring consistent and measurable progress through your learning journey.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span><strong>1 Credit Hour</strong> = Approximately 1 hour of instructional content plus assignments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span><strong>4 Credit Hour Module</strong> = Video lectures, quizzes, assignments, and hands-on practice</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span><strong>Self-Paced</strong> = Complete modules at your own schedule while maintaining quality standards</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgramsPage;