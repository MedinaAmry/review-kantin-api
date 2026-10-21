import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { getUsers } from '../controllers/users.controller';

const router = Router();
router.get('/', authenticate, authorize('admin'), getUsers);
export default router;