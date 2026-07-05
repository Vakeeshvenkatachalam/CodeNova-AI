import { apiClient } from './apiClient';

export interface PracticeProblem {
  id: number;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  starterCode: string;
  solutionCode: string;
  points: number;
}

export interface PracticeSubmitResponse {
  status: 'PASSED' | 'FAILED';
  feedback: string;
  pointsEarned: number;
}

export const practiceService = {
  async getProblems(): Promise<PracticeProblem[]> {
    const response = await apiClient.get<PracticeProblem[]>('/api/v1/practice/problems');
    return response.data;
  },

  async generateProblem(category: string, difficulty: string): Promise<PracticeProblem> {
    const response = await apiClient.post<PracticeProblem>(
      `/api/v1/practice/generate?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}`
    );
    return response.data;
  },

  async submitAttempt(problemId: number, code: string, language: string): Promise<PracticeSubmitResponse> {
    const response = await apiClient.post<PracticeSubmitResponse>(`/api/v1/practice/submit/${problemId}`, { code, language });
    return response.data;
  },

  async getHint(problemId: number): Promise<string> {
    const response = await apiClient.get<{ hint: string }>(`/api/v1/practice/problems/${problemId}/hint`);
    return response.data.hint;
  },
};
