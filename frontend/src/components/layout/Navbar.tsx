import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, Menu, Bell, User, LogOut, ChevronDown, Award } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, title }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Try to load name from local storage user key if set
  const getDisplayName = () => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) return parsed.name;
      }
    } catch (_) {}
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Developer';
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const displayName = getDisplayName();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border-light bg-surface-light px-4 shadow-sm dark:border-border-dark dark:bg-surface-dark transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 hover:bg-brand-light dark:hover:bg-brand-dark lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5 text-content-secondary-light dark:text-content-secondary-dark" />
        </button>
        <h1 className="text-lg font-semibold font-sans text-content-primary-light dark:text-content-primary-dark">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark/Light mode switcher */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 border border-border-light hover:bg-brand-light dark:border-border-dark dark:hover:bg-brand-dark transition-all duration-200"
          aria-label="Toggle Dark/Light Mode"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-primary" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="rounded-lg p-2 border border-border-light hover:bg-brand-light dark:border-border-dark dark:hover:bg-brand-dark transition-all duration-200"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4 text-content-secondary-light dark:text-content-secondary-dark" />
        </button>

        {/* Profile Avatar Dropdown */}
        <div className="relative border-l border-border-light pl-4 dark:border-border-dark" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 hover:opacity-85 focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 hover:border-primary/40 transition-colors">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden text-sm font-semibold text-content-primary-light dark:text-content-primary-dark sm:inline-block max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-content-secondary-light dark:text-content-secondary-dark" />
          </button>

          {/* Animated Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border-light bg-surface-light py-1.5 shadow-lg dark:border-border-dark dark:bg-surface-dark animate-fade-in z-50">
              <div className="border-b border-border-light px-4 py-2 dark:border-border-dark">
                <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-500">
                  Signed in as
                </p>
                <p className="truncate text-xs font-semibold text-content-primary-light dark:text-content-primary-dark">
                  {user?.email}
                </p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-content-secondary-light hover:bg-brand-light dark:text-gray-300 dark:hover:bg-brand-dark transition-colors"
              >
                <User className="h-4 w-4 text-primary" /> View Profile
              </Link>

              <button
                onClick={handleLogoutClick}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-danger hover:bg-brand-light dark:hover:bg-brand-dark transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
