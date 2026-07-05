import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

// This is the portal access code that guards the admin login screen.
// Change this to a strong secret in production.
const ADMIN_PORTAL_SECRET = 'admin@codenova2024';

export const AdminLogin: React.FC = () => {
  const [step, setStep] = useState<'secret' | 'credentials'>('secret');
  const [portalSecret, setPortalSecret] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePortalAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (portalSecret === ADMIN_PORTAL_SECRET) {
      setError('');
      setStep('credentials');
    } else {
      setError('Invalid portal access code. Contact your system administrator.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await authService.login({ email, password });

      // Persist token & user to localStorage (same shape as normal login)
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify({ email: res.email, role: res.role }));

      if (res.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        // Not an admin — clear and reject
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Access denied. This portal is restricted to administrators only.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dark glow backdrops */}
      <div className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 h-96 w-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Branding */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-red-700 to-indigo-600 shadow-2xl border border-red-500/20 mx-auto">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Portal</h1>
            <p className="text-xs text-gray-500 mt-1">CodeNova AI — Restricted Access</p>
          </div>
        </div>

        {/* Step 1: Portal Secret Gate */}
        {step === 'secret' && (
          <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-red-400">Portal Access Code Required</p>
              <p className="text-[11px] text-gray-500 leading-normal">
                Enter the administrator portal access code to proceed to the login screen.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePortalAccess} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Portal Access Code
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={portalSecret}
                    onChange={(e) => setPortalSecret(e.target.value)}
                    placeholder="Enter portal access code..."
                    autoFocus
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#161b22] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500/50 placeholder-gray-600"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold bg-gradient-to-r from-red-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                Verify Access Code
              </button>
            </form>

            <div className="text-center">
              <Link to="/" className="inline-flex items-center gap-1 text-[10px] text-gray-600 hover:text-gray-400 transition-colors">
                <ArrowLeft className="h-3 w-3" /> Return to Student Platform
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Admin Credentials */}
        {step === 'credentials' && (
          <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping inline-block" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-400">Portal Access Verified</p>
            </div>

            <div className="space-y-0.5">
              <p className="text-sm font-bold text-white">Administrator Sign In</p>
              <p className="text-[11px] text-gray-500">Use your registered admin email and password.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@codenova.ai"
                    autoFocus
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#161b22] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600"
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#161b22] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-pulse">Authenticating...</span>
                ) : (
                  <><Shield className="h-4 w-4" /> Enter Admin Workspace</>
                )}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => { setStep('secret'); setError(''); setPortalSecret(''); }}
                className="inline-flex items-center gap-1 text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" /> Re-enter access code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
