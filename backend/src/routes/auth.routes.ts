import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { loginValidator, registerValidator } from '../validators/auth.validator';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);

export default router;
