import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { registerBody, loginBody } from '../schemas/auth.schema';
import * as c from '../controllers/auth.controller';

const router = Router();
router.post('/register', validate({ body: registerBody }), c.register);
router.post('/login', validate({ body: loginBody }), c.login);
router.get('/me', authenticate, c.me);
export default router;