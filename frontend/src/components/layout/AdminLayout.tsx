import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart2,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const adminLinks = [
    { name: 'Home', path: '/admin/dashboard', icon: LayoutDashboard, description: 'Platform analytics & monthly reports' },
    { name: 'Student Directory', path: '/admin/users', icon: Users, description: 'User management & individual progress' },
    { name: 'Language Analytics', path: '/admin/analytics', icon: BarChart2, description: 'Language strengths & participation' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
        : 'text-gray-400 hover:bg-gray-800/60 hover:text-white border border-transparent'
    }`;

  return (
    <div className="min-h-screen bg-[#060810] flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed bottom-0 top-0 left-0 z-50 flex w-64 flex-col bg-[#0d1117] border-r border-gray-800 px-4 py-6 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-800">
          <Link to="/admin/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-600 to-primary flex items-center justify-center shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white tracking-tight block leading-none">CodeNova</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-red-400">Admin Portal</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-800 text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Admin navigation links */}
        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={navLinkClass}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xs font-bold">{link.name}</span>
                  <span className="block text-[9px] text-gray-600 group-hover:text-gray-500 truncate">{link.description}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Admin info footer */}
        <div className="border-t border-gray-800 pt-5 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-red-500 to-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.email?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{user?.email || 'admin@codenova.ai'}</p>
              <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold border border-transparent text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out of Admin Portal
          </button>
        </div>
      </aside>

      {/* Main admin content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top admin header bar */}
        <header className="h-14 border-b border-gray-800 bg-[#0d1117]/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-500"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Breadcrumb hint */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-500">
              <Shield className="h-3.5 w-3.5 text-red-400" />
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-300 font-semibold">Admin Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              System Online
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-500 transition-colors">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
