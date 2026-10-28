import express from 'express';
import {
  getComments,
  createComment,
  likeComment,
  deleteComment
} from '../controllers/commentController.js';
import { isAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getComments);
router.post('/', isAuth, createComment);
router.post('/:id/like', isAuth, likeComment);
router.delete('/:id', isAuth, deleteComment);

export default router;
