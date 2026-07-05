import React, { useEffect, useState } from 'react';
import { adminService, AdminReport } from '../../services/adminService';
import { BarChart2, Award, Users, Cpu } from 'lucide-react';

const LANGUAGE_COLORS = [
  'from-primary to-ai',
  'from-green-500 to-emerald-400',
  'from-amber-500 to-yellow-400',
  'from-purple-500 to-violet-400',
  'from-rose-500 to-pink-400',
  'from-cyan-500 to-teal-400',
];

export const AdminAnalyticsPage: React.FC = () => {
  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await adminService.getOverallReport();
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
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-72 bg-gray-800 rounded-2xl" />
          <div className="h-72 bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const langEntries = report ? Object.entries(report.languageDistribution).sort((a, b) => b[1] - a[1]) : [];
  const totalLangSolves = langEntries.reduce((acc, [, c]) => acc + c, 0);

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Language Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Which programming languages students excel in and overall participation breakdown.</p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Students', value: report?.totalUsers ?? 0, icon: Users, color: 'text-primary bg-primary/10' },
          { label: 'Participation Rate', value: `${report ? report.participationRate.toFixed(1) : 0}%`, icon: BarChart2, color: 'text-green-400 bg-green-500/10' },
          { label: 'Languages Tracked', value: langEntries.length, icon: Cpu, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Top Language', value: langEntries[0]?.[0] ?? 'N/A', icon: Award, color: 'text-purple-400 bg-purple-500/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#0d1117] border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{stat.label}</p>
                <p className="text-lg font-extrabold text-white mt-0.5">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar chart visualization */}
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-4">
            <BarChart2 className="h-4.5 w-4.5 text-primary" />
            <h2 className="font-bold text-white text-sm">Solve Distribution by Language</h2>
          </div>

          {langEntries.length > 0 ? (
            <div className="space-y-5">
              {langEntries.map(([lang, count], idx) => {
                const pct = totalLangSolves > 0 ? (count / totalLangSolves) * 100 : 0;
                const colorClass = LANGUAGE_COLORS[idx % LANGUAGE_COLORS.length];
                return (
                  <div key={lang} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-sm bg-gradient-to-r ${colorClass}`} />
                        <span className="text-white">{lang}</span>
                      </div>
                      <span className="text-gray-400">{count} students · {pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-600 text-xs">No language data tracked yet.</div>
          )}
        </div>

        {/* Donut-style representation and strong students */}
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-4">
            <Award className="h-4.5 w-4.5 text-amber-400" />
            <h2 className="font-bold text-white text-sm">Language Dominance Breakdown</h2>
          </div>

          <div className="space-y-4">
            {langEntries.map(([lang, count], idx) => {
              const pct = totalLangSolves > 0 ? (count / totalLangSolves) * 100 : 0;
              const colorClass = LANGUAGE_COLORS[idx % LANGUAGE_COLORS.length];
              const rank = idx + 1;
              return (
                <div key={lang} className="flex items-center gap-4 p-3 bg-gray-900/40 border border-gray-800/60 rounded-xl">
                  <div className="text-lg font-extrabold text-gray-700 w-6 shrink-0">#{rank}</div>
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-extrabold text-xs shrink-0`}>
                    {lang.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{lang}</p>
                    <p className="text-[10px] text-gray-500">{count} students excelling · {pct.toFixed(1)}% of learners</p>
                  </div>
                  {rank === 1 && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      TOP
                    </span>
                  )}
                </div>
              );
            })}
            {langEntries.length === 0 && (
              <div className="py-10 text-center text-gray-600 text-xs">Language data will appear here as students submit solutions.</div>
            )}
          </div>

          <div className="bg-primary/5 border border-primary/15 rounded-xl p-3.5 text-[11px] text-gray-400 leading-relaxed">
            <strong className="text-primary">Note:</strong> Language strengths are calculated based on the number of correct (PASSED) submissions made by each student. A student's strongest language reflects where they have the most successful code runs.
          </div>
        </div>
      </div>
    </div>
  );
};
