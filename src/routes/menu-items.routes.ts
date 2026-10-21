import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import {
  getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem,
} from '../controllers/menu-items.controller';

const router = Router();
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', authenticate, authorize('owner', 'admin'), createMenuItem);
router.put('/:id', authenticate, authorize('owner', 'admin'), updateMenuItem);
router.delete('/:id', authenticate, authorize('owner', 'admin'), deleteMenuItem);
export default router;