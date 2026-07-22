import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { dashboardService, DashboardSummary, DashboardInsight } from '../services/dashboardService';
import {
  Flame, CheckCircle, Target, Sparkles, ArrowRight, BookOpen,
  AlertTriangle, Award, Compass, Clock, Activity, Calendar
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insight, setInsight] = useState<DashboardInsight | null>(null);
  
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [errorInsight, setErrorInsight] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await dashboardService.getSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setLoadingSummary(false);
      }
    };

    const fetchInsights = async () => {
      try {
        const data = await dashboardService.getInsights();
        setInsight(data);
      } catch (err) {
        console.error('Failed to load AI Insights:', err);
        setErrorInsight(true);
      } finally {
        setLoadingInsight(false);
      }
    };

    fetchSummary();
    fetchInsights();
  }, []);

  const handleRecommendationAction = (module: string) => {
    switch (module) {
      case 'PRACTICE':
        navigate('/practice');
        break;
      case 'MENTOR':
        navigate('/mentor');
        break;
      case 'SQL_MENTOR':
        navigate('/sql');
        break;
      case 'KNOWLEDGE_BASE':
        navigate('/kb');
        break;
      default:
        navigate('/practice');
    }
  };

  const unlockedBadges = [
    { name: 'Consistency Champion', icon: '🔥', desc: 'Maintained a 5-day active streak' },
    { name: 'Fast Solver', icon: '⚡', desc: 'Resolved an algorithm in under 2 minutes' },
    { name: 'Perfect Accuracy', icon: '🎯', desc: 'Passed all test cases on first compile run' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
            Dashboard Overview
          </h2>
          <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
            Track your personalized AI study tracks, diagnostic goals, and progress achievements.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark px-3.5 py-2 rounded-xl text-content-primary-light dark:text-content-primary-dark font-mono">
          <Calendar className="h-4 w-4 text-primary" /> Active Cohort
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loadingSummary ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="animate-pulse h-24 rounded-xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark" />
          ))
        ) : (
          <>
            <Card onClick={() => navigate('/progress')} className="flex items-center gap-4 cursor-pointer hover-card-premium p-4">
              <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500 shrink-0">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-400">
                  Active Streak
                </p>
                <h3 className="text-xl font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">
                  {summary?.currentStreak || 0} Days 🔥
                </h3>
              </div>
            </Card>

            <Card onClick={() => navigate('/practice')} className="flex items-center gap-4 cursor-pointer hover-card-premium p-4">
              <div className="rounded-xl bg-green-500/10 p-3 text-green-500 shrink-0">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-400">
                  Problems Solved
                </p>
                <h3 className="text-xl font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">
                  {summary?.solvedCount || 0} Algorithms
                </h3>
              </div>
            </Card>

            <Card onClick={() => navigate('/interview')} className="flex items-center gap-4 cursor-pointer hover-card-premium p-4">
              <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-400">
                  Mock Interviews
                </p>
                <h3 className="text-xl font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">
                  {summary?.interviewSessionsCount || 0} Sessions
                </h3>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* AI Recommendation Insight */}
      {loadingInsight ? (
        <div className="animate-pulse h-28 rounded-xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark" />
      ) : errorInsight ? (
        <div className="rounded-xl bg-danger/5 border border-danger/20 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-danger/10 p-2 text-danger">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-content-primary-light dark:text-content-primary-dark text-xs">
                  AI insights is temporarily busy
                </h4>
                <p className="text-xs text-content-secondary-light dark:text-gray-400 mt-0.5 leading-relaxed font-sans">
                  Free API quota limits were exceeded. Practice algorithm questions in the hub directly in the meantime!
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/practice')} variant="danger" className="flex items-center gap-2 text-xs py-1.5 px-3">
              Open Practice Hub <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="glow-pulse rounded-xl bg-surface-light border border-border-light p-5 dark:bg-surface-dark dark:border-border-dark">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-ai/10 p-2 text-ai animate-pulse shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-content-primary-light dark:text-content-primary-dark text-sm">
                    AI Mentor Insights
                  </h4>
                  <Badge variant="ai" className="text-[9px] py-0 px-1.5 font-bold">Recommended Path</Badge>
                </div>
                <p className="text-content-secondary-light dark:text-gray-300 mt-1 font-semibold font-sans">
                  {insight?.summary}
                </p>
                <p className="text-[10px] text-content-muted-light dark:text-gray-400 mt-1 font-mono">
                  {insight?.recommendation}
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleRecommendationAction(insight?.targetModule || 'PRACTICE')}
              variant="ai"
              className="flex items-center gap-2 text-xs py-1.5 px-4 shadow-glow-ai shrink-0"
            >
              Open Track <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Main grids: Goal and Badges */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Goal & Activities */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border-light pb-3 dark:border-border-dark">
            <Compass className="h-4.5 w-4.5 text-primary" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark">
              Daily Target Checklist
            </h4>
          </div>
          
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex items-start gap-3 bg-brand-light dark:bg-brand-dark p-3 rounded-xl border border-border-light dark:border-border-dark">
              <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold shrink-0">✔</div>
              <div>
                <p className="font-bold text-content-primary-light dark:text-content-primary-dark">Establish initial goals</p>
                <p className="text-[10px] text-content-secondary-light dark:text-gray-400">Configure language goals inside the practice hub.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-brand-light dark:bg-brand-dark p-3 rounded-xl border border-border-light dark:border-border-dark opacity-60">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 font-mono">1</div>
              <div>
                <p className="font-bold text-content-primary-light dark:text-content-primary-dark">Solve 2 algorithms</p>
                <p className="text-[10px] text-content-secondary-light dark:text-gray-400">Complete challenges in the practice roadmap.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-brand-light dark:bg-brand-dark p-3 rounded-xl border border-border-light dark:border-border-dark opacity-60">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 font-mono">2</div>
              <div>
                <p className="font-bold text-content-primary-light dark:text-content-primary-dark">Complete 1 mock prep session</p>
                <p className="text-[10px] text-content-secondary-light dark:text-gray-400">Run a 10-question simulation under FAANG difficulty.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Unlocked Badges Case */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border-light pb-3 dark:border-border-dark">
            <Award className="h-4.5 w-4.5 text-primary" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark">
              Developer Badges Case
            </h4>
          </div>

          <div className="space-y-3.5">
            {unlockedBadges.map((b, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark rounded-xl flex items-center justify-center text-lg shrink-0">
                  {b.icon}
                </div>
                <div className="text-xs">
                  <p className="font-bold text-content-primary-light dark:text-content-primary-dark">{b.name}</p>
                  <p className="text-[10px] text-content-muted-light dark:text-gray-400 font-sans mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
