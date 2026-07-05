import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminProtectedRoute } from './AdminProtectedRoute';

// ─── Student / Public Pages ────────────────────────────────────────────────
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';

// ─── Protected Student Pages ───────────────────────────────────────────────
import { Dashboard } from '../pages/Dashboard';
import { ChatMentor } from '../pages/ChatMentor';
import { CodeWorkspace } from '../pages/CodeWorkspace';
import { PracticeHub } from '../pages/PracticeHub';
import { SqlMentor } from '../pages/SqlMentor';
import { KnowledgeBase } from '../pages/KnowledgeBase';
import { Progress } from '../pages/Progress';
import { Profile } from '../pages/Profile';
import { InterviewPrep } from '../pages/InterviewPrep';

// ─── Standalone Admin Portal Pages ────────────────────────────────────────
import { AdminLogin } from '../pages/AdminLogin';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Landing & Auth ─────────────────────────────────────────── */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ── Student Authenticated App ──────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mentor" element={<ChatMentor />} />
            <Route path="/workspace" element={<CodeWorkspace />} />
            <Route path="/practice" element={<PracticeHub />} />
            <Route path="/sql" element={<SqlMentor />} />
            <Route path="/kb" element={<KnowledgeBase />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/interview" element={<InterviewPrep />} />
          </Route>
        </Route>

        {/* ── Standalone Admin Portal ────────────────────────────────── */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          </Route>
        </Route>

        {/* ── Catch-all ──────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
