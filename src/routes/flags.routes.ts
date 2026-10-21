import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { getFlags, getFlagById, updateFlagStatus } from '../controllers/flags.controller';

const router = Router();
router.use(authenticate, authorize('admin'));
router.get('/', getFlags);
router.get('/:id', getFlagById);
router.put('/:id', updateFlagStatus);
export default router;