import { apiClient } from './apiClient';

export interface InterviewSession {
  id: number;
  roleTarget: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface InterviewQuestion {
  id: number;
  questionText: string;
  userAnswer?: string;
  feedback?: string;
  score?: number;
}

export interface InterviewEvaluationResponse {
  strengths: string;
  gaps: string;
  score: number;
  improvement: string;
}

export const interviewService = {
  async createSession(roleTarget: string, difficulty: string): Promise<InterviewSession> {
    const response = await apiClient.post<InterviewSession>('/api/v1/interview/sessions', { roleTarget, difficulty });
    return response.data;
  },

  async generateQuestion(sessionId: number): Promise<InterviewQuestion> {
    const response = await apiClient.post<InterviewQuestion>(`/api/v1/interview/sessions/${sessionId}/question`);
    return response.data;
  },

  async evaluateAnswer(questionId: number, userAnswer: string, questionText: string): Promise<InterviewEvaluationResponse> {
    const response = await apiClient.post<InterviewEvaluationResponse>(`/api/v1/interview/questions/${questionId}/evaluate`, {
      userAnswer,
      questionText,
    });
    return response.data;
  },

  async getSessions(): Promise<InterviewSession[]> {
    const response = await apiClient.get<InterviewSession[]>('/api/v1/interview/sessions');
    return response.data;
  },
};
