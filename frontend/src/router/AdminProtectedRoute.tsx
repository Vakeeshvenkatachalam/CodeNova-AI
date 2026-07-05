import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * AdminProtectedRoute — guards all /admin/* routes.
 * Reads token + user from localStorage directly (admin portal is a separate
 * standalone app that does not share the main app's AuthContext).
 * Redirects to /admin/login if no valid admin session is found.
 */
export const AdminProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
