import { apiClient } from './apiClient';

export interface DebugResponse {
  rootCause: string;
  fixReasoning: string;
  suggestedCode: string;
}

export const debugService = {
  async analyzeBug(code: string, errorMessage?: string): Promise<DebugResponse> {
    const response = await apiClient.post<DebugResponse>('/api/v1/debug/analyze', { code, errorMessage });
    return response.data;
  },
};
