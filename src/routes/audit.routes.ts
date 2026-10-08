import { Router } from 'express';
import { getAuditLogs, createAuditLog } from '../controllers/audit.controller';

const router = Router();

router.get('/', getAuditLogs);
router.post('/', createAuditLog);

export default router;