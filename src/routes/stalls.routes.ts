import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { idParam, listQuery, createBody, updateBody } from '../schemas/stall.schema';
import { reviewBody } from '../schemas/review.schema';
import {
  getStalls, getStallById, createStall, updateStall, deleteStall, addReview,
} from '../controllers/stalls.controller';

const router = Router();

router.get('/', validate({ query: listQuery }), getStalls);
router.get('/:id', validate({ params: idParam }), getStallById);
router.post('/', authenticate, authorize('owner', 'admin'),
  validate({ body: createBody }), createStall);
router.put('/:id', authenticate, authorize('owner', 'admin'),
  validate({ params: idParam, body: updateBody }), updateStall);
router.delete('/:id', authenticate, authorize('admin'),
  validate({ params: idParam }), deleteStall);
router.post('/:id/reviews', authenticate,
  validate({ params: idParam, body: reviewBody }), addReview);

export default router;