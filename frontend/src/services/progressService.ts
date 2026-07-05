import { apiClient } from './apiClient';

export interface ProgressSummary {
  level: number;
  totalXp: number;
  problemsSolved: number;
  totalSubmissions: number;
  totalSessions: number;
  aiRoadmapRecommendation: string;
  activityTrends: Array<{
    date: string;
    count: number;
  }>;
}

export const progressService = {
  async getSummary(): Promise<ProgressSummary> {
    const response = await apiClient.get<ProgressSummary>('/api/v1/progress/summary');
    return response.data;
  },
};
