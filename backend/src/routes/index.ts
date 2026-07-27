import { Router } from 'express';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import ragRoutes from './rag.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Pocket C.A. API is healthy' });
});

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/knowledge', ragRoutes);

export default router;
