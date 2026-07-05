import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import {
  Sparkles, ArrowRight, Database, Terminal, Library, MessageSquareCode,
  Code, UserCheck, Lock, Mail, UserPlus, Shield, Info, PhoneCall, HelpCircle, ChevronRight
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const Landing: React.FC = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Auth Tabs & Forms state
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleAutofillDemo = () => {
    setEmail('student@codenova.ai');
    setPassword('password');
    setAuthError('');
    setAuthSuccess('');
    setActiveTab('signin');
    scrollToSection('home');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({ email, password });
      setAuthSuccess('Registration successful! Please sign in below.');
      setActiveTab('signin');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Email already registered or registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactSuccess(false);
    }, 3000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-brand-light dark:bg-[#0b0f19] text-content-primary-light dark:text-gray-100 flex flex-col font-sans transition-colors duration-200 scroll-smooth">
      {/* Decorative Blur Backdrops */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-ai/10 blur-[120px] pointer-events-none animate-pulse" />

      {/* Responsive Navigation Header Bar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#0b0f19]/70 backdrop-blur-md border-b border-border-light/40 dark:border-gray-800/40 transition-all duration-200">
        <div className="max-w-7xl w-full mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand Logo */}
          <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-ai flex items-center justify-center text-white font-extrabold text-lg shadow-md">
              C
            </div>
            <span className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-primary to-ai bg-clip-text text-transparent">
              CodeNova AI
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-content-secondary-light dark:text-gray-300">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-primary transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('about')} className="hover:text-primary transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-primary transition-colors">
              Contact
            </button>
          </nav>

          {/* Call to Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 text-[10px] font-bold py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
            >
              <Shield className="h-3.5 w-3.5" /> Admin Portal
            </Link>

            {isLoggedIn ? (
              <Link
                to="/dashboard"
                className="text-xs font-bold py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white shadow-glow-brand/10 transition-all duration-200 flex items-center gap-1"
              >
                Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setActiveTab('signin'); setAuthError(''); setAuthSuccess(''); scrollToSection('home'); }}
                  className="text-xs font-bold text-content-secondary-light dark:text-gray-300 hover:text-primary transition-colors px-3 py-1.5"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setActiveTab('signup'); setAuthError(''); setAuthSuccess(''); scrollToSection('home'); }}
                  className="text-xs font-bold py-2 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 py-8 space-y-24">
        
        {/* Section 1: HERO / HOME */}
        <section id="home" className="grid gap-12 lg:grid-cols-12 items-center pt-8">
          {/* Left Column: Hero Intro */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-primary/10 border border-primary/20 text-xs text-primary font-bold shadow-sm">
              <Sparkles className="h-3.5 w-3.5 animate-spin" /> Personalized AI-Powered Learning Hub
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Supercharge Your <br />
              <span className="bg-gradient-to-r from-primary via-indigo-400 to-ai bg-clip-text text-transparent">
                Coding Journey
              </span>{' '}
              with AI
            </h1>
            
            <p className="text-sm sm:text-base text-content-secondary-light dark:text-gray-400 max-w-xl leading-relaxed">
              CodeNova AI is an interactive tutoring workspace that provides custom practice problems, real database SQL queries execution, and AI-grounded codebase mentors.
            </p>

            {/* Platform Credential Autofill */}
            <Card className="max-w-md p-4 bg-primary/5 dark:bg-primary/5 border border-primary/20 shadow-glow-brand/5 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1 w-full">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">Pre-Seeded Demo Account</h4>
                  <p className="text-[11px] text-content-secondary-light dark:text-gray-400">
                    Want to test the platform instantly? Click the autofill button below to load the student workspace.
                  </p>
                  <button
                    onClick={handleAutofillDemo}
                    className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold py-1.5 px-3 rounded bg-primary text-white hover:bg-primary-hover transition-colors"
                  >
                    Autofill Demo Credentials
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Embedded Sign In / Sign Up Forms */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            {isLoggedIn ? (
              <Card className="p-8 text-center space-y-6 bg-surface-light dark:bg-[#121927] border-2 border-primary/20">
                <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-primary to-ai rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-border-light dark:border-gray-800">
                  C
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-content-primary-light dark:text-content-primary-dark">
                    Welcome Back Developer!
                  </h3>
                  <p className="text-xs text-content-secondary-light dark:text-gray-400">
                    You are already authenticated. Enter your personalized cockpit workspace dashboard below.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="primary"
                  className="w-full text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-glow-brand/20"
                >
                  Enter Workspace <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>
            ) : (
              <Card className="p-6 bg-surface-light dark:bg-[#121927] border border-border-light dark:border-gray-800 shadow-xl relative">
                {/* Tabs */}
                <div className="flex border-b border-border-light dark:border-gray-800 mb-6">
                  <button
                    onClick={() => { setActiveTab('signin'); setAuthError(''); setAuthSuccess(''); }}
                    className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
                      activeTab === 'signin'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-content-muted-light dark:text-gray-500 hover:text-content-secondary-light'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setActiveTab('signup'); setAuthError(''); setAuthSuccess(''); }}
                    className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
                      activeTab === 'signup'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-content-muted-light dark:text-gray-500 hover:text-content-secondary-light'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Form Banners */}
                {authError && (
                  <div className="mb-4 rounded-lg bg-danger/10 border border-danger/20 p-3 text-xs text-danger">
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="mb-4 rounded-lg bg-success/10 border border-success/20 p-3 text-xs text-success animate-bounce">
                    {authSuccess}
                  </div>
                )}

                {/* Forms */}
                {activeTab === 'signin' ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email..."
                          className="w-full text-xs pl-9 pr-3 py-2.5 bg-brand-light dark:bg-black/20 border border-border-light dark:border-gray-800 text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-content-muted-light dark:text-gray-500" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                          Password
                        </label>
                        <Link to="/forgot-password" className="text-[10px] font-semibold text-primary hover:underline">
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password..."
                          className="w-full text-xs pl-9 pr-3 py-2.5 bg-brand-light dark:bg-black/20 border border-border-light dark:border-gray-800 text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-content-muted-light dark:text-gray-500" />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      isLoading={isLoading}
                      variant="primary"
                      className="w-full text-xs py-2 flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="h-4 w-4" /> Sign In to Workspace
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email..."
                          className="w-full text-xs pl-9 pr-3 py-2.5 bg-brand-light dark:bg-black/20 border border-border-light dark:border-gray-800 text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-content-muted-light dark:text-gray-500" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 characters..."
                          className="w-full text-xs pl-9 pr-3 py-2.5 bg-brand-light dark:bg-black/20 border border-border-light dark:border-gray-800 text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-content-muted-light dark:text-gray-500" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password..."
                          className="w-full text-xs pl-9 pr-3 py-2.5 bg-brand-light dark:bg-black/20 border border-border-light dark:border-gray-800 text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-content-muted-light dark:text-gray-500" />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      isLoading={isLoading}
                      variant="primary"
                      className="w-full text-xs py-2 flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="h-4 w-4" /> Create Student Account
                    </Button>
                  </form>
                )}
              </Card>
            )}
          </div>
        </section>

        {/* Section 2: FEATURES */}
        <section id="features" className="space-y-10 text-center pt-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Our Tutoring Modules</h2>
            <p className="text-sm text-content-secondary-light dark:text-gray-400 max-w-xl mx-auto">
              Empowering students with smart learning systems, real-time executors, and persistent AI mentors.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl w-full text-left mx-auto">
            <Card className="p-5 space-y-3 hover:scale-[1.02] transition-transform duration-200">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquareCode className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm">AI Coding Mentor</h3>
              <p className="text-xs text-content-secondary-light dark:text-gray-400 leading-relaxed">
                Ask queries and learn code structures block-by-block with smart code visualizers.
              </p>
            </Card>

            <Card className="p-5 space-y-3 hover:scale-[1.02] transition-transform duration-200">
              <div className="h-10 w-10 rounded-lg bg-ai/10 flex items-center justify-center text-ai">
                <Code className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm">Code Workspace</h3>
              <p className="text-xs text-content-secondary-light dark:text-gray-400 leading-relaxed">
                Autocomplete next lines, trace code complexities, and execute dynamic bug debuggers.
              </p>
            </Card>

            <Card className="p-5 space-y-3 hover:scale-[1.02] transition-transform duration-200">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm">SQL Mentor</h3>
              <p className="text-xs text-content-secondary-light dark:text-gray-400 leading-relaxed">
                Run database queries in real-time, inspect tables, and see compiler log outputs.
              </p>
            </Card>

            <Card className="p-5 space-y-3 hover:scale-[1.02] transition-transform duration-200">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <Library className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm">RAG Knowledge Base</h3>
              <p className="text-xs text-content-secondary-light dark:text-gray-400 leading-relaxed">
                Upload custom reference guidebooks and chat with PDFs citing exact page coordinates.
              </p>
            </Card>
          </div>
        </section>

        {/* Section 3: ABOUT US */}
        <section id="about" className="grid gap-12 lg:grid-cols-2 items-center pt-8 text-left">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-ai/10 border border-ai/20 text-xs text-ai font-bold shadow-sm">
              <Info className="h-3.5 w-3.5" /> About CodeNova AI
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Revolutionizing Computer Science Education
            </h2>
            <p className="text-sm text-content-secondary-light dark:text-gray-400 leading-relaxed">
              CodeNova AI is not just another coding platform; it is a personalized smart tutor designed by developers, for developers. By merging LLM-powered context understanding with active runtime sandboxes, we provide students with immediate, localized feedback on code runs.
            </p>

            <div className="space-y-3">
              {[
                'Interactive SQL execution playgrounds linked to H2 memory matrices',
                'Advanced RAG engines isolating document coordinates to cite exact page references',
                'Gamified user progress tracking carrying level progression matrices and XP totals',
                'Real-time runtime bug diagnostic modules suggesting logical corrections'
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-content-secondary-light dark:text-gray-300">
                  <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center">
            {/* Aesthetic Card graphic */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-ai/10 rounded-2xl blur-xl" />
            <Card className="relative z-10 w-full max-w-md p-6 bg-surface-light dark:bg-[#121927] border border-border-light dark:border-gray-800 shadow-2xl flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-border-light dark:border-gray-800 pb-3">
                <span className="text-xs font-bold text-primary">Student Analytics Summary</span>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-brand-light/50 dark:bg-black/20 rounded border border-border-light dark:border-gray-800/80">
                  <span className="text-[10px] text-gray-500 block">Total Exercises Completed</span>
                  <span className="text-lg font-bold text-content-primary-light dark:text-white">45 Challenges</span>
                </div>
                <div className="p-3 bg-brand-light/50 dark:bg-black/20 rounded border border-border-light dark:border-gray-800/80">
                  <span className="text-[10px] text-gray-500 block">Total Sandbox Runtime Runs</span>
                  <span className="text-lg font-bold text-content-primary-light dark:text-white">1,240 Executions</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                  <span>Current Module Progression</span>
                  <span>78%</span>
                </div>
                <div className="h-2 w-full bg-brand-light dark:bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-ai rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 4: CONTACT US */}
        <section id="contact" className="max-w-4xl w-full mx-auto space-y-8 pt-8">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-success/10 border border-success/20 text-xs text-success font-bold shadow-sm mx-auto">
              <PhoneCall className="h-3.5 w-3.5" /> Contact Support
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Get in Touch</h2>
            <p className="text-sm text-content-secondary-light dark:text-gray-400 max-w-xl mx-auto">
              Have questions about platform access, curriculum configurations, or licensing? Send us a message!
            </p>
          </div>

          <Card className="p-6 bg-surface-light dark:bg-[#121927] border border-border-light dark:border-gray-800 shadow-xl max-w-xl mx-auto">
            {contactSuccess ? (
              <div className="py-8 text-center space-y-3 animate-fade-in">
                <div className="h-12 w-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="text-base font-bold text-content-primary-light dark:text-white">Thank You!</h4>
                <p className="text-xs text-content-secondary-light dark:text-gray-400">
                  Your message has been sent successfully. We will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full text-xs p-2.5 bg-brand-light dark:bg-black/20 border border-border-light dark:border-gray-800 text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full text-xs p-2.5 bg-brand-light dark:bg-black/20 border border-border-light dark:border-gray-800 text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your query or feedback..."
                    className="w-full text-xs p-2.5 bg-brand-light dark:bg-black/20 border border-border-light dark:border-gray-800 text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full text-xs py-2 flex items-center justify-center gap-1.5">
                  Send Message
                </Button>
              </form>
            )}
          </Card>
        </section>

      </main>

      {/* Responsive Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 border-t border-border-light/40 dark:border-gray-800/40 mt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-tr from-primary to-ai flex items-center justify-center text-white text-[11px] font-extrabold">
              C
            </div>
            <span className="text-sm font-extrabold tracking-wide bg-gradient-to-r from-primary to-ai bg-clip-text text-transparent">
              CodeNova AI
            </span>
          </div>

          <div className="flex gap-4 text-xs text-content-secondary-light dark:text-gray-400">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-primary transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('about')} className="hover:text-primary transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-primary transition-colors">
              Contact
            </button>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-xs text-content-muted-light dark:text-gray-500">
              &copy; {new Date().getFullYear()} CodeNova AI. All rights reserved.
            </p>
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-red-400 transition-colors"
            >
              <Shield className="h-3 w-3" /> Administrator Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
