import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Users, Sparkles, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVideoLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'instructor') navigate('/instructor');
      else navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_8ff41f05-92b1-4c8a-95d9-187ebdd2d158/artifacts/umfriwpy_logo.webp" 
                alt="Right Tech Centre" 
                className="h-12 w-12"
                data-testid="nav-logo"
              />
              <span className="text-2xl font-bold gradient-text" data-testid="nav-brand-text">Right Tech Centre</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => navigate('/')} className="text-gray-300 hover:text-white transition-colors" data-testid="nav-home-link">Home</button>
              <button onClick={() => navigate('/about')} className="text-gray-300 hover:text-white transition-colors" data-testid="nav-about-link">About</button>
              <button onClick={() => navigate('/programs')} className="text-gray-300 hover:text-white transition-colors" data-testid="nav-programs-link">Programs</button>
              <button onClick={() => navigate('/catalog')} className="text-gray-300 hover:text-white transition-colors" data-testid="nav-catalog-link">Catalog</button>
              {user ? (
                <Button onClick={handleGetStarted} className="btn-primary" data-testid="nav-dashboard-btn">
                  Dashboard
                </Button>
              ) : (
                <Button onClick={() => navigate('/auth')} className="btn-primary" data-testid="nav-login-btn">
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="video-background"
          style={{ opacity: videoLoaded ? 0.3 : 0 }}
          data-testid="hero-video"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay"></div>
        
        <div className="relative z-10 container mx-auto px-6 text-center animate-fadeInUp">
          <img 
            src="https://customer-assets.emergentagent.com/job_8ff41f05-92b1-4c8a-95d9-187ebdd2d158/artifacts/umfriwpy_logo.webp" 
            alt="Right Tech Centre" 
            className="h-24 w-24 mx-auto mb-6 animate-float"
            data-testid="hero-logo"
          />
          <h1 className="text-5xl md:text-7xl font-bold mb-6" data-testid="hero-title">
            <span className="gradient-text">AI-Powered</span> Tech Education
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto" data-testid="hero-tagline">
            Master cutting-edge technologies with world-class certification programs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/programs')} className="btn-primary text-lg px-8 py-6" data-testid="hero-explore-btn">
              Explore Programs <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button onClick={handleGetStarted} className="btn-secondary text-lg px-8 py-6" data-testid="hero-start-btn">
              Get Started <Play className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-black to-gray-900" data-testid="features-section">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text" data-testid="features-title">
            Why Choose Right Tech Centre?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-effect p-8 rounded-2xl hover-lift" data-testid="feature-ai">
              <Sparkles className="h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold mb-3">AI-Powered Learning</h3>
              <p className="text-gray-400">Personal AI tutor for every course, providing instant help and explanations</p>
            </div>
            <div className="glass-effect p-8 rounded-2xl hover-lift" data-testid="feature-courses">
              <BookOpen className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Expert Curriculum</h3>
              <p className="text-gray-400">Industry-aligned courses with structured credit hour system</p>
            </div>
            <div className="glass-effect p-8 rounded-2xl hover-lift" data-testid="feature-certificates">
              <Award className="h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Global Certification</h3>
              <p className="text-gray-400">Earn recognized diplomas and bachelor degrees</p>
            </div>
            <div className="glass-effect p-8 rounded-2xl hover-lift" data-testid="feature-community">
              <Users className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Expert Instructors</h3>
              <p className="text-gray-400">Learn from industry professionals with real-world experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black" data-testid="cta-section">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="cta-title">
            Ready to Start Your <span className="gradient-text">Tech Journey</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto" data-testid="cta-description">
            Join thousands of students transforming their careers with our AI-powered learning platform
          </p>
          <Button onClick={handleGetStarted} className="btn-primary text-lg px-12 py-6" data-testid="cta-button">
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12" data-testid="footer">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img 
                src="https://customer-assets.emergentagent.com/job_8ff41f05-92b1-4c8a-95d9-187ebdd2d158/artifacts/umfriwpy_logo.webp" 
                alt="Right Tech Centre" 
                className="h-10 w-10"
                data-testid="footer-logo"
              />
              <span className="text-xl font-bold gradient-text">Right Tech Centre</span>
            </div>
            <p className="text-gray-400" data-testid="footer-copyright">
              © {new Date().getFullYear()} Right Tech Centre. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;