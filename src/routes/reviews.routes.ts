import { Router } from 'express';
import {
  getReviews,
  getReviewById,
  createReview,
  deleteReview,
} from '../controllers/reviews.controller';

const router = Router();

router.get('/', getReviews);
router.get('/:id', getReviewById);
router.post('/', createReview);
router.delete('/:id', deleteReview);

export default router;