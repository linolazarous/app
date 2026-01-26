import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourses } from '@/lib/api';
import { toast } from 'sonner';
import { Search, BookOpen, Clock, Award } from 'lucide-react';

const CourseCatalog = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || course.course_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-black text-white" data-testid="course-catalog">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3" onClick={() => navigate('/')} className="cursor-pointer">
            <img 
              src="https://customer-assets.emergentagent.com/job_8ff41f05-92b1-4c8a-95d9-187ebdd2d158/artifacts/umfriwpy_logo.webp" 
              alt="Right Tech Centre" 
              className="h-10 w-10"
              data-testid="catalog-logo"
            />
            <span className="text-xl font-bold gradient-text">Course Catalog</span>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="border-gray-700" data-testid="back-home-btn">
            Back to Home
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="catalog-title">
            Explore <span className="gradient-text">Our Courses</span>
          </h1>
          <p className="text-xl text-gray-400" data-testid="catalog-subtitle">
            Choose from diplomas, bachelor programs, and certifications
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white pl-10"
              data-testid="search-input"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white rounded-md px-4 py-2"
            data-testid="filter-select"
          >
            <option value="all">All Programs</option>
            <option value="diploma">Diplomas</option>
            <option value="bachelor">Bachelor Degrees</option>
            <option value="certification">Certifications</option>
          </select>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading courses...</p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card 
                key={course.id} 
                className="bg-gray-900 border-gray-800 hover-lift cursor-pointer"
                onClick={() => navigate(`/course/${course.id}`)}
                data-testid={`course-${course.id}`}
              >
                {course.thumbnail_url && (
                  <div className="h-48 bg-gray-800 rounded-t-lg overflow-hidden">
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-yellow-400/20 text-yellow-400 capitalize font-semibold">
                      {course.course_type}
                    </span>
                    <span className="text-sm text-gray-400">{course.duration_months} months</span>
                  </div>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center text-gray-400">
                      <Award className="h-4 w-4 mr-1" />
                      {course.credit_hours} Credits
                    </div>
                    <div className="flex items-center text-gray-400">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {course.modules_count} Modules
                    </div>
                  </div>
                  <Button className="w-full btn-primary" data-testid={`view-course-${course.id}`}>
                    View Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;