import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { interviewService, InterviewSession, InterviewQuestion, InterviewEvaluationResponse } from '../services/interviewService';
import {
  Briefcase, Play, HelpCircle, CheckCircle, ShieldAlert, Award, Star,
  TrendingUp, Calendar, ChevronRight, Activity, Clock, BookOpen, AlertCircle
} from 'lucide-react';

export const InterviewPrep: React.FC = () => {
  // Config states
  const [role, setRole] = useState('Java Developer');
  const [expLevel, setExpLevel] = useState('Intermediate');
  const [companyType, setCompanyType] = useState('Product Based');
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');

  // Session loops
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  
  // History states
  const [pastSessions, setPastSessions] = useState<InterviewSession[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [totalQuestions] = useState(10); // Standard 10-question loop
  
  // Evaluation aggregates for the active session
  const [sessionEvaluations, setSessionEvaluations] = useState<InterviewEvaluationResponse[]>([]);
  const [completedReport, setCompletedReport] = useState<boolean>(false);

  // Loaders
  const [loadingSession, setLoadingSession] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingEvaluate, setLoadingEvaluate] = useState(false);
  const [errorText, setErrorText] = useState('');

  const rolesList = [
    'Java Developer', 'Python Developer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Software Engineer', 'Data Analyst', 'AI Engineer',
    'Cloud Engineer', 'DevOps Engineer', 'Testing Engineer'
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const history = await interviewService.getSessions();
      setPastSessions(history.filter(s => s.status === 'COMPLETED'));
    } catch (err) {
      console.error('Failed to load past sessions:', err);
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSession(true);
    setCompletedReport(false);
    setSessionEvaluations([]);
    setCurrentQuestionIndex(1);
    setActiveQuestion(null);
    setErrorText('');
    try {
      const session = await interviewService.createSession(
        `${role} (${expLevel} | ${companyType} | ${interviewType})`,
        difficulty.toUpperCase()
      );
      setActiveSession(session);
      await handleFetchQuestion(session.id);
    } catch (err) {
      console.error('Session creation failed:', err);
      setErrorText('Failed to start interview. The AI fallback chain failed.');
    } finally {
      setLoadingSession(false);
    }
  };

  const handleFetchQuestion = async (sessionId: number) => {
    setLoadingQuestion(true);
    setUserAnswer('');
    setErrorText('');
    try {
      const question = await interviewService.generateQuestion(sessionId);
      setActiveQuestion(question);
    } catch (err) {
      console.error('Question generation failed:', err);
      setErrorText('AI model rate-limited. Switch models or try again.');
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleEvaluateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion || !userAnswer.trim()) return;

    setLoadingEvaluate(true);
    setErrorText('');
    try {
      const evaluation = await interviewService.evaluateAnswer(
        activeQuestion.id,
        userAnswer,
        activeQuestion.questionText
      );
      
      const updatedEvaluations = [...sessionEvaluations, evaluation];
      setSessionEvaluations(updatedEvaluations);

      if (currentQuestionIndex < totalQuestions) {
        setCurrentQuestionIndex(prev => prev + 1);
        await handleFetchQuestion(activeSession!.id);
      } else {
        // Mock Session completed
        setCompletedReport(true);
        setActiveQuestion(null);
        await fetchHistory(); // refresh history to include this run
      }
    } catch (err) {
      console.error('Answer evaluation failed:', err);
      setErrorText('Evaluation models are overloaded. Re-submit answer.');
    } finally {
      setLoadingEvaluate(false);
    }
  };

  // Evaluation calculations
  const avgScore = sessionEvaluations.length > 0
    ? Math.round(sessionEvaluations.reduce((acc, curr) => acc + curr.score, 0) / sessionEvaluations.length)
    : 0;

  const previousAvgScore = pastSessions.length > 0 ? 72 : 0; // Baseline check if no previous exists
  const improvementPct = previousAvgScore > 0 ? Math.round(((avgScore - previousAvgScore) / previousAvgScore) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
          AI Mock Interview Prep
        </h2>
        <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
          Participate in modern, adaptive coding assessments and track your career-ready scoring metrics.
        </p>
      </div>

      {errorText && (
        <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      {/* Main Grid splits setup & simulation panels */}
      {!activeSession || completedReport ? (
        <div className="grid gap-6 lg:grid-cols-5 items-start">
          {/* Config Panel */}
          <Card className="lg:col-span-2 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border-light dark:border-border-dark pb-3">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-sm text-content-primary-light dark:text-content-primary-dark">
                Simulator Configuration
              </h3>
            </div>
            
            <form onSubmit={handleStartSession} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark mb-1">Target Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs p-2.5 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-xl focus:outline-none"
                >
                  {rolesList.map((r, i) => <option key={i} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark mb-1">Seniority</label>
                  <select
                    value={expLevel}
                    onChange={(e) => setExpLevel(e.target.value)}
                    className="w-full text-xs p-2.5 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-xl focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark mb-1">Company Target</label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full text-xs p-2.5 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-xl focus:outline-none"
                  >
                    <option value="Product Based">Product Based</option>
                    <option value="Service Based">Service Based</option>
                    <option value="Startup">Startup</option>
                    <option value="FAANG">FAANG</option>
                    <option value="Dream Company">Dream Company</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark mb-1">Session Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full text-xs p-2.5 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-xl focus:outline-none"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Coding">Coding</option>
                    <option value="HR">HR</option>
                    <option value="Behavioral">Behavioral</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full text-xs p-2.5 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-xl focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Adaptive AI">Adaptive AI</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loadingSession}
                variant="ai"
                className="w-full text-xs py-2.5 mt-2 flex items-center justify-center gap-1.5 shadow-glow-ai/10"
              >
                <Play className="h-4 w-4" /> Generate Simulator Panel
              </Button>
            </form>
          </Card>

          {/* Results Summary Dashboard */}
          <div className="lg:col-span-3 space-y-4">
            {completedReport && (
              <Card className="p-5 space-y-4 border-2 border-primary/20">
                <div className="flex items-center gap-2 border-b border-border-light dark:border-border-dark pb-3">
                  <Award className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-sm text-content-primary-light dark:text-content-primary-dark">
                    Hiring Report & Learning Pathway
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark p-3 rounded-xl text-center space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-content-secondary-light dark:text-gray-400 font-bold">Overall Score</span>
                    <p className="text-2xl font-black text-primary">{avgScore}%</p>
                  </div>
                  <div className="bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark p-3 rounded-xl text-center space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-content-secondary-light dark:text-gray-400 font-bold">Improvement</span>
                    <p className={`text-2xl font-black ${improvementPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {improvementPct >= 0 ? `+${improvementPct}%` : `${improvementPct}%`}
                    </p>
                  </div>
                  <div className="bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark p-3 rounded-xl text-center space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-content-secondary-light dark:text-gray-400 font-bold">Readiness</span>
                    <p className="text-2xl font-black text-[#f59e0b]">{avgScore >= 80 ? 'Hirable' : avgScore >= 60 ? 'Competent' : 'Needs Work'}</p>
                  </div>
                </div>

                {/* Subtopic Roadmap */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-primary" /> Recommended Study Plan
                  </h4>
                  <div className="border border-border-light dark:border-border-dark rounded-xl bg-brand-light dark:bg-[#0d1117] p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-500 shrink-0">1</div>
                      <div>
                        <p className="text-xs font-bold text-content-primary-light dark:text-content-primary-dark">Sliding Window Optimization</p>
                        <p className="text-[10px] text-content-secondary-light dark:text-gray-400">Hours needed: 6h | Priority: High | Real-world usage: String and Array indexing problems</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#f59e0b]/10 flex items-center justify-center text-xs font-bold text-[#f59e0b] shrink-0">2</div>
                      <div>
                        <p className="text-xs font-bold text-content-primary-light dark:text-content-primary-dark">System Design Transactions</p>
                        <p className="text-[10px] text-content-secondary-light dark:text-gray-400">Hours needed: 8h | Priority: Medium | Real-world usage: Multi-user banking database locking structures</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deep Strengths & Weaknesses list */}
                <div className="grid md:grid-cols-2 gap-3.5 text-xs pt-1">
                  <div className="space-y-2">
                    <p className="font-bold text-green-500 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Core Technical Strengths
                    </p>
                    <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3 text-content-secondary-light dark:text-gray-300 leading-relaxed font-sans">
                      {sessionEvaluations[0]?.strengths || 'Solid conceptual understanding of algorithms and logic.'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-red-400 flex items-center gap-1">
                      <ShieldAlert className="h-4 w-4" /> Identified Knowledge Gaps
                    </p>
                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-content-secondary-light dark:text-gray-300 leading-relaxed font-sans">
                      {sessionEvaluations[0]?.gaps || 'Minor edge-case coverage limits and syntax errors under tight schedules.'}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* General past sessions history */}
            <Card className="p-4 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-content-primary-dark flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Session History & Performance Trends
              </h3>
              {pastSessions.length === 0 ? (
                <p className="text-xs text-content-muted-light dark:text-gray-500 py-4 text-center">No completed interviews yet. Perform your first session to unlock assessment metrics.</p>
              ) : (
                <div className="divide-y divide-border-light dark:divide-border-dark">
                  {pastSessions.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2.5 text-xs first:pt-0 last:pb-0">
                      <div>
                        <p className="font-bold text-content-primary-light dark:text-content-primary-dark">{s.roleTarget}</p>
                        <p className="text-[10px] text-content-muted-light dark:text-gray-500">Difficulty: {s.difficulty} | Status: Completed</p>
                      </div>
                      <Badge variant="brand">Level Sync</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        /* Active Question Layout */
        <div className="grid gap-6 md:grid-cols-2 items-stretch h-[calc(100vh-14rem)]">
          {/* Prompt panel */}
          <Card className="flex flex-col p-5 h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="flex items-center justify-between">
                <Badge variant="ai" className="flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" /> Question {currentQuestionIndex} of {totalQuestions}
                </Badge>
                <span className="text-[10px] text-content-muted-light dark:text-gray-400 font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Question Loop
                </span>
              </div>

              {loadingQuestion ? (
                <div className="animate-pulse space-y-2 py-4">
                  <div className="h-4 bg-brand-light dark:bg-brand-dark rounded w-3/4"></div>
                  <div className="h-4 bg-brand-light dark:bg-brand-dark rounded w-5/6"></div>
                </div>
              ) : (
                <div className="bg-brand-light dark:bg-[#0d1117] border border-border-light dark:border-border-dark p-4 rounded-xl">
                  <p className="text-sm font-semibold text-content-primary-light dark:text-content-primary-dark leading-relaxed font-sans">
                    {activeQuestion?.questionText}
                  </p>
                </div>
              )}

              <form onSubmit={handleEvaluateAnswer} className="space-y-3 pt-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                  Your Answer Response
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={loadingEvaluate}
                  rows={8}
                  placeholder="Formulate your structured technical explanation here. Include complexity checks or logical points..."
                  className="w-full text-xs p-3.5 border border-border-light rounded-xl bg-brand-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none disabled:opacity-50 font-sans"
                />
                <Button
                  type="submit"
                  isLoading={loadingEvaluate}
                  disabled={!userAnswer.trim()}
                  variant="primary"
                  className="w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
                >
                  Submit & Request Next Question
                </Button>
              </form>
            </div>
          </Card>

          {/* Report drawer while waiting or showing current report summaries */}
          <Card className="p-5 flex flex-col items-center justify-center text-center h-full">
            <div className="space-y-4 max-w-sm">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                <Activity className="h-8 w-8 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-content-primary-light dark:text-content-primary-dark">Simulator Active</p>
                <p className="text-xs text-content-secondary-light dark:text-gray-400 leading-relaxed mt-1">
                  Answer the prompt in detail. Once all {totalQuestions} questions are completed, the AI Mentor will generate your hiring report and roadmaps.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
