import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareCode,
  Code,
  Terminal,
  Database,
  Library,
  TrendingUp,
  LogOut,
  X,
  User,
  Briefcase,
  BarChart3,
  Settings
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const links = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Coding Mentor', path: '/mentor', icon: MessageSquareCode },
    { name: 'Code Workspace', path: '/workspace', icon: Code },
    { name: 'Practice Hub', path: '/practice', icon: Terminal },
    { name: 'SQL Mentor', path: '/sql', icon: Database },
    { name: 'Knowledge Base', path: '/kb', icon: Library },
    { name: 'Mock Interview', path: '/interview', icon: Briefcase },
    { name: 'Analytics Board', path: '/analytics', icon: BarChart3 },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'IDE Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-brand/5'
        : 'text-content-secondary-light hover:bg-brand-light hover:text-content-primary-light dark:text-content-secondary-dark dark:hover:bg-brand-dark dark:hover:text-content-primary-dark border border-transparent'
    }`;

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-45 bg-black/50 lg:hidden transition-opacity duration-200"
        />
      )}

      <aside
        className={`fixed bottom-0 top-0 left-0 z-50 flex w-64 flex-col border-r border-border-light bg-surface-light px-4 py-6 transition-transform duration-300 dark:border-border-dark dark:bg-surface-dark lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header brand logo */}
        <div className="flex items-center justify-between border-b border-border-light pb-6 dark:border-border-dark">
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-ai flex items-center justify-center text-white font-bold animate-pulse">
              C
            </div>
            <span className="text-lg font-bold font-sans tracking-wide bg-gradient-to-r from-primary to-ai bg-clip-text text-transparent">
              CodeNova AI
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-brand-light dark:hover:bg-brand-dark lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-content-secondary-light dark:text-content-secondary-dark" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="mt-8 flex-1 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={navLinkClass}
              >
                <Icon className="h-4.5 w-4.5" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer logout */}
        <div className="border-t border-border-light pt-6 dark:border-border-dark">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium border border-transparent text-red-500 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
