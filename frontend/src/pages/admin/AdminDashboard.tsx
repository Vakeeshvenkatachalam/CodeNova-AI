import React, { useEffect, useState } from 'react';
import { adminService, AdminMetrics, AdminReport } from '../../services/adminService';
import {
  Users, BookOpen, Library, BarChart2, Activity, Award,
  TrendingUp, MessageSquare, Zap, Shield
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [m, r] = await Promise.all([
          adminService.getPlatformMetrics(),
          adminService.getOverallReport(),
        ]);
        setMetrics(m);
        setReport(r);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-64 bg-gray-800 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-800 rounded-xl" />)}
        </div>
        <div className="h-72 bg-gray-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Live analytics snapshot across all student accounts and activity metrics.</p>
      </div>

      {/* Top stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Registered Students</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{metrics?.totalUsersCount ?? '-'}</p>
          </div>
        </div>
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-green-500/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Code Runs</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{metrics?.totalSubmissionsCount ?? '-'}</p>
          </div>
        </div>
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Practice Problems</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{metrics?.totalPracticeProblemsCount ?? '-'}</p>
          </div>
        </div>
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Library className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">RAG PDF Documents</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{metrics?.totalKnowledgeDocumentsCount ?? '-'}</p>
          </div>
        </div>
      </div>

      {/* Monthly engagement report */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-[#0d1117] border border-gray-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-4">
            <BarChart2 className="h-4.5 w-4.5 text-primary" />
            <h2 className="font-bold text-white text-sm">Monthly Engagement Report</h2>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {[
              { label: 'Active Logins Today', value: `${report?.activeLoginsToday ?? 0} Students`, color: 'border-l-primary' },
              { label: 'Participation Rate', value: `${report ? report.participationRate.toFixed(1) : 0}%`, color: 'border-l-green-500' },
              { label: 'Avg XP per Student', value: `${report ? report.averageXpPerUser.toFixed(0) : 0} XP`, color: 'border-l-amber-500' },
              { label: 'Monthly Code Runs', value: `${report?.currentMonthSubmissions ?? 0}`, color: 'border-l-purple-500' },
              { label: 'Total AI Chat Sessions', value: `${report?.totalSessions ?? 0}`, color: 'border-l-cyan-500' },
              { label: 'Cumulative XP Earned', value: `${report?.totalXpOverall ?? 0} XP`, color: 'border-l-rose-500' },
            ].map((stat) => (
              <div key={stat.label} className={`bg-gray-900/50 border-l-2 ${stat.color} rounded-r-lg p-3`}>
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{stat.label}</p>
                <p className="text-sm font-extrabold text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Activity className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Activity Report Summary</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-white">
                    {report ? Math.round(report.totalUsers * (report.participationRate / 100)) : 0} of {report?.totalUsers ?? 0} students
                  </strong>{' '}
                  have participated this period. The platform has accumulated{' '}
                  <strong className="text-white">{report?.totalXpOverall ?? 0} XP</strong> across all learners,
                  with an average of <strong className="text-white">{report ? report.averageXpPerUser.toFixed(0) : 0} XP</strong> per registered student.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Language distribution */}
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-4">
            <Award className="h-4.5 w-4.5 text-amber-400" />
            <h2 className="font-bold text-white text-sm">Language Strengths</h2>
          </div>
          <div className="space-y-4">
            {report && Object.keys(report.languageDistribution).length > 0 ? (
              Object.entries(report.languageDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([lang, count]) => {
                  const total = Object.values(report.languageDistribution).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={lang} className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-white">{lang}</span>
                        <span className="text-gray-400">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-ai rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-[11px] text-gray-500 italic text-center py-8">No solve data tracked yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
