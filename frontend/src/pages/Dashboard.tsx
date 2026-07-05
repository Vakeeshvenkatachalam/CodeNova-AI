import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { dashboardService, DashboardSummary, DashboardInsight } from '../services/dashboardService';
import { Flame, CheckCircle, Target, Sparkles, ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
          Dashboard Overview
        </h2>
        <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
          Monitor your coding statistics and view customized AI learning tracks.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loadingSummary ? (
          // Pulse Skeletons for stats
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="animate-pulse h-24 rounded-xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark" />
          ))
        ) : (
          <>
            <Card hoverGlow onClick={() => navigate('/progress')} className="flex items-center gap-4 cursor-pointer hover:border-orange-500/30 transition-all duration-200">
              <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">
                  Active Streak
                </p>
                <h3 className="text-2xl font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">
                  {summary?.currentStreak || 0} Days 🔥
                </h3>
              </div>
            </Card>

            <Card hoverGlow onClick={() => navigate('/practice')} className="flex items-center gap-4 cursor-pointer hover:border-success/30 transition-all duration-200">
              <div className="rounded-xl bg-success/10 p-3 text-success">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">
                  Problems Solved
                </p>
                <h3 className="text-2xl font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">
                  {summary?.solvedCount || 0} Problems
                </h3>
              </div>
            </Card>

            <Card hoverGlow onClick={() => navigate('/interview')} className="flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-all duration-200">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">
                  Mock Interviews
                </p>
                <h3 className="text-2xl font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">
                  {summary?.interviewSessionsCount || 0} Sessions
                </h3>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* AI Recommendation Alert */}
      {loadingInsight ? (
        <div className="animate-pulse h-28 rounded-xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark" />
      ) : errorInsight ? (
        // Fail-safe default fallback card if rate-limited or offline
        <div className="rounded-xl bg-danger/5 border border-danger/20 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-danger/10 p-2 text-danger">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-content-primary-light dark:text-content-primary-dark">
                  AI insights is temporarily busy
                </h4>
                <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-0.5">
                  Free quota limits were hit. Start practicing some algorithm questions in the hub instead!
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/practice')}
              variant="danger"
              className="flex items-center gap-2 text-xs py-1.5 px-3"
            >
              Open Practice Hub <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="glow-pulse rounded-xl bg-surface-light border border-border-light p-6 dark:bg-surface-dark dark:border-border-dark">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-ai/10 p-2 text-ai animate-pulse">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-content-primary-light dark:text-content-primary-dark">
                    AI Mentor Insights
                  </h4>
                  <Badge variant="ai" className="text-[10px] py-0 px-1.5">Cached 24h</Badge>
                </div>
                <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
                  <strong>Status:</strong> {insight?.summary}
                </p>
                <p className="text-xs text-content-muted-light dark:text-content-muted-dark mt-1 font-mono">
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

      {/* Dashboard details grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between border-b border-border-light pb-4 mb-4 dark:border-border-dark">
            <h4 className="font-bold text-content-primary-light dark:text-content-primary-dark">
              Recent Activity
            </h4>
            <Badge variant="brand">Real-Time Sync</Badge>
          </div>

          {loadingSummary ? (
            <div className="animate-pulse space-y-3">
              <div className="h-12 bg-brand-light dark:bg-brand-dark rounded-lg" />
              <div className="h-12 bg-brand-light dark:bg-brand-dark rounded-lg" />
            </div>
          ) : !summary || summary.recentActivities.length === 0 ? (
            // Friendly Empty State
            <div className="text-center py-10 border border-dashed border-border-light dark:border-border-dark rounded-lg">
              <BookOpen className="h-8 w-8 text-content-muted-light dark:text-content-muted-dark mx-auto mb-2" />
              <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark">
                You haven't solved any problems yet!
              </p>
              <Button
                onClick={() => navigate('/practice')}
                variant="secondary"
                className="text-xs py-1.5 px-3 mt-3"
              >
                Start Practice Now
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {summary.recentActivities.map((act, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-brand-light dark:bg-brand-dark p-3 transition-colors duration-200"
                >
                  <div>
                    <p className="text-sm font-semibold text-content-primary-light dark:text-content-primary-dark">
                      {act.name}
                    </p>
                    <p className="text-xs text-content-muted-light dark:text-content-muted-dark mt-0.5">
                      {new Date(act.time).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={act.status === 'PASSED' ? 'success' : 'danger'}>
                    {act.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Unlocked Badges */}
        <Card>
          <div className="flex items-center justify-between border-b border-border-light pb-4 mb-4 dark:border-border-dark">
            <h4 className="font-bold text-content-primary-light dark:text-content-primary-dark">
              Unlocked Achievements
            </h4>
            <Badge variant="warning">Portfolio Badges</Badge>
          </div>

          {/* Currently simple mock badges unlocked.
              Full achievements evaluations will map user progress logic in Phase 11. */}
          <div className="flex flex-wrap gap-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-border-light bg-brand-light p-2.5 dark:border-border-dark dark:bg-brand-dark">
              <div className="h-7 w-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs font-bold">
                🏆
              </div>
              <div>
                <p className="text-xs font-bold text-content-primary-light dark:text-content-primary-dark">First Steps</p>
                <p className="text-[10px] text-content-muted-light dark:text-content-muted-dark">Solves first problem</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 rounded-lg border border-border-light bg-brand-light p-2.5 dark:border-border-dark dark:bg-brand-dark opacity-40">
              <div className="h-7 w-7 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500 text-xs font-bold">
                🔒
              </div>
              <div>
                <p className="text-xs font-bold text-content-primary-light dark:text-content-primary-dark">SQL Specialist</p>
                <p className="text-[10px] text-content-muted-light dark:text-content-muted-dark">Solve 10 SQL problems</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
