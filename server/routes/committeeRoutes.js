import express from 'express';
import {
  getCommittee,
  createCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember
} from '../controllers/committeeController.js';
import { isAuth, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCommittee);
router.post('/', isAuth, isAdmin, createCommitteeMember);
router.put('/:id', isAuth, isAdmin, updateCommitteeMember);
router.delete('/:id', isAuth, isAdmin, deleteCommitteeMember);

export default router;
