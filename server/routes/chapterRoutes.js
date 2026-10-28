import express from 'express';
import { getChapters, createChapter } from '../controllers/chapterController.js';
import { isAuth, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getChapters);
router.post('/', isAuth, isAdmin, createChapter);

export default router;
