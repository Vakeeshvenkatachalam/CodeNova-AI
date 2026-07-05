import { apiClient } from './apiClient';

export interface KbDocument {
  id: number;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface SourceReference {
  text: string;
  pageNumber: number;
}

export interface KbChatResponse {
  answer: string;
  sources: SourceReference[];
}

export const kbService = {
  async listDocuments(): Promise<KbDocument[]> {
    const response = await apiClient.get<KbDocument[]>('/api/v1/kb/documents');
    return response.data;
  },

  async uploadDocument(file: File): Promise<KbDocument> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<KbDocument>('/api/v1/kb/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteDocument(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/kb/documents/${id}`);
  },

  async chatWithPdf(id: number, question: string): Promise<KbChatResponse> {
    const response = await apiClient.post<KbChatResponse>(`/api/v1/kb/documents/${id}/chat`, { question });
    return response.data;
  },
};
