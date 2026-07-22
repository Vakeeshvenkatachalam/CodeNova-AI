import { apiClient } from './apiClient';

export interface SqlGenerateResponse {
  sql: string;
  explanation: string;
}

export interface SqlReviewResponse {
  status: 'CORRECT' | 'INCORRECT';
  feedback: string;
  optimalQuery?: string;
  optimizationAdvice?: string;
  learningRoadmap?: string;
}

export interface SqlExecuteResponse {
  success: boolean;
  columns: string[];
  rows: string[][];
  errorMessage: string;
  rowCount: number;
}

export const sqlMentorService = {
  async generateSql(prompt: string): Promise<SqlGenerateResponse> {
    const response = await apiClient.post<SqlGenerateResponse>('/api/v1/sql/generate', { prompt });
    return response.data;
  },

  async reviewSql(prompt: string, userSql: string): Promise<SqlReviewResponse> {
    const response = await apiClient.post<SqlReviewResponse>('/api/v1/sql/review', { prompt, userSql });
    return response.data;
  },

  async executeSql(sql: string): Promise<SqlExecuteResponse> {
    const response = await apiClient.post<SqlExecuteResponse>('/api/v1/sql/execute', { sql });
    return response.data;
  },
};
