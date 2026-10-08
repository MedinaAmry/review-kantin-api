import { Router } from 'express';
import {
  getFlags,
  getFlagById,
  updateFlagStatus,
} from '../controllers/flags.controller';

const router = Router();

router.get('/', getFlags);
router.get('/:id', getFlagById);
router.put('/:id', updateFlagStatus);

export default router;