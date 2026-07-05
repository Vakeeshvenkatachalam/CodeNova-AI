import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { practiceService, PracticeProblem, PracticeSubmitResponse } from '../services/practiceService';
import { Terminal, Award, HelpCircle, ChevronRight, Plus, Sparkles, Code, Play } from 'lucide-react';

export const PracticeHub: React.FC = () => {
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [activeProblem, setActiveProblem] = useState<PracticeProblem | null>(null);
  
  // Forms & state
  const [editorCode, setEditorCode] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [submitResult, setSubmitResult] = useState<PracticeSubmitResponse | null>(null);

  // AI Problem Creator panel flags
  const [generatingProblem, setGeneratingProblem] = useState(false);
  const [topic, setTopic] = useState('Data Structures');
  const [difficulty, setDifficulty] = useState('EASY');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoadingList(true);
    try {
      const data = await practiceService.getProblems();
      setProblems(data);
      if (data.length > 0 && activeProblem === null) {
        handleSelectProblem(data[0]);
      }
    } catch (err) {
      console.error('Failed to load problems list:', err);
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
      console.error('Hint retrieval failed:', err);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmitAttempt = async () => {
    if (!activeProblem || !editorCode.trim()) return;
    setLoadingSubmit(true);
    setSubmitResult(null);
    try {
      const report = await practiceService.submitAttempt(activeProblem.id, editorCode, 'Java');
      setSubmitResult(report);
    } catch (err) {
      console.error('Code submission failed:', err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleGenerateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingProblem(true);
    try {
      const newProb = await practiceService.generateProblem(topic, difficulty);
      setProblems((prev) => [newProb, ...prev]);
      handleSelectProblem(newProb);
    } catch (err) {
      console.error('Problem generation failed:', err);
    } finally {
      setGeneratingProblem(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
            Practice Hub
          </h2>
          <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
            Solve problems dynamically or trigger AI to design custom tasks.
          </p>
        </div>

        <Badge variant="brand">XP System Connected</Badge>
      </div>

      {/* Outer splits workspace */}
      <div className="grid gap-6 lg:grid-cols-4 items-start h-[calc(100vh-13rem)]">
        {/* Left pane: selector lists & creators */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
          {/* AI problem generator card */}
          <Card className="p-3 shrink-0">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-ai">
              <Sparkles className="h-3.5 w-3.5" /> AI Problem Creator
            </h4>
            <form onSubmit={handleGenerateProblem} className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-brand-light border border-border-light text-[10px] dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded py-1 px-1.5 focus:outline-none"
                >
                  <option>Algorithms</option>
                  <option>Data Structures</option>
                  <option>Recursion</option>
                </select>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="bg-brand-light border border-border-light text-[10px] dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded py-1 px-1.5 focus:outline-none"
                >
                  <option>EASY</option>
                  <option>MEDIUM</option>
                  <option>HARD</option>
                </select>
              </div>
              <Button
                type="submit"
                isLoading={generatingProblem}
                variant="ai"
                className="w-full text-[10px] py-1 h-[28px] shadow-glow-ai/20 flex items-center justify-center gap-1"
              >
                <Plus className="h-3 w-3" /> Design Challenge
              </Button>
            </form>
          </Card>

          {/* List of problems */}
          <Card className="flex-1 flex flex-col p-3 overflow-hidden h-full">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-content-primary-light dark:text-content-primary-dark shrink-0">
              Problems List
            </h4>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingList ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse h-12 rounded bg-brand-light dark:bg-brand-dark" />
                ))
              ) : problems.length === 0 ? (
                <p className="text-[10px] text-content-muted-light dark:text-content-muted-dark text-center py-6">No problems found.</p>
              ) : (
                problems.map((prob) => (
                  <button
                    key={prob.id}
                    onClick={() => handleSelectProblem(prob)}
                    className={`w-full text-left p-2.5 rounded border transition-all duration-150 flex items-center justify-between ${
                      activeProblem?.id === prob.id
                        ? 'bg-primary/10 border-primary/20 text-primary'
                        : 'border-transparent hover:bg-brand-light dark:hover:bg-brand-dark text-content-secondary-light dark:text-content-secondary-dark'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold truncate max-w-[120px]">{prob.title}</p>
                      <span className="text-[9px] text-content-muted-light dark:text-content-muted-dark">{prob.category}</span>
                    </div>
                    <Badge variant={prob.difficulty === 'EASY' ? 'success' : prob.difficulty === 'MEDIUM' ? 'warning' : 'danger'} className="text-[8px] py-0 px-1 shrink-0">
                      {prob.difficulty}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right workspace splits: Problem description & code editor */}
        <div className="lg:col-span-3 grid gap-6 md:grid-cols-2 h-full overflow-hidden items-stretch">
          {/* Description & Hint */}
          <Card className="flex flex-col p-4 overflow-hidden h-full">
            {activeProblem ? (
              <div className="flex flex-col h-full space-y-3">
                <div className="flex justify-between items-center border-b border-border-light pb-2 dark:border-border-dark shrink-0">
                  <h3 className="font-bold text-content-primary-light dark:text-content-primary-dark">
                    {activeProblem.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-content-secondary-light dark:text-content-secondary-dark">
                    <Award className="h-4 w-4 text-amber-500" /> {activeProblem.points} XP
                  </div>
                </div>
                
                {/* Description Text */}
                <div className="flex-1 overflow-y-auto pr-1 text-xs text-content-secondary-light dark:text-content-secondary-dark leading-relaxed">
                  <p className="whitespace-pre-line">{activeProblem.description}</p>
                  
                  {hintText && (
                    <div className="mt-4 rounded-lg bg-primary/10 border border-primary/20 p-3 text-primary relative">
                      <p className="font-bold mb-0.5">AI Hint:</p>
                      <p>{hintText}</p>
                    </div>
                  )}
                </div>

                {/* Hints and execution action bar */}
                <div className="flex gap-2 shrink-0 pt-2 border-t border-border-light dark:border-border-dark">
                  <Button
                    onClick={handleGetHint}
                    isLoading={loadingHint}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs py-1.5 px-3 flex-1"
                  >
                    <HelpCircle className="h-4 w-4" /> Get Clue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <p className="text-xs text-content-muted-light dark:text-content-muted-dark">Select a problem to review description</p>
              </div>
            )}
          </Card>

          {/* Code Editor & Grade reports */}
          <div className="flex flex-col gap-4 h-full overflow-hidden">
            {/* Editor Pre */}
            <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-[#1e1e1e] border-none shadow-md">
              <div className="flex h-9 items-center justify-between bg-[#2d2d2d] px-4 border-b border-[#3c3c3c]">
                <div className="flex items-center gap-1.5">
                  <Code className="h-4 w-4 text-content-secondary-dark" />
                  <span className="text-xs font-mono text-content-secondary-dark">Solution.java</span>
                </div>
                <Play className="h-3.5 w-3.5 text-content-muted-dark" />
              </div>
              <textarea
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                disabled={activeProblem === null || loadingSubmit}
                className="flex-1 p-4 font-mono text-xs text-green-400 bg-[#1e1e1e] border-none resize-none focus:outline-none focus:ring-0 leading-relaxed overflow-y-auto disabled:opacity-50"
              />
            </Card>

            {/* Submit Action Block */}
            <div className="shrink-0 flex flex-col gap-2">
              {submitResult && (
                <div className={`rounded-lg border p-3 text-xs leading-relaxed ${
                  submitResult.status === 'PASSED'
                    ? 'bg-success/15 border-success/35 text-success'
                    : 'bg-danger/15 border-danger/35 text-danger'
                }`}>
                  <p className="font-bold flex items-center gap-1">
                    {submitResult.status === 'PASSED' ? 'PASSED ✅' : 'FAILED ❌'}
                    {submitResult.status === 'PASSED' && <span className="text-[10px] text-amber-500 font-semibold">(Earned {submitResult.pointsEarned} XP)</span>}
                  </p>
                  <p className="mt-1 font-mono text-[10px]">{submitResult.feedback}</p>
                </div>
              )}

              <Button
                onClick={handleSubmitAttempt}
                isLoading={loadingSubmit}
                disabled={activeProblem === null || !editorCode.trim()}
                variant="primary"
                className="w-full text-xs py-2"
              >
                Submit Code Solution
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
