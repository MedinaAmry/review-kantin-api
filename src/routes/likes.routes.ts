import { Router } from 'express';
import { createLike, deleteLike } from '../controllers/likes.controller';

const router = Router();

router.post('/', createLike);
router.delete('/:id', deleteLike);

export default router;