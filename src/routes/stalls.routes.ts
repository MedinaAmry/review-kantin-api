import { Router } from 'express';
import {
  getStalls,
  getStallById,
  createStall,
  updateStall,
  deleteStall,
} from '../controllers/stalls.controller';

const router = Router();

router.get('/', getStalls);
router.get('/:id', getStallById);
router.post('/', createStall);
router.put('/:id', updateStall);
router.delete('/:id', deleteStall);

export default router;