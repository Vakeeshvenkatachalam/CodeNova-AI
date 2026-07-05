import { apiClient } from './apiClient';

export interface DashboardSummary {
  currentStreak: number;
  maxStreak: number;
  solvedCount: number;
  attemptedCount: number;
  chatSessionsCount: number;
  interviewSessionsCount: number;
  activeCategory: string;
  recentActivities: Array<{
    name: String;
    time: string;
    status: string;
  }>;
}

export interface DashboardInsight {
  summary: string;
  recommendation: string;
  targetModule: 'PRACTICE' | 'MENTOR' | 'SQL_MENTOR' | 'KNOWLEDGE_BASE';
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<DashboardSummary>('/api/v1/dashboard/summary');
    return response.data;
  },

  async getInsights(): Promise<DashboardInsight> {
    const response = await apiClient.get<DashboardInsight>('/api/v1/dashboard/insights');
    return response.data;
  },
};
