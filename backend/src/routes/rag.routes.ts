import { Router } from 'express';
import { ragController } from '../controllers/rag.controller';

const router = Router();

// Public / User Knowledge Base Routes
router.get('/search', ragController.search);
router.get('/documents', ragController.getDocuments);

// Admin Knowledge Management Routes
router.get('/admin/status', ragController.getStatus);
router.post('/admin/reindex', ragController.reindex);
router.post('/admin/upload', ragController.uploadDocument);
router.delete('/admin/documents/*', ragController.deleteDocument);

export default router;
