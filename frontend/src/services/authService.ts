import { apiClient } from './apiClient';
import { AuthRequest, AuthResponse, RegisterRequest, ForgotRequest, ResetRequest } from '../types/api';

export const authService = {
  async login(payload: AuthRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', payload);
    return response.data;
  },

  async register(payload: RegisterRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/register', payload);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken });
    return response.data;
  },

  async forgotPassword(payload: ForgotRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/forgot-password', payload);
    return response.data;
  },

  async resetPassword(payload: ResetRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/reset-password', payload);
    return response.data;
  },
};
