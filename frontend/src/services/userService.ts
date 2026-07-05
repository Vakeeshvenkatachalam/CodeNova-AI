import { apiClient } from './apiClient';

export interface UserProfile {
  email: string;
  name: string | null;
  bio: string | null;
  preferredLanguage: string;
  level: number;
  totalXp: number;
  problemsSolved: number;
  totalSessions: number;
}

export interface UserProfileUpdateRequest {
  name: string;
  bio: string;
  preferredLanguage: string;
}

export const userService = {
  async getUserProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/api/v1/users/profile');
    return response.data;
  },

  async updateUserProfile(payload: UserProfileUpdateRequest): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/api/v1/users/profile', payload);
    return response.data;
  },
};
