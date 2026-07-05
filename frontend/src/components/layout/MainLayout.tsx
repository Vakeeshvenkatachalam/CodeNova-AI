import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Outlet, useLocation } from 'react-router-dom';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('CodeNova AI');

  // Dynamically update page title in Navbar based on current active path name
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) setPageTitle('Dashboard');
    else if (path.includes('/mentor')) setPageTitle('AI Coding Mentor');
    else if (path.includes('/workspace')) setPageTitle('Code Workspace');
    else if (path.includes('/practice')) setPageTitle('Practice Hub');
    else if (path.includes('/sql')) setPageTitle('SQL Mentor');
    else if (path.includes('/kb')) setPageTitle('Knowledge Base');
    else if (path.includes('/progress')) setPageTitle('Progress Tracker');
    else if (path.includes('/admin')) setPageTitle('Admin Panel');
    else setPageTitle('CodeNova AI');
  }, [location]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-light dark:bg-brand-dark transition-colors duration-200">
      {/* Sidebar navigation drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          title={pageTitle}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        
        {/* Main Content Workspace Scroll */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-light p-4 dark:bg-brand-dark transition-colors duration-200 lg:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
