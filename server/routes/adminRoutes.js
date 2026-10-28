import express from 'express';
import { isAuth, isAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  getAdminOverview,
  getAdminStats,
  exportMembersReport,
  getAdminMembers,
  updateMemberStatus,
  toggleMemberRole,
  deleteMember,
  getAdminMentors,
  createAdminMentor,
  updateAdminMentor,
  deleteAdminMentor,
  getAdminCommittee,
  createAdminCommittee,
  deleteAdminCommittee,
  getAdminSponsors,
  createAdminSponsor,
  updateAdminSponsor,
  deleteAdminSponsor,
  getAdminTestimonials,
  createAdminTestimonial,
  updateAdminTestimonial,
  deleteAdminTestimonial,
  getAdminEvents,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  getAdminQuestions,
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
  sendMassMail
} from '../controllers/adminController.js';

const router = express.Router();

// Apply Authentication & Admin Guards to all admin endpoints
router.use(isAuth, isAdmin);

// 1. Overview & Analytics
router.get('/overview', getAdminOverview);
router.get('/stats', getAdminStats);
router.get('/export', exportMembersReport);

// 2. Members & Secondary Admins
router.get('/members', getAdminMembers);
router.put('/members/:id/status', updateMemberStatus);
router.patch('/members/:id/status', updateMemberStatus);
router.put('/members/:id/role', toggleMemberRole);
router.delete('/members/:id', deleteMember);

// 3. Mentors & Committee Management (with ImageKit upload)
router.get('/mentors', getAdminMentors);
router.post('/mentors', upload.any(), createAdminMentor);
router.put('/mentors/:id', upload.any(), updateAdminMentor);
router.delete('/mentors/:id', deleteAdminMentor);

router.get('/committee', getAdminCommittee);
router.post('/committee', upload.single('image'), createAdminCommittee);
router.delete('/committee/:id', deleteAdminCommittee);

// 4. Sponsors & Partners (with ImageKit upload)
router.get('/sponsors', getAdminSponsors);
router.post('/sponsors', upload.single('logo'), createAdminSponsor);
router.put('/sponsors/:id', upload.single('logo'), updateAdminSponsor);
router.delete('/sponsors/:id', deleteAdminSponsor);

// 5. Testimonials Engine (with ImageKit upload)
router.get('/testimonials', getAdminTestimonials);
router.post('/testimonials', upload.single('avatar'), createAdminTestimonial);
router.put('/testimonials/:id', upload.single('avatar'), updateAdminTestimonial);
router.delete('/testimonials/:id', deleteAdminTestimonial);

// 6. Events & Conclaves Management (with ImageKit upload & gallery)
router.get('/events', getAdminEvents);
router.post('/events', upload.any(), createAdminEvent);
router.put('/events/:id', upload.any(), updateAdminEvent);
router.delete('/events/:id', deleteAdminEvent);

// 7. Quiz Management System
router.get('/quiz/questions', getAdminQuestions);
router.post('/quiz/questions', createAdminQuestion);
router.put('/quiz/questions/:id', updateAdminQuestion);
router.delete('/quiz/questions/:id', deleteAdminQuestion);

// 8. Mass Mailer / Broadcast
router.post('/mass-mail', sendMassMail);

export default router;
