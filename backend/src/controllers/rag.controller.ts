import { Request, Response } from 'express';
import { ragService } from '../services/rag.service';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export class RagController {
  public search = async (req: Request, res: Response) => {
    try {
      const query = (req.query.q as string) || '';
      const category = (req.query.category as string) || 'all';

      if (!query.trim()) {
        const allDocs = ragService.getAllDocuments();
        const filtered =
          category && category !== 'all'
            ? allDocs.filter((d) => d.category.toLowerCase().includes(category.toLowerCase()))
            : allDocs;
        return sendSuccess(res, 200, 'All Knowledge Base documents retrieved', filtered);
      }

      const results = ragService.search(query, 10, category);
      return sendSuccess(res, 200, `Semantic search completed for "${query}"`, results);
    } catch (err) {
      logger.error('RAG Search Error:', err);
      throw ApiError.internal('Failed to perform semantic search');
    }
  };

  public getDocuments = async (_req: Request, res: Response) => {
    try {
      const docs = ragService.getAllDocuments();
      return sendSuccess(res, 200, 'Document list retrieved', docs);
    } catch (err) {
      throw ApiError.internal('Failed to retrieve documents');
    }
  };

  public getStatus = async (_req: Request, res: Response) => {
    try {
      const stats = ragService.getStats();
      return sendSuccess(res, 200, 'RAG Index Status retrieved', stats);
    } catch (err) {
      throw ApiError.internal('Failed to retrieve RAG status');
    }
  };

  public reindex = async (_req: Request, res: Response) => {
    try {
      const stats = ragService.reindex();
      return sendSuccess(res, 200, 'Knowledge Base re-indexed successfully', stats);
    } catch (err) {
      throw ApiError.internal('Failed to re-index Knowledge Base');
    }
  };

  public uploadDocument = async (req: Request, res: Response) => {
    try {
      const { filename, content, category } = req.body;
      if (!filename || !content) {
        throw ApiError.badRequest('Filename and content are required');
      }

      const result = ragService.addDocument(filename, content, category);
      return sendSuccess(res, 200, 'Document uploaded and indexed successfully', result);
    } catch (err) {
      logger.error('RAG Upload Error:', err);
      if (err instanceof ApiError) throw err;
      throw ApiError.internal('Failed to upload document');
    }
  };

  public deleteDocument = async (req: Request, res: Response) => {
    try {
      const docId = req.params.docId || (req.query.docId as string);
      if (!docId) {
        throw ApiError.badRequest('Document ID is required');
      }

      const success = ragService.deleteDocument(docId);
      if (success) {
        return sendSuccess(res, 200, 'Document deleted and index updated', { deleted: true, docId });
      }
      throw ApiError.notFound('Document not found');
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw ApiError.internal('Failed to delete document');
    }
  };
}

export const ragController = new RagController();
