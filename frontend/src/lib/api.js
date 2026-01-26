import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Course APIs
export const getCourses = async () => {
  const response = await axios.get(`${API_URL}/courses`);
  return response.data;
};

export const getCourse = async (courseId) => {
  const response = await axios.get(`${API_URL}/courses/${courseId}`);
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await axios.post(`${API_URL}/courses`, courseData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateCourse = async (courseId, courseData) => {
  const response = await axios.put(`${API_URL}/courses/${courseId}`, courseData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const deleteCourse = async (courseId) => {
  const response = await axios.delete(`${API_URL}/courses/${courseId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Module APIs
export const getCourseModules = async (courseId) => {
  const response = await axios.get(`${API_URL}/courses/${courseId}/modules`);
  return response.data;
};

export const createModule = async (moduleData) => {
  const response = await axios.post(`${API_URL}/modules`, moduleData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getModule = async (moduleId) => {
  const response = await axios.get(`${API_URL}/modules/${moduleId}`);
  return response.data;
};

// Lesson APIs
export const getModuleLessons = async (moduleId) => {
  const response = await axios.get(`${API_URL}/modules/${moduleId}/lessons`);
  return response.data;
};

export const createLesson = async (lessonData) => {
  const response = await axios.post(`${API_URL}/lessons`, lessonData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getLesson = async (lessonId) => {
  const response = await axios.get(`${API_URL}/lessons/${lessonId}`);
  return response.data;
};

// Assessment APIs
export const getModuleAssessments = async (moduleId) => {
  const response = await axios.get(`${API_URL}/modules/${moduleId}/assessments`);
  return response.data;
};

export const createAssessment = async (assessmentData) => {
  const response = await axios.post(`${API_URL}/assessments`, assessmentData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Enrollment APIs
export const enrollCourse = async (courseId) => {
  const response = await axios.post(`${API_URL}/enrollments`, { course_id: courseId }, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getMyEnrollments = async () => {
  const response = await axios.get(`${API_URL}/enrollments/my`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Progress APIs
export const updateProgress = async (progressData) => {
  const response = await axios.post(`${API_URL}/progress`, progressData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getLessonProgress = async (lessonId) => {
  const response = await axios.get(`${API_URL}/progress/lesson/${lessonId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Certificate APIs
export const getMyCertificates = async () => {
  const response = await axios.get(`${API_URL}/certificates/my`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const generateCertificate = async (courseId) => {
  const response = await axios.post(`${API_URL}/certificates/generate/${courseId}`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

// AI Tutor APIs
export const askAITutor = async (courseId, message, sessionId = null) => {
  const response = await axios.post(`${API_URL}/ai-tutor`, {
    course_id: courseId,
    message,
    session_id: sessionId
  }, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Video APIs
export const getVideoMetadata = async (vimeoId) => {
  const response = await axios.get(`${API_URL}/videos/${vimeoId}/metadata`);
  return response.data;
};

// Analytics APIs
export const getDashboardAnalytics = async () => {
  const response = await axios.get(`${API_URL}/analytics/dashboard`, {
    headers: getAuthHeader()
  });
  return response.data;
};