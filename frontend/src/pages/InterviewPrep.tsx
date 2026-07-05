import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { interviewService, InterviewSession, InterviewQuestion, InterviewEvaluationResponse } from '../services/interviewService';
import { Briefcase, Play, HelpCircle, CheckCircle, ShieldAlert, Award, Star } from 'lucide-react';

export const InterviewPrep: React.FC = () => {
  // Session states
  const [role, setRole] = useState('Backend Engineer');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  
  // Question states
  const [activeQuestion, setActiveQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  
  // Loading flags
  const [loadingSession, setLoadingSession] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingEvaluate, setLoadingEvaluate] = useState(false);

  // Result storage
  const [report, setReport] = useState<InterviewEvaluationResponse | null>(null);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSession(true);
    setReport(null);
    setActiveQuestion(null);
    try {
      const session = await interviewService.createSession(role, difficulty);
      setActiveSession(session);
      // Automatically pull first question
      handleFetchQuestion(session.id);
    } catch (err) {
      console.error('Session creation failed:', err);
    } finally {
      setLoadingSession(false);
    }
  };

  const handleFetchQuestion = async (sessionId: number) => {
    setLoadingQuestion(true);
    setUserAnswer('');
    setReport(null);
    try {
      const question = await interviewService.generateQuestion(sessionId);
      setActiveQuestion(question);
    } catch (err) {
      console.error('Question generation failed:', err);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleEvaluateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion || !userAnswer.trim()) return;

    setLoadingEvaluate(true);
    try {
      const evaluation = await interviewService.evaluateAnswer(
        activeQuestion.id,
        userAnswer,
        activeQuestion.questionText
      );
      setReport(evaluation);
    } catch (err) {
      console.error('Answer evaluation failed:', err);
    } finally {
      setLoadingEvaluate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
          AI Interview Preparation
        </h2>
        <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
          Simulate mock interviews for your target roles and get hiring reports.
        </p>
      </div>

      {/* Grid splits layout */}
      <div className="grid gap-6 lg:grid-cols-4 items-start h-[calc(100vh-13rem)]">
        {/* Left panel session creator */}
        <div className="lg:col-span-1 flex flex-col gap-4 shrink-0">
          <Card className="p-4">
            <h3 className="font-bold text-xs font-sans uppercase tracking-wider mb-3 text-content-primary-light dark:text-content-primary-dark">
              Mock Configuration
            </h3>
            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark mb-1.5">
                  Target Role
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Java Spring Architect"
                  className="w-full text-xs p-2 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full text-xs p-2 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none"
                >
                  <option>EASY</option>
                  <option>MEDIUM</option>
                  <option>HARD</option>
                </select>
              </div>

              <Button
                type="submit"
                isLoading={loadingSession}
                variant="ai"
                className="w-full text-xs py-2 shadow-glow-ai/20 flex items-center justify-center gap-1.5"
              >
                <Play className="h-3.5 w-3.5" /> Start Mock Session
              </Button>
            </form>
          </Card>
          
          {activeSession && (
            <Card className="p-4 bg-primary/5 border border-primary/20 text-center space-y-1">
              <Badge variant="brand" className="mx-auto">Session Active</Badge>
              <p className="text-xs font-bold text-content-primary-light dark:text-content-primary-dark mt-2 truncate">
                {activeSession.roleTarget}
              </p>
              <p className="text-[10px] text-content-secondary-light dark:text-content-secondary-dark">
                Difficulty: {activeSession.difficulty}
              </p>
            </Card>
          )}
        </div>

        {/* Right workspace panels: Questions & evaluation logs */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          {activeQuestion ? (
            <div className="grid gap-6 md:grid-cols-2 h-full items-stretch">
              {/* Question panel & user input form */}
              <Card className="flex flex-col p-4 overflow-hidden h-full">
                <div className="flex-1 overflow-y-auto space-y-4">
                  <Badge variant="ai" className="flex items-center gap-1 w-fit">
                    <HelpCircle className="h-3.5 w-3.5" /> Question Prompt
                  </Badge>

                  {loadingQuestion ? (
                    <div className="animate-pulse h-16 rounded bg-brand-light dark:bg-brand-dark" />
                  ) : (
                    <p className="text-sm font-semibold text-content-primary-light dark:text-content-primary-dark leading-relaxed">
                      {activeQuestion.questionText}
                    </p>
                  )}

                  {/* Textarea answer input */}
                  <form onSubmit={handleEvaluateAnswer} className="space-y-3 pt-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark">
                      Your Answer
                    </label>
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={loadingEvaluate}
                      rows={6}
                      placeholder="Type your response here..."
                      className="w-full text-xs p-3 border border-border-light rounded-lg bg-brand-light dark:bg-brand-dark dark:border-border-dark text-content-secondary-light dark:text-content-secondary-dark focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none disabled:opacity-50"
                    />
                    <Button
                      type="submit"
                      isLoading={loadingEvaluate}
                      disabled={!userAnswer.trim()}
                      variant="primary"
                      className="w-full text-xs py-2"
                    >
                      Submit Response
                    </Button>
                  </form>
                </div>
              </Card>

              {/* Evaluation score report panel */}
              <Card className="flex flex-col p-4 overflow-hidden h-full">
                <Badge variant="warning" className="flex items-center gap-1 w-fit mb-3">
                  <Star className="h-3.5 w-3.5" /> Evaluation Report
                </Badge>

                {!report ? (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-xs text-content-muted-light dark:text-content-muted-dark">
                      Submit your response to view graded reports.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                    {/* Score badge wrapper */}
                    <div className="flex items-center gap-3 bg-brand-light dark:bg-brand-dark p-3 rounded-lg border border-border-light dark:border-border-dark shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {report.score}%
                      </div>
                      <div>
                        <p className="font-bold text-content-primary-light dark:text-content-primary-dark">Hiring Assessment</p>
                        <p className="text-[10px] text-content-muted-light dark:text-content-muted-dark">Based on target capabilities</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="font-bold text-success flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Strengths:
                        </p>
                        <p className="text-content-secondary-light dark:text-content-secondary-dark mt-0.5 leading-relaxed">
                          {report.strengths}
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-danger flex items-center gap-1">
                          <ShieldAlert className="h-3.5 w-3.5" /> Core Gaps:
                        </p>
                        <p className="text-content-secondary-light dark:text-content-secondary-dark mt-0.5 leading-relaxed">
                          {report.gaps}
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-primary flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" /> Improvement Plan:
                        </p>
                        <p className="text-content-secondary-light dark:text-content-secondary-dark mt-0.5 leading-relaxed">
                          {report.improvement}
                        </p>
                      </div>
                    </div>
                    
                    {/* Next round trigger */}
                    <Button
                      onClick={() => handleFetchQuestion(activeSession!.id)}
                      variant="secondary"
                      className="w-full text-xs py-1.5 mt-2"
                    >
                      Next Question
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="flex h-full items-center justify-center text-center">
              <div>
                <Briefcase className="h-12 w-12 text-content-muted-light dark:text-content-muted-dark mx-auto mb-3" />
                <p className="text-sm font-semibold text-content-secondary-light dark:text-content-secondary-dark">
                  Please configure role requirements and click 'Start Session'.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
