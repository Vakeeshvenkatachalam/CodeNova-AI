import { apiClient } from './apiClient';

export interface ExplanationBlock {
  block: string;
  explanation: string;
}

export interface ExplainResponse {
  explanations: ExplanationBlock[];
}

export interface ComplexityResponse {
  timeComplexity: string;
  spaceComplexity: string;
  justification: string;
}

export interface AutocompleteResponse {
  suggestion: string;
}

export const codeAnalysisService = {
  async explainCode(code: string, language: string): Promise<ExplainResponse> {
    const response = await apiClient.post<ExplainResponse>('/api/v1/analysis/explain', { code, language });
    return response.data;
  },

  async analyzeComplexity(code: string, language: string): Promise<ComplexityResponse> {
    const response = await apiClient.post<ComplexityResponse>('/api/v1/analysis/complexity', { code, language });
    return response.data;
  },

  async autocomplete(codeBeforeCursor: string, language: string): Promise<AutocompleteResponse> {
    const response = await apiClient.post<AutocompleteResponse>('/api/v1/analysis/autocomplete', { codeBeforeCursor, language });
    return response.data;
  },

  async runCode(code: string, language: string): Promise<RunCodeResponse> {
    const response = await apiClient.post<RunCodeResponse>('/api/v1/analysis/run', { code, language });
    return response.data;
  },
};

export interface RunCodeResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
}
