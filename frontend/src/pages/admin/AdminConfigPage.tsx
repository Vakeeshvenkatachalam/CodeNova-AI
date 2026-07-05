import React, { useEffect, useState } from 'react';
import { adminService, AdminReport } from '../../services/adminService';
import { Settings, Key, Cpu, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export const AdminConfigPage: React.FC = () => {
  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [newApiKey, setNewApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const r = await adminService.getOverallReport();
      setReport(r);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKey.trim()) return;
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const res = await adminService.updateConfig(newApiKey);
      setSuccess(res.message);
      setNewApiKey('');
      await fetchReport();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update API key.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-64 bg-gray-800 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-80 bg-gray-800 rounded-2xl" />
          <div className="h-80 bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Configuration</h1>
        <p className="text-sm text-gray-500 mt-1">Manage the AI API key and view active model settings for the CodeNova backend.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Key form */}
        <div className="lg:col-span-2 bg-[#0d1117] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-4">
            <Settings className="h-4.5 w-4.5 text-primary" />
            <h2 className="font-bold text-white text-sm">AI API Key Configuration</h2>
          </div>

          {/* Current model info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-1.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Active AI Model</p>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold text-white">{report?.activeAilModelName || 'Not configured'}</p>
              </div>
              <p className="text-[10px] text-gray-600">Resolved automatically from API key prefix at startup.</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-1.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">API Key Status</p>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${report?.activeApiKeyStatus === 'ACTIVE' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <p className={`text-sm font-bold ${report?.activeApiKeyStatus === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>
                  {report?.activeApiKeyStatus || 'Unknown'}
                </p>
              </div>
              <p className="text-[10px] text-gray-600">Backend validates key on every AI request.</p>
            </div>
          </div>

          {/* Alert messages */}
          {success && (
            <div className="flex items-start gap-2.5 rounded-xl bg-green-500/10 border border-green-500/20 p-3.5 text-xs text-green-400">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* API Key update form */}
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                New Gemini / Groq API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="gsk_... or AIza..."
                  className="w-full text-xs pl-9 pr-3 py-3 bg-gray-900/80 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder-gray-600"
                />
                <Key className="absolute left-3 top-3.5 h-4 w-4 text-gray-600" />
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                Paste a new API key. Changes are written to the server's <code className="font-mono text-gray-400">.env</code> file immediately, but the backend must be <strong className="text-amber-400">restarted</strong> to apply the new key.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving || !newApiKey.trim()}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-primary to-ai text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Key className="h-4 w-4" /> Save API Key</>
              )}
            </button>
          </form>
        </div>

        {/* Diagnostics sidebar */}
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-4">
            <Cpu className="h-4.5 w-4.5 text-amber-400" />
            <h2 className="font-bold text-white text-sm">System Diagnostics</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Status indicator */}
            <div className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/15 rounded-xl">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              <div>
                <p className="font-bold text-green-400 text-[10px] uppercase tracking-wide">Backend Online</p>
                <p className="text-gray-600 text-[10px] mt-0.5">Spring Boot server is running and accepting requests.</p>
              </div>
            </div>

            {/* Config path */}
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Config File Path</p>
              <code className="block text-[10px] text-gray-400 bg-gray-900/60 p-2 rounded-lg font-mono break-all">
                D:/Projects/Codenova-Ai/.env
              </code>
            </div>

            {/* Supported providers */}
            <div className="space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Supported AI Providers</p>
              {[
                { name: 'Google Gemini', prefix: 'AIza...', color: 'text-blue-400' },
                { name: 'Groq LLaMA', prefix: 'gsk_...', color: 'text-green-400' },
                { name: 'OpenAI GPT', prefix: 'sk-...', color: 'text-purple-400' },
              ].map((p) => (
                <div key={p.name} className="flex justify-between items-center text-[10px]">
                  <span className={`font-bold ${p.color}`}>{p.name}</span>
                  <span className="font-mono text-gray-600">{p.prefix}</span>
                </div>
              ))}
            </div>

            {/* Warning note */}
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-[10px] text-amber-400 leading-relaxed">
              <strong>⚠ Restart Required</strong><br />
              After saving a new API key, stop and restart the Spring Boot backend for the change to take effect.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
