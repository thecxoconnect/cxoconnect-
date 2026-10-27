import { Router } from 'express';
import {
  getAdminOverview,
  getAllUsers,
  approveApplication,
  declineApplication,
  deactivateUser,
  resendInvitation,
  addMember,
  editMember,
  updateUserStatus,
  updateUserRole
} from '../controllers/userController.js';
import { isAuth, isAdmin, isMainAdmin } from '../middleware/auth.js';

const router = Router();

// Administrative Overview Metrics
router.get('/overview', isAuth, isAdmin, getAdminOverview);

// List Applications and Members
router.get('/', isAuth, isAdmin, getAllUsers);

// Add Member Directly
router.post('/', isAuth, isAdmin, addMember);

// Edit Member Record
router.put('/:id', isAuth, isAdmin, editMember);

// Application Actions
router.patch('/:id/approve', isAuth, isAdmin, approveApplication);
router.patch('/:id/decline', isAuth, isAdmin, declineApplication);
router.patch('/:id/deactivate', isAuth, isAdmin, deactivateUser);
router.post('/:id/resend-invite', isAuth, isAdmin, resendInvitation);

// Legacy Status and Role Actions
router.patch('/:id/status', isAuth, isAdmin, updateUserStatus);
router.patch('/:id/role', isAuth, isMainAdmin, updateUserRole);

export default router;
