import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { practiceService, PracticeProblem, PracticeSubmitResponse } from '../services/practiceService';
import {
  Terminal, Award, HelpCircle, ChevronRight, Plus, Sparkles, Code, Play,
  TrendingUp, BookOpen, Clock, Lightbulb, Compass, ShieldAlert, CheckCircle, Flame
} from 'lucide-react';

export const PracticeHub: React.FC = () => {
  // Phase management: 'wizard' | 'assessment' | 'roadmap'
  const [phase, setPhase] = useState<'wizard' | 'assessment' | 'roadmap'>('wizard');

  // Wizard preferences
  const [lang, setLang] = useState('Java');
  const [goal, setGoal] = useState('Dream Company');
  const [deadline, setDeadline] = useState('60 Days');
  const [dailyTime, setDailyTime] = useState('2 Hours');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Arrays', 'Strings']);

  // Problems list & active states
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [activeProblem, setActiveProblem] = useState<PracticeProblem | null>(null);
  const [editorCode, setEditorCode] = useState('');
  
  // XP & Streaks
  const [xp, setXp] = useState(120);
  const [streak, setStreak] = useState(5);
  const [solvedCount, setSolvedCount] = useState(8);

  // Status & loader flags
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [generatingProblem, setGeneratingProblem] = useState(false);
  const [hintText, setHintText] = useState('');
  const [submitResult, setSubmitResult] = useState<PracticeSubmitResponse | null>(null);

  // Roadmap details
  const [roadmapWeeks, setRoadmapWeeks] = useState<{ week: number; topic: string; hours: number }[]>([]);

  // Assessment question state
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [assessmentScore, setAssessmentScore] = useState(0);

  const topicOptions = ['Arrays', 'Strings', 'Recursion', 'Trees', 'Graphs', 'DP', 'OOP', 'Collections', 'SQL'];

  useEffect(() => {
    if (phase === 'roadmap') {
      fetchProblems();
    }
  }, [phase]);

  const handleToggleTopic = (t: string) => {
    setSelectedTopics(prev =>
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const handleStartAssessment = () => {
    setPhase('assessment');
    setAssessmentIndex(0);
    setAssessmentScore(0);
  };

  const handleAssessmentSubmit = (choiceCorrect: boolean) => {
    if (choiceCorrect) {
      setAssessmentScore(prev => prev + 25);
    }
    if (assessmentIndex < 2) {
      setAssessmentIndex(prev => prev + 1);
    } else {
      // Completed, calculate roadmap weeks
      const weeks = selectedTopics.map((t, idx) => ({
        week: idx + 1,
        topic: t,
        hours: dailyTime === '4 Hours' ? 28 : dailyTime === '2 Hours' ? 14 : 7
      }));
      setRoadmapWeeks(weeks);
      setPhase('roadmap');
    }
  };

  const fetchProblems = async () => {
    setLoadingList(true);
    try {
      const data = await practiceService.getProblems();
      setProblems(data);
      if (data.length > 0 && activeProblem === null) {
        handleSelectProblem(data[0]);
      }
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSelectProblem = (prob: PracticeProblem) => {
    setActiveProblem(prob);
    setEditorCode(prob.starterCode || `public class Solution {\n    // Code here\n}`);
    setHintText('');
    setSubmitResult(null);
  };

  const handleGetHint = async () => {
    if (!activeProblem) return;
    setLoadingHint(true);
    try {
      const hint = await practiceService.getHint(activeProblem.id);
      setHintText(hint);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmitAttempt = async () => {
    if (!activeProblem || !editorCode.trim()) return;
    setLoadingSubmit(true);
    setSubmitResult(null);
    try {
      const report = await practiceService.submitAttempt(activeProblem.id, editorCode, lang);
      setSubmitResult(report);
      if (report.status === 'PASSED') {
        setXp(prev => prev + 30);
        setSolvedCount(prev => prev + 1);
        setStreak(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleGenerateProblem = async (category: string, difficulty: string) => {
    setGeneratingProblem(true);
    try {
      const newProb = await practiceService.generateProblem(category, difficulty);
      setProblems(prev => [newProb, ...prev]);
      handleSelectProblem(newProb);
    } catch (err) {
      console.error('Failed to generate problem:', err);
    } finally {
      setGeneratingProblem(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
            Practice Hub
          </h2>
          <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
            Build syntax mastery and resolve challenges on our adaptive AI coding pipeline.
          </p>
        </div>

        {/* Level indicators */}
        <div className="flex items-center gap-3">
          <div className="bg-brand-light dark:bg-brand-dark px-3 py-1.5 rounded-xl border border-border-light dark:border-border-dark flex items-center gap-1.5 text-xs text-content-primary-light dark:text-content-primary-dark font-bold font-mono">
            <Flame className="h-4 w-4 text-[#f59e0b] fill-[#f59e0b]" /> {streak} Day Streak
          </div>
          <div className="bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 flex items-center gap-1 text-xs text-primary font-bold font-mono">
            🏆 {xp} XP
          </div>
        </div>
      </div>

      {/* PHASE 1: Wizard Preferences */}
      {phase === 'wizard' && (
        <Card className="max-w-2xl mx-auto p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border-light dark:border-border-dark pb-3">
            <Compass className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm text-content-primary-light dark:text-content-primary-dark">Configure Study Goals</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1 text-content-secondary-light dark:text-gray-400">Language</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full p-2.5 bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark rounded-xl text-content-primary-light dark:text-content-primary-dark focus:outline-none"
                >
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                  <option value="C++">C++</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="SQL">SQL</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-content-secondary-light dark:text-gray-400">Goal Target</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-2.5 bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark rounded-xl text-content-primary-light dark:text-content-primary-dark focus:outline-none"
                >
                  <option value="Dream Company">Dream Company</option>
                  <option value="FAANG">FAANG</option>
                  <option value="Placement Prep">Placement Prep</option>
                  <option value="Competitive Programming">Competitive Programming</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1 text-content-secondary-light dark:text-gray-400">Time Deadline</label>
                <select
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2.5 bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark rounded-xl text-content-primary-light dark:text-content-primary-dark focus:outline-none"
                >
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                  <option value="180 Days">180 Days</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-content-secondary-light dark:text-gray-400">Daily Study Budget</label>
                <select
                  value={dailyTime}
                  onChange={(e) => setDailyTime(e.target.value)}
                  className="w-full p-2.5 bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark rounded-xl text-content-primary-light dark:text-content-primary-dark focus:outline-none"
                >
                  <option value="30 mins">30 mins</option>
                  <option value="1 Hour">1 Hour</option>
                  <option value="2 Hours">2 Hours</option>
                  <option value="4 Hours">4 Hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2 text-content-secondary-light dark:text-gray-400">Select Study Topics</label>
              <div className="grid grid-cols-3 gap-2">
                {topicOptions.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleTopic(t)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      selectedTopics.includes(t)
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border-light dark:border-border-dark bg-brand-light dark:bg-brand-dark text-content-secondary-light dark:text-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleStartAssessment}
            disabled={selectedTopics.length === 0}
            variant="primary"
            className="w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
          >
            <Play className="h-4 w-4" /> Start Initial AI Assessment
          </Button>
        </Card>
      )}

      {/* PHASE 2: Diagnostic Assessment */}
      {phase === 'assessment' && (
        <Card className="max-w-xl mx-auto p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
            <span className="text-xs font-bold text-primary font-mono uppercase">Initial Assessment Diagnostic</span>
            <span className="text-[10px] text-content-muted-light dark:text-gray-400">Stage {assessmentIndex + 1} of 3</span>
          </div>

          <div className="space-y-4">
            {assessmentIndex === 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-content-primary-light dark:text-content-primary-dark leading-relaxed">
                  1. What is the average time complexity of searching for an element in a balanced binary search tree (BST)?
                </p>
                <div className="grid gap-2 text-xs">
                  <button onClick={() => handleAssessmentSubmit(false)} className="w-full text-left p-3 rounded-xl border border-border-light dark:border-border-dark hover:border-primary transition-all">O(N)</button>
                  <button onClick={() => handleAssessmentSubmit(true)} className="w-full text-left p-3 rounded-xl border border-border-light dark:border-border-dark hover:border-primary transition-all">O(log N)</button>
                  <button onClick={() => handleAssessmentSubmit(false)} className="w-full text-left p-3 rounded-xl border border-border-light dark:border-border-dark hover:border-primary transition-all">O(1)</button>
                </div>
              </div>
            )}
            {assessmentIndex === 1 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-content-primary-light dark:text-content-primary-dark leading-relaxed">
                  2. Which of the following is optimal for finding the shortest path in an unweighted grid network?
                </p>
                <div className="grid gap-2 text-xs">
                  <button onClick={() => handleAssessmentSubmit(true)} className="w-full text-left p-3 rounded-xl border border-border-light dark:border-border-dark hover:border-primary transition-all">Breadth-First Search (BFS)</button>
                  <button onClick={() => handleAssessmentSubmit(false)} className="w-full text-left p-3 rounded-xl border border-border-light dark:border-border-dark hover:border-primary transition-all">Depth-First Search (DFS)</button>
                  <button onClick={() => handleAssessmentSubmit(false)} className="w-full text-left p-3 rounded-xl border border-border-light dark:border-border-dark hover:border-primary transition-all">Dijkstra's Algorithm</button>
                </div>
              </div>
            )}
            {assessmentIndex === 2 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-content-primary-light dark:text-content-primary-dark leading-relaxed">
                  3. Dynamic Programming is primarily applicable for problems exhibiting:
                </p>
                <div className="grid gap-2 text-xs">
                  <button onClick={() => handleAssessmentSubmit(false)} className="w-full text-left p-3 rounded-xl border border-border-light dark:border-border-dark hover:border-primary transition-all">First-in, First-out sequencing structures</button>
                  <button onClick={() => handleAssessmentSubmit(true)} className="w-full text-left p-3 rounded-xl border border-border-light dark:border-border-dark hover:border-primary transition-all">Overlapping subproblems and optimal substructure</button>
                  <button onClick={() => handleAssessmentSubmit(false)} className="w-full text-left p-3 rounded-xl border border-border-light dark:border-border-dark hover:border-primary transition-all">Greedy local-maxima choices</button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* PHASE 3: Roadmap Dashboard & Editor */}
      {phase === 'roadmap' && (
        <div className="grid gap-6 lg:grid-cols-5 items-start">
          {/* Left panel: Roadmap calendar timeline */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="p-4 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
                <Compass className="h-4.5 w-4.5 text-primary" /> Study Roadmap Path
              </h3>

              <div className="space-y-2">
                {roadmapWeeks.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-brand-light dark:bg-brand-dark p-3 rounded-xl border border-border-light dark:border-border-dark text-xs">
                    <div>
                      <p className="font-bold text-content-primary-light dark:text-content-primary-dark">Week {item.week}: {item.topic}</p>
                      <p className="text-[10px] text-content-secondary-light dark:text-gray-400">Budget: {item.hours} hours total</p>
                    </div>
                    <Button
                      onClick={() => handleGenerateProblem(item.topic, 'EASY')}
                      isLoading={generatingProblem && activeProblem?.category === item.topic}
                      variant="secondary"
                      className="text-[10px] px-2 py-1 flex items-center gap-1 font-bold shrink-0"
                    >
                      <Plus className="h-3 w-3" /> Fetch Task
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Solved Problems Inventory */}
            <Card className="p-4 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-primary" /> Solved Problems ({solvedCount})
              </h3>
              <div className="divide-y divide-border-light dark:divide-border-dark max-h-48 overflow-y-auto pr-1">
                {problems.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectProblem(p)}
                    className={`w-full text-left py-2 px-2 rounded-lg text-xs transition-colors flex justify-between items-center ${
                      activeProblem?.id === p.id
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-content-secondary-light dark:text-gray-300 hover:bg-brand-light dark:hover:bg-brand-dark'
                    }`}
                  >
                    <span>{p.title}</span>
                    <Badge variant={p.difficulty === 'EASY' ? 'brand' : p.difficulty === 'MEDIUM' ? 'warning' : 'danger'}>{p.difficulty}</Badge>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right panel: Active problem workspace editor */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {activeProblem ? (
              <Card className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant={activeProblem.difficulty === 'EASY' ? 'brand' : activeProblem.difficulty === 'MEDIUM' ? 'warning' : 'danger'} className="mb-1.5">{activeProblem.difficulty}</Badge>
                    <h3 className="text-base font-bold text-content-primary-light dark:text-content-primary-dark leading-snug">{activeProblem.title}</h3>
                    <p className="text-[10px] text-content-muted-light dark:text-gray-400 font-mono">Category: {activeProblem.category}</p>
                  </div>

                  <Button
                    onClick={handleGetHint}
                    isLoading={loadingHint}
                    variant="secondary"
                    className="text-[10px] px-2 py-1 flex items-center gap-1 shrink-0"
                  >
                    <Lightbulb className="h-3 w-3 text-[#f59e0b]" /> Hint
                  </Button>
                </div>

                {/* Description */}
                <div className="p-3 bg-brand-light dark:bg-[#0d1117] border border-border-light dark:border-border-dark rounded-xl text-xs text-content-secondary-light dark:text-gray-300 leading-relaxed font-sans">
                  {activeProblem.description}
                </div>

                {hintText && (
                  <div className="p-3 bg-[#f59e0b]/5 border border-[#f59e0b]/15 text-[#f59e0b] rounded-xl text-xs leading-relaxed flex gap-2">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span><strong>AI Hint:</strong> {hintText}</span>
                  </div>
                )}

                {/* Code Editor */}
                <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 overflow-hidden flex flex-col">
                  <div className="bg-[#2d2d2d] px-4 py-2 border-b border-[#3c3c3c] flex items-center justify-between text-xs text-gray-400 font-mono">
                    <span>Solution.{lang === 'Java' ? 'java' : lang === 'Python' ? 'py' : 'cpp'}</span>
                    <Badge variant="brand">Active Workspace</Badge>
                  </div>
                  <textarea
                    value={editorCode}
                    onChange={(e) => setEditorCode(e.target.value)}
                    className="w-full h-56 p-4 font-mono text-xs text-green-400 bg-[#1e1e1e] border-none resize-none focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Submit trigger */}
                <Button
                  onClick={handleSubmitAttempt}
                  isLoading={loadingSubmit}
                  variant="primary"
                  className="w-full text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-glow-brand/20"
                >
                  <Play className="h-4 w-4" /> Run Code & Verify logic
                </Button>

                {submitResult && (
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                    submitResult.status === 'PASSED'
                      ? 'bg-green-500/5 border-green-500/20 text-green-400'
                      : 'bg-red-500/5 border-red-500/20 text-red-400'
                  }`}>
                    <p className="font-bold flex items-center gap-1">
                      {submitResult.status === 'PASSED' ? <CheckCircle className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                      Execution Status: {submitResult.status}
                    </p>
                    <p className="font-sans text-content-secondary-light dark:text-gray-300"><strong>Feedback:</strong> {submitResult.message}</p>
                    
                    {/* Optimal complexity details */}
                    <div className="grid grid-cols-2 gap-2 font-mono text-[10px] bg-brand-light dark:bg-brand-dark p-2.5 rounded-lg border border-border-light dark:border-border-dark mt-2 text-content-primary-light dark:text-content-primary-dark">
                      <div>⌚ Time Complexity: O(N)</div>
                      <div>💾 Space Complexity: O(1)</div>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-8 text-center text-content-secondary-light dark:text-gray-400">
                <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-60 text-primary" />
                <p className="text-xs">Click "Fetch Task" on any roadmap week to load your custom adaptive problems.</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
