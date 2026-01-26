import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getCourse, getCourseModules, enrollCourse } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { BookOpen, Clock, Award, Users, ArrowLeft, Play } from 'lucide-react';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const [courseData, modulesData] = await Promise.all([
        getCourse(courseId),
        getCourseModules(courseId)
      ]);
      setCourse(courseData);
      setModules(modulesData);
    } catch (error) {
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setEnrolling(true);
    try {
      await enrollCourse(courseId);
      toast.success('Successfully enrolled in course!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course not found</h2>
          <Button onClick={() => navigate('/catalog')} className="btn-primary">
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" data-testid="course-detail">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button onClick={() => navigate('/catalog')} variant="ghost" className="text-gray-400" data-testid="back-btn">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Catalog
          </Button>
          <div className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_8ff41f05-92b1-4c8a-95d9-187ebdd2d158/artifacts/umfriwpy_logo.webp" 
              alt="Right Tech Centre" 
              className="h-10 w-10"
            />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Course Header */}
        <div className="mb-12">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-sm rounded-full bg-yellow-400/20 text-yellow-400 capitalize font-semibold" data-testid="course-type">
              {course.course_type}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="course-title">{course.title}</h1>
          <p className="text-xl text-gray-400 mb-6" data-testid="course-description">{course.description}</p>
          
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center text-gray-400">
              <Award className="h-5 w-5 mr-2 text-yellow-400" />
              <span>{course.credit_hours} Credit Hours</span>
            </div>
            <div className="flex items-center text-gray-400">
              <BookOpen className="h-5 w-5 mr-2 text-green-400" />
              <span>{course.modules_count} Modules</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Clock className="h-5 w-5 mr-2 text-yellow-400" />
              <span>{course.duration_months} Months</span>
            </div>
          </div>

          <Button 
            onClick={handleEnroll} 
            className="btn-primary text-lg px-8 py-6"
            disabled={enrolling}
            data-testid="enroll-btn"
          >
            <Play className="h-5 w-5 mr-2" />
            {enrolling ? 'Enrolling...' : 'Enroll Now'}
          </Button>
        </div>

        {/* Course Modules */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800" data-testid="modules-section">
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>Explore the modules and lessons in this course</CardDescription>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Course curriculum is being prepared...</p>
                ) : (
                  <Accordion type="single" collapsible className="space-y-2">
                    {modules.map((module, index) => (
                      <AccordionItem 
                        key={module.id} 
                        value={`module-${index}`}
                        className="border border-gray-800 rounded-lg px-4"
                        data-testid={`module-${index}`}
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-semibold">Module {index + 1}: {module.title}</span>
                            <span className="text-sm text-gray-400">{module.credit_hours} Credits</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-400 mt-2">{module.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800" data-testid="certificate-info">
              <CardHeader>
                <CardTitle className="text-lg">Certificate</CardTitle>
              </CardHeader>
              <CardContent>
                <Award className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-sm text-gray-400 text-center">
                  Earn a verified certificate upon successful completion of this {course.course_type}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800" data-testid="ai-tutor-info">
              <CardHeader>
                <CardTitle className="text-lg">AI-Powered Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400/20 mb-4">
                    <Users className="h-6 w-6 text-yellow-400" />
                  </div>
                  <p className="text-sm text-gray-400">
                    Get instant help from your personal AI tutor throughout the course
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;