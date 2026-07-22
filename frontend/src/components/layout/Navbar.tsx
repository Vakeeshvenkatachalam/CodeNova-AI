import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, Menu, Bell, User, LogOut, ChevronDown, CheckCircle, Sparkles, X } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, title }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'practice', text: 'Daily practice milestone incomplete. Solve 1 challenge to maintain your streak!', time: '10m ago', read: false },
    { id: 2, type: 'achievement', text: '🏆 Consistency Champion badge unlocked (5 days streak!).', time: '1h ago', read: false },
    { id: 3, type: 'interview', text: 'Mock Simulator is ready for Java Developer review.', time: '3h ago', read: false }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark all notifications as read when opening panel
  useEffect(() => {
    if (notificationsOpen && unreadCount > 0) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [notificationsOpen, unreadCount]);

  const handleDismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* Notifications Center */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="rounded-lg p-2 border border-border-light hover:bg-brand-light dark:border-border-dark dark:hover:bg-brand-dark transition-all duration-200 relative"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4 text-content-secondary-light dark:text-content-secondary-dark" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border-light bg-surface-light p-3 shadow-lg dark:border-border-dark dark:bg-surface-dark z-50">
              <div className="flex justify-between items-center border-b border-border-light pb-2 mb-2 dark:border-border-dark">
                <span className="text-xs font-bold text-content-primary-light dark:text-content-primary-dark">Notifications</span>
                {notifications.length > 0 ? (
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <span className="text-[9px] font-mono text-primary font-bold">Unread ({unreadCount})</span>
                    )}
                    <button
                      onClick={handleClearAllNotifications}
                      className="text-[9px] font-semibold text-danger hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                ) : (
                  <span className="text-[9px] text-content-muted-light dark:text-gray-500 font-mono">0 alerts</span>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-content-muted-light dark:text-gray-500">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2.5 bg-brand-light dark:bg-brand-dark rounded-lg text-[10px] leading-relaxed border border-border-light dark:border-border-dark relative group">
                      <p className="text-content-primary-light dark:text-gray-300 font-sans pr-4">{n.text}</p>
                      <span className="text-[8px] text-content-muted-light dark:text-gray-500 mt-1 block font-mono">{n.time}</span>
                      <button
                        onClick={() => handleDismissNotification(n.id)}
                        className="absolute top-2 right-2 text-content-muted-light hover:text-danger dark:text-gray-500 dark:hover:text-red-400 opacity-60 hover:opacity-100 transition-opacity"
                        title="Dismiss"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
