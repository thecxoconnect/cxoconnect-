import express from 'express';
import {
  getMentors,
  requestMentorship,
  createMentor,
  updateMentor,
  deleteMentor
} from '../controllers/mentorController.js';
import { isAuth, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getMentors);
router.post('/request', isAuth, requestMentorship);
router.post('/', isAuth, isAdmin, createMentor);
router.put('/:id', isAuth, isAdmin, updateMentor);
router.delete('/:id', isAuth, isAdmin, deleteMentor);

export default router;
