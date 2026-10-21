import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { getAuditLogs, createAuditLog } from '../controllers/audit.controller';

const router = Router();
router.use(authenticate, authorize('admin'));
router.get('/', getAuditLogs);
router.post('/', createAuditLog);
export default router;