import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Award, 
  BarChart3, 
  Sparkles,
  Plus,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { getDashboardAnalytics, getCourses } from '@/lib/api';
import CourseCreationWizard from '@/components/admin/CourseCreationWizard';
import CourseManagement from '@/components/admin/CourseManagement';
import StudentManagement from '@/components/admin/StudentManagement';
import CertificateManagement from '@/components/admin/CertificateManagement';
import AnalyticsView from '@/components/admin/AnalyticsView';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsData, coursesData] = await Promise.all([
        getDashboardAnalytics(),
        getCourses()
      ]);
      setAnalytics(analyticsData);
      setCourses(coursesData);
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'create-course', label: 'Create New Course', icon: Plus },
    { id: 'manage-courses', label: 'Manage Courses', icon: BookOpen },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'certificates', label: 'Certificate Generation', icon: Award },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Content Assistant', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex" data-testid="admin-dashboard">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-gray-900 border-r border-gray-800 fixed h-full z-40 overflow-y-auto`}
        data-testid="admin-sidebar"
      >
        {sidebarOpen && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <img 
                  src="https://customer-assets.emergentagent.com/job_8ff41f05-92b1-4c8a-95d9-187ebdd2d158/artifacts/umfriwpy_logo.webp" 
                  alt="Right Tech Centre" 
                  className="h-10 w-10"
                  data-testid="admin-logo"
                />
                <span className="font-bold gradient-text text-lg">Admin Panel</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSidebarOpen(false)}
                className="md:hidden"
                data-testid="close-sidebar-btn"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mb-6 p-4 glass-effect rounded-lg" data-testid="admin-user-info">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="font-semibold">{user?.full_name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-yellow-500 to-green-500 text-black font-semibold'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                    data-testid={`menu-${item.id}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-800">
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                data-testid="logout-btn"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-72' : 'ml-0'} transition-all duration-300`}>
        {/* Top Bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30" data-testid="admin-topbar">
          <div className="flex items-center space-x-4">
            {!sidebarOpen && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSidebarOpen(true)}
                data-testid="open-sidebar-btn"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-2xl font-bold gradient-text" data-testid="admin-page-title">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h1>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="border-gray-700" data-testid="view-site-btn">
            View Site
          </Button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-6" data-testid="dashboard-overview">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gray-900 border-gray-800" data-testid="stat-courses">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Total Courses</span>
                          <BookOpen className="h-5 w-5 text-yellow-400" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl font-bold gradient-text">{analytics?.total_courses || 0}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800" data-testid="stat-students">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Total Students</span>
                          <Users className="h-5 w-5 text-green-400" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl font-bold gradient-text">{analytics?.total_students || 0}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800" data-testid="stat-enrollments">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Enrollments</span>
                          <BarChart3 className="h-5 w-5 text-yellow-400" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl font-bold gradient-text">{analytics?.total_enrollments || 0}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800" data-testid="stat-certificates">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Certificates</span>
                          <Award className="h-5 w-5 text-green-400" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl font-bold gradient-text">{analytics?.total_certificates || 0}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gray-900 border-gray-800" data-testid="recent-courses">
                    <CardHeader>
                      <CardTitle>Recent Courses</CardTitle>
                      <CardDescription>Latest courses added to the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {courses.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No courses yet. Create your first course!</p>
                      ) : (
                        <div className="space-y-4">
                          {courses.slice(0, 5).map((course) => (
                            <div key={course.id} className="flex items-center justify-between p-4 glass-effect rounded-lg hover-lift">
                              <div>
                                <h4 className="font-semibold">{course.title}</h4>
                                <p className="text-sm text-gray-400">{course.course_type} • {course.credit_hours} Credit Hours</p>
                              </div>
                              <Button size="sm" variant="outline" className="border-gray-700">
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'create-course' && (
                <CourseCreationWizard onSuccess={loadData} />
              )}

              {activeTab === 'manage-courses' && (
                <CourseManagement courses={courses} onUpdate={loadData} />
              )}

              {activeTab === 'students' && (
                <StudentManagement />
              )}

              {activeTab === 'certificates' && (
                <CertificateManagement />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView analytics={analytics} />
              )}

              {activeTab === 'ai-assistant' && (
                <Card className="bg-gray-900 border-gray-800" data-testid="ai-assistant-panel">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
                      AI Content Assistant
                    </CardTitle>
                    <CardDescription>Generate course content, quizzes, and learning materials with AI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Sparkles className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
                      <p className="text-gray-400 mb-4">AI Assistant features coming soon!</p>
                      <p className="text-sm text-gray-500">Generate quizzes, create course outlines, and get content suggestions</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
