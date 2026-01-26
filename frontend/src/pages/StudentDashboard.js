import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { getMyEnrollments, getMyCertificates, getCourse } from '@/lib/api';
import { toast } from 'sonner';
import { BookOpen, Award, LogOut, Play, Download } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [enrollmentsData, certificatesData] = await Promise.all([
        getMyEnrollments(),
        getMyCertificates()
      ]);
      
      setEnrollments(enrollmentsData);
      setCertificates(certificatesData);

      // Load course details for each enrollment
      const coursesData = await Promise.all(
        enrollmentsData.map(enrollment => getCourse(enrollment.course_id))
      );
      setEnrolledCourses(coursesData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-black text-white" data-testid="student-dashboard">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_8ff41f05-92b1-4c8a-95d9-187ebdd2d158/artifacts/umfriwpy_logo.webp" 
              alt="Right Tech Centre" 
              className="h-10 w-10"
              data-testid="dashboard-logo"
            />
            <span className="text-xl font-bold gradient-text">My Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => navigate('/catalog')} variant="outline" className="border-gray-700" data-testid="browse-courses-btn">
              Browse Courses
            </Button>
            <Button onClick={handleLogout} variant="ghost" className="text-red-400 hover:text-red-300" data-testid="logout-btn">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2" data-testid="welcome-title">
            Welcome back, <span className="gradient-text">{user?.full_name}</span>
          </h1>
          <p className="text-gray-400" data-testid="welcome-subtitle">Continue your learning journey</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your courses...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Enrolled Courses */}
            <section data-testid="enrolled-courses-section">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <BookOpen className="h-6 w-6 text-yellow-400 mr-2" />
                My Courses
              </h2>
              
              {enrollments.length === 0 ? (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                    <p className="text-gray-400 mb-6">Start learning by enrolling in a course</p>
                    <Button onClick={() => navigate('/catalog')} className="btn-primary" data-testid="explore-catalog-btn">
                      Explore Course Catalog
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrollments.map((enrollment, index) => {
                    const course = enrolledCourses[index];
                    if (!course) return null;
                    
                    return (
                      <Card key={enrollment.id} className="bg-gray-900 border-gray-800 hover-lift" data-testid={`course-card-${enrollment.id}`}>
                        <CardHeader>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription className="capitalize">{course.course_type}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Progress</span>
                                <span className="font-semibold">{Math.round(enrollment.progress_percentage)}%</span>
                              </div>
                              <Progress value={enrollment.progress_percentage} className="h-2" />
                            </div>
                            <Button 
                              onClick={() => navigate(`/learn/${enrollment.id}`)} 
                              className="w-full btn-primary"
                              data-testid={`resume-btn-${enrollment.id}`}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {enrollment.progress_percentage > 0 ? 'Resume Learning' : 'Start Course'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Certificates */}
            <section data-testid="certificates-section">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Award className="h-6 w-6 text-green-400 mr-2" />
                My Certificates
              </h2>
              
              {certificates.length === 0 ? (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="py-12 text-center">
                    <Award className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
                    <p className="text-gray-400">Complete courses to earn certificates</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((certificate) => (
                    <Card key={certificate.id} className="bg-gray-900 border-gray-800 hover-lift" data-testid={`certificate-card-${certificate.id}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">Certificate</CardTitle>
                        <CardDescription>
                          Issued on {new Date(certificate.issued_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full btn-primary" data-testid={`download-cert-${certificate.id}`}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Certificate
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;