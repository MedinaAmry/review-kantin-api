import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { createLike, deleteLike } from '../controllers/likes.controller';

const router = Router();
router.use(authenticate);
router.post('/', createLike);
router.delete('/:id', deleteLike);
export default router;