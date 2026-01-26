import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createCourse, createModule, createLesson, createAssessment } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';

const CourseCreationWizard = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState(null);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    course_type: 'diploma',
    credit_hours: 60,
    modules_count: 15,
    duration_months: 12,
    thumbnail_url: ''
  });

  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState({
    title: '',
    description: '',
    credit_hours: 4,
    lessons: [],
    quiz: { questions: [] }
  });

  const handleCourseTypeChange = (type) => {
    const config = {
      diploma: { credit_hours: 60, modules_count: 15, duration_months: 12 },
      bachelor: { credit_hours: 120, modules_count: 30, duration_months: 24 },
      certification: { credit_hours: 20, modules_count: 5, duration_months: 6 }
    };
    setCourseData({ ...courseData, course_type: type, ...config[type] });
  };

  const handleCreateCourse = async () => {
    try {
      const course = await createCourse(courseData);
      setCourseId(course.id);
      toast.success('Course created successfully!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create course');
    }
  };

  const handleAddModule = async () => {
    if (!currentModule.title) {
      toast.error('Module title is required');
      return;
    }

    try {
      const module = await createModule({
        course_id: courseId,
        title: currentModule.title,
        description: currentModule.description,
        credit_hours: currentModule.credit_hours,
        module_order: modules.length + 1
      });

      // Create lessons for the module
      for (let i = 0; i < currentModule.lessons.length; i++) {
        await createLesson({
          module_id: module.id,
          title: currentModule.lessons[i].title,
          description: currentModule.lessons[i].description,
          vimeo_id: currentModule.lessons[i].vimeo_id,
          duration_minutes: currentModule.lessons[i].duration_minutes,
          lesson_order: i + 1,
          content: currentModule.lessons[i].content
        });
      }

      // Create quiz if questions exist
      if (currentModule.quiz.questions.length > 0) {
        await createAssessment({
          module_id: module.id,
          title: `${currentModule.title} - Quiz`,
          assessment_type: 'quiz',
          questions: currentModule.quiz.questions,
          passing_score: 70
        });
      }

      setModules([...modules, { ...currentModule, id: module.id }]);
      setCurrentModule({
        title: '',
        description: '',
        credit_hours: 4,
        lessons: [],
        quiz: { questions: [] }
      });
      toast.success('Module added successfully!');
    } catch (error) {
      toast.error('Failed to add module');
    }
  };

  const handleFinish = () => {
    toast.success('Course creation completed!');
    if (onSuccess) onSuccess();
    // Reset wizard
    setStep(1);
    setCourseId(null);
    setCourseData({
      title: '',
      description: '',
      course_type: 'diploma',
      credit_hours: 60,
      modules_count: 15,
      duration_months: 12,
      thumbnail_url: ''
    });
    setModules([]);
  };

  return (
    <div className="space-y-6" data-testid="course-creation-wizard">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-yellow-400' : 'text-gray-600'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-yellow-400 text-black' : 'bg-gray-800'}`}>
            {step > 1 ? <Check className="h-5 w-5" /> : '1'}
          </div>
          <span className="ml-2 font-semibold">Course Details</span>
        </div>
        <div className="flex-1 h-0.5 mx-4 bg-gray-800"></div>
        <div className={`flex items-center ${step >= 2 ? 'text-yellow-400' : 'text-gray-600'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-yellow-400 text-black' : 'bg-gray-800'}`}>
            {step > 2 ? <Check className="h-5 w-5" /> : '2'}
          </div>
          <span className="ml-2 font-semibold">Build Modules</span>
        </div>
        <div className="flex-1 h-0.5 mx-4 bg-gray-800"></div>
        <div className={`flex items-center ${step >= 3 ? 'text-yellow-400' : 'text-gray-600'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-yellow-400 text-black' : 'bg-gray-800'}`}>
            '3'
          </div>
          <span className="ml-2 font-semibold">Review & Publish</span>
        </div>
      </div>

      {/* Step 1: Course Details */}
      {step === 1 && (
        <Card className="bg-gray-900 border-gray-800" data-testid="step-course-details">
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>Define the basic information about your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Select Course Type</Label>
              <RadioGroup value={courseData.course_type} onValueChange={handleCourseTypeChange}>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${courseData.course_type === 'diploma' ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-700 hover:border-gray-600'}`}
                       onClick={() => handleCourseTypeChange('diploma')}>
                    <RadioGroupItem value="diploma" id="diploma" className="sr-only" />
                    <Label htmlFor="diploma" className="cursor-pointer">
                      <h4 className="font-bold text-lg mb-2">Diploma</h4>
                      <p className="text-sm text-gray-400">15 modules × 4 credit hours</p>
                      <p className="text-sm text-gray-400">60 Credit Hours Total</p>
                      <p className="text-sm text-gray-400">12-18 months duration</p>
                    </Label>
                  </div>

                  <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${courseData.course_type === 'bachelor' ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-700 hover:border-gray-600'}`}
                       onClick={() => handleCourseTypeChange('bachelor')}>
                    <RadioGroupItem value="bachelor" id="bachelor" className="sr-only" />
                    <Label htmlFor="bachelor" className="cursor-pointer">
                      <h4 className="font-bold text-lg mb-2">Bachelor/Degree</h4>
                      <p className="text-sm text-gray-400">30 modules × 4 credit hours</p>
                      <p className="text-sm text-gray-400">120 Credit Hours Total</p>
                      <p className="text-sm text-gray-400">24 months duration</p>
                    </Label>
                  </div>

                  <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${courseData.course_type === 'certification' ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-700 hover:border-gray-600'}`}
                       onClick={() => handleCourseTypeChange('certification')}>
                    <RadioGroupItem value="certification" id="certification" className="sr-only" />
                    <Label htmlFor="certification" className="cursor-pointer">
                      <h4 className="font-bold text-lg mb-2">Certification</h4>
                      <p className="text-sm text-gray-400">5 modules × 4 credit hours</p>
                      <p className="text-sm text-gray-400">20 Credit Hours (Varies)</p>
                      <p className="text-sm text-gray-400">6 months duration</p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="course-title">Course Title</Label>
              <Input
                id="course-title"
                placeholder="e.g., Diploma in Web Development"
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
                data-testid="course-title-input"
              />
            </div>

            <div>
              <Label htmlFor="course-description">Course Description</Label>
              <Textarea
                id="course-description"
                placeholder="Describe what students will learn in this course..."
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white min-h-32"
                data-testid="course-description-input"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="credit-hours">Credit Hours</Label>
                <Input
                  id="credit-hours"
                  type="number"
                  value={courseData.credit_hours}
                  onChange={(e) => setCourseData({ ...courseData, credit_hours: parseInt(e.target.value) })}
                  className="bg-gray-800 border-gray-700 text-white"
                  data-testid="credit-hours-input"
                />
              </div>
              <div>
                <Label htmlFor="modules-count">Number of Modules</Label>
                <Input
                  id="modules-count"
                  type="number"
                  value={courseData.modules_count}
                  onChange={(e) => setCourseData({ ...courseData, modules_count: parseInt(e.target.value) })}
                  className="bg-gray-800 border-gray-700 text-white"
                  data-testid="modules-count-input"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (months)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={courseData.duration_months}
                  onChange={(e) => setCourseData({ ...courseData, duration_months: parseInt(e.target.value) })}
                  className="bg-gray-800 border-gray-700 text-white"
                  data-testid="duration-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="thumbnail-url">Thumbnail URL (Optional)</Label>
              <Input
                id="thumbnail-url"
                placeholder="https://example.com/image.jpg"
                value={courseData.thumbnail_url}
                onChange={(e) => setCourseData({ ...courseData, thumbnail_url: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
                data-testid="thumbnail-url-input"
              />
            </div>

            <Button 
              onClick={handleCreateCourse} 
              className="btn-primary w-full"
              disabled={!courseData.title || !courseData.description}
              data-testid="create-course-btn"
            >
              Create Course & Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Module Builder */}
      {step === 2 && (
        <div className="space-y-6" data-testid="step-module-builder">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Module Builder</CardTitle>
              <CardDescription>
                Build modules for your course. Each module = 4 credit hours.
                Progress: {modules.length} / {courseData.modules_count} modules created
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="module-title">Module Title</Label>
                <Input
                  id="module-title"
                  placeholder="e.g., Module 1: HTML & CSS Fundamentals"
                  value={currentModule.title}
                  onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  data-testid="module-title-input"
                />
              </div>

              <div>
                <Label htmlFor="module-description">Module Description</Label>
                <Textarea
                  id="module-description"
                  placeholder="What will students learn in this module?"
                  value={currentModule.description}
                  onChange={(e) => setCurrentModule({ ...currentModule, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  data-testid="module-description-input"
                />
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h4 className="font-semibold mb-4">Lessons (Optional - Can be added later)</h4>
                <p className="text-sm text-gray-400 mb-4">You can add lessons now or later from the course management panel</p>
                {currentModule.lessons.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {currentModule.lessons.map((lesson, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <span>{lesson.title}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newLessons = currentModule.lessons.filter((_, i) => i !== index);
                            setCurrentModule({ ...currentModule, lessons: newLessons });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={handleAddModule} 
                  className="btn-primary"
                  disabled={!currentModule.title}
                  data-testid="add-module-btn"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Module
                </Button>
                {modules.length >= courseData.modules_count && (
                  <Button 
                    onClick={() => setStep(3)} 
                    className="btn-primary"
                    data-testid="proceed-review-btn"
                  >
                    Proceed to Review <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {modules.length > 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Created Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {modules.map((module, index) => (
                    <div key={module.id} className="p-4 glass-effect rounded-lg">
                      <h4 className="font-semibold">Module {index + 1}: {module.title}</h4>
                      <p className="text-sm text-gray-400">{module.description}</p>
                      <p className="text-sm text-gray-500 mt-2">{module.credit_hours} Credit Hours</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 3: Review & Publish */}
      {step === 3 && (
        <Card className="bg-gray-900 border-gray-800" data-testid="step-review">
          <CardHeader>
            <CardTitle>Review & Publish</CardTitle>
            <CardDescription>Review your course before publishing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold gradient-text mb-2">{courseData.title}</h3>
                <p className="text-gray-400">{courseData.description}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 glass-effect rounded-lg">
                  <p className="text-sm text-gray-400">Course Type</p>
                  <p className="font-semibold capitalize">{courseData.course_type}</p>
                </div>
                <div className="p-4 glass-effect rounded-lg">
                  <p className="text-sm text-gray-400">Credit Hours</p>
                  <p className="font-semibold">{courseData.credit_hours}</p>
                </div>
                <div className="p-4 glass-effect rounded-lg">
                  <p className="text-sm text-gray-400">Modules</p>
                  <p className="font-semibold">{modules.length} created</p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h4 className="font-semibold mb-3">Modules</h4>
                <div className="space-y-2">
                  {modules.map((module, index) => (
                    <div key={module.id} className="p-3 bg-gray-800 rounded-lg">
                      <span className="font-medium">Module {index + 1}: {module.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={() => setStep(2)} variant="outline" className="border-gray-700" data-testid="back-btn">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Modules
              </Button>
              <Button onClick={handleFinish} className="btn-primary flex-1" data-testid="finish-btn">
                <Check className="mr-2 h-4 w-4" /> Finish & Publish Course
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseCreationWizard;