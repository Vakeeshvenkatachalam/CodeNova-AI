import { apiClient } from './apiClient';

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  sender: 'USER' | 'AI';
  content: string;
  createdAt: string;
}

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>('/api/v1/chat/conversations');
    return response.data;
  },

  async createConversation(): Promise<Conversation> {
    const response = await apiClient.post<Conversation>('/api/v1/chat/conversations');
    return response.data;
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(`/api/v1/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  async sendMessage(conversationId: number, content: string): Promise<Message> {
    const response = await apiClient.post<Message>(`/api/v1/chat/conversations/${conversationId}/messages`, { content });
    return response.data;
  },
};
