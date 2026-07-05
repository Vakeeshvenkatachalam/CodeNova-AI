import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { authService } from '../services/authService';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const data = await authService.forgotPassword({ email });
      setMessage(data.message || 'Reset link logged to console successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
            Reset Password
          </h2>
          <p className="mt-1.5 text-sm text-content-secondary-light dark:text-content-secondary-dark">
            We will log a stateless reset link for you
          </p>
        </div>

        <Card hoverGlow>
          {message ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark">
                Check System Logs
              </h3>
              <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark">
                {message} Inspect your Spring Boot log files or console logs to copy the reset link.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline mt-4">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="mb-2">
                <Badge variant="brand">Stateless Reset</Badge>
              </div>

              {error && (
                <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 text-xs text-danger">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-content-muted-light dark:text-content-muted-dark" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="block w-full rounded-lg border border-border-light bg-brand-light py-2 pl-10 pr-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-border-dark dark:bg-brand-dark transition-all duration-200"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full"
              >
                Send Reset Link
              </Button>

              <div className="text-center mt-4">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-secondary-light hover:text-content-primary-light dark:text-content-secondary-dark dark:hover:text-content-primary-dark hover:underline">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
