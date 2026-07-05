import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { progressService, ProgressSummary } from '../services/progressService';
import { Award, Sparkles, TrendingUp, Calendar, BookOpen, Layers } from 'lucide-react';

export const Progress: React.FC = () => {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await progressService.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load progress details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
          Progress Tracker
        </h2>
        <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
          Review your learning analytics, XP progression, and on-demand AI roadmap recommendations.
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-20 bg-surface-light border border-border-light rounded-xl dark:bg-surface-dark dark:border-border-dark" />
            ))}
          </div>
          <div className="h-40 bg-surface-light border border-border-light rounded-xl dark:bg-surface-dark dark:border-border-dark" />
        </div>
      ) : (
        <>
          {/* Analytics Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Current Level</p>
                <h4 className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">Level {summary?.level}</h4>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Total XP</p>
                <h4 className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">{summary?.totalXp} XP</h4>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5 text-success">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Solved</p>
                <h4 className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">{summary?.problemsSolved} Problems</h4>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="rounded-lg bg-ai/10 p-2.5 text-ai">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Attempts</p>
                <h4 className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">{summary?.totalSubmissions} Code Runs</h4>
              </div>
            </Card>
          </div>

          {/* AI Roadmap Insights Banner */}
          <div className="glow-pulse rounded-xl bg-surface-light border border-border-light p-6 dark:bg-surface-dark dark:border-border-dark">
            <div className="flex items-start gap-3.5">
              <div className="rounded-lg bg-ai/10 p-2.5 text-ai animate-pulse shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-content-primary-light dark:text-content-primary-dark">
                    AI Progression Advisor
                  </h4>
                  <Badge variant="ai" className="text-[9px] py-0.5 px-2">On Demand Analysis</Badge>
                </div>
                <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark mt-2 leading-relaxed">
                  {summary?.aiRoadmapRecommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Daily, Weekly, and Monthly Progress Goals */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Daily Target */}
            <Card hoverGlow className="p-5 space-y-3.5 border-l-4 border-l-primary bg-surface-light dark:bg-surface-dark">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Daily Target</span>
                <Badge variant="brand">Today</Badge>
              </div>
              <div>
                <h4 className="text-sm font-bold text-content-primary-light dark:text-content-primary-dark">Daily Solve Target</h4>
                <p className="text-[10.5px] text-content-secondary-light dark:text-gray-400 mt-0.5 leading-normal">
                  Solve 1 challenge in the practice hub to maintain active streak momentum.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-content-secondary-light dark:text-gray-300">Status</span>
                  <span className="text-primary">
                    {summary && summary.problemsSolved > 0 ? '1 / 1 Solved' : '0 / 1 Solved'}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-brand-light dark:bg-brand-dark overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: summary && summary.problemsSolved > 0 ? '100%' : '0%' }}
                  />
                </div>
              </div>
            </Card>

            {/* Weekly Target */}
            <Card hoverGlow className="p-5 space-y-3.5 border-l-4 border-l-ai bg-surface-light dark:bg-surface-dark">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Weekly Target</span>
                <Badge variant="ai">This Week</Badge>
              </div>
              <div>
                <h4 className="text-sm font-bold text-content-primary-light dark:text-content-primary-dark">Weekly Code Submissions</h4>
                <p className="text-[10.5px] text-content-secondary-light dark:text-gray-400 mt-0.5 leading-normal">
                  Aim for 10 compiler test suite runs to test logic edge-cases.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-content-secondary-light dark:text-gray-300">Status</span>
                  <span className="text-ai">
                    {summary ? Math.min(summary.totalSubmissions, 10) : 0} / 10 Runs
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-brand-light dark:bg-brand-dark overflow-hidden">
                  <div
                    className="h-full bg-ai rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(((summary?.totalSubmissions || 0) / 10) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Monthly Target */}
            <Card hoverGlow className="p-5 space-y-3.5 border-l-4 border-l-amber-500 bg-surface-light dark:bg-surface-dark">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Monthly Target</span>
                <Badge variant="warning">This Month</Badge>
              </div>
              <div>
                <h4 className="text-sm font-bold text-content-primary-light dark:text-content-primary-dark">Monthly XP Progression</h4>
                <p className="text-[10.5px] text-content-secondary-light dark:text-gray-400 mt-0.5 leading-normal">
                  Earn 500 progression points to rank up to next major level.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-content-secondary-light dark:text-gray-300">Status</span>
                  <span className="text-amber-500">
                    {summary?.totalXp || 0} / 500 XP
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-brand-light dark:bg-brand-dark overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(((summary?.totalXp || 0) / 500) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Time Series Activity bar graph */}
          <div className="grid gap-6 lg:grid-cols-3">

            <Card className="lg:col-span-2">
              <div className="flex items-center gap-2 border-b border-border-light pb-3 mb-4 dark:border-border-dark">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                <h4 className="font-bold text-content-primary-light dark:text-content-primary-dark">
                  Weekly Activity Logs
                </h4>
              </div>

              {/* Simple CSS-based bar graph */}
              <div className="h-48 flex items-end justify-between gap-2.5 px-4 pt-4 border-b border-border-light dark:border-border-dark">
                {summary?.activityTrends.map((trend, index) => {
                  const maxCount = Math.max(...summary.activityTrends.map(t => t.count), 1);
                  const barHeightPercent = Math.max((trend.count / maxCount) * 100, 5); // Minimum height is 5%

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full relative flex items-end justify-center">
                        {/* Tooltip */}
                        <span className="absolute -top-6 text-[9px] font-bold bg-primary text-white py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                          {trend.count} runs
                        </span>
                        
                        {/* Bar */}
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-primary to-ai group-hover:opacity-85 transition-all duration-200"
                          style={{ height: `${barHeightPercent}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-content-muted-light dark:text-content-muted-dark rotate-12 mt-1 shrink-0">
                        {trend.date.substring(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Achievements Sidebar */}
            <Card className="lg:col-span-1">
              <div className="flex items-center gap-2 border-b border-border-light pb-3 mb-4 dark:border-border-dark">
                <Award className="h-4.5 w-4.5 text-amber-500" />
                <h4 className="font-bold text-content-primary-light dark:text-content-primary-dark">
                  Achievements Tracker
                </h4>
              </div>

              <div className="space-y-3.5 text-xs text-content-secondary-light dark:text-content-secondary-dark">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 text-lg">
                    🎓
                  </div>
                  <div>
                    <p className="font-bold text-content-primary-light dark:text-content-primary-dark">First Steps</p>
                    <p className="text-[10px] text-content-muted-light dark:text-content-muted-dark mt-0.5">Solve first coding problem</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-40">
                  <div className="h-8 w-8 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-500 shrink-0 text-lg">
                    🔒
                  </div>
                  <div>
                    <p className="font-bold text-content-primary-light dark:text-content-primary-dark">Algorithm Ace</p>
                    <p className="text-[10px] text-content-muted-light dark:text-content-muted-dark mt-0.5">Solve 15 algorithm problems</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-40">
                  <div className="h-8 w-8 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-500 shrink-0 text-lg">
                    🔒
                  </div>
                  <div>
                    <p className="font-bold text-content-primary-light dark:text-content-primary-dark">Chat Master</p>
                    <p className="text-[10px] text-content-muted-light dark:text-content-muted-dark mt-0.5">Start 10 mentor conversations</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
