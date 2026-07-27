import { api } from './api';

export interface RagDocItem {
  docId: string;
  title: string;
  category: string;
  keywords: string[];
  summary: string;
  sourceRef: string;
  pageEstimate: number;
  updatedAt: string;
  content: string;
  scorePercent: number;
}

export interface RagStatus {
  indexed: boolean;
  lastIndexedAt: string;
  totalChunks: number;
  totalDocs: number;
  vocabularySize: number;
  embeddingEngine: string;
  knowledgeDir: string;
}

export const knowledgeService = {
  async search(query: string, category?: string): Promise<RagDocItem[]> {
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (category && category !== 'all') params.category = category;

    const { data } = await api.get('/knowledge/search', { params });
    return data.data || [];
  },

  async getAllDocuments(): Promise<RagDocItem[]> {
    const { data } = await api.get('/knowledge/documents');
    return data.data || [];
  },

  async getAdminStatus(): Promise<RagStatus> {
    const { data } = await api.get('/knowledge/admin/status');
    return data.data;
  },

  async reindex(): Promise<{ totalDocs: number; totalChunks: number; timestamp: string }> {
    const { data } = await api.post('/knowledge/admin/reindex');
    return data.data;
  },

  async uploadDocument(filename: string, content: string, category?: string) {
    const { data } = await api.post('/knowledge/admin/upload', { filename, content, category });
    return data.data;
  },

  async deleteDocument(docId: string) {
    const { data } = await api.delete(`/knowledge/admin/documents/${encodeURIComponent(docId)}`);
    return data.data;
  },
};
