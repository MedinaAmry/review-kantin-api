import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { getReviews, getReviewById, deleteReview } from '../controllers/reviews.controller';

const router = Router();
router.get('/', getReviews);
router.get('/:id', getReviewById);
router.delete('/:id', authenticate, deleteReview);
export default router;