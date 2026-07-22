import { apiClient } from './apiClient';

export interface UserDetail {
  id: number;
  email: string;
  role: string;
  name: string | null;
  createdAt: string | null;
}

export interface AdminMetrics {
  totalUsersCount: number;
  totalSubmissionsCount: number;
  totalPracticeProblemsCount: number;
  totalKnowledgeDocumentsCount: number;
}

export interface AdminUserProgress {
  email: string;
  name: string | null;
  bio: string | null;
  preferredLanguage: string;
  level: number;
  totalXp: number;
  problemsSolved: number;
  totalSubmissions: number;
  totalSessions: number;
  solvesByLanguage: Record<string, number>;
  strongestLanguage: string;
  recentSubmissions: Array<{
    id: number;
    problemTitle: string;
    language: string;
    status: string;
    createdAt: string;
  }>;
}

export interface AdminReport {
  totalUsers: number;
  activeLoginsToday: number;
  participationRate: number;
  totalSubmissions: number;
  totalSessions: number;
  totalXpOverall: number;
  averageXpPerUser: number;
  languageDistribution: Record<string, number>;
  currentMonthSubmissions: number;
  activeAilModelName?: string;
  activeAiModelName?: string;
  activeApiKeyStatus?: string;
}

export const adminService = {
  async listUsers(): Promise<UserDetail[]> {
    const response = await apiClient.get<UserDetail[]>('/api/v1/admin/users');
    return response.data;
  },

  async getPlatformMetrics(): Promise<AdminMetrics> {
    const response = await apiClient.get<AdminMetrics>('/api/v1/admin/metrics');
    return response.data;
  },

  async toggleUserAccess(userId: number, action: 'PROMOTE' | 'DEMOTE'): Promise<void> {
    await apiClient.post(`/api/v1/admin/users/${userId}/access?action=${action}`);
  },

  async getUserProgress(userId: number): Promise<AdminUserProgress> {
    const response = await apiClient.get<AdminUserProgress>(`/api/v1/admin/users/${userId}/progress`);
    return response.data;
  },

  async getOverallReport(): Promise<AdminReport> {
    const response = await apiClient.get<AdminReport>('/api/v1/admin/report');
    return response.data;
  },

  async updateConfig(apiKey: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/admin/config', { apiKey });
    return response.data;
  },

  async deleteUser(userId: number): Promise<void> {
    await apiClient.delete(`/api/v1/admin/users/${userId}`);
  },
};

