import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { adminService, UserDetail, AdminMetrics, AdminUserProgress, AdminReport } from '../services/adminService';
import { Users, Shield, BookOpen, Library, ArrowUpCircle, ArrowDownCircle, Settings, Clipboard, Key, Award, BarChart2, Activity, User, X, Cpu, MessageSquare } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'config'>('overview');
  
  // Data States
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [selectedUserProgress, setSelectedUserProgress] = useState<AdminUserProgress | null>(null);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  
  // AI Config fields
  const [newApiKey, setNewApiKey] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState('');
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersData = await adminService.listUsers();
      const metricsData = await adminService.getPlatformMetrics();
      const reportData = await adminService.getOverallReport();
      setUsers(usersData);
      setMetrics(metricsData);
      setReport(reportData);
    } catch (err) {
      console.error('Failed to load admin panel details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccess = async (id: number, currentRole: string) => {
    const action = currentRole === 'ROLE_ADMIN' ? 'DEMOTE' : 'PROMOTE';
    const confirmMsg = currentRole === 'ROLE_ADMIN'
      ? 'Are you sure you want to demote this Admin to User role?'
      : 'Are you sure you want to promote this User to Admin role?';

    if (confirm(confirmMsg)) {
      setUpdatingUserId(id);
      try {
        await adminService.toggleUserAccess(id, action);
        // Refresh users list
        const refreshedUsers = await adminService.listUsers();
        setUsers(refreshedUsers);
      } catch (err) {
        console.error('Failed to toggle user access level:', err);
      } finally {
        setUpdatingUserId(null);
      }
    }
  };

  const handleViewDetails = async (userId: number) => {
    setLoadingDetails(true);
    setSelectedUserProgress(null);
    try {
      const details = await adminService.getUserProgress(userId);
      setSelectedUserProgress(details);
    } catch (err) {
      console.error('Failed to load student details report:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKey.trim()) return;

    setSavingConfig(true);
    setConfigSuccess('');
    setConfigError('');
    try {
      const res = await adminService.updateConfig(newApiKey);
      setConfigSuccess(res.message);
      setNewApiKey('');
      // Reload overview configs
      const reportData = await adminService.getOverallReport();
      setReport(reportData);
    } catch (err: any) {
      setConfigError(err.response?.data?.message || 'Failed to update system API key');
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-surface-light border border-border-light rounded-xl dark:bg-surface-dark dark:border-border-dark" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-20 bg-surface-light border border-border-light rounded-xl dark:bg-surface-dark dark:border-border-dark" />
          ))}
        </div>
        <div className="h-60 bg-surface-light border border-border-light rounded-xl dark:bg-surface-dark dark:border-border-dark" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
            Admin Moderation Panel
          </h2>
          <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
            Audit study engagement metrics, inspect individual student records, and modify active AI system configs.
          </p>
        </div>

        {/* Tab Switcher Controls */}
        <div className="flex p-1 bg-brand-light dark:bg-brand-dark rounded-xl border border-border-light dark:border-border-dark shrink-0 max-w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-surface-dark shadow text-primary'
                : 'text-content-secondary-light dark:text-gray-400 hover:text-content-primary-light'
            }`}
          >
            Overview & Reports
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-white dark:bg-surface-dark shadow text-primary'
                : 'text-content-secondary-light dark:text-gray-400 hover:text-content-primary-light'
            }`}
          >
            Student Directory
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'config'
                ? 'bg-white dark:bg-surface-dark shadow text-primary'
                : 'text-content-secondary-light dark:text-gray-400 hover:text-content-primary-light'
            }`}
          >
            System AI Configs
          </button>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Total Registered</p>
            <h4 className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">
              {metrics?.totalUsersCount} Profiles
            </h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="rounded-lg bg-success/10 p-2.5 text-success">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Total Code Runs</p>
            <h4 className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">
              {metrics?.totalSubmissionsCount} Runs
            </h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Curriculum Challenges</p>
            <h4 className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">
              {metrics?.totalPracticeProblemsCount} Problems
            </h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="rounded-lg bg-ai/10 p-2.5 text-ai">
            <Library className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">RAG Vector Docs</p>
            <h4 className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5">
              {metrics?.totalKnowledgeDocumentsCount} PDFs
            </h4>
          </div>
        </Card>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Monthly Report Summary */}
          <Card className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 border-b border-border-light pb-3 mb-4 dark:border-border-dark">
              <BarChart2 className="h-4.5 w-4.5 text-primary" />
              <h4 className="font-bold text-content-primary-light dark:text-content-primary-dark">
                Overall Study Engagement & Monthly Reports
              </h4>
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              <div className="p-3 bg-brand-light/40 dark:bg-brand-dark/20 border-l-2 border-l-primary rounded-r">
                <span className="text-[10px] font-bold text-content-muted-light dark:text-gray-500 block uppercase">Logins Today</span>
                <span className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5 block">
                  {report?.activeLoginsToday} Students
                </span>
              </div>
              <div className="p-3 bg-brand-light/40 dark:bg-brand-dark/20 border-l-2 border-l-ai rounded-r">
                <span className="text-[10px] font-bold text-content-muted-light dark:text-gray-500 block uppercase">Participation Rate</span>
                <span className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5 block">
                  {report ? report.participationRate.toFixed(1) : 0}%
                </span>
              </div>
              <div className="p-3 bg-brand-light/40 dark:bg-brand-dark/20 border-l-2 border-l-amber-500 rounded-r">
                <span className="text-[10px] font-bold text-content-muted-light dark:text-gray-500 block uppercase">Average XP Per User</span>
                <span className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5 block">
                  {report ? report.averageXpPerUser.toFixed(0) : 0} XP
                </span>
              </div>
              <div className="p-3 bg-brand-light/40 dark:bg-brand-dark/20 border-l-2 border-l-success rounded-r">
                <span className="text-[10px] font-bold text-content-muted-light dark:text-gray-500 block uppercase">Month Solves (Runs)</span>
                <span className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5 block">
                  {report?.currentMonthSubmissions} Runs
                </span>
              </div>
              <div className="p-3 bg-brand-light/40 dark:bg-brand-dark/20 border-l-2 border-l-purple-500 rounded-r">
                <span className="text-[10px] font-bold text-content-muted-light dark:text-gray-500 block uppercase">Overall Sessions</span>
                <span className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5 block">
                  {report?.totalSessions} Chats
                </span>
              </div>
              <div className="p-3 bg-brand-light/40 dark:bg-brand-dark/20 border-l-2 border-l-indigo-500 rounded-r">
                <span className="text-[10px] font-bold text-content-muted-light dark:text-gray-500 block uppercase">Total XP Accumulation</span>
                <span className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark mt-0.5 block">
                  {report?.totalXpOverall} XP
                </span>
              </div>
            </div>

            {/* Participation summary */}
            <div className="bg-primary/5 dark:bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-2 mt-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                <Activity className="h-4 w-4" /> Activity Report Analysis
              </h5>
              <p className="text-xs text-content-secondary-light dark:text-gray-300 leading-relaxed">
                Currently, <strong>{report ? (report.totalUsers * (report.participationRate / 100)).toFixed(0) : 0} out of {report?.totalUsers} registered students</strong> have submitted compilation requests or initiated mentor chat sessions. Overall language strengths indicate Java remains the dominant learning preference followed by Python.
              </p>
            </div>
          </Card>

          {/* Language Strengths distribution */}
          <Card className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2 border-b border-border-light pb-3 mb-4 dark:border-border-dark">
              <Award className="h-4.5 w-4.5 text-amber-500" />
              <h4 className="font-bold text-content-primary-light dark:text-content-primary-dark">
                Language Strengths
              </h4>
            </div>

            <div className="space-y-4">
              {report && Object.keys(report.languageDistribution).length > 0 ? (
                Object.entries(report.languageDistribution).map(([lang, count]) => {
                  const total = Object.values(report.languageDistribution).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  
                  return (
                    <div key={lang} className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-content-primary-light dark:text-content-primary-dark">{lang}</span>
                        <span className="text-primary">{count} Students ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-brand-light dark:bg-brand-dark overflow-hidden border border-border-light dark:border-border-dark">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-ai rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-content-muted-light dark:text-gray-500 italic text-center py-6">
                  No solve distributions tracked yet.
                </p>
              )}
              <p className="text-[10px] text-content-muted-light dark:text-gray-500 leading-normal">
                Reflects the programming language where students have unlocked the highest number of correct (PASSED) code submissions.
              </p>
            </div>
          </Card>

        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* User management panel table */}
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-border-light pb-3 mb-4 dark:border-border-dark">
              <Users className="h-4.5 w-4.5 text-primary" />
              <h4 className="font-bold text-content-primary-light dark:text-content-primary-dark">
                User Profiles Directory
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs leading-relaxed border-collapse">
                <thead>
                  <tr className="border-b border-border-light dark:border-border-dark text-content-muted-light dark:text-content-muted-dark uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">System Role</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark text-content-secondary-light dark:text-content-secondary-dark">
                  {users.map((usr) => (
                    <tr key={usr.id} className="hover:bg-brand-light/50 dark:hover:bg-brand-dark/50 transition-colors duration-150">
                      <td className="py-3 px-3 font-semibold">
                        <div>
                          <span>{usr.email}</span>
                          <span className="block text-[10px] text-content-muted-light dark:text-gray-500 font-mono">ID: {usr.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={usr.role === 'ROLE_ADMIN' ? 'brand' : 'secondary'}>
                          {usr.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <Button
                          onClick={() => handleViewDetails(usr.id)}
                          variant="secondary"
                          className="text-[10px] py-1 px-2.5 h-7"
                        >
                          View Progress
                        </Button>
                        <Button
                          onClick={() => handleToggleAccess(usr.id, usr.role)}
                          isLoading={updatingUserId === usr.id}
                          variant={usr.role === 'ROLE_ADMIN' ? 'danger' : 'primary'}
                          className="text-[10px] py-1 px-2.5 h-7 inline-flex items-center gap-1"
                        >
                          {usr.role === 'ROLE_ADMIN' ? <ArrowDownCircle className="h-3 w-3" /> : <ArrowUpCircle className="h-3 w-3" />}
                          {usr.role === 'ROLE_ADMIN' ? 'Demote' : 'Promote'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Student Progress details sidebar */}
          <Card className="lg:col-span-1 relative min-h-[400px] overflow-hidden">
            {loadingDetails ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-[#121927]/50">
                <span className="text-xs text-content-secondary-light dark:text-gray-300 animate-pulse">Loading progress details...</span>
              </div>
            ) : selectedUserProgress ? (
              <div className="space-y-5 animate-fade-in">
                {/* Header detail */}
                <div className="flex justify-between items-start border-b border-border-light pb-3 dark:border-border-dark">
                  <div>
                    <h4 className="font-bold text-content-primary-light dark:text-content-primary-dark truncate max-w-[180px]">
                      {selectedUserProgress.name || 'Anonymous Coder'}
                    </h4>
                    <p className="text-[10.5px] text-content-muted-light dark:text-gray-500 truncate max-w-[180px]">
                      {selectedUserProgress.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedUserProgress(null)}
                    className="p-1 hover:bg-brand-light dark:hover:bg-brand-dark rounded text-content-secondary-light dark:text-gray-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Level details badge */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-ai flex items-center justify-center text-white font-bold text-sm">
                    {selectedUserProgress.level}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-500">
                      <span>Progression Level</span>
                      <span>{selectedUserProgress.totalXp} XP</span>
                    </div>
                    <div className="h-1.5 w-full bg-brand-light dark:bg-brand-dark rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-primary" style={{ width: `${selectedUserProgress.totalXp % 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Stats summary rows */}
                <div className="grid gap-2 grid-cols-3 text-center border-y border-border-light py-3 dark:border-border-dark">
                  <div>
                    <span className="text-[9px] font-bold text-content-muted-light dark:text-gray-500 uppercase block">Solves</span>
                    <span className="font-bold text-xs text-content-primary-light dark:text-content-primary-dark">{selectedUserProgress.problemsSolved}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-content-muted-light dark:text-gray-500 uppercase block">Runs</span>
                    <span className="font-bold text-xs text-content-primary-light dark:text-content-primary-dark">{selectedUserProgress.totalSubmissions}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-content-muted-light dark:text-gray-500 uppercase block">Chats</span>
                    <span className="font-bold text-xs text-content-primary-light dark:text-content-primary-dark">{selectedUserProgress.totalSessions}</span>
                  </div>
                </div>

                {/* Preferred & Strongest languages */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-content-secondary-light dark:text-gray-400">Preferred Language:</span>
                    <span className="font-bold text-primary">{selectedUserProgress.preferredLanguage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-secondary-light dark:text-gray-400">Strongest Language:</span>
                    <span className="font-bold text-ai">{selectedUserProgress.strongestLanguage}</span>
                  </div>
                </div>

                {/* Bio text detail */}
                <div className="bg-brand-light/30 dark:bg-brand-dark/20 p-2.5 rounded border border-border-light dark:border-border-dark text-[11px] text-content-secondary-light dark:text-gray-300 italic whitespace-pre-wrap">
                  {selectedUserProgress.bio || 'No bio written yet.'}
                </div>

                {/* Latest submissions table list */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-content-muted-light dark:text-gray-500 uppercase block">Recent Submissions (Last 5)</span>
                  <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                    {selectedUserProgress.recentSubmissions.slice(0, 5).map((sub) => (
                      <div key={sub.id} className="flex justify-between items-center text-[10px] border-b border-border-light/40 dark:border-border-dark/40 pb-1">
                        <span className="truncate max-w-[120px] font-semibold text-content-primary-light dark:text-gray-300">{sub.problemTitle}</span>
                        <div className="flex gap-2 items-center">
                          <span className="font-mono text-content-muted-light dark:text-gray-500 text-[9px]">{sub.language}</span>
                          <Badge variant={sub.status === 'PASSED' ? 'success' : 'danger'} className="text-[8px] py-0 px-1">
                            {sub.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border-light dark:border-border-dark rounded-xl">
                <User className="h-8 w-8 text-content-muted-light dark:text-gray-500 mb-2" />
                <p className="text-xs font-semibold text-content-secondary-light dark:text-gray-400">
                  Select a Student
                </p>
                <p className="text-[10px] text-content-muted-light dark:text-gray-500 mt-1 max-w-[180px]">
                  Click "View Progress" next to a user in the list to audit details.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* AI Settings configuration */}
          <Card className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 border-b border-border-light pb-3 mb-4 dark:border-border-dark">
              <Settings className="h-4.5 w-4.5 text-primary" />
              <h4 className="font-bold text-content-primary-light dark:text-content-primary-dark">
                System API & Model Settings Configurator
              </h4>
            </div>

            {configSuccess && (
              <div className="rounded-lg bg-success/10 border border-success/20 p-3 text-xs text-success">
                {configSuccess}
              </div>
            )}
            {configError && (
              <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 text-xs text-danger">
                {configError}
              </div>
            )}

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                  Active Model Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={report?.activeAilModelName || ''}
                  className="w-full text-xs p-2.5 bg-brand-light dark:bg-brand-dark/20 border border-border-light dark:border-border-dark text-content-muted-light dark:text-gray-500 rounded-lg outline-none cursor-not-allowed"
                />
                <p className="text-[10px] text-content-muted-light dark:text-gray-500">
                  Resolved automatically at startup according to key prefix parameters.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                  Update Gemini/Groq API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="Enter new key value (e.g. gsk_...)"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-brand-light dark:bg-black/20 border border-border-light dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Key className="absolute left-3 top-3.5 h-4 w-4 text-content-muted-light dark:text-gray-500" />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={savingConfig}
                  variant="primary"
                  className="text-xs py-1.5 px-4"
                >
                  Save API Key configuration
                </Button>
              </div>
            </form>
          </Card>

          {/* System API Information */}
          <Card className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2 border-b border-border-light pb-3 mb-4 dark:border-border-dark">
              <Cpu className="h-4.5 w-4.5 text-primary" />
              <h4 className="font-bold text-content-primary-light dark:text-content-primary-dark">
                API Diagnostics
              </h4>
            </div>

            <div className="space-y-3.5 text-xs text-content-secondary-light dark:text-gray-300">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-500 block">API Status</span>
                <span className="font-semibold text-success flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success inline-block"></span> {report?.activeApiKeyStatus}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-500 block">Config Target Path</span>
                <span className="font-mono text-[10px] break-all">{`D:\\Projects\\Codenova-Ai\\.env`}</span>
              </div>

              <div className="bg-primary/5 dark:bg-primary/5 border border-primary/20 p-3 rounded-lg text-[10.5px] leading-relaxed text-primary">
                ⚠️ Updating configuration writes changes to the project's root <strong>.env</strong> file. You will need to stop and restart the Spring Boot backend server for settings to take effect.
              </div>
            </div>
          </Card>

        </div>
      )}
    </div>
  );
};
