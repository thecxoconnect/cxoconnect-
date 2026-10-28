import express from 'express';
import {
  getSponsors,
  submitPartnerInquiry,
  createSponsor,
  deleteSponsor
} from '../controllers/sponsorController.js';
import { isAuth, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSponsors);
router.post('/inquiry', submitPartnerInquiry);
router.post('/', isAuth, isAdmin, createSponsor);
router.delete('/:id', isAuth, isAdmin, deleteSponsor);

export default router;
