import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { authService } from '../services/authService';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset request. Missing token.');
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.resetPassword({ token, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Token may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4 dark:bg-brand-dark transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-ai text-white font-bold text-xl mb-3 shadow-glow-brand/20">
            C
          </div>
          <h2 className="text-2xl font-bold font-sans tracking-tight text-content-primary-light dark:text-content-primary-dark">
            Choose New Password
          </h2>
          <p className="mt-1.5 text-sm text-content-secondary-light dark:text-content-secondary-dark">
            Enter your new secure password below
          </p>
        </div>

        <Card hoverGlow>
          {success ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark">
                Password Reset Complete
              </h3>
              <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark">
                Your credentials have been securely updated. You can now login with your new password.
              </p>
              <Button onClick={() => navigate('/login')} variant="primary" className="w-full mt-4">
                Proceed to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="mb-2">
                <Badge variant="brand">Set New Credentials</Badge>
              </div>

              {error && (
                <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 text-xs text-danger">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-content-muted-light dark:text-content-muted-dark" />
                  </span>
                  <input
                    type="password"
                    required
                    disabled={!token}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-border-light bg-brand-light py-2 pl-10 pr-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-border-dark dark:bg-brand-dark transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-content-muted-light dark:text-content-muted-dark" />
                  </span>
                  <input
                    type="password"
                    required
                    disabled={!token}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-border-light bg-brand-light py-2 pl-10 pr-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-border-dark dark:bg-brand-dark transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={!token}
                className="w-full"
              >
                Reset Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
