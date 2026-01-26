import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteCourse } from '@/lib/api';
import { toast } from 'sonner';
import { Edit, Trash2, Eye, BookOpen } from 'lucide-react';

const CourseManagement = ({ courses, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || course.course_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await deleteCourse(courseId);
      toast.success('Course deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  return (
    <div className="space-y-6" data-testid="course-management">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Manage Courses</CardTitle>
          <CardDescription>View, edit, and manage all courses on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              data-testid="search-courses-input"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2"
              data-testid="filter-type-select"
            >
              <option value="all">All Types</option>
              <option value="diploma">Diploma</option>
              <option value="bachelor">Bachelor</option>
              <option value="certification">Certification</option>
            </select>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No courses found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="bg-gray-800 border-gray-700 hover-lift" data-testid={`course-card-${course.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-400/20 text-yellow-400 capitalize">
                        {course.course_type}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-400">{course.description.substring(0, 100)}...</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{course.credit_hours} Credit Hours</span>
                        <span className="text-gray-500">{course.modules_count} Modules</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1 border-gray-600" data-testid={`view-btn-${course.id}`}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600" data-testid={`edit-btn-${course.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(course.id)}
                        data-testid={`delete-btn-${course.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManagement;