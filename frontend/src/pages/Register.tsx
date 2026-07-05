import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Lock, Mail } from 'lucide-react';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({ email, password });
      navigate('/login', {
        state: { message: 'Registration successful! Please login with your credentials.' },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email already registered or registration failed');
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
            Create your Account
          </h2>
          <p className="mt-1.5 text-sm text-content-secondary-light dark:text-content-secondary-dark">
            Join CodeNova AI and level up your coding skills
          </p>
        </div>

        <Card hoverGlow>
          <div className="mb-4">
            <Badge variant="brand">Registration Module</Badge>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-danger/10 border border-danger/20 p-3 text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-content-muted-light dark:text-content-muted-dark" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-border-light bg-brand-light py-2 pl-10 pr-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-border-dark dark:bg-brand-dark transition-all duration-200"
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
              Sign Up
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-content-secondary-light dark:text-content-secondary-dark">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
