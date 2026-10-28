import express from 'express';
import {
  getMembers,
  getMemberStats,
  getMemberById,
  updateMemberStatus,
  updateMemberRole,
  deleteMember
} from '../controllers/memberController.js';
import { isAuth, isAdmin, isMainAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Stats (Admin only)
router.get('/stats', isAuth, isAdmin, getMemberStats);

// Members list (Admin only)
router.get('/', isAuth, isAdmin, getMembers);

// Single member (Admin only)
router.get('/:id', isAuth, isAdmin, getMemberById);

// Update status (Admin only)
router.put('/:id/status', isAuth, isAdmin, updateMemberStatus);

// Update role / promote to admin (Main Admin only)
router.put('/:id/role', isAuth, isMainAdmin, updateMemberRole);

// Delete account (Admin only)
router.delete('/:id', isAuth, isAdmin, deleteMember);

export default router;
